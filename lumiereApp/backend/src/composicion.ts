import { BusDeEventosEnMemoria } from '@lumiere/reservas/eventos'
import { AuditoriaEnMemoria } from './auditoria/auditoria.ts'

// Único lugar que conecta emisor y consumidores. Sumar un consumidor nuevo
// es una línea `bus.suscribir(...)` aquí; el caso de uso de Reservas no cambia.
export const bus = new BusDeEventosEnMemoria()
export const auditoria = new AuditoriaEnMemoria()

bus.suscribir(auditoria.alReservaConfirmada)