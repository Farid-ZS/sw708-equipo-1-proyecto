from __future__ import annotations

from typing import Optional

from src.domain.cinema import Boleto, BoletoRepository


class InMemoryBoletoRepository(BoletoRepository):
    def __init__(self) -> None:
        self._store: dict[tuple[str, str], Boleto] = {}

    def guardar(self, boleto: Boleto) -> None:
        self._store[(boleto.funcion_id, boleto.asiento)] = boleto

    def buscar_por_asiento(self, funcion_id: str, asiento: str) -> Optional[Boleto]:
        return self._store.get((funcion_id, asiento))
