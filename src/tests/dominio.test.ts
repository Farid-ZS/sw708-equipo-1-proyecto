import { beforeEach, describe, test } from 'node:test'
import assert from 'node:assert/strict'

import {
  AsientoOcupadoError,
  Boleto,
  DatosInvalidosError,
  ReservarBoletoUseCase,
} from '../domain/cinema.ts'
import { InMemoryBoletoRepository } from '../infrastructure/memoria.ts'
import { BoletoController } from '../presentation/controller.ts'

describe('ReservarBoletoUseCase', () => {
  let repositorio: InMemoryBoletoRepository
  let casoUso: ReservarBoletoUseCase

  beforeEach(() => {
    repositorio = new InMemoryBoletoRepository()
    casoUso = new ReservarBoletoUseCase(repositorio)
  })

  test('reserva exitosa', async () => {
    const boleto = await casoUso.ejecutar('F001', 'A1', 'Ana')

    assert.ok(boleto instanceof Boleto)
    assert.equal(boleto.asiento, 'A1')
  })

  test('asiento ocupado lanza error', async () => {
    await casoUso.ejecutar('F001', 'A1', 'Ana')

    await assert.rejects(
      () => casoUso.ejecutar('F001', 'A1', 'Luis'),
      (error: unknown) => error instanceof AsientoOcupadoError
    )
  })

  test('mismo asiento en distinta función', async () => {
    await casoUso.ejecutar('F001', 'A1', 'Ana')
    const boleto = await casoUso.ejecutar('F002', 'A1', 'Luis')

    assert.ok(boleto instanceof Boleto)
  })

  test('datos vacíos lanza error', async () => {
    await assert.rejects(
      () => casoUso.ejecutar('F001', '', 'Ana'),
      (error: unknown) => error instanceof DatosInvalidosError
    )
  })
})

describe('BoletoController', () => {
  let controlador: BoletoController

  beforeEach(() => {
    const repositorio = new InMemoryBoletoRepository()
    controlador = new BoletoController(new ReservarBoletoUseCase(repositorio))
  })

  test('reserva devuelve 201', async () => {
    const respuesta = await controlador.reservar({
      funcion_id: 'F001',
      asiento: 'B2',
      nombre_cliente: 'Carlos',
    })

    assert.equal(respuesta.status, 201)
    assert.ok(respuesta.data.id)
  })

  test('asiento ocupado devuelve 400', async () => {
    const datos = {
      funcion_id: 'F001',
      asiento: 'B2',
      nombre_cliente: 'Carlos',
    }

    await controlador.reservar(datos)
    const respuesta = await controlador.reservar(datos)

    assert.equal(respuesta.status, 400)
    assert.ok(respuesta.data.error)
  })
})
