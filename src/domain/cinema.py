from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
import uuid

from src.domain.puertos import BoletoRepository


@dataclass
class Boleto:
    id: str
    funcion_id: str
    asiento: str
    nombre_cliente: str
    reservado_en: datetime = field(default_factory=datetime.now)

    @staticmethod
    def crear(funcion_id: str, asiento: str, nombre_cliente: str) -> "Boleto":
        return Boleto(
            id=str(uuid.uuid4()),
            funcion_id=funcion_id,
            asiento=asiento,
            nombre_cliente=nombre_cliente,
        )


class AsientoOcupadoError(Exception):
    pass


class ReservarBoletoUseCase:
    def __init__(self, repository: BoletoRepository) -> None:
        self._repo = repository

    def ejecutar(self, funcion_id: str, asiento: str, nombre_cliente: str) -> Boleto:
        if not funcion_id or not asiento or not nombre_cliente:
            raise ValueError("Faltan datos obligatorios")

        if self._repo.buscar_por_asiento(funcion_id, asiento) is not None:
            raise AsientoOcupadoError(f"El asiento {asiento} ya está ocupado")

        boleto = Boleto.crear(funcion_id, asiento, nombre_cliente)
        self._repo.guardar(boleto)
        return boleto
