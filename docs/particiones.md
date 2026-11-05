# Particiones del sistema Lumiere

Este documento compara dos formas de partir el sistema y justifica la elegida frente al escenario de calidad de mayor prioridad, **E1: concurrencia e integridad de asientos** ([docs/escenarios.md](escenarios.md)).

- **Opción A: monolito con base de datos compartida.** Es el sistema heredado que describe el [ADR-0001](adr/0001-eleccion-estilo-arquitectonico.md): un controlador central coordina venta de entradas, confitería y persistencia, y cualquier módulo lee o escribe las tablas de los demás (Oracle con dos esquemas compartidos por todos los módulos).
- **Opción B: partición por módulo dueño de sus datos.** Cada módulo (Reservas, Cartelera/Funciones, Salas, Confitería, Reportes) es dueño exclusivo de sus tablas y expone un contrato explícito. Ningún módulo consulta las tablas de otro. Hoy la partición **Reservas** ya está implementada así en `lumiereApp/backend/src/`.

---

## 03. Evaluación de A vs B frente al Escenario E1

E1 exige que, ante 1000 intentos concurrentes sobre el mismo asiento y la misma función, se confirme exactamente 1 reserva y se rechacen 999, con 0 registros duplicados.

| Criterio | A: monolito con base compartida | B: Reservas como partición dueña de sus datos |
|---|---|---|
| **Cuántos módulos toca un cambio en la regla de E1** | Varios. La regla «un asiento, una reserva por función» puede romperse desde cualquier módulo que escriba en la tabla de reservas (venta, cancelaciones, confitería con combos, reportes), así que un cambio en la regla obliga a revisar todos esos puntos de escritura. | **Uno: Reservas.** La regla vive en `ReservarBoletoUseCase` (`domain/cinema.ts`) y en el UNIQUE `uk_boleto_funcion_asiento` (`database/lab06_hexagonal/01_create_boletos.sql`). El único que escribe en `boletos` es `PostgresBoletoRepository` (`infrastructure/postgres.repository.ts`). |
| **Acoplamiento de datos** | Alto. Las tablas son compartidas y cualquier módulo hace consultas cruzadas (*joins* entre esquemas), así que un cambio de columna o de restricción en reservas afecta a módulos que no tienen nada que ver con E1. | Bajo. Reservas es la dueña única de la tabla `boletos` y de su restricción. Los demás módulos acceden solo por el puerto `BoletoRepository` o por el endpoint `POST /api/reservas`, nunca con SQL directo. |
| **Escalado independiente** | No es posible. Para soportar un estreno con alta contención hay que escalar el monolito completo, incluidos módulos de poca carga como confitería o reportes. | Posible. Reservas, el cuello de botella de E1, puede escalarse sola: más instancias detrás del endpoint (horizontal) o más recursos para su base (vertical). La atomicidad no depende de la instancia, porque la garantiza el UNIQUE de PostgreSQL ([ADR-0003](adr/0003-bloqueo-pesimista-butacas.md)). |
| **Pruebas aisladas** | Difíciles. Para probar la concurrencia de butacas hay que levantar la base completa con los datos de todos los módulos, y una falla puede venir de cualquiera de ellos. | Directas. `domain.test.ts` (7 pruebas) verifica la regla con el adaptador en memoria, sin base de datos. `adaptadores.test.ts` (5 pruebas) verifica que memoria y PostgreSQL cumplen el mismo contrato. `e2e.test.ts` (3 pruebas) verifica el endpoint HTTP. |

**Conclusión.** B atiende mejor E1 en los cuatro criterios: la regla queda en un solo módulo, la tabla tiene un solo dueño, el cuello de botella se escala por separado y la regla se prueba sin depender del resto del sistema. A solo gana en simplicidad inicial, que E1 no premia.

> **Alcance real hoy.** B está aplicada solo a Reservas. Los demás módulos (`ventas`, `salas`, `confiteria`, `reportes`, etc.) todavía son *stubs* en `lumiereApp/backend/src/routes/`. Todos corren en el mismo proceso de Express, así que el escalado independiente es una capacidad que la partición habilita, no un despliegue que ya exista.

---

## 04. Justificación formal de la partición elegida (B)

### Qué se gana

- **Independencia de Reservas.** La regla de E1 se cambia, se prueba y se despliega tocando solo la partición Reservas, sin riesgo de romper cartelera, confitería o reportes.
- **Escalamiento del cuello de botella.** En un estreno la carga se concentra en las reservas. Con B se escala Reservas de forma vertical (más recursos para su base y su proceso) u horizontal (más instancias detrás del mismo endpoint), sin escalar lo que no lo necesita. Escalar en horizontal no pone en riesgo la integridad, porque la exclusión mutua la resuelve el motor con `uk_boleto_funcion_asiento` y no la memoria de una instancia.
- **Verificabilidad.** La medida de E1 (1 confirmada, 999 rechazadas, 0 duplicados) se mide sobre un solo módulo y una sola tabla, con el instrumento definido en `docs/escenarios.md` (k6 + consulta SQL de verificación).

### Qué se pierde

- **Simplicidad inicial.** Con A, una pantalla que muestra asientos ocupados por función con el nombre de la película se resuelve con un *join*. Con B, Cartelera no puede leer `boletos`: tiene que pedírselo a Reservas por su contrato, y eso implica más código, más archivos y una llamada adicional.
- **Contratos explícitos obligatorios.** Cada dato que otro módulo necesite de Reservas tiene que estar en su puerto o en su API. Hoy el contrato `BoletoRepository` solo ofrece `guardar` y `buscarPorAsiento`; los reportes de ocupación o de recaudación por función van a necesitar operaciones nuevas en el contrato, no consultas cruzadas.
- **Consistencia entre módulos.** Datos que en A se validaban con claves foráneas entre tablas (por ejemplo, que `funcion_id` exista en Funciones) en B tienen que validarse a través del contrato del otro módulo.

### Qué tendría que cambiar para que A fuera la mejor opción

Que el cine deje de tener concurrencia sobre butacas y pase a ser un **sistema CRUD administrativo**: por ejemplo, si la venta se hiciera solo en una taquilla, con un único operador y sin venta web. En ese caso E1 dejaría de ser el escenario P0, no habría cuello de botella que escalar por separado, y la simplicidad de A (consultas directas, menos contratos y menos archivos) pesaría más que la independencia que da B.

---

**Relación con otras decisiones:** [ADR-0001](adr/0001-eleccion-estilo-arquitectonico.md) (estilo hexagonal con dominio aislado), [ADR-0002](adr/0002-adopcion-de-Postgresql.md) (PostgreSQL), [ADR-0003](adr/0003-bloqueo-pesimista-butacas.md) (UNIQUE como mecanismo atómico frente a E1) y [ADR-0004](adr/0004-adopcion-typescript-backend.md) (backend en TypeScript).
