import { useState } from 'react'
import type { ReactNode } from 'react'
import { SedeSelector } from '../components/SedeSelector/SedeSelector.tsx'
import { sedes } from '../data/sedes.mock.ts'
import type { Sede } from '../data/sedes.mock.ts'
import { Contexto } from './sedeContext.ts'

const CLAVE = 'lumiere.sede'

function leerSedeGuardada(): Sede | null {
  try {
    const id = Number(localStorage.getItem(CLAVE))
    return sedes.find((s) => s.id === id) ?? null
  } catch {
    return null
  }
}

// La sede es obligatoria: mientras no se elija no se muestra ninguna pantalla.
export function SedeProvider({ children }: { children: ReactNode }) {
  const [sede, setSede] = useState<Sede | null>(leerSedeGuardada)
  const [selectorAbierto, setSelectorAbierto] = useState(false)

  const elegir = (nueva: Sede) => {
    setSede(nueva)
    setSelectorAbierto(false)
    try {
      localStorage.setItem(CLAVE, String(nueva.id))
    } catch {
      // Sin almacenamiento: la sede vale solo para esta sesión.
    }
  }

  return (
    <Contexto.Provider value={sede ? { sede, cambiarSede: () => setSelectorAbierto(true) } : null}>
      {sede && children}
      <SedeSelector
        abierto={!sede || selectorAbierto}
        obligatorio={!sede}
        sedeActual={sede}
        alElegir={elegir}
        alCerrar={() => setSelectorAbierto(false)}
      />
    </Contexto.Provider>
  )
}
