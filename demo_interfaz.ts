import { ReservarBoletoUseCase } from './src/domain/cinema.ts'
import { InMemoryBoletoRepository } from './src/infrastructure/memoria.ts'
import { BoletoController } from './src/presentation/controller.ts'

const repositorio = new InMemoryBoletoRepository()
const casoUso = new ReservarBoletoUseCase(repositorio)
const controlador = new BoletoController(casoUso)

console.log('\n=== CASO 1: RESERVA EXITOSA ===')
const resultadoReserva = await controlador.reservar({
  funcion_id: 'FUNC-001',
  asiento: 'A5',
  nombre_cliente: 'Carlos',
})
console.log(resultadoReserva)

console.log('\n=== CASO 2: ASIENTO OCUPADO ===')
const resultadoOcupado = await controlador.reservar({
  funcion_id: 'FUNC-001',
  asiento: 'A5',
  nombre_cliente: 'Pedro',
})
console.log(resultadoOcupado)

console.log('\n=== CASO 3: DATOS INCOMPLETOS ===')
const resultadoIncompleto = await controlador.reservar({
  funcion_id: 'FUNC-001',
  asiento: 'B3',
  nombre_cliente: '',
})
console.log(resultadoIncompleto)
