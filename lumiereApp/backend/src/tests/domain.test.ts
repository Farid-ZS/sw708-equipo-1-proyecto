import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  Boleto,
  ReservarBoletoUseCase,
  AsientoOcupadoError,
  DatosInvalidosError,
} from '@lumiere/reservas'
import { InMemoryBoletoRepository } from '@lumiere/reservas/memoria'
import { ReservasController } from '@lumiere/reservas/http'

describe('Dominio: ReservarBoletoUseCase', () => {
  let repo: InMemoryBoletoRepository
  let useCase: ReservarBoletoUseCase

  beforeEach(() => {
    repo = new InMemoryBoletoRepository()
    useCase = new ReservarBoletoUseCase(repo)
  })

  test('reserva exitosa crea un boleto con datos correctos', async () => {
    const boleto = await useCase.ejecutar('F001', 'A1', 'Ana')

    assert.ok(boleto instanceof Boleto)
    assert.equal(boleto.funcionId, 'F001')
    assert.equal(boleto.asiento, 'A1')
    assert.equal(boleto.nombreCliente, 'Ana')
    assert.ok(boleto.id)
    assert.ok(boleto.reservadoEn instanceof Date)
  })

  test('asiento ocupado lanza AsientoOcupadoError', async () => {
    await useCase.ejecutar('F001', 'A1', 'Ana')

    await assert.rejects(
      async () => {
        await useCase.ejecutar('F001', 'A1', 'Luis')
      },
      (err: unknown) => {
        assert.ok(err instanceof AsientoOcupadoError)
        assert.match((err as Error).message, /ya está ocupado/)
        return true
      }
    )
  })

  test('mismo asiento en distinta función procede sin conflicto', async () => {
    const boleto1 = await useCase.ejecutar('F001', 'A1', 'Ana')
    const boleto2 = await useCase.ejecutar('F002', 'A1', 'Luis')

    assert.ok(boleto1)
    assert.ok(boleto2)
    assert.notEqual(boleto1.id, boleto2.id)
  })

  test('datos vacíos lanza DatosInvalidosError', async () => {
    await assert.rejects(
      async () => {
        await useCase.ejecutar('F001', '', 'Ana')
      },
      (err: unknown) => {
        assert.ok(err instanceof DatosInvalidosError)
        return true
      }
    )

    await assert.rejects(
      async () => {
        await useCase.ejecutar('', 'A1', 'Ana')
      },
      (err: unknown) => {
        assert.ok(err instanceof DatosInvalidosError)
        return true
      }
    )
  })
})

describe('Presentación: ReservasController', () => {
  let repo: InMemoryBoletoRepository
  let controller: ReservasController

  beforeEach(() => {
    repo = new InMemoryBoletoRepository()
    const useCase = new ReservarBoletoUseCase(repo)
    controller = new ReservasController(useCase)
  })

  test('reserva devuelve status 201 y datos del boleto', async () => {
    const resp = await controller.ejecutar({
      funcion_id: 'F001',
      asiento: 'B2',
      nombre_cliente: 'Carlos',
    })

    assert.equal(resp.status, 201)
    assert.ok(resp.data?.id)
    assert.equal(resp.data?.asiento, 'B2')
    assert.equal(resp.data?.nombre_cliente, 'Carlos')
  })

  test('asiento ocupado devuelve status 400 y mensaje de error', async () => {
    const datos = {
      funcion_id: 'F001',
      asiento: 'B2',
      nombre_cliente: 'Carlos',
    }

    await controller.ejecutar(datos)
    const resp = await controller.ejecutar(datos)

    assert.equal(resp.status, 400)
    assert.match(resp.error ?? '', /ya está ocupado/)
  })

  test('datos incompletos devuelve status 400', async () => {
    const resp = await controller.ejecutar({
      funcion_id: 'F001',
      asiento: '',
      nombre_cliente: 'Carlos',
    })

    assert.equal(resp.status, 400)
    assert.match(resp.error ?? '', /datos obligatorios/)
  })
})
