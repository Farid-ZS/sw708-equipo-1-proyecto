import { Router } from 'express'
import { stub } from './stub.ts'

export const peliculasRouter = Router()

peliculasRouter.get('/', stub('Listar cartelera'))
peliculasRouter.get('/:id', stub('Detalle de película'))
peliculasRouter.post('/', stub('Crear película (admin)'))
peliculasRouter.put('/:id', stub('Editar película (admin)'))
peliculasRouter.delete('/:id', stub('Eliminar película (admin)'))
