import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { PeliculaCarousel } from '../../components/PeliculaCarousel/PeliculaCarousel.tsx'
import { PeliculaDatos } from '../../components/PeliculaDatos/PeliculaDatos.tsx'
import { Poster } from '../../components/Poster/Poster.tsx'
import { useSede } from '../../context/sedeContext.ts'
import { funciones } from '../../data/funciones.mock.ts'
import type { Funcion } from '../../data/funciones.mock.ts'
import { peliculas } from '../../data/peliculas.mock.ts'
import type { Pelicula } from '../../data/peliculas.mock.ts'
import EnConstruccion from '../EnConstruccion/EnConstruccion.tsx'
import styles from './PeliculaDetalle.module.scss'

const ETIQUETA_ESTADO: Record<Pelicula['estado'], string> = {
  cartelera: 'En cartelera',
  preventa: 'Preventa',
  proximamente: 'Próximamente',
}

const aFecha = (iso: string) => new Date(`${iso}T00:00`)

function fechaLarga(iso: string): string {
  return aFecha(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Pestaña de día: "Hoy", "Mañana" o el día de la semana, con el número y el mes debajo.
function nombreDia(iso: string): { dia: string; fecha: string } {
  const d = aFecha(iso)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const diferencia = Math.round((d.getTime() - hoy.getTime()) / 86_400_000)
  const dia = diferencia === 0 ? 'Hoy' : diferencia === 1 ? 'Mañana' : d.toLocaleDateString('es-PE', { weekday: 'short' })
  return { dia, fecha: d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }) }
}

// Una función de hoy cuya hora ya pasó no se puede comprar.
function yaPaso(f: Funcion): boolean {
  return new Date(`${f.fecha}T${f.hora}`) < new Date()
}

const porHora = (a: Funcion, b: Funcion) => a.hora.localeCompare(b.hora)

function Horarios({ pelicula }: { pelicula: Pelicula }) {
  const { sede, cambiarSede } = useSede()
  const [fecha, setFecha] = useState('')

  if (pelicula.estado === 'proximamente') {
    return (
      <p className={styles.aviso}>
        {pelicula.fechaEstreno ? `Se estrena el ${fechaLarga(pelicula.fechaEstreno)}.` : 'Pronto en Lumiere.'} Los horarios se publicarán
        cuando empiece la preventa.
      </p>
    )
  }

  // Los días salen de todas las funciones de la película;
  // el cine elegido (debajo) decide qué horarios se ven.
  const propias = funciones.filter((f) => f.peliculaId === pelicula.id)
  const fechas = [...new Set(propias.map((f) => f.fecha))].sort()

  if (fechas.length === 0) return <p className={styles.aviso}>Todavía no hay funciones programadas para esta película.</p>

  const fechaActiva = fechas.includes(fecha) ? fecha : fechas[0]
  const delDia = propias.filter((f) => f.fecha === fechaActiva)
  const visibles = delDia.filter((f) => f.sedeId === sede?.id).sort(porHora)
  // Un grupo por cada combinación de formato e idioma, como "2D · Doblada".
  const grupos = [...new Set(visibles.map((f) => `${f.formato} · ${f.idioma}`))]

  return (
    <>
      <div className={styles.dias} role="tablist" aria-label="Día de la función">
        {fechas.map((f) => {
          const { dia, fecha: corta } = nombreDia(f)
          return (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={f === fechaActiva}
              className={f === fechaActiva ? styles.diaActivo : styles.dia}
              onClick={() => setFecha(f)}
            >
              <span>{dia}</span>
              <strong>{corta}</strong>
            </button>
          )
        })}
      </div>

      {/* Parece un desplegable, pero abre el selector de cine de siempre. */}
      <button type="button" className={styles.selectorCine} onClick={cambiarSede} aria-label="Cambiar de cine">
        <span className={styles.selectorEtiqueta}>Cine</span>
        <strong>{sede ? sede.nombre : 'Elige tu cine'}</strong>
        {sede && <span className={styles.selectorDireccion}>{sede.direccion}</span>}
      </button>

      {!sede ? (
        <p className={styles.aviso}>Elige un cine para ver los horarios de esta película.</p>
      ) : grupos.length === 0 ? (
        <p className={styles.aviso}>No hay funciones en {sede.nombre} este día. Prueba con otro día o cine.</p>
      ) : (
        <div className={styles.cine}>
          {grupos.map((g) => (
            <div key={g} className={styles.grupo}>
              <span className={styles.grupoNombre}>{g}</span>
              <div className={styles.horas}>
                {visibles
                  .filter((f) => `${f.formato} · ${f.idioma}` === g)
                  .map((f) =>
                    yaPaso(f) ? (
                      <span key={f.id} className={styles.horaPasada} title="Esta función ya empezó">
                        {f.hora}
                      </span>
                    ) : (
                      // Aún sin pantalla de compra: cae en la ruta comodín.
                      <Link key={f.id} to={`/funciones/${f.id}`} className={styles.hora}>
                        {f.hora}
                      </Link>
                    ),
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function Detalle({ pelicula }: { pelicula: Pelicula }) {
  const { hash } = useLocation()
  const { titulo, sinopsis, generos, estado, fechaEstreno, director, reparto, tono } = pelicula
  const otras = peliculas.filter((p) => p.id !== pelicula.id && p.estado !== 'proximamente')

  // Al entrar desde otra película se empieza arriba, salvo que se pida ir a los horarios.
  useEffect(() => {
    if (hash) document.querySelector(hash)?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [hash, pelicula.id])

  return (
    <>
      <section className={styles.banner} style={{ '--tono': tono } as CSSProperties}>
        <div className={styles.bannerContenido}>
          <Poster pelicula={pelicula} className={styles.poster} />

          <div className={styles.info}>
            <p className={styles.estado}>{ETIQUETA_ESTADO[estado]}</p>
            <h1>{titulo}</h1>
            <p className={styles.generos}>{generos.join(' · ')}</p>
            <PeliculaDatos pelicula={pelicula} grande />
            <p className={styles.sinopsis}>{sinopsis}</p>

            <dl className={styles.ficha}>
              {director && (
                <div>
                  <dt>Director</dt>
                  <dd>{director}</dd>
                </div>
              )}
              {reparto && reparto.length > 0 && (
                <div>
                  <dt>Reparto</dt>
                  <dd>{reparto.join(', ')}</dd>
                </div>
              )}
              {fechaEstreno && (
                <div>
                  <dt>Estreno</dt>
                  <dd>{fechaLarga(fechaEstreno)}</dd>
                </div>
              )}
            </dl>

            {estado !== 'proximamente' && (
              <a href="#horarios" className={styles.comprar}>
                Comprar entradas
              </a>
            )}
          </div>
        </div>
      </section>

      <section id="horarios" className={styles.seccion}>
        <h2>Horarios</h2>
        <Horarios pelicula={pelicula} />
      </section>

      {otras.length > 0 && (
        <section className={styles.seccion}>
          <h2>También en Lumiere</h2>
          <PeliculaCarousel peliculas={otras} />
        </section>
      )}
    </>
  )
}

export default function PeliculaDetalle() {
  const { id } = useParams()
  const pelicula = peliculas.find((p) => p.id === Number(id))
  if (!pelicula) return <EnConstruccion />
  // `key` reinicia el día elegido al pasar de una película a otra.
  return <Detalle key={pelicula.id} pelicula={pelicula} />
}
