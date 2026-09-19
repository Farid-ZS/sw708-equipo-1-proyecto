import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Pelicula } from '../../data/peliculas.mock.ts'
import { Poster } from '../Poster/Poster.tsx'
import styles from './HeroCarousel.module.scss'

const INTERVALO_MS = 6000

interface Props {
  peliculas: Pelicula[]
}

export function HeroCarousel({ peliculas }: Props) {
  const total = peliculas.length
  const [actual, setActual] = useState(0)

  // Sin avance automático si el usuario pidió reducir el movimiento.
  const [autoplay] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? []
      : [Autoplay({ delay: INTERVALO_MS, stopOnInteraction: false, stopOnMouseEnter: true })],
  )
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, autoplay)

  const alSeleccionar = useCallback(() => {
    if (emblaApi) setActual(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', alSeleccionar).on('reInit', alSeleccionar)
    return () => {
      emblaApi.off('select', alSeleccionar).off('reInit', alSeleccionar)
    }
  }, [emblaApi, alSeleccionar])

  return (
    <section className={styles.carrusel} aria-roledescription="carrusel" aria-label="Películas destacadas">
      <div className={styles.viewport} ref={emblaRef}>
        <div className={styles.pista}>
          {peliculas.map((p, i) => (
            <article
              key={p.id}
              className={styles.slide}
              style={{ '--tono': p.tono } as CSSProperties}
              aria-roledescription="diapositiva"
              aria-label={`${i + 1} de ${total}`}
              inert={i !== actual}
            >
              <div className={styles.contenido}>
                <div className={styles.texto}>
                  <p className={styles.etiqueta}>En cartelera</p>
                  <h1>{p.titulo}</h1>
                  <p className={styles.meta}>
                    {p.generos.join(' · ')} · {p.duracionMin} min · {p.clasificacion}
                  </p>
                  <p className={styles.sinopsis}>{p.sinopsis}</p>
                  <div className={styles.botones}>
                    <a href="#cartelera" className={styles.primario}>
                      Comprar entradas
                    </a>
                    <a href="#cartelera" className={styles.secundario}>
                      Ver funciones
                    </a>
                  </div>
                </div>
                <Poster titulo={p.titulo} tono={p.tono} className={styles.poster} />
              </div>
            </article>
          ))}
        </div>
      </div>

      {total > 1 && (
        <div className={styles.controles}>
          <button type="button" className={styles.flecha} onClick={() => emblaApi?.scrollPrev()} aria-label="Anterior">
            ‹
          </button>
          <div className={styles.puntos}>
            {peliculas.map((p, i) => (
              <button
                key={p.id}
                type="button"
                className={i === actual ? styles.puntoActivo : styles.punto}
                onClick={() => emblaApi?.scrollTo(i)}
                aria-label={`Ir a ${p.titulo}`}
                aria-current={i === actual}
              />
            ))}
          </div>
          <button type="button" className={styles.flecha} onClick={() => emblaApi?.scrollNext()} aria-label="Siguiente">
            ›
          </button>
        </div>
      )}
    </section>
  )
}
