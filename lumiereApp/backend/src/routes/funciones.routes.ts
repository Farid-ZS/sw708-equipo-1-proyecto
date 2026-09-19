import { Router } from 'express'
import { stub } from './stub.ts'

export const funcionesRouter = Router()

funcionesRouter.get('/', stub('Listar funciones'))
funcionesRouter.get('/:id', stub('Detalle de función'))
funcionesRouter.get('/:id/asientos', stub('Mapa de asientos de la función'))
funcionesRouter.post('/', stub('Programar función (admin)'))
funcionesRouter.put('/:id', stub('Editar función (admin)'))
funcionesRouter.delete('/:id', stub('Eliminar función (admin)'))
