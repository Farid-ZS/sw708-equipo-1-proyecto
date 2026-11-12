import { Router } from 'express'
import { pool } from '../db.ts'
import { PostgresBoletoRepository } from '@lumiere/reservas/postgres'
import {
  type BoletoRepository,
  type PublicadorDeEventos,
  ReservarBoletoUseCase,
} from '@lumiere/reservas'
import { ReservasController, exigirJson } from '@lumiere/reservas/http'
import { bus } from '../composicion.ts'
import { stub } from './stub.ts'

export function crearReservasRouter(
  repo: BoletoRepository = new PostgresBoletoRepository(pool),
  publicador: PublicadorDeEventos = bus
): Router {
  const router = Router()
  const useCase = new ReservarBoletoUseCase(repo, publicador)
  const controller = new ReservasController(useCase)

  // Endpoints funcionales de la rodaja vertical:
  router.post('/', exigirJson, controller.reservar)
  router.post('/reservar', exigirJson, controller.reservar)

  // Endpoints complementarios para etapas siguientes:
  router.get('/:id', stub('Detalle de reserva'))
  router.delete('/:id', stub('Liberar reserva'))

  return router
}

export const reservasRouter = crearReservasRouter()