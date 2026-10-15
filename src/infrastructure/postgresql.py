import psycopg as psy  
from src.domain.cinema import Boleto  
from src.domain.puertos import BoletoRepository 
from typing import Optional  

class PostgreBoletoRepository(BoletoRepository):
    def __init__(self,connection_string) : 
        self.connection_string =connection_string  
    
    def guardar(self,boleto:Boleto) -> None:
        with psy.connect(self.connection_string) as conn: 
            with conn.cursor() as cursor: 
                parametros=(boleto.id,boleto.funcion_id,boleto.asiento,boleto.nombre_cliente,boleto.reservado_en) 
                cursor.execute("INSERT INTO boletos (id,funcion_id,asiento,nombre_cliente,reservado_en) VALUES (%s,%s,%s,%s,%s)", parametros) 
    def buscar_por_asiento(self,funcion_id:str,asiento:str) ->Optional[Boleto]:
        with psy.connect(self.connection_string) as conn: 
            with conn.cursor() as cursor: 
                parametros= (funcion_id,asiento) 
                cursor.execute("SELECT id,funcion_id,asiento,nombre_cliente,reservado_en FROM boletos WHERE funcion_id = %s AND asiento =%s",parametros) 
                fila = cursor.fetchone() 
                if fila is None: 
                    return None 
                boleto = Boleto(id=str(fila[0]) , 
                                funcion_id=str(fila[1]),
                                asiento=str(fila[2]), 
                                nombre_cliente=str(fila[3]), 
                                reservado_en=fila[4]
                                )
                return boleto 