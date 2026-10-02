// Datos de prueba. Se reemplazan por GET /api/sedes.
// Por ahora solo hay cines en Lima. Para abrir otra ciudad basta con sumar la sede aquí:
// el selector de cine agrupa por `ciudad` automáticamente.
import type { Formato } from './peliculas.mock.ts'

export interface Sede {
  id: number
  nombre: string
  ciudad: string
  direccion: string
  salas: number
  formatos: Formato[]
}

export const sedes: Sede[] = [
  { id: 1, nombre: 'Lumiere Centro', ciudad: 'Lima', direccion: 'Av. Nicolás de Piérola 1020, Cercado de Lima', salas: 8, formatos: ['2D', '3D', 'VIP'] },
  { id: 2, nombre: 'Lumiere Norte', ciudad: 'Lima', direccion: 'Av. Alfredo Mendiola 3698, Los Olivos', salas: 10, formatos: ['2D', '3D'] },
  { id: 3, nombre: 'Lumiere Sur', ciudad: 'Lima', direccion: 'Av. Los Héroes 850, San Juan de Miraflores', salas: 6, formatos: ['2D'] },
  { id: 4, nombre: 'Lumiere Este', ciudad: 'Lima', direccion: 'Av. Javier Prado Este 6200, La Molina', salas: 9, formatos: ['2D', '3D', 'VIP'] },
]
