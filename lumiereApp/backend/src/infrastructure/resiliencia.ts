import CircuitBreaker from 'opossum'
import {
  AsientoOcupadoError,
  DatosInvalidosError,
  ServicioNoDisponibleError,
  type Boleto,
  type BoletoRepository,
} from '@lumiere/reservas'

/**
 * Valores y motivos: docs/resiliencia.md.
 * - timeout: tiempo máximo de espera por una respuesta de la base.
 * - errorThresholdPercentage: % de fallas que abre el circuito.
 * - volumeThreshold: peticiones mínimas antes de evaluar el %.
 * - resetTimeout: cuánto queda abierto antes de probar una petición.
 * - reintentos: intentos extra de una lectura que falla (no se reintenta guardar).
 * - esperaReintentoMs: pausa entre intentos.
 */
export interface OpcionesResiliencia {
  timeout: number
  errorThresholdPercentage: number
  volumeThreshold: number
  resetTimeout: number
  reintentos: number
  esperaReintentoMs: number
}

export const opcionesPorDefecto: OpcionesResiliencia = {
  timeout: 1500,
  errorThresholdPercentage: 50,
  volumeThreshold: 5,
  resetTimeout: 10_000,
  reintentos: 2,
  esperaReintentoMs: 100,
}

// Un asiento ocupado es una respuesta de negocio, no una falla de la base:
// no cuenta para abrir el circuito.
const esErrorDeNegocio = (error: unknown): boolean =>
  error instanceof AsientoOcupadoError || error instanceof DatosInvalidosError

const dormir = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms))

/**
 * Adaptador decorador: protege cualquier BoletoRepository con timeout y
 * circuit breaker (opossum). El dominio solo ve el mismo puerto y, cuando la
 * base no responde, el error de dominio ServicioNoDisponibleError.
 */
export class BoletoRepositoryConCircuitBreaker implements BoletoRepository {
  private readonly guardarCb: CircuitBreaker<[Boleto], void>
  private readonly buscarCb: CircuitBreaker<[string, string], Boleto | null>
  private readonly registrar: (mensaje: string) => void

  constructor(
    repo: BoletoRepository,
    opciones: OpcionesResiliencia = opcionesPorDefecto,
    registrar: (mensaje: string) => void = console.warn
  ) {
    this.registrar = registrar
    const { reintentos, esperaReintentoMs, ...conf } = opciones
    const comunes = { ...conf, errorFilter: esErrorDeNegocio }
    // Guardar no se reintenta: tras un timeout no se sabe si el INSERT llegó a
    // hacerse, y repetirlo mostraría «asiento ocupado» sobre una reserva exitosa.
    this.guardarCb = new CircuitBreaker((boleto: Boleto) => repo.guardar(boleto), comunes)
    // La lectura es idempotente: se reintenta dentro del circuito, sin superar su timeout.
    this.buscarCb = new CircuitBreaker(async (funcionId: string, asiento: string) => {
      for (let intento = 0; ; intento++) {
        try {
          return await repo.buscarPorAsiento(funcionId, asiento)
        } catch (error) {
          if (esErrorDeNegocio(error) || intento >= reintentos) throw error
          await dormir(esperaReintentoMs)
        }
      }
    }, comunes)
    for (const [nombre, cb] of [
      ['guardar', this.guardarCb],
      ['buscarPorAsiento', this.buscarCb],
    ] as const) {
      cb.on('open', () => this.registrar(`Circuito abierto (${nombre}): la base no responde`))
      cb.on('halfOpen', () => this.registrar(`Circuito semiabierto (${nombre}): probando`))
      cb.on('close', () => this.registrar(`Circuito cerrado (${nombre}): la base respondió`))
    }
  }

  guardar(boleto: Boleto): Promise<void> {
    return this.proteger(() => this.guardarCb.fire(boleto))
  }

  buscarPorAsiento(funcionId: string, asiento: string): Promise<Boleto | null> {
    return this.proteger(() => this.buscarCb.fire(funcionId, asiento))
  }

  cerrar(): void {
    this.guardarCb.shutdown()
    this.buscarCb.shutdown()
  }

  private async proteger<T>(llamada: () => Promise<T>): Promise<T> {
    try {
      return await llamada()
    } catch (error) {
      if (esErrorDeNegocio(error)) throw error
      throw new ServicioNoDisponibleError()
    }
  }
}
