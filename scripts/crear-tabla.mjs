import { readFile } from 'node:fs/promises'
import pg from 'pg'

const urlBaseDatos = process.env.TEST_DATABASE_URL

if (!urlBaseDatos) {
  console.error('TEST_DATABASE_URL no está configurada')
  process.exit(1)
}

const sql = await readFile('database/lab06_hexagonal/01_create_boletos.sql', 'utf8')
const cliente = new pg.Client({ connectionString: urlBaseDatos })

try {
  await cliente.connect()
  await cliente.query(sql)
  console.log('Tabla de pruebas creada correctamente')
} catch (error) {
  console.error('No se pudo crear la tabla de pruebas:', error)
  process.exitCode = 1
} finally {
  await cliente.end()
}
