// Pruebas del contrato docs/api/openapi.yaml (v1.1.0) (POST /api/reservas) por HTTP real:
// se levanta Express en un puerto libre y se llama con fetch, como un consumidor.
import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import type { AddressInfo } from 'node:net'
import type { Server } from 'node:http'
import express from 'express'
import { InMemoryBoletoRepository } from '@lumiere/reservas/memoria'
import type { BoletoRepository } from '@lumiere/reservas'
import { crearReservasRouter } from '../routes/reservas.routes.ts'
import { app } from '../app.ts'

const CLAVES_ERROR = ['codigo', 'error', 'status']
const CLAVES_RESERVA = ['asiento', 'funcion_id', 'id', 'nombre_cliente', 'reservado_en']

function levantar(aplicacion: express.Express): Promise<{ server: Server; url: string }> {
  return new Promise((resolve) => {
    const server = aplicacion.listen(0, () => {
      const { port } = server.address() as AddressInfo
      resolve({ server, url: `http://127.0.0.1:${port}` })
    })
  })
}

function appCon(repo: BoletoRepository): express.Express {
  const aplicacion = express()
  aplicacion.use(express.json())
  aplicacion.use('/api/reservas', crearReservasRouter(repo, { async publicar() {} }))
  return aplicacion
}

async function postReserva(url: string, cuerpo: unknown) {
  const res = await fetch(`${url}/api/reservas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  })
  return {
    status: res.status,
    location: res.headers.get('location'),
    body: (await res.json()) as Record<string, unknown>,
  }
}

const valida = { funcion_id: 'F001', asiento: 'A12', nombre_cliente: 'Ana Pérez' }

describe('Contrato POST /api/reservas', () => {
  let server: Server
  let url: string

  before(async () => {
    ;({ server, url } = await levantar(appCon(new InMemoryBoletoRepository())))
  })
  after(() => server.close())

  test('201: devuelve ReservaCreadaResponse con exactamente los campos del contrato', async () => {
    const { status, location, body } = await postReserva(url, valida)

    assert.equal(status, 201)
    assert.deepEqual(Object.keys(body).sort(), ['data', 'status'])
    assert.equal(body.status, 201)
    const data = body.data as Record<string, string>
    assert.deepEqual(Object.keys(data).sort(), CLAVES_RESERVA)
    assert.match(data.id!, /^[0-9a-f-]{36}$/)
    assert.ok(!Number.isNaN(Date.parse(data.reservado_en!)))
    assert.equal(data.asiento, 'A12')
    assert.equal(location, `/api/reservas/${data.id}`)
  })

  test('201: el asiento se normaliza a mayúsculas', async () => {
    const { status, body } = await postReserva(url, { ...valida, asiento: ' c7 ' })

    assert.equal(status, 201)
    assert.equal((body.data as Record<string, string>).asiento, 'C7')
  })

  test('409: el asiento en minúsculas choca con el mismo asiento en mayúsculas', async () => {
    const { status, body } = await postReserva(url, { ...valida, asiento: 'a12' })

    assert.equal(status, 409)
    assert.equal(body.codigo, 'ASIENTO_OCUPADO')
  })

  test('415 SOLICITUD_MALFORMADA si el Content-Type no es application/json', async () => {
    const res = await fetch(`${url}/api/reservas`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'funcion_id=F001&asiento=A1',
    })
    const body = (await res.json()) as Record<string, unknown>

    assert.equal(res.status, 415)
    assert.deepEqual(Object.keys(body).sort(), CLAVES_ERROR)
    assert.equal(body.codigo, 'SOLICITUD_MALFORMADA')
  })

  test('409: repetir la misma función y asiento devuelve ASIENTO_OCUPADO', async () => {
    const { status, body } = await postReserva(url, valida)

    assert.equal(status, 409)
    assert.deepEqual(Object.keys(body).sort(), CLAVES_ERROR)
    assert.equal(body.codigo, 'ASIENTO_OCUPADO')
  })

  const casos400: Array<[string, unknown]> = [
    ['falta un campo obligatorio', { funcion_id: 'F001', asiento: 'B1' }],
    ['campo con solo espacios', { ...valida, asiento: '   ' }],
    ['campo con tipo incorrecto', { ...valida, asiento: 5 }],
    ['campo null', { ...valida, nombre_cliente: null }],
    ['campo no declarado (additionalProperties: false)', { ...valida, asiento: 'B2', precio: 10 }],
    ['cuerpo que no es objeto', ['F001', 'A12']],
    ['asiento con formato inválido', { ...valida, asiento: '12A' }],
    ['asiento demasiado largo', { ...valida, asiento: 'A123' }],
    ['nombre_cliente de más de 120 caracteres', { ...valida, asiento: 'D1', nombre_cliente: 'x'.repeat(121) }],
  ]

  for (const [caso, cuerpo] of casos400) {
    test(`400 DATOS_INVALIDOS: ${caso}`, async () => {
      const { status, body } = await postReserva(url, cuerpo)

      assert.equal(status, 400)
      assert.deepEqual(Object.keys(body).sort(), CLAVES_ERROR)
      assert.equal(body.status, 400)
      assert.equal(body.codigo, 'DATOS_INVALIDOS')
    })
  }
})

describe('Contrato POST /api/reservas: fallos de infraestructura', () => {
  test('500 ERROR_INTERNO sin exponer el detalle del error', async () => {
    const repoRoto: BoletoRepository = {
      async guardar() {
        throw new Error('ECONNREFUSED 10.0.0.5:5432')
      },
      async buscarPorAsiento() {
        return null
      },
    }
    const { server, url } = await levantar(appCon(repoRoto))
    const errorOriginal = console.error
    console.error = () => {}
    try {
      const { status, body } = await postReserva(url, valida)

      assert.equal(status, 500)
      assert.deepEqual(body, {
        status: 500,
        codigo: 'ERROR_INTERNO',
        error: 'Error interno del servidor',
      })
    } finally {
      console.error = errorOriginal
      server.close()
    }
  })

  test('400 DATOS_INVALIDOS ante JSON mal formado (manejador global de app.ts)', async () => {
    const { server, url } = await levantar(app)
    try {
      const res = await fetch(`${url}/api/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"funcion_id": "F001",',
      })
      const body = (await res.json()) as { codigo: string }

      assert.equal(res.status, 400)
      assert.equal(body.codigo, 'DATOS_INVALIDOS')
    } finally {
      server.close()
    }
  })
})
