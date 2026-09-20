import { createContext, useContext } from 'react'
import type { Sede } from '../data/sedes.mock.ts'

export interface SedeCtx {
  sede: Sede
  /** Abre el selector para cambiar de cine. */
  cambiarSede: () => void
}

export const Contexto = createContext<SedeCtx | null>(null)

export function useSede() {
  const ctx = useContext(Contexto)
  if (!ctx) throw new Error('useSede debe usarse dentro de <SedeProvider> con una sede elegida')
  return ctx
}
