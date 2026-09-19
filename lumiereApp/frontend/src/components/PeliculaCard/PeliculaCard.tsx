import type { Pelicula } from '../../data/peliculas.mock.ts'
import { Poster } from '../Poster/Poster.tsx'
import styles from './PeliculaCard.module.scss'

interface Props {
  pelicula: Pelicula
  /** Funciones a mostrar (ya filtradas por día). */
  funciones?: Pelicula['funciones']
}

export function PeliculaCard({ pelicula, funciones = pelicula.funciones }: Props) {
  const { titulo, tono, clasificacion, generos, duracionMin, estreno } = pelicula

  return (
    <article className={styles.card}>
      <div className={styles.posterWrap}>
        <Poster titulo={titulo} tono={tono} />
        <span className={`${styles.clasificacion} ${clasificacion === '+18' ? styles.adulto : ''}`} title="Clasificación">
          {clasificacion}
        </span>
      </div>

      <h3 className={styles.titulo}>{titulo}</h3>
      <p className={styles.meta}>
        {generos.join(' · ')} · {duracionMin} min
      </p>

      {estreno ? (
        <p className={styles.estreno}>Estreno: {estreno}</p>
      ) : (
        <ul className={styles.funciones}>
          {funciones.map((f) => (
            <li key={`${f.sala}-${f.hora}`}>
              <button type="button" title={`${f.sala} · ${f.formato}`}>
                <strong>{f.hora}</strong>
                <span>{f.formato}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
