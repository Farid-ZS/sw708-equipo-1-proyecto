// Datos de prueba para el prototipo. Se reemplazan por GET /api/peliculas.
/** APT: apta para todo público · M14 / M18: mayores de esa edad · R: restringida. */
export type Clasificacion = 'APT' | 'M14' | 'M18' | 'R'

export type Formato = '2D' | '3D' | 'VIP'

export interface Pelicula {
  id: number
  titulo: string
  sinopsis: string
  generos: string[]
  duracionMin: number
  clasificacion: Clasificacion
  /** Tono (0-360) del póster generado con CSS mientras no hay imágenes reales. */
  tono: number
  /** URL de la foto real. Si falta, se genera un póster con CSS. */
  imagen?: string
  estado: 'cartelera' | 'proximamente'
  /** Marca "ESTRENO": solo las películas que son estreno la traen en true. */
  esEstreno: boolean
  formatos: Formato[]
  /** Solo para "próximamente": fecha de estreno en formato ISO (YYYY-MM-DD). */
  fechaEstreno?: string
}

export const peliculas: Pelicula[] = [
  {
    id: 1,
    titulo: 'El Último Faro',
    sinopsis:
      'Una guardiana descubre que la luz del faro abandonado guía algo más que barcos en las noches sin luna.',
    generos: ['Drama', 'Misterio'],
    duracionMin: 128,
    clasificacion: 'M14',
    tono: 32,
    estado: 'cartelera',
    esEstreno: false,
    formatos: ['2D', 'VIP'],
  },
  {
    id: 2,
    titulo: 'Ciudad de Neón',
    sinopsis: 'Un mensajero nocturno carga un paquete que media ciudad quiere y la otra mitad teme.',
    generos: ['Acción', 'Ciencia ficción'],
    duracionMin: 112,
    clasificacion: 'M14',
    tono: 285,
    estado: 'cartelera',
    esEstreno: true,
    formatos: ['2D', '3D'],
  },
  {
    id: 3,
    titulo: 'La Ruta del Colibrí',
    sinopsis: 'Tres hermanos cruzan los Andes en una camioneta prestada para cumplir el último deseo de su abuela.',
    generos: ['Aventura', 'Familiar'],
    duracionMin: 98,
    clasificacion: 'APT',
    tono: 150,
    estado: 'cartelera',
    esEstreno: false,
    formatos: ['2D'],
  },
  {
    id: 4,
    titulo: 'Noche de Sombras',
    sinopsis: 'Una mudanza a una casa heredada despierta lo que la familia prometió no volver a nombrar.',
    generos: ['Terror'],
    duracionMin: 104,
    clasificacion: 'M18',
    tono: 355,
    estado: 'cartelera',
    esEstreno: true,
    formatos: ['2D'],
  },
  {
    id: 5,
    titulo: 'Amor en Tiempos de Lluvia',
    sinopsis: 'Dos desconocidos comparten paraguas, y después, una ciudad entera que no deja de llover.',
    generos: ['Romance', 'Comedia'],
    duracionMin: 106,
    clasificacion: 'APT',
    tono: 200,
    estado: 'cartelera',
    esEstreno: false,
    formatos: ['2D', 'VIP'],
  },
  {
    id: 6,
    titulo: 'Horizonte Rojo',
    sinopsis: 'La primera tripulación en llegar a Marte encuentra que alguien ya dejó las luces encendidas.',
    generos: ['Ciencia ficción', 'Suspenso'],
    duracionMin: 141,
    clasificacion: 'M14',
    tono: 12,
    estado: 'cartelera',
    esEstreno: true,
    formatos: ['2D', '3D', 'VIP'],
  },
  {
    id: 7,
    titulo: 'Los Guardianes del Bosque',
    sinopsis: 'Una niña y un zorro parlante deben proteger el último bosque antes de que caiga la primera nevada.',
    generos: ['Animación', 'Familiar'],
    duracionMin: 92,
    clasificacion: 'APT',
    tono: 120,
    estado: 'proximamente',
    esEstreno: false,
    formatos: ['2D', '3D'],
    fechaEstreno: '2026-10-01',
  },
  {
    id: 8,
    titulo: 'Código Rubí',
    sinopsis: 'Un ladrón retirado acepta un último golpe que resulta ser una trampa hecha a su medida.',
    generos: ['Thriller'],
    duracionMin: 119,
    clasificacion: 'M14',
    tono: 330,
    estado: 'proximamente',
    esEstreno: false,
    formatos: ['2D'],
    fechaEstreno: '2026-10-06',
  },
  {
    id: 9,
    titulo: 'Ecos del Desierto',
    sinopsis: 'Una expedición sigue un mapa que ningún archivo reconoce hasta el último oasis del mundo.',
    generos: ['Aventura', 'Drama'],
    duracionMin: 133,
    clasificacion: 'M14',
    tono: 45,
    estado: 'proximamente',
    esEstreno: false,
    formatos: ['2D', '3D', 'VIP'],
    fechaEstreno: '2026-10-13',
  },
]
