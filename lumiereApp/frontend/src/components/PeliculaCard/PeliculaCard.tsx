import { Link, useNavigate } from 'react-router-dom'
import { useSede } from '../../context/sedeContext.ts'
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
  // En cartelera y preventa ya se pueden comprar boletos; en próximamente todavía no.
  const esComprable = estado === 'cartelera' || enPreventa
  const { requerirSede } = useSede()
  const navigate = useNavigate()

  const contenido = (
    <>
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
    </>
  )

  // Con boletos disponibles la tarjeta completa hace de botón (aún sin pantalla de
  // compra: cae en la ruta comodín). Si todavía no hay cine elegido, primero se pide.
  if (esComprable) {
    const destino = `/comprar/${id}`
    return (
      <Link
        to={destino}
        className={styles.card}
        aria-label={`Comprar entradas: ${titulo}`}
        onClick={(e) => {
          e.preventDefault()
          requerirSede(() => navigate(destino))
        }}
      >
        {contenido}
      </Link>
    )
  }

  return <article className={styles.card}>{contenido}</article>
}
