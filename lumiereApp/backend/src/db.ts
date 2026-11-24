import pg from 'pg'
import { config } from './config.ts'

// El pool no abre conexiones hasta la primera consulta, así que el backend levanta sin BD.
// Timeouts del cliente: sin ellos, una base que no responde deja la petición esperando sin límite.
export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  connectionTimeoutMillis: 1000,
  query_timeout: 1000,
})
