import { Router } from 'express'
import { stub } from './stub.ts'

export const confiteriaRouter = Router()

confiteriaRouter.get('/productos', stub('Listar productos'))
confiteriaRouter.post('/productos', stub('Crear producto (admin)'))
confiteriaRouter.put('/productos/:id', stub('Editar producto (admin)'))
confiteriaRouter.delete('/productos/:id', stub('Eliminar producto (admin)'))
confiteriaRouter.post('/ventas', stub('Registrar venta de confitería'))
