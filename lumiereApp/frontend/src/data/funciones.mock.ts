// Datos de prueba. Se reemplazan por GET /api/funciones.
// Se generan a partir de las sedes y películas: al sumar un cine en sedes.mock.ts
// (de cualquier ciudad) sus funciones aparecen solas.
import { peliculas } from './peliculas.mock.ts'
import type { Formato } from './peliculas.mock.ts'
import { sedes } from './sedes.mock.ts'

export type Idioma = 'Doblada' | 'Subtitulada'

export interface Funcion {
  id: number
  peliculaId: number
  sedeId: number
  /** Día de la función en formato ISO (YYYY-MM-DD). */
  fecha: string
  hora: string
  idioma: Idioma
  formato: Formato
}

const DIAS_CARTELERA = 3
const DIAS_PREVENTA = 6
const HORAS = ['11:00', '12:30', '13:40', '14:30', '15:50', '16:00', '17:10', '17:45', '18:30', '19:20', '20:15', '21:00', '21:40', '22:30']
// Cuántas funciones tiene cada formato + idioma en un cine y día (entre MIN y MAX).
const MIN_HORAS = 3
const MAX_HORAS = 6

// Fecha local (toISOString la daría en UTC y de noche se adelanta un día).
function fechaIso(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

// `dias` días seguidos a partir de `desde`.
function diasDesde(desde: Date, dias: number): string[] {
  return Array.from({ length: dias }, (_, i) => {
    const d = new Date(desde)
    d.setDate(d.getDate() + i)
    return fechaIso(d)
  })
}

/** Cartelera: solo se programa hoy y los dos días siguientes. */
const fechasCartelera: string[] = diasDesde(new Date(), DIAS_CARTELERA)

// Preventa: funciones desde el estreno de la película. Si esa fecha ya quedó atrás
// (datos de prueba viejos), se corre a justo después de la ventana de cartelera.
function fechasPreventa(fechaEstreno?: string): string[] {
  const finCartelera = new Date()
  finCartelera.setDate(finCartelera.getDate() + DIAS_CARTELERA)
  const estreno = fechaEstreno ? new Date(`${fechaEstreno}T00:00`) : finCartelera
  return diasDesde(estreno > finCartelera ? estreno : finCartelera, DIAS_PREVENTA)
}

function generarFunciones(): Funcion[] {
  const lista: Funcion[] = []

  for (const sede of sedes) {
    for (const p of peliculas) {
      if (p.estado === 'proximamente') continue

      const fechas = p.estado === 'preventa' ? fechasPreventa(p.fechaEstreno) : fechasCartelera

      fechas.forEach((fecha, dia) => {
        // Variación fija (no aleatoria) para que no todo se proyecte todos los días.
        const semilla = p.id + sede.id + dia
        if (semilla % 4 === 0) return

        const idiomas: Idioma[] =
          p.clasificacion === 'APT'
            ? semilla % 2 === 0 ? ['Doblada', 'Subtitulada'] : ['Doblada']
            : semilla % 3 === 0 ? ['Subtitulada'] : ['Subtitulada', 'Doblada']

        for (const formato of p.formatos.filter((f) => sede.formatos.includes(f))) {
          for (const idioma of idiomas) {
            // Horas distintas y repartidas en el día: se salta por la lista con un paso fijo.
            const cantidad = MIN_HORAS + ((semilla + lista.length) % (MAX_HORAS - MIN_HORAS + 1))
            const inicio = (semilla + lista.length) % HORAS.length
            const horas = new Set(Array.from({ length: cantidad }, (_, i) => HORAS[(inicio + i * 3) % HORAS.length]))
            for (const hora of horas) {
              lista.push({ id: lista.length + 1, peliculaId: p.id, sedeId: sede.id, fecha, hora, idioma, formato })
            }
          }
        }
      })
    }
  }

  return lista
}

export const funciones: Funcion[] = generarFunciones()
