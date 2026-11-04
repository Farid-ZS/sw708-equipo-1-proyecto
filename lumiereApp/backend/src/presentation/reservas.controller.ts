import type { Request, Response } from 'express'
import {
  ReservarBoletoUseCase,
  AsientoOcupadoError,
  DatosInvalidosError,
} from '../domain/cinema.ts'

export interface ReservaInput {
  funcion_id?: string
  asiento?: string
  nombre_cliente?: string
}

export interface ReservaOutput {
  status: number
  data?: {
    id: string
    funcion_id: string
    asiento: string
    nombre_cliente: string
    reservado_en: string
  }
  error?: string
}

export class ReservasController {
  private readonly useCase: ReservarBoletoUseCase

  constructor(useCase: ReservarBoletoUseCase) {
    this.useCase = useCase
  }

  /**
   * Ejecución programática para pruebas unitarias o invocación CLI
   */
  async ejecutar(input: ReservaInput): Promise<ReservaOutput> {
    const funcionId = input.funcion_id ?? ''
    const asiento = input.asiento ?? ''
    const nombreCliente = input.nombre_cliente ?? ''

    try {
      const boleto = await this.useCase.ejecutar(funcionId, asiento, nombreCliente)
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
      if (
        error instanceof AsientoOcupadoError ||
        error instanceof DatosInvalidosError
      ) {
        return {
          status: 400,
          error: error.message,
        }
      }
      throw error
    }
  }

  /**
   * Manejador de endpoint HTTP Express
   */
  reservar = async (req: Request, res: Response): Promise<void> => {
    try {
      const resultado = await this.ejecutar(req.body)
      res.status(resultado.status).json(resultado)
    } catch (error) {
      console.error('Error no esperado en reserva:', error)
      res.status(500).json({ status: 500, error: 'Error interno del servidor' })
    }
  }
}
