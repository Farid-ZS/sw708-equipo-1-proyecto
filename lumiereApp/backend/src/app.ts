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
  console.error(err)
  res.status(500).json({ error: 'Error interno del servidor' })
}
app.use(manejarError)
