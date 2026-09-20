import type { Pelicula } from '../../data/peliculas.mock.ts'
import styles from './Restriccion.module.scss'

const DESCRIPCION: Record<Pelicula['clasificacion'], string> = {
  APT: 'Apta para todo público',
  M14: 'Mayores de 14 años',
  M18: 'Mayores de 18 años',
  R: 'Restringida',
}

interface Props {
  clasificacion: Pelicula['clasificacion']
  grande?: boolean
}

// Sello de restricción de edad: APT, M14, M18 o R.
export function Restriccion({ clasificacion, grande = false }: Props) {
  const adulto = clasificacion === 'M18' || clasificacion === 'R'
  const clases = [styles.sello, grande && styles.grande, adulto && styles.adulto].filter(Boolean).join(' ')

  return (
    <span className={clases} title={DESCRIPCION[clasificacion]} aria-label={DESCRIPCION[clasificacion]}>
      {clasificacion}
    </span>
  )
}
