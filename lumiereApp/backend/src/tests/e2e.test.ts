import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import type { Request, Response } from 'express'
import { InMemoryBoletoRepository } from '@lumiere/reservas/memoria'
import { ReservarBoletoUseCase } from '@lumiere/reservas'
import { ReservasController } from '@lumiere/reservas/http'

interface MockResponse {
  statusCode: number
  body: unknown
  headers: Record<string, string>
  status(code: number): this
  json(data: unknown): this
  setHeader(nombre: string, valor: string): this
}

function crearMockResponse(): MockResponse {
  const mock: MockResponse = {
    statusCode: 200,
    body: null,
    headers: {},
    setHeader(nombre: string, valor: string) {
      this.headers[nombre] = valor
      return this
    },
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(data: unknown) {
      this.body = data
      return this
    },
  }
  return mock
}

describe('Integración HTTP: ReservasController con Express Handler', () => {
  let controller: ReservasController
  let repo: InMemoryBoletoRepository

  beforeEach(() => {
    repo = new InMemoryBoletoRepository()
    const useCase = new ReservarBoletoUseCase(repo)
    controller = new ReservasController(useCase)
  })

  test('POST /api/reservas registra una nueva reserva y responde HTTP 201', async () => {
    const req = {
      body: {
        funcion_id: 'F-E2E-1',
        asiento: 'H12',
        nombre_cliente: 'Mariana Gomez',
      },
    } as Request
    const res = crearMockResponse()

    await controller.reservar(req, res as unknown as Response)

    assert.equal(res.statusCode, 201)
    const body = res.body as { status: number; data: { id: string; asiento: string } }
    assert.equal(body.status, 201)
    assert.equal(body.data.asiento, 'H12')
    assert.ok(body.data.id)
    assert.equal(res.headers['Location'], `/api/reservas/${body.data.id}`)
  })

  test('POST /api/reservas rechaza asiento ocupado con HTTP 409', async () => {
    const req1 = {
      body: {
        funcion_id: 'F-E2E-DUP',
        asiento: 'C4',
        nombre_cliente: 'Cliente Uno',
      },
    } as Request
    const res1 = crearMockResponse()
    await controller.reservar(req1, res1 as unknown as Response)
    assert.equal(res1.statusCode, 201)

    const req2 = {
      body: {
        funcion_id: 'F-E2E-DUP',
        asiento: 'C4',
        nombre_cliente: 'Cliente Dos',
      },
    } as Request
    const res2 = crearMockResponse()
    await controller.reservar(req2, res2 as unknown as Response)

    assert.equal(res2.statusCode, 409)
    const body = res2.body as { status: number; codigo: string; error: string }
    assert.equal(body.status, 409)
    assert.equal(body.codigo, 'ASIENTO_OCUPADO')
    assert.match(body.error, /ya está ocupado/)
  })

  test('POST /api/reservas rechaza datos incompletos con HTTP 400', async () => {
    const req = {
      body: {
        funcion_id: 'F-E2E-1',
        asiento: '',
        nombre_cliente: 'Mariana',
      },
    } as Request
    const res = crearMockResponse()

    await controller.reservar(req, res as unknown as Response)

    assert.equal(res.statusCode, 400)
    const body = res.body as { status: number; error: string }
    assert.equal(body.status, 400)
    assert.match(body.error, /datos obligatorios/)
  })
})
