import type { Pool } from 'pg'
import { Boleto, type BoletoRepository, AsientoOcupadoError } from '../domain/cinema.ts'

export class PostgresBoletoRepository implements BoletoRepository {
  private readonly pool: Pool

  constructor(pool: Pool) {
    this.pool = pool
  }

  async guardar(boleto: Boleto): Promise<void> {
    try {
      await this.pool.query(
        `INSERT INTO boletos (id, funcion_id, asiento, nombre_cliente, reservado_en)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          boleto.id,
          boleto.funcionId,
          boleto.asiento,
          boleto.nombreCliente,
          boleto.reservadoEn,
        ]
      )
    } catch (error: unknown) {
      const err = error as { code?: string }
      // Código 23505 = unique_violation en PostgreSQL (uk_boleto_funcion_asiento)
      if (err?.code === '23505') {
        throw new AsientoOcupadoError(`El asiento ${boleto.asiento} ya está ocupado`)
      }
      throw error
    }
  }

  async buscarPorAsiento(funcionId: string, asiento: string): Promise<Boleto | null> {
    const res = await this.pool.query(
      `SELECT id, funcion_id, asiento, nombre_cliente, reservado_en
       FROM boletos
       WHERE funcion_id = $1 AND asiento = $2`,
      [funcionId, asiento]
    )

    if (res.rows.length === 0) {
      return null
    }

    const row = res.rows[0]
    return new Boleto(
      String(row.id),
      String(row.funcion_id),
      String(row.asiento),
      String(row.nombre_cliente),
      new Date(row.reservado_en)
    )
  }
}
