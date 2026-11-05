import pg from 'pg'

import { Boleto, type BoletoRepository } from '../domain/cinema.ts'

export class PostgreBoletoRepository implements BoletoRepository {
  private readonly pool: pg.Pool

  constructor(pool: pg.Pool) {
    this.pool = pool
  }

  async guardar(boleto: Boleto): Promise<void> {
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
  }

  async buscarPorAsiento(funcionId: string, asiento: string): Promise<Boleto | null> {
    const resultado = await this.pool.query(
      `SELECT id, funcion_id, asiento, nombre_cliente, reservado_en
       FROM boletos
       WHERE funcion_id = $1 AND asiento = $2`,
      [funcionId, asiento]
    )

    if (resultado.rows.length === 0) {
      return null
    }

    const fila = resultado.rows[0]
    return new Boleto(
      String(fila.id),
      String(fila.funcion_id),
      String(fila.asiento),
      String(fila.nombre_cliente),
      new Date(fila.reservado_en)
    )
  }
}
