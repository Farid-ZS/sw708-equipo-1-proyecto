import { Router } from 'express'
import { stub } from './stub.ts'

export const sedesRouter = Router()

sedesRouter.get('/', stub('Listar sedes (cines)'))
sedesRouter.get('/:id', stub('Detalle de sede'))
sedesRouter.post('/', stub('Crear sede (admin)'))
sedesRouter.put('/:id', stub('Editar sede (admin)'))
sedesRouter.delete('/:id', stub('Eliminar sede (admin)'))
