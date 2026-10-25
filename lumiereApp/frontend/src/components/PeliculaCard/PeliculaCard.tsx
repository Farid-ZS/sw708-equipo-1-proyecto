import { Link } from 'react-router-dom'
import type { Pelicula } from '../../data/peliculas.mock.ts'
import { CintaEstreno } from '../CintaEstreno/CintaEstreno.tsx'
import { PeliculaDatos } from '../PeliculaDatos/PeliculaDatos.tsx'
import { Poster } from '../Poster/Poster.tsx'
import { Restriccion } from '../Restriccion/Restriccion.tsx'
import styles from './PeliculaCard.module.scss'

function formatearFechaEstreno(fechaIso: string): string {
  const [anio, mes, dia] = fechaIso.split('-')
  return `${dia}/${mes}/${anio}`
}

export function PeliculaCard({ pelicula }: { pelicula: Pelicula }) {
  const { id, titulo, clasificacion, duracionMin, esEstreno, estado, fechaEstreno } = pelicula
  const enPreventa = estado === 'preventa'

  // Toda la tarjeta lleva a la ficha de la película; ahí se eligen cine y horario.
  return (
    <Link to={`/pelicula/${id}`} className={styles.card} aria-label={`Ver ${titulo}`}>
      <div className={styles.foto}>
        <Poster pelicula={pelicula} className={styles.poster} />
        {esEstreno && <CintaEstreno />}
        <span className={styles.duracion} title="Duración">
          {duracionMin} min
        </span>
      </div>

      <div className={styles.cuerpo}>
        <div className={styles.encabezado}>
          <h3 title={titulo}>{titulo}</h3>
          <Restriccion clasificacion={clasificacion} />
        </div>

        <PeliculaDatos pelicula={pelicula} sinRestriccion sinDuracion />
        {fechaEstreno && !enPreventa && <p className={styles.fecha}>{formatearFechaEstreno(fechaEstreno)}</p>}
      </div>
    </Link>
  )
}
