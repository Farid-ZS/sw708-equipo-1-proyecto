import { useSede } from '../../context/sedeContext.ts'
import { HeroCarousel } from '../../components/HeroCarousel/HeroCarousel.tsx'
import { PeliculaCard } from '../../components/PeliculaCard/PeliculaCard.tsx'
import { peliculas } from '../../data/peliculas.mock.ts'
import styles from './Home.module.scss'

export default function Home() {
  const { sede } = useSede()

  const enCartelera = peliculas.filter((p) => p.estado === 'cartelera')
  const proximamente = peliculas.filter((p) => p.estado === 'proximamente')
  const destacadas = enCartelera.slice(0, 4)

  return (
    <>
      <HeroCarousel peliculas={destacadas} />

      <section id="cartelera" className={styles.seccion}>
        <h2>Cartelera</h2>
        <p className={styles.sedeActual}>Películas disponibles en {sede.nombre}</p>

        <div className={styles.grid}>
          {enCartelera.map((p) => (
            <PeliculaCard key={p.id} pelicula={p} />
          ))}
        </div>
      </section>

      <section id="proximamente" className={styles.seccion}>
        <h2>Próximamente</h2>
        <div className={styles.grid}>
          {proximamente.map((p) => (
            <PeliculaCard key={p.id} pelicula={p} />
          ))}
        </div>
      </section>
    </>
  )
}
