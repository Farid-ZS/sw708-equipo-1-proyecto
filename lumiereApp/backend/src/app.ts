import cors from 'cors'
import express from 'express'
import type { ErrorRequestHandler } from 'express'
import { config } from './config.ts'
import { apiRouter } from './routes/index.ts'

export const app = express()

app.use(cors({ origin: config.frontendUrl }))
app.use(express.json())

app.use('/api', apiRouter)

app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

const manejarError: ErrorRequestHandler = (err, _req, res, _next) => {
  // JSON mal formado: express.json() falla antes de llegar al controlador.
  // Se responde con el ErrorResponse del contrato (docs/api/openapi.yml).
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({
      status: 400,
      codigo: 'DATOS_INVALIDOS',
      error: 'El cuerpo debe ser un JSON válido',
    })
    return
  }
  console.error(err)
  res.status(500).json({
    status: 500,
    codigo: 'ERROR_INTERNO',
    error: 'Error interno del servidor',
  })
}
app.use(manejarError)
