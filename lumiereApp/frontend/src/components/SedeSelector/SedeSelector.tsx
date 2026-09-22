import { useEffect, useRef, useState } from 'react'
import logo from '../../assets/images/logo_lumiere.png'
import { sedes } from '../../data/sedes.mock.ts'
import type { Sede } from '../../data/sedes.mock.ts'
import styles from './SedeSelector.module.scss'

interface Props {
  abierto: boolean
  /** Sin sede elegida: no se puede cerrar hasta escoger una. */
  obligatorio: boolean
  sedeActual: Sede | null
  alElegir: (sede: Sede) => void
  alCerrar: () => void
}

const normalizar = (t: string) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export function SedeSelector({ abierto, obligatorio, sedeActual, alElegir, alCerrar }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const d = dialogo.current
    if (!d) return
    if (abierto && !d.open) d.showModal()
    if (!abierto && d.open) d.close()
  }, [abierto])

  // El panel es un <dialog> a media altura del viewport: sin esto, la página
  // de fondo conserva su propia barra de scroll y queda una doble barra.
  // Se compensa el ancho de esa barra con padding para que el contenido no
  // se corra al ocultarla (y al mostrarla de nuevo al cerrar).
  useEffect(() => {
    if (!abierto) return
    const anchoBarra = window.innerWidth - document.documentElement.clientWidth
    const overflowOriginal = document.body.style.overflow
    const paddingOriginal = document.body.style.paddingRight
    document.body.style.overflow = 'hidden'
    if (anchoBarra > 0) document.body.style.paddingRight = `${anchoBarra}px`
    return () => {
      document.body.style.overflow = overflowOriginal
      document.body.style.paddingRight = paddingOriginal
    }
  }, [abierto])

  const filtro = normalizar(busqueda.trim())
  const visibles = sedes.filter((s) => normalizar(`${s.nombre} ${s.ciudad} ${s.direccion}`).includes(filtro))
  const ciudades = [...new Set(visibles.map((s) => s.ciudad))]

  return (
    <dialog
      ref={dialogo}
      className={`${styles.dialogo} ${obligatorio ? styles.obligatorio : ''}`}
      aria-labelledby="sede-titulo"
      // ESC no cierra mientras la sede sea obligatoria
      onCancel={(e) => obligatorio && e.preventDefault()}
      onClose={alCerrar}
    >
      <div className={styles.cabecera}>
        <img src={logo} alt="Lumiere Cines" className={styles.logo} />
        {!obligatorio && (
          <button type="button" className={styles.cerrar} onClick={alCerrar} aria-label="Cerrar">
            ×
          </button>
        )}
      </div>

      <h2 id="sede-titulo">Elige tu cine</h2>
      <p className={styles.ayuda}>
        {obligatorio
          ? 'Para ver la cartelera, preventas y estrenos, primero selecciona el cine donde quieres ir.'
          : 'Cambiar de cine actualiza la cartelera y los horarios.'}
      </p>

      <input
        type="search"
        className={styles.buscar}
        placeholder="Buscar por nombre, ciudad o distrito"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar cine"
      />

      <div className={styles.lista}>
        {ciudades.map((ciudad) => (
          <section key={ciudad}>
            <h3>{ciudad}</h3>
            <ul>
              {visibles
                .filter((s) => s.ciudad === ciudad)
                .map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className={s.id === sedeActual?.id ? styles.sedeActiva : styles.sede}
                      onClick={() => alElegir(s)}
                    >
                      <strong>{s.nombre}</strong>
                      <span>{s.direccion}</span>
                      <small>
                        {s.salas} salas · {s.formatos.join(' · ')}
                      </small>
                    </button>
                  </li>
                ))}
            </ul>
          </section>
        ))}
        {ciudades.length === 0 && <p className={styles.vacio}>No encontramos cines con “{busqueda}”.</p>}
      </div>
    </dialog>
  )
}
