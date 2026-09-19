import { app } from './app.ts'
import { config } from './config.ts'

// Express 5 entrega los errores de listen (p. ej. puerto ocupado) en este callback.
app.listen(config.port, (error?: Error) => {
  if (error) throw error
  console.log(`Backend escuchando en http://localhost:${config.port}`)
})
