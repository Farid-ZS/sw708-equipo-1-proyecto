// Datos de prueba para el prototipo. Se reemplazan por GET /api/peliculas.
export type Clasificacion = 'TP' | '+14' | '+18'

export interface Funcion {
  hora: string
  sala: string
  formato: '2D' | '3D' | 'VIP'
}

export interface Pelicula {
  id: number
  titulo: string
  sinopsis: string
  generos: string[]
  duracionMin: number
  clasificacion: Clasificacion
  /** Tono (0-360) del póster generado con CSS mientras no hay imágenes reales. */
  tono: number
  estado: 'cartelera' | 'proximamente'
  funciones: Funcion[]
  estreno?: string
}

export const peliculas: Pelicula[] = [
  {
    id: 1,
    titulo: 'El Último Faro',
    sinopsis:
      'Una guardiana descubre que la luz del faro abandonado guía algo más que barcos en las noches sin luna.',
    generos: ['Drama', 'Misterio'],
    duracionMin: 128,
    clasificacion: '+14',
    tono: 32,
    estado: 'cartelera',
    funciones: [
      { hora: '14:30', sala: 'Sala 1', formato: '2D' },
      { hora: '17:15', sala: 'Sala 1', formato: '2D' },
      { hora: '20:00', sala: 'Sala VIP', formato: 'VIP' },
    ],
  },
  {
    id: 2,
    titulo: 'Ciudad de Neón',
    sinopsis: 'Un mensajero nocturno carga un paquete que media ciudad quiere y la otra mitad teme.',
    generos: ['Acción', 'Ciencia ficción'],
    duracionMin: 112,
    clasificacion: '+14',
    tono: 285,
    estado: 'cartelera',
    funciones: [
      { hora: '15:00', sala: 'Sala 2', formato: '3D' },
      { hora: '18:30', sala: 'Sala 2', formato: '3D' },
      { hora: '21:45', sala: 'Sala 2', formato: '3D' },
    ],
  },
  {
    id: 3,
    titulo: 'La Ruta del Colibrí',
    sinopsis: 'Tres hermanos cruzan los Andes en una camioneta prestada para cumplir el último deseo de su abuela.',
    generos: ['Aventura', 'Familiar'],
    duracionMin: 98,
    clasificacion: 'TP',
    tono: 150,
    estado: 'cartelera',
    funciones: [
      { hora: '13:00', sala: 'Sala 3', formato: '2D' },
      { hora: '15:30', sala: 'Sala 3', formato: '2D' },
      { hora: '18:00', sala: 'Sala 3', formato: '2D' },
    ],
  },
  {
    id: 4,
    titulo: 'Noche de Sombras',
    sinopsis: 'Una mudanza a una casa heredada despierta lo que la familia prometió no volver a nombrar.',
    generos: ['Terror'],
    duracionMin: 104,
    clasificacion: '+18',
    tono: 355,
    estado: 'cartelera',
    funciones: [
      { hora: '19:30', sala: 'Sala 4', formato: '2D' },
      { hora: '22:15', sala: 'Sala 4', formato: '2D' },
    ],
  },
  {
    id: 5,
    titulo: 'Amor en Tiempos de Lluvia',
    sinopsis: 'Dos desconocidos comparten paraguas, y después, una ciudad entera que no deja de llover.',
    generos: ['Romance', 'Comedia'],
    duracionMin: 106,
    clasificacion: 'TP',
    tono: 200,
    estado: 'cartelera',
    funciones: [
      { hora: '16:00', sala: 'Sala 5', formato: '2D' },
      { hora: '18:45', sala: 'Sala 5', formato: '2D' },
      { hora: '21:15', sala: 'Sala VIP', formato: 'VIP' },
    ],
  },
  {
    id: 6,
    titulo: 'Horizonte Rojo',
    sinopsis: 'La primera tripulación en llegar a Marte encuentra que alguien ya dejó las luces encendidas.',
    generos: ['Ciencia ficción', 'Suspenso'],
    duracionMin: 141,
    clasificacion: '+14',
    tono: 12,
    estado: 'cartelera',
    funciones: [
      { hora: '14:00', sala: 'Sala VIP', formato: 'VIP' },
      { hora: '17:30', sala: 'Sala 1', formato: '3D' },
      { hora: '21:00', sala: 'Sala 1', formato: '3D' },
    ],
  },
  {
    id: 7,
    titulo: 'Los Guardianes del Bosque',
    sinopsis: 'Una niña y un zorro parlante deben proteger el último bosque antes de que caiga la primera nevada.',
    generos: ['Animación', 'Familiar'],
    duracionMin: 92,
    clasificacion: 'TP',
    tono: 120,
    estado: 'proximamente',
    estreno: 'Próximo jueves',
    funciones: [],
  },
  {
    id: 8,
    titulo: 'Código Rubí',
    sinopsis: 'Un ladrón retirado acepta un último golpe que resulta ser una trampa hecha a su medida.',
    generos: ['Thriller'],
    duracionMin: 119,
    clasificacion: '+14',
    tono: 330,
    estado: 'proximamente',
    estreno: 'En dos semanas',
    funciones: [],
  },
  {
    id: 9,
    titulo: 'Ecos del Desierto',
    sinopsis: 'Una expedición sigue un mapa que ningún archivo reconoce hasta el último oasis del mundo.',
    generos: ['Aventura', 'Drama'],
    duracionMin: 133,
    clasificacion: '+14',
    tono: 45,
    estado: 'proximamente',
    estreno: 'En tres semanas',
    funciones: [],
  },
]
