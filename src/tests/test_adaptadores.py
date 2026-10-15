import unittest
import os
import uuid
import psycopg as psy

from src.domain.cinema import AsientoOcupadoError, Boleto, ReservarBoletoUseCase
from src.infrastructure.memoria import InMemoryBoletoRepository
from src.infrastructure.postgresql import PostgreBoletoRepository

class PruebasCompartidas:
    def test_reserva_exitosa(self):
        boleto = self.use_case.ejecutar(
            self.funcion_prueba, "A1", "Carlos"
        )

        self.assertIsInstance(boleto, Boleto)
        self.assertEqual(boleto.asiento, "A1")
        self.assertEqual(boleto.nombre_cliente, "Carlos")

        encontrado = self.repo.buscar_por_asiento(
            self.funcion_prueba, "A1"
        )
        self.assertIsNotNone(encontrado)
        self.assertEqual(encontrado.id, boleto.id)

    def test_asiento_ocupado(self):
        self.use_case.ejecutar(
            self.funcion_prueba, "A1", "Carlos"
        )

        with self.assertRaises(AsientoOcupadoError):
            self.use_case.ejecutar(
                self.funcion_prueba, "A1", "Luis"
            )

    def test_mismo_asiento_distinta_funcion(self):
        segunda_funcion = self.funcion_prueba + "-B"

        primero = self.use_case.ejecutar(
            self.funcion_prueba, "A1", "Carlos"
        )
        segundo = self.use_case.ejecutar(
            segunda_funcion, "A1", "Luis"
        )

        self.assertIsInstance(primero, Boleto)
        self.assertIsInstance(segundo, Boleto)
        self.assertNotEqual(primero.id, segundo.id)

    def test_datos_vacios(self):
        with self.assertRaises(ValueError):
            self.use_case.ejecutar(
                self.funcion_prueba, "", "Carlos"
            )

    def test_asiento_disponible(self):
        resultado = self.repo.buscar_por_asiento(
            self.funcion_prueba, "A9"
        )
        self.assertIsNone(resultado)


class TestAdaptadorMemoria(PruebasCompartidas, unittest.TestCase): 
    def setUp(self): 
        self.funcion_prueba = f"TEST-{uuid.uuid4().hex[:8]}"
        self.repo = InMemoryBoletoRepository() 
        self.use_case = ReservarBoletoUseCase(self.repo) 
        
class TestAdaptadorPostgres(PruebasCompartidas, unittest.TestCase):
        def setUp(self): 
            self.connection_string = os.getenv("TEST_DATABASE_URL") 
            if not self.connection_string:
                self.skipTest("TEST_DATABASE_URL no está configurada")
            self.funcion_prueba = f"TEST-{uuid.uuid4().hex[:8]}"
            self.repo = PostgreBoletoRepository(self.connection_string)
            self.use_case = ReservarBoletoUseCase(self.repo)

        def tearDown(self): 
            with psy.connect(self.connection_string) as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""DELETE FROM boletos WHERE funcion_id IN (%s, %s)""",(self.funcion_prueba,self.funcion_prueba + "-B",),) 
        
if __name__ == "__main__":
    unittest.main()

        