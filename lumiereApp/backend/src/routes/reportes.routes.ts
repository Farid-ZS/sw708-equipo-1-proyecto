import { Router } from 'express'
import { stub } from './stub.ts'

export const reportesRouter = Router()

reportesRouter.get('/ocupacion', stub('Ocupación de salas (admin)'))
reportesRouter.get('/recaudacion', stub('Recaudación por función (admin)'))
