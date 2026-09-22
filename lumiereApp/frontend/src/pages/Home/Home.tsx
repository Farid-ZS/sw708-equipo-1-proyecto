import { Link, useNavigate } from 'react-router-dom'
import { useSede } from '../../context/sedeContext.ts'
import { HeroCarousel } from '../../components/HeroCarousel/HeroCarousel.tsx'
import { PeliculaCard } from '../../components/PeliculaCard/PeliculaCard.tsx'
import { PeliculaCarousel } from '../../components/PeliculaCarousel/PeliculaCarousel.tsx'
import { peliculas } from '../../data/peliculas.mock.ts'
import styles from './Home.module.scss'

export default function Home() {
  const { sede, requerirSede } = useSede()
  const navigate = useNavigate()

  const enCartelera = peliculas.filter((p) => p.estado === 'cartelera')
  const enPreventa = peliculas.filter((p) => p.estado === 'preventa')
  const proximamente = peliculas.filter((p) => p.estado === 'proximamente')
  const destacadas = enCartelera.slice(0, 4)

  return (
    <>
      <HeroCarousel peliculas={destacadas} />

      <section id="cartelera" className={styles.seccion}>
        <h2>Cartelera</h2>
        <p className={styles.sedeActual}>
          {sede ? `Películas disponibles en ${sede.nombre}` : 'Elige tu cine para ver horarios y disponibilidad'}
        </p>

        <div className={styles.grid}>
          {enCartelera.map((p) => (
            <PeliculaCard key={p.id} pelicula={p} />
          ))}
        </div>
      </section>

      {enPreventa.length > 0 && (
        <>
          <div className={styles.divisor}>
            <Link
              to="/cartelera"
              className={styles.verMas}
              onClick={(e) => {
                e.preventDefault()
                requerirSede(() => navigate('/cartelera'))
              }}
            >
              Ver más
            </Link>
          </div>

          <section id="preventa" className={`${styles.seccion} ${styles.sinLinea}`}>
            <h2>Preventa</h2>
            <p className={styles.sedeActual}>Compra ya tus boletos para estos estrenos</p>

            <PeliculaCarousel peliculas={enPreventa} />
          </section>
        </>
      )}

      <section id="proximamente" className={styles.seccion}>
        <h2>Próximamente</h2>
        <PeliculaCarousel peliculas={proximamente} />
      </section>
    </>
  )
}
