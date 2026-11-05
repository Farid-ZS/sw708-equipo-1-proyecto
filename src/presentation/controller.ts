import {
  AsientoOcupadoError,
  DatosInvalidosError,
  type ReservarBoletoUseCase,
} from '../domain/cinema.ts'

export interface DatosReserva {
  funcion_id?: string
  asiento?: string
  nombre_cliente?: string
}

export interface RespuestaReserva {
  status: number
  data: {
    id?: string
    funcion_id?: string
    asiento?: string
    nombre_cliente?: string
    reservado_en?: string
    error?: string
  }
}

export class BoletoController {
  private readonly casoUso: ReservarBoletoUseCase

  constructor(casoUso: ReservarBoletoUseCase) {
    this.casoUso = casoUso
  }

  async reservar(datos: DatosReserva): Promise<RespuestaReserva> {
    const funcionId = (datos.funcion_id ?? '').trim()
    const asiento = (datos.asiento ?? '').trim()
    const nombreCliente = (datos.nombre_cliente ?? '').trim()

    try {
      const boleto = await this.casoUso.ejecutar(funcionId, asiento, nombreCliente)
      return {
        status: 201,
        data: {
          id: boleto.id,
          funcion_id: boleto.funcionId,
          asiento: boleto.asiento,
          nombre_cliente: boleto.nombreCliente,
          reservado_en: boleto.reservadoEn.toISOString(),
        },
      }
    } catch (error) {
      if (error instanceof AsientoOcupadoError || error instanceof DatosInvalidosError) {
        return { status: 400, data: { error: error.message } }
      }
      throw error
    }
  }
}
