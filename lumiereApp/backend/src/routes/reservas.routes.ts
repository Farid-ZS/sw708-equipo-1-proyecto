import { Router } from 'express'
import { stub } from './stub.ts'

export const reservasRouter = Router()

reservasRouter.post('/', stub('Reservar asientos temporalmente'))
reservasRouter.get('/:id', stub('Detalle de reserva'))
reservasRouter.delete('/:id', stub('Liberar reserva'))
