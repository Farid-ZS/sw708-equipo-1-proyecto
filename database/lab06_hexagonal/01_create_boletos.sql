-- Laboratorio 06: Arquitectura Hexagonal
-- Base de datos de pruebas para los adaptadores

CREATE TABLE IF NOT EXISTS boletos (
    id UUID PRIMARY KEY,
    funcion_id VARCHAR(50) NOT NULL,
    asiento VARCHAR(10) NOT NULL,
    nombre_cliente VARCHAR(150) NOT NULL,
    reservado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_boleto_funcion_asiento
        UNIQUE (funcion_id, asiento)
);