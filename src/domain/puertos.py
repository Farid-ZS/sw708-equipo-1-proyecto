from __future__ import annotations

from abc import ABC, abstractmethod
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from src.domain.cinema import Boleto


# interfaz que la infra debe implementar
class BoletoRepository(ABC):
    @abstractmethod
    def guardar(self, boleto: Boleto) -> None: ...

    @abstractmethod
    def buscar_por_asiento(self, funcion_id: str, asiento: str) -> Optional[Boleto]: ...
