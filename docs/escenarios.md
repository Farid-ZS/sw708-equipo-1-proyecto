# Escenarios de Calidad — Sistema Lumiere

Este documento define los escenarios de calidad del sistema **Lumiere** conforme al estándar de atributos de calidad (Bass, Clements y Kazman). Cada escenario incluye su especificación formal con medida verificable, su instrumento concreto de medición, el responsable del equipo y la decisión arquitectónica (ADR) asociada.

---

## 1. Escenarios de Calidad

### Escenario 1 (E1) — Fiabilidad: Concurrencia e Integridad de Asientos (P0)

- **Fuente:** Dos usuarios simultáneos (vendedores de taquilla o clientes web).
- **Estímulo:** Intentan reservar exactamente el mismo asiento de la misma función al mismo milisegundo.
- **Artefacto:** Módulo de reservas de boletos y base de datos relacional de butacas.
- **Entorno:** Sistema en producción con sala de alta demanda (estreno comercial con alta contención).
- **Respuesta:** Exactamente una solicitud confirma la reserva y emite boleto con HTTP 201; la otra es rechazada deterministamente con mensaje `"El asiento ... ya está ocupado"` y código HTTP 400. Ninguna reserva queda en estado intermedio ni existe sobreventa (*overbooking*).
- **Medida:** En 1000 intentos concurrentes dirigidos al mismo asiento y función: exactamente 1 reserva confirmada y 999 respuestas de rechazo; 0 registros duplicados en base de datos.
- **Instrumento de Medición:** Script de carga concurrente con **`k6`** disparando 1000 peticiones POST paralelas a `/api/reservas`, seguido de una consulta de verificación SQL directa en PostgreSQL (`SELECT count(*) FROM boletos WHERE funcion_id = ... AND asiento = ...`).
- **Responsable de Ejecución:** Luis Angel Vargas Ponce.
- **Decisión Arquitectónica:** [ADR-0003](adr/0003-bloqueo-pesimista-butacas.md) (Restricción atómica `UNIQUE (funcion_id, asiento)` en PostgreSQL con traducción de error `23505` a `AsientoOcupadoError`).

---

### Escenario 2 (E2) — Seguridad: Inmutabilidad y Trazabilidad de Auditoría (P1)

- **Fuente:** Usuario interno (empleado o cajero) con acceso autenticado al sistema.
- **Estímulo:** Cancela una reserva e intenta posteriormente modificar o eliminar el registro histórico de dicha cancelación.
- **Artefacto:** Módulo de cancelaciones y tabla histórica de auditoría.
- **Entorno:** Operación normal del cine; el empleado intenta alterar registros desde la aplicación o alterando consultas.
- **Respuesta:** El sistema registra de manera inmutable quién canceló, la fecha/hora exacta, el identificador del boleto y los asientos liberados; el sistema rechaza cualquier intento de modificación o borrado posterior.
- **Medida:** El 100% de las cancelaciones queda registrado con usuario y marca de tiempo; 0 registros pueden ser modificados o eliminados (0 sentencias `UPDATE` o `DELETE` exitosas sobre cancelaciones).
- **Instrumento de Medición:** Prueba de integración automatizada en **`node:test`** que ejecuta operaciones de cancelación y posteriormente intenta invocar sentencias `UPDATE` y `DELETE` tanto vía API como mediante transacciones SQL directas con el rol operativo, verificando rechazo con código de error de permisos/integridad.
- **Responsable de Ejecución:** Farid Paolo Zamudio Sánchez.
- **Decisión Arquitectónica:** [ADR-0001](adr/0001-eleccion-estilo-arquitectonico.md) (Dominio aislado con puertos y adaptadores para registro inmutable).

---

### Escenario 3 (E3) — Seguridad: Control de Acceso por Roles (RBAC) (P1)

- **Fuente:** Usuario sin sesión iniciada, o empleado con rol de vendedor estándar.
- **Estímulo:** Intenta acceder a rutas administrativas restringidas (creación de películas, salas, funciones o reportes de recaudación) directamente mediante peticiones HTTP/API.
- **Artefacto:** Módulo de autenticación, validación de tokens JWT y middleware de autorización de rutas.
- **Entorno:** Sistema en funcionamiento accesible desde terminales de taquilla o red local.
- **Respuesta:** El sistema intercepta las peticiones en el middleware perimetral, deniega el acceso sin ejecutar la lógica de negocio y responde con HTTP 401 Unauthorized o HTTP 403 Forbidden.
- **Medida:** De 100 peticiones a rutas administrativas sin credenciales de administrador, el 100% (100 de 100) son rechazadas y 0 modifican la configuración del cine.
- **Instrumento de Medición:** Suite automatizada de pruebas de seguridad HTTP con **`node:test`** y peticiones simuladas con tokens alterados, expirados o con roles insuficientes, integrada en el pipeline de GitHub Actions en cada push.
- **Responsable de Ejecución:** Gonzalo Alessandro Albornoz Azurza.
- **Decisión Arquitectónica:** Middleware de autorización por roles y firma de tokens JWT en el adaptador primario Express.

---

### Escenario 4 (E4) — Capacidad de Interacción: Agilidad y Usabilidad en Taquilla (P2)

- **Fuente:** Vendedor de taquilla nuevo o con entrenamiento básico en horario pico.
- **Estímulo:** Atiende a un cliente presencial para seleccionar función, butacas y confirmar la venta.
- **Artefacto:** Interfaz web de taquilla con mapa interactivo de asientos en tiempo real.
- **Entorno:** Fila de espera en taquilla física con alta afluencia de público.
- **Respuesta:** El vendedor completa la transacción en pocos clics visualizando el mapa de asientos con estados claros (libre, reservado, ocupado), sin requerir verificación manual en ventanilla ni cálculos externos.
- **Medida:** Cada venta se completa en menos de 5 clics y menos de 60 segundos; se produce como máximo 1 error por cada 20 ventas atendidas.
- **Definición de Error:** *Se define formalmente como error la selección involuntaria de un asiento ocupado, un clic fuera del área activa del mapa interactivo, o el intento de confirmación con datos de cliente incompletos que obligue a reiniciar el formulario de venta.*
- **Instrumento de Medición:** Sesión presencial de pruebas de usabilidad con 3 operadores de taquilla, tareas guionadas de venta rápida, cronometraje de flujo, grabación de pantalla y registro analítico de eventos de clic en el frontend React.
- **Responsable de Ejecución:** Carlos Daniel Chavez Oliva.
- **Decisión Arquitectónica:** Diseño de interfaz SPA en React 18 con sincronización visual de estados de butacas y validaciones reactivas inmediatas.

---

### Escenario 5 (E5) — Fiabilidad: Recuperación ante Caídas y Consistencia Transaccional (P1)

- **Fuente:** Falla imprevista de infraestructura (reinicio del proceso Node.js, apagón del servidor o reinicio del contenedor).
- **Estímulo:** El servidor o base de datos se interrumpe de forma abrupta mientras existen reservas concurrentes en proceso.
- **Artefacto:** Servidor de aplicación Express y motor PostgreSQL.
- **Entorno:** Alta carga transaccional al momento de la caída.
- **Respuesta:** Al restablecerse el servicio, el 100% de las ventas confirmadas antes de la caída permanecen intactas; las reservas que se encontraban a mitad de ejecución se descartan limpiamente (rollback automático), sin dejar asientos bloqueados indefinidamente ni registros corruptos.
- **Medida:** El sistema se recupera y responde con normalidad en menos de 60 segundos tras el reinicio; el 100% de las transacciones incompletas abortan limpiamente; existen 0 bloqueos residuales (*deadlocks* o *locks* colgados) en la tabla `boletos`.
- **Instrumento de Medición:** Prueba de resiliencia ejecutando `docker restart` sobre el contenedor de PostgreSQL y la aplicación durante una ráfaga de transacciones, con sondeo concurrente cada 1 segundo al endpoint `/api/health` para cronometrar la recuperación, seguido de un script SQL de reconciliación que verifique la ausencia de bloqueos huérfanos.
- **Responsable de Ejecución:** Luis Angel Vargas Ponce.
- **Decisión Arquitectónica:** [ADR-0002](adr/0002-adopcion-de-Postgresql.md) y [ADR-0003](adr/0003-bloqueo-pesimista-butacas.md) (Transacciones ACID y WAL en PostgreSQL).

---

### Escenario 6 (E6) — Rendimiento: Latencia de Consulta de Cartelera bajo Carga (P2)

- **Fuente:** Múltiples clientes concurrentes consultando funciones y películas desde navegadores web.
- **Estímulo:** Ráfaga sostenida de 500 solicitudes por segundo a las rutas de cartelera y horarios.
- **Artefacto:** Endpoints `/api/peliculas` y `/api/funciones` del backend y base de datos PostgreSQL.
- **Entorno:** Viernes por la tarde antes del inicio de funciones de fin de semana.
- **Respuesta:** El servidor entrega la lista actualizada de funciones vigentes con sus salas y disponibilidad sin degradar el tiempo de respuesta.
- **Medida:** El 95% de las peticiones (percentil p95) responde en menos de 300 milisegundos, con 0% de errores HTTP 500 bajo una tasa de 500 req/s.
- **Instrumento de Medición:** Script de rendimiento con **`k6`** simulando 500 usuarios virtuales concurrentes durante 2 minutos hacia los endpoints de lectura, monitoreando latencias p90, p95 y tasa de errores.
- **Responsable de Ejecución:** Gonzalo Alessandro Albornoz Azurza.
- **Decisión Arquitectónica:** [ADR-0002](adr/0002-adopcion-de-Postgresql.md) (Consultas optimizadas con índices B-Tree en PostgreSQL) y pool de conexiones `pg.Pool`.

---

### Escenario 7 (E7) — Modificabilidad: Adición de un Nuevo Adaptador de Infraestructura (P2)

- **Fuente:** Desarrollador del equipo de backend.
- **Estímulo:** Requerimiento de incorporar un nuevo adaptador de persistencia alternativo (por ejemplo, base de datos de auditoría en MongoDB o almacenamiento en caché Redis) o un nuevo canal de notificación.
- **Artefacto:** Capa de infraestructura y contratos de puertos en el núcleo de dominio.
- **Entorno:** Mantenimiento evolutivo del sistema.
- **Respuesta:** El nuevo adaptador se implementa satisfaciendo la interfaz del puerto existente sin requerir modificaciones en las clases de dominio ni en los casos de uso.
- **Medida:** Se requiere modificar 0 líneas de código en la capa de dominio (`src/domain/`); el nuevo adaptador pasa las mismas pruebas de contrato de la suite compartida en menos de 2 horas de desarrollo.
- **Instrumento de Medición:** Revisión de diferencias de Git (`git diff --stat src/domain/`) comprobando 0 cambios en el dominio, y ejecución exitosa de la suite parametrizada de pruebas de contrato (`src/tests/adaptadores.test.ts`).
- **Responsable de Ejecución:** Farid Paolo Zamudio Sánchez.
- **Decisión Arquitectónica:** [ADR-0001](adr/0001-eleccion-estilo-arquitectonico.md) y [ADR-0004](adr/0004-adopcion-typescript-backend.md) (Arquitectura Hexagonal con Puertos y Adaptadores).

---

## 2. Matriz de Priorización y Trazabilidad

| ID | Atributo de Calidad | Escenario | Impacto en Negocio | Dificultad Técnica | Prioridad | Decisión Arquitectónica que lo Atiende | Instrumento y Responsable |
|:---:|---|---|:---:|:---:|:---:|---|---|
| **E1** | **Fiabilidad** | Concurrencia e Integridad de Asientos | Alto (3) | Alta (3) | **P0** | **ADR-0003**: Restricción `UNIQUE` atómica con traducción de error `23505`. | Script k6 (1000 req concurrentes) — Luis Vargas |
| **E2** | **Seguridad** | Inmutabilidad de Auditoría en Cancelaciones | Alto (3) | Media (2) | **P1** | **ADR-0001**: Núcleo de dominio desacoplado con repositorio inmutable. | Test de rechazo UPDATE/DELETE en `node:test` — Farid Zamudio |
| **E3** | **Seguridad** | Control de Acceso por Roles (RBAC) | Alto (3) | Baja (1) | **P1** | Middleware de autorización JWT y control de acceso por roles. | Test HTTP automatizado en CI (HTTP 401/403) — Gonzalo Albornoz |
| **E5** | **Fiabilidad** | Recuperación ante Caídas y Consistencia | Alto (3) | Media (2) | **P1** | **ADR-0002** y **ADR-0003**: Transacciones ACID y recuperación por WAL en PostgreSQL. | Chaos test `docker restart` y sondeo healthcheck — Luis Vargas |
| **E4** | **Usabilidad** | Agilidad en Venta con Mapa de Asientos | Medio (2) | Baja (1) | **P2** | Interfaz SPA reactiva en React 18 con mapa de butacas en tiempo real. | Sesión de usabilidad con 3 vendedores y grabación — Carlos Chavez |
| **E6** | **Rendimiento** | Latencia de Cartelera bajo Carga | Medio (2) | Media (2) | **P2** | **ADR-0002**: Índices B-Tree en PostgreSQL y pool de conexiones `pg.Pool`. | Test de carga k6 (500 req/s, p95 < 300 ms) — Gonzalo Albornoz |
| **E7** | **Modificabilidad** | Adición de Nuevo Adaptador | Medio (2) | Media (2) | **P2** | **ADR-0001** y **ADR-0004**: Puertos y Adaptadores (Hexagonal) en TypeScript. | `git diff --stat` en `src/domain/` y tests de contrato — Farid Zamudio |

---

### 2.1. Justificación del Orden y cómo la Prioridad Guio las Decisiones

El orden de priorización establecido refleja las dependencias críticas del modelo de negocio de exhibición cinematográfica:

1. **Prioridad P0 (Escenario 1 — Concurrencia de Asientos):** Vender dos veces el mismo asiento a dos clientes distintos representa el fallo operacional y reputacional más severo de un cine. Esta prioridad absoluta guio de manera directa la adopción de **PostgreSQL (ADR-0002)** y el descarte de mecanismos optimistas en favor de la **restricción atómica compuesta de unicidad (ADR-0003)**, garantizando que el motor de base de datos serialice las reservas a nivel de índice B-Tree sin depender de temporizadores frágiles en memoria.
2. **Prioridad P1 (Escenarios 2, 3 y 5 — Integridad Operacional, Acceso y Disponibilidad):** Un cine no puede operar si los cajeros pueden borrar transacciones para apropiarse de ingresos (E2), si usuarios externos pueden alterar precios o salas (E3), o si un corte de energía deja butacas en estados indeterminados (E5). La necesidad de proteger la integridad financiera y operativa guio la definición de transacciones atómicas con WAL en PostgreSQL y el aislamiento de puertos en el dominio.
3. **Prioridad P2 (Escenarios 4, 6 y 7 — Fluidez, Rendimiento y Evolución):** Una vez blindada la consistencia transaccional, los escenarios P2 atienden la experiencia del usuario y la mantenibilidad: la rapidez de despacho en taquilla evita colas (E4), la cartelera de alta velocidad sostiene picos de tráfico en estrenos (E6), y la arquitectura hexagonal permite incorporar pasarelas de pago o proveedores alternativos en horas sin tocar el núcleo del negocio (E7), guiando la adopción de **TypeScript y React (ADR-0004)**.
