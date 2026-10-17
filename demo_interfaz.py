
from src.presentation.controller import BoletoController
from src.domain.cinema import ReservarBoletoUseCase
from src.infrastructure.memoria import InMemoryBoletoRepository

repositorio = InMemoryBoletoRepository()
caso_uso = ReservarBoletoUseCase(repositorio)
controlador = BoletoController(caso_uso)

print("\n=== CASO 1: RESERVA EXITOSA ===")
resultado = controlador.reservar({
    "funcion_id": "FUNC-001",
    "asiento": "A5",
    "nombre_cliente": "Carlos"
})
print(resultado)

print("\n=== CASO 2: ASIENTO OCUPADO ===")
resultado = controlador.reservar({
    "funcion_id": "FUNC-001",
    "asiento": "A5",
    "nombre_cliente": "Pedro"
})
print(resultado)

print("\n=== CASO 3: DATOS INCOMPLETOS ===")
resultado = controlador.reservar({
    "funcion_id": "FUNC-001",
    "asiento": "B3",
    "nombre_cliente": ""
})
print(resultado)
