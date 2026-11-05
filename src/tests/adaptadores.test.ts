import { after, afterEach, beforeEach, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import pg from 'pg'

import {
  AsientoOcupadoError,
  Boleto,
  DatosInvalidosError,
  ReservarBoletoUseCase,
  type BoletoRepository,
} from '../domain/cinema.ts'
import { InMemoryBoletoRepository } from '../infrastructure/memoria.ts'
import { PostgreBoletoRepository } from '../infrastructure/postgresql.ts'

interface ContextoContrato {
  repositorio: BoletoRepository
  limpiar?: (funcionPrueba: string) => Promise<void>
}

function ejecutarPruebasDeContrato(
  nombreAdaptador: string,
  crearContexto: () => ContextoContrato
): void {
  describe(`Contrato de adaptador: ${nombreAdaptador}`, () => {
    let repositorio: BoletoRepository
    let casoUso: ReservarBoletoUseCase
    let funcionPrueba: string
    let limpiar: ((funcionPrueba: string) => Promise<void>) | undefined

    beforeEach(() => {
      const contexto = crearContexto()
      repositorio = contexto.repositorio
      limpiar = contexto.limpiar
      casoUso = new ReservarBoletoUseCase(repositorio)
      funcionPrueba = `TEST-${randomUUID().slice(0, 8)}`
    })

    afterEach(async () => {
      if (limpiar) {
        await limpiar(funcionPrueba)
      }
    })

    test('reserva exitosa', async () => {
      const boleto = await casoUso.ejecutar(funcionPrueba, 'A1', 'Carlos')

      assert.ok(boleto instanceof Boleto)
      assert.equal(boleto.asiento, 'A1')
      assert.equal(boleto.nombreCliente, 'Carlos')

      const encontrado = await repositorio.buscarPorAsiento(funcionPrueba, 'A1')
      assert.ok(encontrado)
      assert.equal(encontrado?.id, boleto.id)
    })

    test('asiento ocupado', async () => {
      await casoUso.ejecutar(funcionPrueba, 'A1', 'Carlos')

      await assert.rejects(
        () => casoUso.ejecutar(funcionPrueba, 'A1', 'Luis'),
        (error: unknown) => error instanceof AsientoOcupadoError
      )
    })

    test('mismo asiento en distinta función', async () => {
      const segundaFuncion = `${funcionPrueba}-B`

      const primero = await casoUso.ejecutar(funcionPrueba, 'A1', 'Carlos')
      const segundo = await casoUso.ejecutar(segundaFuncion, 'A1', 'Luis')

      assert.ok(primero instanceof Boleto)
      assert.ok(segundo instanceof Boleto)
      assert.notEqual(primero.id, segundo.id)
    })

    test('datos vacíos', async () => {
      await assert.rejects(
        () => casoUso.ejecutar(funcionPrueba, '', 'Carlos'),
        (error: unknown) => error instanceof DatosInvalidosError
      )
    })

    test('asiento disponible', async () => {
      const resultado = await repositorio.buscarPorAsiento(funcionPrueba, 'A9')

      assert.equal(resultado, null)
    })
  })
}

ejecutarPruebasDeContrato('En memoria', () => ({
  repositorio: new InMemoryBoletoRepository(),
}))

const urlPruebas = process.env.TEST_DATABASE_URL

if (urlPruebas) {
  const pool = new pg.Pool({ connectionString: urlPruebas })
  const repositorio = new PostgreBoletoRepository(pool)

  ejecutarPruebasDeContrato('PostgreSQL', () => ({
    repositorio,
    limpiar: async (funcionPrueba) => {
      await pool.query(
        'DELETE FROM boletos WHERE funcion_id IN ($1, $2)',
        [funcionPrueba, `${funcionPrueba}-B`]
      )
    },
  }))

  after(async () => {
    await pool.end()
  })
} else {
  describe('Contrato de adaptador: PostgreSQL', () => {
    test.skip('Omitido: TEST_DATABASE_URL no está configurada', () => {})
  })
}
