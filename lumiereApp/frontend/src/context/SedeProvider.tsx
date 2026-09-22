import { useRef, useState } from 'react'
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

// La sede ya no es obligatoria para navegar: solo se pide cuando el usuario
// intenta comprar entradas o alguna acción que la necesite (ver requerirSede).
export function SedeProvider({ children }: { children: ReactNode }) {
  const [sede, setSede] = useState<Sede | null>(leerSedeGuardada)
  const [selectorAbierto, setSelectorAbierto] = useState(false)
  const accionPendiente = useRef<(() => void) | null>(null)

  const elegir = (nueva: Sede) => {
    setSede(nueva)
    setSelectorAbierto(false)
    try {
      localStorage.setItem(CLAVE, String(nueva.id))
    } catch {
      // Sin almacenamiento: la sede vale solo para esta sesión.
    }
    const pendiente = accionPendiente.current
    accionPendiente.current = null
    pendiente?.()
  }

  const cambiarSede = () => {
    accionPendiente.current = null
    setSelectorAbierto(true)
  }

  const requerirSede = (accion: () => void) => {
    if (sede) {
      accion()
      return
    }
    accionPendiente.current = accion
    setSelectorAbierto(true)
  }

  return (
    <Contexto.Provider value={{ sede, cambiarSede, requerirSede }}>
      {children}
      <SedeSelector
        abierto={selectorAbierto}
        sedeActual={sede}
        alElegir={elegir}
        alCerrar={() => {
          setSelectorAbierto(false)
          accionPendiente.current = null
        }}
      />
    </Contexto.Provider>
  )
}
