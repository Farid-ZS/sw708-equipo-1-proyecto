import type { CSSProperties } from 'react'
import type { Pelicula } from '../../data/peliculas.mock.ts'
import styles from './Poster.module.scss'

interface Props {
  pelicula: Pick<Pelicula, 'titulo' | 'tono' | 'imagen'>
  className?: string
}

// Muestra la foto de la película. Sin `imagen`, genera un póster con CSS.
export function Poster({ pelicula, className = '' }: Props) {
  const { titulo, tono, imagen } = pelicula

  if (imagen) {
    return <img src={imagen} alt={`Póster de ${titulo}`} className={`${styles.poster} ${styles.imagen} ${className}`} loading="lazy" />
  }

  return (
    <div className={`${styles.poster} ${className}`} style={{ '--tono': tono } as CSSProperties} role="img" aria-label={`Póster de ${titulo}`}>
      <span className={styles.sol} />
      <span className={styles.titulo}>{titulo}</span>
    </div>
  )
}
