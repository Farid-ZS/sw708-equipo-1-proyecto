// Datos de prueba. Se reemplazan por GET /api/sedes.
export interface Sede {
  id: number
  nombre: string
  ciudad: string
  direccion: string
  salas: number
  formatos: string[]
}

export const sedes: Sede[] = [
  { id: 1, nombre: 'Lumiere Centro', ciudad: 'Lima', direccion: 'Av. Nicolás de Piérola 1020, Cercado de Lima', salas: 8, formatos: ['2D', '3D', 'VIP'] },
  { id: 2, nombre: 'Lumiere Norte', ciudad: 'Lima', direccion: 'Av. Alfredo Mendiola 3698, Los Olivos', salas: 10, formatos: ['2D', '3D'] },
  { id: 3, nombre: 'Lumiere Sur', ciudad: 'Lima', direccion: 'Av. Los Héroes 850, San Juan de Miraflores', salas: 6, formatos: ['2D'] },
  { id: 4, nombre: 'Lumiere Este', ciudad: 'Lima', direccion: 'Av. Javier Prado Este 6200, La Molina', salas: 9, formatos: ['2D', '3D', 'VIP'] },
  { id: 5, nombre: 'Lumiere Arequipa', ciudad: 'Arequipa', direccion: 'Calle Mercaderes 410, Cercado', salas: 5, formatos: ['2D', '3D'] },
  { id: 6, nombre: 'Lumiere Trujillo', ciudad: 'Trujillo', direccion: 'Av. España 1780, Trujillo', salas: 7, formatos: ['2D', '3D', 'VIP'] },
]
