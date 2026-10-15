import unittest
import os
import uuid 
import psycopg as psy  


from src.domain.cinema import AsientoOcupadoError, Boleto, ReservarBoletoUseCase
from src.infrastructure.memoria import InMemoryBoletoRepository
from src.presentation.controller import BoletoController 
from src.infrastructure.postgresql import PostgreBoletoRepository 

class TestAdaptadores(unittest.TestCase): 
    def setUp(self): 
        self.repo_memoria= InMemoryBoletoRepository() 
        self.use_case_memoria= ReservarBoletoUseCase(self.repo_memoria) 
        self.connection_string = os.getenv("TEST_DATABASE_URL")
        if not self.connection_string:
            self.skipTest("TEST_DATABASE_URL no está configurada")
        
        self.repo_postgres= PostgreBoletoRepository(self.connection_string) 
        self.use_case_postgres= ReservarBoletoUseCase(self.repo_postgres)
        self.funcion_prueba = f"TEST-{uuid.uuid4().hex[:8]}"
    
    def tearDown(self): 
        with psy.connect(self.connection_string) as conn:
            with conn.cursor() as cursor: 
                cursor.execute("DELETE FROM boletos WHERE funcion_id = %s", (self.funcion_prueba,)) 
        
    def test_reserva_memoria(self): 
        boleto = self.use_case_memoria.ejecutar(self.funcion_prueba, "A1", "Carlos") 
        self.assertIsInstance(boleto,Boleto)
        self.assertEqual(boleto.asiento, "A1") 
    
    def test_reserva_postgres(self): 
        boleto = self.use_case_postgres.ejecutar(self.funcion_prueba, "A1", "Carlos") 
        self.assertIsInstance(boleto, Boleto)
        self.assertEqual(boleto.asiento, "A1") 
        