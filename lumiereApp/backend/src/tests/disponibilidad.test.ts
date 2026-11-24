import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  ReservarBoletoUseCase,
  ServicioNoDisponibleError,
  type BoletoRepository,
} from '@lumiere/reservas'
import { ReservasController } from '@lumiere/reservas/http'

describe('Disponibilidad: respuesta definida cuando la base no responde', () => {
  test('ServicioNoDisponibleError se traduce a HTTP 503 con mensaje claro', async () => {
    const repoCaido: BoletoRepository = {
      async guardar() {
        throw new ServicioNoDisponibleError()
      },
      async buscarPorAsiento() {
        throw new ServicioNoDisponibleError()
      },
    }
    const controller = new ReservasController(new ReservarBoletoUseCase(repoCaido))

    const resultado = await controller.ejecutar({
      funcion_id: 'F001',
      asiento: 'A1',
      nombre_cliente: 'Ana',
    })

    assert.equal(resultado.status, 503)
    assert.match(resultado.error ?? '', /no está disponible/)
  })
})
