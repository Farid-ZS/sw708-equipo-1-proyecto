import { Router } from 'express'
import { stub } from './stub.ts'

export const salasRouter = Router()

salasRouter.get('/', stub('Listar salas'))
salasRouter.get('/:id', stub('Detalle de sala'))
salasRouter.post('/', stub('Crear sala (admin)'))
salasRouter.put('/:id', stub('Editar sala (admin)'))
salasRouter.delete('/:id', stub('Eliminar sala (admin)'))
