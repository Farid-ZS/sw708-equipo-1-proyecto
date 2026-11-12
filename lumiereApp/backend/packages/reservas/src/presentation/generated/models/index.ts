/* tslint:disable */
/* eslint-disable */
/**
 * 
 * @export
 * @interface CrearReservaRequest
 */
export interface CrearReservaRequest {
    /**
     * Identificador alfanumérico de la función en cartelera.
     * No admite valores nulos, cadenas vacías ni únicamente espacios.
     * 
     * @type {string}
     * @memberof CrearReservaRequest
     */
    funcion_id: string;
    /**
     * Código identificador de la butaca (letra de fila seguida de número).
     * Se normaliza a mayúsculas en el servidor.
     * 
     * @type {string}
     * @memberof CrearReservaRequest
     */
    asiento: string;
    /**
     * Nombre y apellido del cliente que reserva.
     * No puede estar vacío ni contener solo espacios.
     * 
     * @type {string}
     * @memberof CrearReservaRequest
     */
    nombre_cliente: string;
}
/**
 * 
 * @export
 * @interface ErrorResponse
 */
export interface ErrorResponse {
    /**
     * Código numérico idéntico al estado HTTP devuelto en el protocolo.
     * @type {number}
     * @memberof ErrorResponse
     */
    status: ErrorResponseStatusEnum;
    /**
     * Constante categórica inmutable para toma de decisiones en el cliente consumidor.
     * @type {string}
     * @memberof ErrorResponse
     */
    codigo: ErrorResponseCodigoEnum;
    /**
     * Mensaje legible para humanos explicando el motivo del fallo sin revelar detalles internos.
     * @type {string}
     * @memberof ErrorResponse
     */
    error: string;
}


/**
 * @export
 */
export const ErrorResponseStatusEnum = {
    NUMBER_400: 400,
    NUMBER_404: 404,
    NUMBER_409: 409,
    NUMBER_415: 415,
    NUMBER_500: 500
} as const;
export type ErrorResponseStatusEnum = typeof ErrorResponseStatusEnum[keyof typeof ErrorResponseStatusEnum];

/**
 * @export
 */
export const ErrorResponseCodigoEnum = {
    DatosInvalidos: 'DATOS_INVALIDOS',
    FuncionNoEncontrada: 'FUNCION_NO_ENCONTRADA',
    AsientoOcupado: 'ASIENTO_OCUPADO',
    SolicitudMalformada: 'SOLICITUD_MALFORMADA',
    ErrorInterno: 'ERROR_INTERNO'
} as const;
export type ErrorResponseCodigoEnum = typeof ErrorResponseCodigoEnum[keyof typeof ErrorResponseCodigoEnum];

/**
 * 
 * @export
 * @interface Reserva
 */
export interface Reserva {
    /**
     * Identificador universal único (UUID v4) asignado por el servidor.
     * @type {string}
     * @memberof Reserva
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof Reserva
     */
    funcion_id: string;
    /**
     * 
     * @type {string}
     * @memberof Reserva
     */
    asiento: string;
    /**
     * 
     * @type {string}
     * @memberof Reserva
     */
    nombre_cliente: string;
    /**
     * Marca temporal de creación en formato ISO 8601 UTC.
     * @type {string}
     * @memberof Reserva
     */
    reservado_en: string;
}
/**
 * 
 * @export
 * @interface ReservaCreadaResponse
 */
export interface ReservaCreadaResponse {
    /**
     * 
     * @type {number}
     * @memberof ReservaCreadaResponse
     */
    status: ReservaCreadaResponseStatusEnum;
    /**
     * 
     * @type {Reserva}
     * @memberof ReservaCreadaResponse
     */
    data: Reserva;
}


/**
 * @export
 */
export const ReservaCreadaResponseStatusEnum = {
    NUMBER_201: 201
} as const;
export type ReservaCreadaResponseStatusEnum = typeof ReservaCreadaResponseStatusEnum[keyof typeof ReservaCreadaResponseStatusEnum];

