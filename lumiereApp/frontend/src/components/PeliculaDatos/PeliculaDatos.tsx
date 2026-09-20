import type { Pelicula } from '../../data/peliculas.mock.ts'
import { Restriccion } from '../Restriccion/Restriccion.tsx'
import styles from './PeliculaDatos.module.scss'

interface Props {
  pelicula: Pick<Pelicula, 'duracionMin' | 'clasificacion' | 'formatos'>
  /** Versión más grande, para el carrusel principal. */
  grande?: boolean
  /** Oculta la restricción cuando ya se muestra junto al nombre. */
  sinRestriccion?: boolean
  /** Oculta la duración cuando se muestra en otro lugar (p. ej. sobre la foto). */
  sinDuracion?: boolean
}

// Etiquetas de la película: duración, restricción y formatos.
export function PeliculaDatos({ pelicula, grande = false, sinRestriccion = false, sinDuracion = false }: Props) {
  const { duracionMin, clasificacion, formatos } = pelicula

  return (
    <ul className={`${styles.datos} ${grande ? styles.grande : ''}`}>
      {!sinDuracion && <li title="Duración">{duracionMin} min</li>}
      {!sinRestriccion && (
        <li className={styles.restriccion}>
          <Restriccion clasificacion={clasificacion} />
        </li>
      )}
      {formatos.map((f) => (
        <li key={f} className={styles.formato} title="Formato">
          {f}
        </li>
      ))}
    </ul>
  )
}
