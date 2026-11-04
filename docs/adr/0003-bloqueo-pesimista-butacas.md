# ADR 0003: Control de concurrencia mediante restricción de unicidad atómica en PostgreSQL para la reserva de butacas

- **Fecha:** 2026-10-17 (Actualizado: 2026-11-04)
- **Estado:** Aceptado

---

## 1. Contexto

El escenario de calidad de mayor prioridad del sistema (**Escenario 1 — P0: Concurrencia e integridad de datos** en `docs/escenarios.md`) exige que, ante intentos simultáneos de compra sobre la misma butaca en una función, exactamente una venta se confirme y las demás sean rechazadas, sin estados intermedios ni sobreventa (*overbooking*).

La verificación realizada únicamente en la capa de aplicación (leer si el asiento existe y luego insertar) introduce una condición de carrera conocida como *time-of-check to time-of-use (TOCTOU)*: dos peticiones concurrentes leen la ausencia del boleto simultáneamente y ambas intentan persistir.

Dado que el modelo de datos de reservas de boletos no precarga una fila por cada butaca libre de una sala, el bloqueo pesimista tradicional con `SELECT ... FOR UPDATE` no es aplicable directamente sobre filas inexistentes. Se requiere un mecanismo de control de concurrencia atómico a nivel de motor de base de datos en PostgreSQL (adoptado en el ADR 0002) que garantice la atomicidad sin sobrecostos de mantenimiento de estado artificial, manteniendo el dominio aislado.

---

## 2. Alternativas consideradas

### Alternativa 1: Tabla de inventario de butacas con bloqueo pesimista (`SELECT ... FOR UPDATE`)

- **Descripción:** Pre-poblar una tabla física con todas las butacas para cada función programada (por ejemplo, 100 a 300 filas por función) y ejecutar una transacción que adquiera un bloqueo exclusivo de fila con `SELECT ... FOR UPDATE` antes de cambiar su estado a "reservado".
- **Razón de descarte:** Incrementa innecesariamente el volumen de datos relacionales y la complejidad operativa al requerir la generación y mantenimiento de cientos de filas por cada nueva función creada en cartelera. Además, retiene conexiones y bloqueos activos en el pool durante la transacción.

### Alternativa 2: Bloqueo optimista con versión

- **Descripción:** Agregar una columna de versión a la función o butaca y verificarla al confirmar la reserva.
- **Razón de descarte:** Bajo contención en funciones de alta demanda (estrenos), los reintentos optimistas fallan en cascada y generan latencia indeseada para el usuario final.

### Alternativa 3: Restricción de unicidad a nivel de motor con traducción de excepciones de integridad (Seleccionada)

- **Descripción:** Establecer una restricción de unicidad estricta en PostgreSQL sobre la combinación de función y asiento: `CONSTRAINT uk_boleto_funcion_asiento UNIQUE (funcion_id, asiento)`. En el adaptador de infraestructura (`PostgresBoletoRepository`), capturar la violación de unicidad lanzada por el motor de base de datos (código SQLSTATE `23505` - `unique_violation`) y traducirla limpiamente a la excepción de dominio `AsientoOcupadoError`.
- **Justificación:** El motor de base de datos garantiza la atomicidad estricta a nivel de índice B-Tree sin necesidad de preinsertar filas ni retener bloqueos manuales. Si dos transacciones intentan reservar el mismo asiento al mismo milisegundo, PostgreSQL serializa la inserción garantizando que exactamente una se confirme y la segunda aborte inmediatamente con un rechazo determinista.

---

## 3. Decisión

**Adoptamos la restricción de unicidad atómica en base de datos (`UNIQUE (funcion_id, asiento)`) como mecanismo principal de control de concurrencia para la reserva de butacas en PostgreSQL.**

En la capa de dominio, el caso de uso realiza la verificación preventiva (`buscarPorAsiento`) para responder de forma rápida en flujos secuenciales. En el adaptador de infraestructura de persistencia (`PostgresBoletoRepository`), se captura de forma obligatoria el error de unicidad de PostgreSQL (código `23505`), traduciéndolo inmediatamente a `AsientoOcupadoError`.

El controlador de presentación captura `AsientoOcupadoError` y responde al cliente con código HTTP 400 y mensaje de error descriptivo, garantizando que ninguna excepción interna del driver de base de datos escape al usuario y cerrando por completo la condición de carrera del Escenario 1 (P0).

---

## 4. Consecuencias

### Positivas (Beneficios)

- **Atomicidad absoluta garantizada por el motor:** Cumple al 100% el Escenario 1 (P0), evitando sobreventa (*overbooking*) bajo cualquier nivel de concurrencia.
- **Modelo de datos eficiente:** No requiere poblar previamente millones de filas en una tabla de asientos por función; solo se persisten las reservas activas.
- **Respuestas deterministas y limpias:** Las peticiones perdedoras reciben un error controlado (`AsientoOcupadoError` / HTTP 400) sin caídas del servicio ni fugas de excepciones de SQL.
- **Independencia del dominio:** El núcleo de negocio permanece agnóstico a los códigos de error específicos de PostgreSQL; la traducción se realiza en el adaptador de infraestructura.

### Negativas (Costos y Trade-offs)

- **Acoplamiento del adaptador al código SQLSTATE:** El adaptador de PostgreSQL debe conocer el código de error `23505`. Otros adaptadores (como el de memoria) deben replicar la verificación de unicidad en sus propias estructuras.
