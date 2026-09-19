import pg from 'pg'
import { config } from './config.ts'

// El pool no abre conexiones hasta la primera consulta, así que el backend levanta sin BD.
export const pool = new pg.Pool({ connectionString: config.databaseUrl })
