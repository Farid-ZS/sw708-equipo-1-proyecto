import { useState } from 'react'
import { PeliculaCard } from '../../components/PeliculaCard/PeliculaCard.tsx'
import { useSede } from '../../context/sedeContext.ts'
import { funciones } from '../../data/funciones.mock.ts'
import { peliculas } from '../../data/peliculas.mock.ts'
import type { Clasificacion, Pelicula } from '../../data/peliculas.mock.ts'
import { sedes } from '../../data/sedes.mock.ts'
import styles from './Peliculas.module.scss'

// Las opciones de cada filtro salen de los datos: al sumar cines, géneros o
// formatos aparecen aquí sin tocar esta pantalla.
const ORDEN_CENSURA: Clasificacion[] = ['APT', 'M14', 'M18', 'R']
const opcionesGenero = [...new Set(peliculas.flatMap((p) => p.generos))].sort((a, b) => a.localeCompare(b, 'es'))
const opcionesIdioma = [...new Set(funciones.map((f) => f.idioma))]
const opcionesFormato = [...new Set(sedes.flatMap((s) => s.formatos))]
const opcionesCensura = ORDEN_CENSURA.filter((c) => peliculas.some((p) => p.clasificacion === c))

type Seccion = Extract<Pelicula['estado'], 'cartelera' | 'preventa'>
const SECCIONES: { id: Seccion; texto: string }[] = [
  { id: 'cartelera', texto: 'Cartelera' },
  { id: 'preventa', texto: 'Preventa' },
]

const alternar = <T,>(lista: T[], valor: T) => (lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor])

interface GrupoProps<T extends string> {
  titulo: string
  opciones: T[]
  elegidas: T[]
  alCambiar: (elegidas: T[]) => void
}

// Filtro desplegable de selección múltiple: el botón abre las casillas.
// Sin nada marcado no filtra.
function GrupoOpciones<T extends string>({ titulo, opciones, elegidas, alCambiar }: GrupoProps<T>) {
  return (
    <details className={styles.grupo}>
      <summary>
        {titulo}
        {elegidas.length > 0 && <span className={styles.cuenta}>{elegidas.length}</span>}
      </summary>
      <div className={styles.opciones}>
        {opciones.map((opcion) => (
          <label key={opcion} className={styles.opcion}>
            <input type="checkbox" checked={elegidas.includes(opcion)} onChange={() => alCambiar(alternar(elegidas, opcion))} />
            {opcion}
          </label>
        ))}
      </div>
    </details>
  )
}

export default function Peliculas() {
  // El cine se elige en el header: aquí solo se lee.
  const { sede } = useSede()

  const [seccion, setSeccion] = useState<Seccion>('cartelera')
  const [generos, setGeneros] = useState<string[]>([])
  const [idiomas, setIdiomas] = useState<string[]>([])
  const [formatos, setFormatos] = useState<string[]>([])
  const [censuras, setCensuras] = useState<Clasificacion[]>([])

  const limpiar = () => {
    setGeneros([])
    setIdiomas([])
    setFormatos([])
    setCensuras([])
  }

  const hayFiltros = generos.length + idiomas.length + formatos.length + censuras.length > 0

  // Idioma y formato dependen de las funciones del cine; género y censura, de la película.
  // Sin cine elegido se consideran las funciones de todos.
  const conFuncion = new Set(
    funciones
      .filter(
        (f) =>
          (!sede || f.sedeId === sede.id) &&
          (idiomas.length === 0 || idiomas.includes(f.idioma)) &&
          (formatos.length === 0 || formatos.includes(f.formato)),
      )
      .map((f) => f.peliculaId),
  )
  const resultado = peliculas.filter(
    (p) =>
      p.estado === seccion &&
      conFuncion.has(p.id) &&
      (generos.length === 0 || p.generos.some((g) => generos.includes(g))) &&
      (censuras.length === 0 || censuras.includes(p.clasificacion)),
  )

  return (
    <section className={styles.pagina}>
      <header className={styles.cabecera}>
        <h1>Películas</h1>
        <p>{sede ? sede.nombre : 'Todos los cines'}</p>
      </header>

      <div className={styles.barra}>
        <div className={styles.secciones} role="tablist" aria-label="Sección">
          {SECCIONES.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={s.id === seccion}
              className={s.id === seccion ? styles.seccionActiva : styles.seccion}
              onClick={() => setSeccion(s.id)}
            >
              {s.texto}
            </button>
          ))}
        </div>
        <p className={styles.total} aria-live="polite">
          {resultado.length} {resultado.length === 1 ? 'película' : 'películas'}
        </p>
      </div>

      <div className={styles.cuerpo}>
        <aside className={styles.filtros} aria-label="Filtros">
          <div className={styles.filtrosCabecera}>
            <h2>Filtrar por</h2>
            {hayFiltros && (
              <button type="button" className={styles.limpiar} onClick={limpiar}>
                Limpiar
              </button>
            )}
          </div>

          <GrupoOpciones titulo="Género" opciones={opcionesGenero} elegidas={generos} alCambiar={setGeneros} />
          <GrupoOpciones titulo="Idioma" opciones={opcionesIdioma} elegidas={idiomas} alCambiar={setIdiomas} />
          <GrupoOpciones titulo="Formato" opciones={opcionesFormato} elegidas={formatos} alCambiar={setFormatos} />
          <GrupoOpciones titulo="Censura" opciones={opcionesCensura} elegidas={censuras} alCambiar={setCensuras} />
        </aside>

        {resultado.length > 0 ? (
          <div className={styles.grid}>
            {resultado.map((p) => (
              <PeliculaCard key={p.id} pelicula={p} />
            ))}
          </div>
        ) : (
          <p className={styles.vacio}>
            {hayFiltros ? 'No hay películas con esos filtros. Prueba quitando alguno.' : 'No hay películas en esta sección para este cine.'}
          </p>
        )}
      </div>
    </section>
  )
}
