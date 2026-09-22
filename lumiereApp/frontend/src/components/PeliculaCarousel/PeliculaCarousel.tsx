import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'
import type { Pelicula } from '../../data/peliculas.mock.ts'
import { PeliculaCard } from '../PeliculaCard/PeliculaCard.tsx'
import styles from './PeliculaCarousel.module.scss'

interface Props {
  peliculas: Pelicula[]
}

// Fila de tarjetas que se desliza horizontalmente (arrastre táctil/mouse + flechas).
export function PeliculaCarousel({ peliculas }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps' })
  const [puedeAnterior, setPuedeAnterior] = useState(false)
  const [puedeSiguiente, setPuedeSiguiente] = useState(false)

  const actualizarControles = useCallback(() => {
    if (!emblaApi) return
    setPuedeAnterior(emblaApi.canScrollPrev())
    setPuedeSiguiente(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    actualizarControles()
    emblaApi.on('select', actualizarControles).on('reInit', actualizarControles)
    return () => {
      emblaApi.off('select', actualizarControles).off('reInit', actualizarControles)
    }
  }, [emblaApi, actualizarControles])

  return (
    <div className={styles.carrusel}>
      <div className={styles.viewport} ref={emblaRef}>
        <div className={styles.pista}>
          {peliculas.map((p) => (
            <div key={p.id} className={styles.slide}>
              <PeliculaCard pelicula={p} />
            </div>
          ))}
        </div>
      </div>

      {puedeAnterior && (
        <button type="button" className={`${styles.flecha} ${styles.anterior}`} onClick={() => emblaApi?.scrollPrev()} aria-label="Anterior">
          ‹
        </button>
      )}
      {puedeSiguiente && (
        <button type="button" className={`${styles.flecha} ${styles.siguiente}`} onClick={() => emblaApi?.scrollNext()} aria-label="Siguiente">
          ›
        </button>
      )}
    </div>
  )
}
