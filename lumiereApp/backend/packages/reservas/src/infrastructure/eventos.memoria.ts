import type { PublicadorDeEventos, ReservaConfirmada } from '../domain/cinema.ts'

export type ManejadorDeEvento = (evento: ReservaConfirmada) => void | Promise<void>

export type AlFallarConsumidor = (error: unknown, evento: ReservaConfirmada) => void

/**
 * Adaptador en memoria del puerto PublicadorDeEventos.
 * Un consumidor que falla no deshace la reserva ni impide que los demás
 * consumidores reciban el evento: el error se reporta por `alFallar`.
 */
export class BusDeEventosEnMemoria implements PublicadorDeEventos {
  private readonly manejadores: ManejadorDeEvento[] = []
  private readonly alFallar: AlFallarConsumidor

  constructor(
    alFallar: AlFallarConsumidor = (error, evento) =>
      console.error(`Un consumidor falló al recibir ${evento.nombre}:`, error)
  ) {
    this.alFallar = alFallar
  }

  suscribir(manejador: ManejadorDeEvento): void {
    this.manejadores.push(manejador)
  }

  async publicar(evento: ReservaConfirmada): Promise<void> {
    for (const manejador of this.manejadores) {
      try {
        await manejador(evento)
      } catch (error) {
        this.alFallar(error, evento)
      }
    }
  }
}