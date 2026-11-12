import type { ReservaConfirmada } from '@lumiere/reservas'

/**
 * Módulo Auditoría (partición B): consume eventos de Reservas y conserva
 * quién hizo qué, sobre qué entidad y cuándo. No decide si una reserva es
 * válida: solo registra lo que Reservas ya confirmó.
 */
export interface RegistroAuditoria {
  operacion: 'RESERVA_CONFIRMADA'
  entidad: 'boleto'
  entidadId: string
  responsable: string
  detalle: { funcionId: string; asiento: string }
  fecha: string
  resultado: 'OK'
}

export class AuditoriaEnMemoria {
  private readonly registros: RegistroAuditoria[] = []

  // Función flecha para poder pasarla directo a `bus.suscribir(...)`.
  alReservaConfirmada = (evento: ReservaConfirmada): void => {
    this.registros.push({
      operacion: 'RESERVA_CONFIRMADA',
      entidad: 'boleto',
      entidadId: evento.boletoId,
      responsable: evento.nombreCliente,
      detalle: { funcionId: evento.funcionId, asiento: evento.asiento },
      fecha: evento.ocurridoEn,
      resultado: 'OK',
    })
  }

  listar(): readonly RegistroAuditoria[] {
    return [...this.registros]
  }
}