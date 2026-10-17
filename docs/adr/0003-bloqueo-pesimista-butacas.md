# ADR 0003: Bloqueo pesimista a nivel de fila para la reserva de butacas

- **Fecha:** 2026-10-17
- **Estado:** Propuesto

---

## 1. Contexto

El escenario de calidad de mayor prioridad del sistema (**Escenario 1 — P0: Concurrencia e integridad de datos** en `docs/escenarios.md`) exige que, ante intentos simultáneos de compra sobre la misma butaca en una función, exactamente una venta se confirme y las demás sean rechazadas, sin estados intermedios ni sobreventa (*overbooking*).

La verificación realizada únicamente en la capa de aplicación (leer el estado de la butaca y luego reservarla) deja una ventana entre el `SELECT` y el `UPDATE` por la cual dos transacciones concurrentes pueden observar la misma butaca como libre y confirmar una doble venta.

Por ello, se necesita una estrategia de control de concurrencia que garantice la atomicidad de la reserva sobre PostgreSQL, gestor adoptado en el ADR 0002, manteniendo la lógica de reserva aislada en el dominio conforme al ADR 0001.

---

## 2. Alternativas consideradas

### Alternativa 1: Bloqueo optimista con columna de versión

- **Descripción:** Registrar una columna de versión en la butaca o reserva; al confirmar la venta, la transacción verifica que la versión no haya cambiado desde su lectura y reintenta en caso contrario.
- **Razón de descarte:** Bajo alta contención sobre el mismo asiento en la función estrella, los reintentos generan latencia y errores para el usuario al final del flujo de compra, que es precisamente el caso más crítico del negocio. Se descartó como estrategia principal, aunque permanece válido para operaciones de bajo conflicto.

### Alternativa 2: Restricción de unicidad sobre la asignación (UNIQUE de función + butaca con venta activa)

- **Descripción:** Definir en la base de datos una restricción de unicidad parcial que impida existan dos ventas activas para la misma butaca en la misma función.
- **Razón de descarte (como estrategia única):** La restricción se mantiene como red de seguridad en la base de datos, pero por sí sola no basta: el flujo de la aplicación necesita un orden determinista de bloqueo para rechazar limpiamente al comprador perdedor y liberar la butaca, en lugar de llegar a una excepción de integridad al final de la transacción.

### Alternativa 3: Bloqueo pesimista a nivel de fila (estrategia seleccionada)

- **Descripción:** Ejecutar la reserva dentro de una transacción que adquiere un bloqueo exclusivo sobre la fila de la butaca mediante `SELECT ... FOR UPDATE`, de modo que las transacciones concurrentes sobre la misma butaca se serialicen.
- **Justificación:** Garantiza que exactamente una transacción confirme la venta, produce rechazos limpios y deterministas para las transacciones perdedoras, y concentra la lógica en un caso de uso de dominio verificable mediante pruebas de concurrencia.

---

## 3. Decisión

**Implementamos la reserva de butacas dentro de una transacción con bloqueo pesimista a nivel de fila (`SELECT ... FOR UPDATE` sobre la butaca), en la capa de infraestructura.**

Las transacciones concurrentes sobre la misma butaca se serializan y solo la primera confirma la venta; las restantes son rechazadas de forma determinista y la butaca queda liberada al finalizar la transacción fallida.

Las reglas de negocio que acompañan al bloqueo (validación de estado de la butaca, confirmación de la venta y liberación ante rechazo) residen en el caso de uso de dominio correspondiente, conforme a la arquitectura definida en el ADR 0001; la capa de infraestructura solo materializa el mecanismo de bloqueo sobre PostgreSQL.

Cuando existan butacas múltiples en una misma reserva, se adquieren los bloqueos en un orden determinista (orden ascendente por identificador de butaca) para evitar *deadlocks*.

---

## 4. Consecuencias

### Positivas (Beneficios)

- **Integridad garantizada:** Exactamente una venta se confirma por butaca, sin estados intermedios ni sobreventa, cumpliendo el Escenario 1 — P0.
- **Lógica centralizada y rastreable:** La reserva reside en un caso de uso de dominio identificable en el código (servicio de reserva), separado del mecanismo de bloqueo que pertenece a la infraestructura.
- **Comportamiento verificable:** El aislamiento del dominio permite probar las reglas de reserva con pruebas unitarias puras, mientras que la concurrencia se verifica mediante pruebas de integración con transacciones simultáneas contra PostgreSQL.
- **Rechazos limpios:** El comprador perdedor recibe una respuesta determinista y la butaca queda disponible inmediatamente al finalizar la transacción rechazada.

### Negativas (Costos y Trade-offs)

- **Retención de bloqueos:** Las transacciones de reserva mantienen locks activos y deben mantenerse cortas para no degradar el rendimiento del sistema bajo carga.
- **Riesgo de deadlocks:** Si el orden de bloqueo de butacas múltiples no fuera determinista, transacciones simultáneas podrían interbloquearse; se mitiga bloqueando siempre en orden ascendente por identificador de butaca.
- **Pruebas de integración más complejas:** Verificar la concurrencia exige ejecutar pruebas contra una base de datos PostgreSQL real con transacciones simultáneas, en lugar de mocks exclusivamente.
- **Acoplamiento al mecanismo del gestor:** La sintaxis de `SELECT ... FOR UPDATE` es específica del gestor; un eventual cambio de base de datos requeriría revisar la implementación en infraestructura, aunque el dominio permanece aislado.
