import { useMemo, useState } from 'react'
import { Footer } from '../../components/Footer/Footer.tsx'
import { Header } from '../../components/Header/Header.tsx'
import { HeroCarousel } from '../../components/HeroCarousel/HeroCarousel.tsx'
import { PeliculaCard } from '../../components/PeliculaCard/PeliculaCard.tsx'
import { peliculas } from '../../data/peliculas.mock.ts'
import styles from './Home.module.scss'

const DIAS_VISIBLES = 7

function proximosDias() {
  const hoy = new Date()
  return Array.from({ length: DIAS_VISIBLES }, (_, i) => {
    const fecha = new Date(hoy)
    fecha.setDate(hoy.getDate() + i)
    return {
      etiqueta: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : fecha.toLocaleDateString('es-PE', { weekday: 'short' }),
      numero: fecha.getDate(),
      mes: fecha.toLocaleDateString('es-PE', { month: 'short' }),
    }
  })
}

const combos = [
  { nombre: 'Combo Clásico', detalle: 'Canchita grande + gaseosa mediana', precio: 'S/ 24.90' },
  { nombre: 'Combo Pareja', detalle: 'Canchita grande + 2 gaseosas + nachos', precio: 'S/ 39.90' },
  { nombre: 'Combo Lumiere', detalle: 'Canchita XL + 2 gaseosas grandes + hot dog', precio: 'S/ 49.90' },
]

export default function Home() {
  const [dia, setDia] = useState(0)
  const dias = useMemo(() => proximosDias(), [])

  const enCartelera = peliculas.filter((p) => p.estado === 'cartelera')
  const proximamente = peliculas.filter((p) => p.estado === 'proximamente')
  const destacadas = enCartelera.slice(0, 4)

  // Mock: en el día seleccionado algunas películas no tienen funciones.
  // Con el backend real esto viene de GET /api/funciones?fecha=...
  const cartelera = enCartelera.filter((p) => (p.id + dia) % 5 !== 0)

  return (
    <>
      <Header />

      <main>
        <HeroCarousel peliculas={destacadas} />

        <section id="cartelera" className={styles.seccion}>
          <h2>Cartelera</h2>

          <div className={styles.dias} role="tablist" aria-label="Día de la función">
            {dias.map((d, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === dia}
                className={i === dia ? styles.diaActivo : styles.dia}
                onClick={() => setDia(i)}
              >
                <span>{d.etiqueta}</span>
                <strong>{d.numero}</strong>
                <span>{d.mes}</span>
              </button>
            ))}
          </div>

          <div className={styles.grid}>
            {cartelera.map((p) => (
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

        <section id="confiteria" className={styles.seccion}>
          <h2>Confitería</h2>
          <div className={styles.combos}>
            {combos.map((c) => (
              <article key={c.nombre} className={styles.combo}>
                <h3>{c.nombre}</h3>
                <p>{c.detalle}</p>
                <strong>{c.precio}</strong>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
