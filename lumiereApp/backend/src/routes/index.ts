import { Router } from 'express'
import { authRouter } from './auth.routes.ts'
import { cancelacionesRouter } from './cancelaciones.routes.ts'
import { confiteriaRouter } from './confiteria.routes.ts'
import { funcionesRouter } from './funciones.routes.ts'
import { peliculasRouter } from './peliculas.routes.ts'
import { reportesRouter } from './reportes.routes.ts'
import { reservasRouter } from './reservas.routes.ts'
import { salasRouter } from './salas.routes.ts'
import { sedesRouter } from './sedes.routes.ts'
import { ventasRouter } from './ventas.routes.ts'

// Cada pantalla nueva = un archivo *.routes.ts + una línea aquí.
export const apiRouter = Router()

apiRouter.get('/health', (_req, res) => {
  res.json({ ok: true })
})

apiRouter.use('/auth', authRouter)
apiRouter.use('/peliculas', peliculasRouter)
apiRouter.use('/funciones', funcionesRouter)
apiRouter.use('/sedes', sedesRouter)
apiRouter.use('/salas', salasRouter)
apiRouter.use('/reservas', reservasRouter)
apiRouter.use('/ventas', ventasRouter)
apiRouter.use('/cancelaciones', cancelacionesRouter)
apiRouter.use('/confiteria', confiteriaRouter)
apiRouter.use('/reportes', reportesRouter)
