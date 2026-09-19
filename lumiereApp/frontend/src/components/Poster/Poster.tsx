import type { CSSProperties } from 'react'
import styles from './Poster.module.scss'

interface Props {
  titulo: string
  tono: number
  className?: string
}

// Póster generado con CSS hasta tener las imágenes reales de cada película.
export function Poster({ titulo, tono, className = '' }: Props) {
  return (
    <div className={`${styles.poster} ${className}`} style={{ '--tono': tono } as CSSProperties} role="img" aria-label={`Póster de ${titulo}`}>
      <span className={styles.sol} />
      <span className={styles.titulo}>{titulo}</span>
    </div>
  )
}
