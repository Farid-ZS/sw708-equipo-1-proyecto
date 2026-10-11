import unittest

from src.domain.cinema import AsientoOcupadoError, Boleto, ReservarBoletoUseCase
from src.infrastructure.memoria import InMemoryBoletoRepository
from src.presentation.controller import BoletoController


class TestReservarBoleto(unittest.TestCase):
    def setUp(self):
        self.repo = InMemoryBoletoRepository()
        self.use_case = ReservarBoletoUseCase(self.repo)

    def test_reserva_exitosa(self):
        boleto = self.use_case.ejecutar("F001", "A1", "Ana")
        self.assertIsInstance(boleto, Boleto)
        self.assertEqual(boleto.asiento, "A1")

    def test_asiento_ocupado_lanza_error(self):
        self.use_case.ejecutar("F001", "A1", "Ana")
        with self.assertRaises(AsientoOcupadoError):
            self.use_case.ejecutar("F001", "A1", "Luis")

    def test_mismo_asiento_distinta_funcion(self):
        self.use_case.ejecutar("F001", "A1", "Ana")
        boleto = self.use_case.ejecutar("F002", "A1", "Luis")
        self.assertIsNotNone(boleto)

    def test_datos_vacios_lanza_error(self):
        with self.assertRaises(ValueError):
            self.use_case.ejecutar("F001", "", "Ana")


class TestBoletoController(unittest.TestCase):
    def setUp(self):
        repo = InMemoryBoletoRepository()
        self.controller = BoletoController(ReservarBoletoUseCase(repo))

    def test_reserva_devuelve_201(self):
        resp = self.controller.reservar({"funcion_id": "F001", "asiento": "B2", "nombre_cliente": "Carlos"})
        self.assertEqual(resp["status"], 201)
        self.assertIn("id", resp["data"])

    def test_asiento_ocupado_devuelve_400(self):
        datos = {"funcion_id": "F001", "asiento": "B2", "nombre_cliente": "Carlos"}
        self.controller.reservar(datos)
        resp = self.controller.reservar(datos)
        self.assertEqual(resp["status"], 400)


if __name__ == "__main__":
    unittest.main()
