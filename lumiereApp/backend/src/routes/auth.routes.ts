import { Router } from 'express'
import { stub } from './stub.ts'

export const authRouter = Router()

authRouter.post('/login', stub('Iniciar sesión'))
authRouter.post('/logout', stub('Cerrar sesión'))
authRouter.get('/me', stub('Usuario autenticado'))
