import { randomUUID } from 'node:crypto'
import type { Request } from 'express' // Violacion intencional de prueba

export class Boleto {
  readonly id: string
  readonly funcionId: string
  readonly asiento: string
  readonly nombreCliente: string
  readonly reservadoEn: Date

  constructor(
    id: string,
    funcionId: string,
    asiento: string,
    nombreCliente: string,
    reservadoEn: Date = new Date()
  ) {
    this.id = id
    this.funcionId = funcionId
    this.asiento = asiento
    this.nombreCliente = nombreCliente
    this.reservadoEn = reservadoEn
  }

  static crear(funcionId: string, asiento: string, nombreCliente: string): Boleto {
    return new Boleto(randomUUID(), funcionId, asiento, nombreCliente, new Date())
  }
}

export class AsientoOcupadoError extends Error {
  constructor(mensaje: string = 'El asiento ya está ocupado') {
    super(mensaje)
    this.name = 'AsientoOcupadoError'
  }
}

export class DatosInvalidosError extends Error {
  constructor(mensaje: string = 'Faltan datos obligatorios') {
    super(mensaje)
    this.name = 'DatosInvalidosError'
  }
}

export interface BoletoRepository {
  guardar(boleto: Boleto): Promise<void>
  buscarPorAsiento(funcionId: string, asiento: string): Promise<Boleto | null>
}

export class ReservarBoletoUseCase {
  private readonly repositorio: BoletoRepository

  constructor(repositorio: BoletoRepository) {
    this.repositorio = repositorio
  }

  async ejecutar(
    funcionId: string,
    asiento: string,
    nombreCliente: string
  ): Promise<Boleto> {
    if (!funcionId?.trim() || !asiento?.trim() || !nombreCliente?.trim()) {
      throw new DatosInvalidosError('Faltan datos obligatorios')
    }

    const funcion = funcionId.trim()
    const butaca = asiento.trim()
    const cliente = nombreCliente.trim()

    const existente = await this.repositorio.buscarPorAsiento(funcion, butaca)
    if (existente !== null) {
      throw new AsientoOcupadoError(`El asiento ${butaca} ya está ocupado`)
    }

    const boleto = Boleto.crear(funcion, butaca, cliente)
    await this.repositorio.guardar(boleto)
    return boleto
  }
}
