from __future__ import annotations

from src.domain.cinema import AsientoOcupadoError, ReservarBoletoUseCase


class BoletoController:
    def __init__(self, use_case: ReservarBoletoUseCase) -> None:
        self._use_case = use_case

    def reservar(self, datos: dict) -> dict:
        funcion_id = datos.get("funcion_id", "").strip()
        asiento = datos.get("asiento", "").strip()
        nombre_cliente = datos.get("nombre_cliente", "").strip()

        try:
            boleto = self._use_case.ejecutar(funcion_id, asiento, nombre_cliente)
            return {
                "status": 201,
                "data": {
                    "id": boleto.id,
                    "funcion_id": boleto.funcion_id,
                    "asiento": boleto.asiento,
                    "nombre_cliente": boleto.nombre_cliente,
                    "reservado_en": boleto.reservado_en.isoformat(),
                },
            }
        except (AsientoOcupadoError, ValueError) as e:
            return {"status": 400, "data": {"error": str(e)}}
