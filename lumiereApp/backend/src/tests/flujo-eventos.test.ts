import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  AsientoOcupadoError,
  ReservaConfirmada,
  ReservarBoletoUseCase,
} from '@lumiere/reservas'
import { InMemoryBoletoRepository } from '@lumiere/reservas/memoria'
import { BusDeEventosEnMemoria } from '@lumiere/reservas/eventos'
import { ReservasController } from '@lumiere/reservas/http'
import { AuditoriaEnMemoria } from '../auditoria/auditoria.ts'

describe('Flujo por eventos: Reservas emite ReservaConfirmada y Auditoría reacciona', () => {
  let repo: InMemoryBoletoRepository
  let bus: BusDeEventosEnMemoria
  let auditoria: AuditoriaEnMemoria
  let useCase: ReservarBoletoUseCase
  let erroresDelBus: unknown[]

  beforeEach(() => {
    erroresDelBus = []
    repo = new InMemoryBoletoRepository()
    bus = new BusDeEventosEnMemoria((error) => erroresDelBus.push(error))
    auditoria = new AuditoriaEnMemoria()
    bus.suscribir(auditoria.alReservaConfirmada)
    useCase = new ReservarBoletoUseCase(repo, bus)
  })

  test('el caso de uso emite el evento y Auditoría registra la reserva', async () => {
    const boleto = await useCase.ejecutar('F001', 'A1', 'Ana')

    const registros = auditoria.listar()
    assert.equal(registros.length, 1)
    assert.equal(registros[0]?.operacion, 'RESERVA_CONFIRMADA')
    assert.equal(registros[0]?.entidadId, boleto.id)
    assert.equal(registros[0]?.responsable, 'Ana')
    assert.deepEqual(registros[0]?.detalle, { funcionId: 'F001', asiento: 'A1' })
    assert.equal(registros[0]?.fecha, boleto.reservadoEn.toISOString())
    assert.equal(registros[0]?.resultado, 'OK')
  })

  test('de extremo a extremo por el controlador: 201 y registro de auditoría', async () => {
    const controller = new ReservasController(useCase)

    const resultado = await controller.ejecutar({
      funcion_id: 'F002',
      asiento: 'B7',
      nombre_cliente: 'Luis',
    })

    assert.equal(resultado.status, 201)
    const registros = auditoria.listar()
    assert.equal(registros.length, 1)
    assert.equal(registros[0]?.entidadId, resultado.data?.id)
  })

  test('una reserva rechazada no emite el evento', async () => {
    await useCase.ejecutar('F001', 'A1', 'Ana')

    await assert.rejects(
      () => useCase.ejecutar('F001', 'A1', 'Luis'),
      (err: unknown) => err instanceof AsientoOcupadoError
    )

    assert.equal(auditoria.listar().length, 1)
  })

  test('el evento es inmutable', async () => {
    let recibido: ReservaConfirmada | undefined
    bus.suscribir((evento) => {
      recibido = evento
    })

    await useCase.ejecutar('F001', 'A1', 'Ana')

    assert.ok(recibido instanceof ReservaConfirmada)
    assert.equal(recibido.nombre, 'ReservaConfirmada')
    assert.ok(Object.isFrozen(recibido))
    assert.throws(() => {
      ;(recibido as { asiento: string }).asiento = 'Z99'
    }, TypeError)
    assert.equal(recibido.asiento, 'A1')
  })

  test('si un consumidor falla, la reserva sigue confirmada y los demás consumidores reciben el evento', async () => {
    const recibidos: string[] = []
    bus.suscribir(() => {
      throw new Error('consumidor roto')
    })
    bus.suscribir((evento) => {
      recibidos.push(evento.boletoId)
    })

    const boleto = await useCase.ejecutar('F001', 'A1', 'Ana')

    assert.ok(await repo.buscarPorAsiento('F001', 'A1'))
    assert.deepEqual(recibidos, [boleto.id])
    assert.equal(auditoria.listar().length, 1)
    assert.equal(erroresDelBus.length, 1)
  })

  test('sumar otro consumidor no obliga a tocar el caso de uso', async () => {
    const segundo = new AuditoriaEnMemoria()
    bus.suscribir(segundo.alReservaConfirmada)

    await useCase.ejecutar('F001', 'A1', 'Ana')

    assert.equal(auditoria.listar().length, 1)
    assert.equal(segundo.listar().length, 1)
  })
})