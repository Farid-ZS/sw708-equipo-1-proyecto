import { Router } from 'express'
import { pool } from '../db.ts'
import { PostgresBoletoRepository } from '../infrastructure/postgres.repository.ts'
import {
  type BoletoRepository,
  ReservarBoletoUseCase,
} from '../domain/cinema.ts'
import { ReservasController } from '../presentation/reservas.controller.ts'
import { stub } from './stub.ts'

export function crearReservasRouter(
  repo: BoletoRepository = new PostgresBoletoRepository(pool)
): Router {
  const router = Router()
  const useCase = new ReservarBoletoUseCase(repo)
  const controller = new ReservasController(useCase)

  // Endpoints funcionales de la rodaja vertical:
  router.post('/', controller.reservar)
  router.post('/reservar', controller.reservar)

  // Endpoints complementarios para etapas siguientes:
  router.get('/:id', stub('Detalle de reserva'))
  router.delete('/:id', stub('Liberar reserva'))

  return router
}

export const reservasRouter = crearReservasRouter()
