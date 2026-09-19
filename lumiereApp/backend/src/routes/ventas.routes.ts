import { Router } from 'express'
import { stub } from './stub.ts'

export const ventasRouter = Router()

ventasRouter.get('/', stub('Listar ventas'))
ventasRouter.get('/:id', stub('Detalle de venta / boleto'))
ventasRouter.post('/', stub('Confirmar venta de boletos'))
