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
  const { titulo, clasificacion, duracionMin, esEstreno, fechaEstreno } = pelicula

  return (
    <article className={styles.card}>
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
        {fechaEstreno && <p className={styles.fecha}>{formatearFechaEstreno(fechaEstreno)}</p>}
      </div>
    </article>
  )
}
