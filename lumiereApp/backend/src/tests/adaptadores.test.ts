import { test, describe, beforeEach, after } from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import pg from 'pg'
import {
  Boleto,
  type BoletoRepository,
  ReservarBoletoUseCase,
  AsientoOcupadoError,
  DatosInvalidosError,
} from '@lumiere/reservas'
import { InMemoryBoletoRepository } from '@lumiere/reservas/memoria'
import { PostgresBoletoRepository } from '@lumiere/reservas/postgres'

function ejecutarContratoPruebas(
  nombreAdaptador: string,
  obtenerRepo: () => BoletoRepository
) {
  describe(`Contrato de Adaptador: ${nombreAdaptador}`, () => {
    let repo: BoletoRepository
    let useCase: ReservarBoletoUseCase
    let funcionPrueba: string

    beforeEach(() => {
      repo = obtenerRepo()
      useCase = new ReservarBoletoUseCase(repo)
      funcionPrueba = `TEST-${crypto.randomUUID().slice(0, 8)}`
    })

    test('reserva exitosa persiste y puede recuperarse por asiento', async () => {
      const boleto = await useCase.ejecutar(funcionPrueba, 'A1', 'Carlos')

      assert.ok(boleto instanceof Boleto)
      assert.equal(boleto.asiento, 'A1')
      assert.equal(boleto.nombreCliente, 'Carlos')

      const encontrado = await repo.buscarPorAsiento(funcionPrueba, 'A1')
      assert.ok(encontrado)
      assert.equal(encontrado?.id, boleto.id)
    })

    test('asiento ocupado lanza AsientoOcupadoError', async () => {
      await useCase.ejecutar(funcionPrueba, 'A1', 'Carlos')

      await assert.rejects(
        async () => {
          await useCase.ejecutar(funcionPrueba, 'A1', 'Luis')
        },
        (err: unknown) => {
          assert.ok(err instanceof AsientoOcupadoError)
          return true
        }
      )
    })

    test('mismo asiento en distinta función no colisiona', async () => {
      const segundaFuncion = `${funcionPrueba}-B`

      const primero = await useCase.ejecutar(funcionPrueba, 'A1', 'Carlos')
      const segundo = await useCase.ejecutar(segundaFuncion, 'A1', 'Luis')

      assert.ok(primero)
      assert.ok(segundo)
      assert.notEqual(primero.id, segundo.id)
    })

    test('datos vacíos lanza DatosInvalidosError', async () => {
      await assert.rejects(
        async () => {
          await useCase.ejecutar(funcionPrueba, '', 'Carlos')
        },
        (err: unknown) => {
          assert.ok(err instanceof DatosInvalidosError)
          return true
        }
      )
    })

    test('asiento disponible devuelve null', async () => {
      const resultado = await repo.buscarPorAsiento(funcionPrueba, 'A9')
      assert.equal(resultado, null)
    })
  })
}

// 1. Suite para Adaptador en Memoria
const memoriaRepo = new InMemoryBoletoRepository()
ejecutarContratoPruebas('En Memoria', () => memoriaRepo)

// 2. Suite para Adaptador PostgreSQL (se ejecuta si TEST_DATABASE_URL está configurada)
const testDbUrl = process.env.TEST_DATABASE_URL
if (testDbUrl) {
  const pool = new pg.Pool({ connectionString: testDbUrl })
  const pgRepo = new PostgresBoletoRepository(pool)
  after(() => pool.end())

  ejecutarContratoPruebas('PostgreSQL', () => pgRepo)
} else {
  describe('Contrato de Adaptador: PostgreSQL', () => {
    test.skip('Omitido: TEST_DATABASE_URL no configurada', () => {})
  })
}
