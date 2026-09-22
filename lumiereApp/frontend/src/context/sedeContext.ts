import { createContext, useContext } from 'react'
import type { Sede } from '../data/sedes.mock.ts'

export interface SedeCtx {
  /** null hasta que el usuario elige un cine: entrar a la página no lo obliga. */
  sede: Sede | null
  /** Abre el selector para elegir o cambiar de cine. */
  cambiarSede: () => void
  /**
   * Para acciones que sí necesitan cine (comprar entradas, ver funciones…):
   * si ya hay uno, ejecuta `accion` de una vez; si no, abre el selector y la
   * ejecuta apenas el usuario elija uno.
   */
  requerirSede: (accion: () => void) => void
}

export const Contexto = createContext<SedeCtx | null>(null)

export function useSede() {
  const ctx = useContext(Contexto)
  if (!ctx) throw new Error('useSede debe usarse dentro de <SedeProvider>')
  return ctx
}
