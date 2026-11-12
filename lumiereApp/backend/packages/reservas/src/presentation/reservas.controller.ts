import type { NextFunction, Request, Response } from 'express'
import {
  ReservarBoletoUseCase,
  AsientoOcupadoError,
  DatosInvalidosError,
  type Boleto,
} from '../domain/cinema.ts'
import {
  ErrorResponseCodigoEnum,
  type CrearReservaRequest,
  type ErrorResponse,
  type ReservaCreadaResponse,
} from './generated/models/index.ts'

/**
 * Adaptador de entrada HTTP del módulo Reservas.
 *
 * Los DTOs (CrearReservaRequest, ReservaCreadaResponse, ErrorResponse) se
 * generan desde docs/api/openapi.yaml (v1.1.0) con `npm run generar:api`; no
 * se editan a mano. Express y los DTOs viven solo en esta capa: el dominio
 * recibe valores simples y no sabe nada de HTTP.
 *
 * Pendiente: el contrato 1.1.0 declara 404 FUNCION_NO_ENCONTRADA, pero el
 * dominio aún no tiene catálogo de funciones (no hay puerto para consultarlo),
 * así que ese caso no se emite todavía.
 */

/** Formato de butaca del contrato: letra de fila + número (A1, B12). */
const PATRON_ASIENTO = /^[A-Za-z][0-9]{1,2}$/
const MAX_NOMBRE_CLIENTE = 120

/**
 * Respuesta del endpoint: o la reserva creada o un error del contrato.
 * Los `?: never` permiten leer `resp.data` o `resp.error` sin estrechar el tipo.
 */
export type ResultadoReserva =
  | (ReservaCreadaResponse & { codigo?: never; error?: never })
  | (ErrorResponse & { data?: never })

const CAMPOS_PERMITIDOS: ReadonlyArray<keyof CrearReservaRequest> = [
  'funcion_id',
  'asiento',
  'nombre_cliente',
]

function errorDatosInvalidos(mensaje: string): ErrorResponse {
  return { status: 400, codigo: ErrorResponseCodigoEnum.DatosInvalidos, error: mensaje }
}

function errorAsientoOcupado(mensaje: string): ErrorResponse {
  return { status: 409, codigo: ErrorResponseCodigoEnum.AsientoOcupado, error: mensaje }
}

function errorTipoContenido(): ErrorResponse {
  return {
    status: 415,
    codigo: ErrorResponseCodigoEnum.SolicitudMalformada,
    error: 'Content-Type no soportado. Se requiere application/json',
  }
}

export function errorInterno(): ErrorResponse {
  return {
    status: 500,
    codigo: ErrorResponseCodigoEnum.ErrorInterno,
    error: 'Error interno del servidor',
  }
}

/**
 * Traduce el cuerpo HTTP al DTO de entrada. Valida la forma que exige el
 * contrato (objeto, campos conocidos, tipo texto, obligatorios presentes,
 * formato de asiento, largo del nombre) y normaliza el asiento a mayúsculas.
 * La regla "no vacío / no solo espacios" la sigue aplicando el dominio.
 */
function traducirPeticion(cuerpo: unknown): CrearReservaRequest | ErrorResponse {
  if (typeof cuerpo !== 'object' || cuerpo === null || Array.isArray(cuerpo)) {
    return errorDatosInvalidos('El cuerpo debe ser un objeto JSON')
  }

  const datos = cuerpo as Record<string, unknown>

  const desconocidos = Object.keys(datos).filter(
    (campo) => !CAMPOS_PERMITIDOS.includes(campo as keyof CrearReservaRequest)
  )
  if (desconocidos.length > 0) {
    return errorDatosInvalidos(`Campos no permitidos: ${desconocidos.join(', ')}`)
  }

  for (const campo of CAMPOS_PERMITIDOS) {
    const valor = datos[campo]
    if (valor === undefined || valor === null) {
      return errorDatosInvalidos('Faltan datos obligatorios')
    }
    if (typeof valor !== 'string') {
      return errorDatosInvalidos(`El campo ${campo} debe ser texto`)
    }
  }

  const asiento = (datos.asiento as string).trim()
  const nombreCliente = datos.nombre_cliente as string

  // Vacío o solo espacios: lo rechaza el dominio con "Faltan datos obligatorios".
  if (asiento !== '' && !PATRON_ASIENTO.test(asiento)) {
    return errorDatosInvalidos('El asiento debe ser una letra seguida de un número (ej. A12)')
  }
  if (nombreCliente.trim().length > MAX_NOMBRE_CLIENTE) {
    return errorDatosInvalidos(
      `El nombre_cliente no puede superar ${MAX_NOMBRE_CLIENTE} caracteres`
    )
  }

  return {
    funcion_id: datos.funcion_id as string,
    asiento: asiento.toUpperCase(),
    nombre_cliente: nombreCliente,
  }
}

/**
 * Middleware de la ruta: 415 si el cuerpo no se envía como application/json.
 * Va antes del controlador porque express.json() ignora otros tipos de contenido.
 */
export function exigirJson(req: Request, res: Response, next: NextFunction): void {
  if (!req.is('application/json')) {
    res.status(415).json(errorTipoContenido())
    return
  }
  next()
}

function esError(valor: CrearReservaRequest | ErrorResponse): valor is ErrorResponse {
  return 'codigo' in valor
}

/** Traduce la entidad de dominio al DTO de respuesta del contrato. */
function traducirRespuesta(boleto: Boleto): ReservaCreadaResponse {
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
}

export class ReservasController {
  private readonly useCase: ReservarBoletoUseCase

  constructor(useCase: ReservarBoletoUseCase) {
    this.useCase = useCase
  }

  /**
   * Petición → DTO → caso de uso → DTO de respuesta.
   * No depende de Express, así se prueba sin levantar un servidor.
   */
  async ejecutar(cuerpo: unknown): Promise<ResultadoReserva> {
    const peticion = traducirPeticion(cuerpo)
    if (esError(peticion)) {
      return peticion
    }

    try {
      const boleto = await this.useCase.ejecutar(
        peticion.funcion_id,
        peticion.asiento,
        peticion.nombre_cliente
      )
      return traducirRespuesta(boleto)
    } catch (error) {
      if (error instanceof DatosInvalidosError) {
        return errorDatosInvalidos(error.message)
      }
      if (error instanceof AsientoOcupadoError) {
        return errorAsientoOcupado(error.message)
      }
      // No se exponen detalles de infraestructura al consumidor.
      console.error('Error no esperado en reserva:', error)
      return errorInterno()
    }
  }

  /** Manejador Express de POST /api/reservas. */
  reservar = async (req: Request, res: Response): Promise<void> => {
    const resultado = await this.ejecutar(req.body)
    if (resultado.data) {
      // RFC 9110: el 201 indica dónde quedó el recurso creado (contrato 1.1.0).
      res.setHeader('Location', `/api/reservas/${resultado.data.id}`)
    }
    res.status(resultado.status).json(resultado)
  }
}
