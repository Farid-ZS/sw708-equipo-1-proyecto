import { Router } from 'express'
import { stub } from './stub.ts'

export const cancelacionesRouter = Router()

cancelacionesRouter.get('/', stub('Historial de cancelaciones'))
cancelacionesRouter.get('/:id', stub('Detalle de cancelación'))
cancelacionesRouter.post('/', stub('Cancelar boleto con motivo'))
