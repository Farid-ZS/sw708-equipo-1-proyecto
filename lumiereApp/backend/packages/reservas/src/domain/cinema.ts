import crypto from 'node:crypto'

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
    return new Boleto(
      crypto.randomUUID(),
      funcionId,
      asiento,
      nombreCliente,
      new Date()
    )
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
  private readonly repository: BoletoRepository

  constructor(repository: BoletoRepository) {
    this.repository = repository
  }

  async ejecutar(
    funcionId: string,
    asiento: string,
    nombreCliente: string
  ): Promise<Boleto> {
    if (!funcionId?.trim() || !asiento?.trim() || !nombreCliente?.trim()) {
      throw new DatosInvalidosError('Faltan datos obligatorios')
    }

    const fId = funcionId.trim()
    const asnt = asiento.trim()
    const cliente = nombreCliente.trim()

    const existente = await this.repository.buscarPorAsiento(fId, asnt)
    if (existente !== null) {
      throw new AsientoOcupadoError(`El asiento ${asnt} ya está ocupado`)
    }

    const boleto = Boleto.crear(fId, asnt, cliente)
    await this.repository.guardar(boleto)
    return boleto
  }
}
