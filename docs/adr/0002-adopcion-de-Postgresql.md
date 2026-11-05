# ADR 0002: Adopción de PostgreSQL como sistema gestor de base de datos para Lumiere

- **Fecha:** 2026-10-11 (Actualizado: 2026-11-04)
- **Estado:** Aceptado

---

## 1. Contexto

El sistema `Lumiere` gestiona la cartelera, venta de boletos, asignación de butacas y confitería para salas de cine. Estas operaciones requieren almacenar información estructurada y garantizar la integridad estricta de los datos durante las transacciones.

Inicialmente, el equipo seleccionó **Oracle Database 21c XE** como sistema gestor de base de datos, utilizando Node.js con Express y TypeScript para el backend. Sin embargo, durante la preparación del entorno de desarrollo se identificaron severas dificultades de infraestructura:
- Las imágenes de contenedor de Oracle XE superan los 6.5 GB de descarga y exigen al menos 6 GB de RAM dedicados, bloqueando el desarrollo local fluido en varias máquinas del equipo.
- La configuración de listener TCP, SID de instancia y múltiples esquemas obligatorios aumentaba drásticamente la fricción inicial sin aportar valor arquitectónico directo al negocio.

Asimismo, el escenario de calidad de mayor prioridad definido para el sistema (**Escenario 1 — P0: Concurrencia e integridad de datos** en `docs/escenarios.md`) exige que, ante intentos simultáneos de compra sobre la misma butaca en una función, exactamente una venta se confirme y las demás sean rechazadas, evitando situaciones de sobreventa (*overbooking*).

Por ello, se evaluaron alternativas relacionales maduras de código abierto que ofrecieran soporte ACID robusto, control de concurrencia atómico y ligereza operativa.

---

## 2. Alternativas consideradas

### Alternativa 1: Mantener Oracle Database 21c XE

- **Descripción:** Continuar utilizando Oracle Database 21c XE como sistema gestor de base de datos relacional, manteniendo la tecnología seleccionada inicialmente.
- **Razón de descarte:** Aunque Oracle proporciona capacidades transaccionales empresariales y PL/SQL avanzado, su sobrecosto de instalación, el consumo prohibitivo de memoria RAM (mínimo 6 GB para el contenedor) y la lentitud de arranque en los pipelines de GitHub Actions imposibilitan un ciclo ágil de desarrollo y pruebas automatizadas para el equipo.

### Alternativa 2: Adoptar MySQL (con motor de almacenamiento InnoDB)

- **Descripción:** Utilizar MySQL 8.x con motor transaccional InnoDB como base de datos relacional para la persistencia del sistema.
- **Trade-offs técnicos y razones de descarte:**
  1. **Control de concurrencia y mecanismos de bloqueo:** InnoDB implementa el aislamiento `REPEATABLE READ` por defecto apoyándose en bloqueos de brecha (*gap locks*) y *next-key locks*. Bajo alta contención concurrente en venta de entradas para una misma función, las inserciones simultáneas de butacas provocan frecuentes interbloqueos (*deadlocks*) por competencia en el índice B-Tree, requiriendo lógica compleja de reintentos en la aplicación.
  2. **Ausencia de índices parciales nativos:** MySQL 8 no soporta la cláusula `WHERE` en la creación de índices únicos (`CREATE UNIQUE INDEX ... WHERE ...`). Para nuestro dominio, donde se requiere garantizar butacas únicas únicamente para reservas activas (permitiendo liberar asientos tras cancelaciones históricas), PostgreSQL permite índices parciales directos, mientras que MySQL obligaría a crear columnas virtuales generadas o tablas intermedias de estado.
  3. **Tipos de datos para UUID e inmutabilidad:** PostgreSQL cuenta con el tipo nativo `UUID` de 16 bytes con operadores optimizados. En MySQL, los identificadores UUID deben almacenarse como cadenas `VARCHAR(36)` (penalizando dramáticamente el espacio y el rendimiento de los índices agrupados de InnoDB) o como `BINARY(16)` que demanda conversiones manuales en cada query del driver `mysql2`.
  4. **Cumplimiento de estándares SQL:** PostgreSQL ofrece un cumplimiento más estricto del estándar SQL (por ejemplo, validación determinista de restricciones `CHECK` y tipado temporal estricto con `TIMESTAMPTZ`), reduciendo discrepancias entre entornos.

### Alternativa 3: Adoptar PostgreSQL (Estrategia Seleccionada)

- **Descripción:** Utilizar PostgreSQL (versión 16) como sistema gestor de base de datos relacional para películas, funciones, salas, butacas y reservas.
- **Justificación:** 
  - **Eficiencia en concurrencia (MVCC):** El modelo de control de concurrencia multiversión (MVCC) de PostgreSQL asegura que las lecturas no bloqueen escrituras ni las escrituras bloqueen lecturas, reduciendo la contención al consultar disponibilidad en tiempo real mientras se procesan compras.
  - **Tipado nativo de negocio:** Soporte directo de columnas de tipo `UUID` (clave primaria del boleto), marcas de tiempo con zona horaria (`TIMESTAMP WITH TIME ZONE`) y extensiones avanzadas.
  - **Soporte de índices parciales y restricciones compuestas:** Permite aplicar restricciones de unicidad atómicas (`UNIQUE (funcion_id, asiento)`) y futuros índices condicionales sobre ventas activas.
  - **Ligereza operativa:** La imagen oficial `postgres:16-alpine` pesa menos de 140 MB y levanta en menos de 2 segundos en Docker y en los servicios de GitHub Actions.

---

## 3. Decisión

**Adoptamos PostgreSQL como sistema gestor de base de datos relacional para el sistema Lumiere, reemplazando Oracle Database 21c XE.**

Utilizamos PostgreSQL para administrar la persistencia de películas, funciones, salas, butacas, reservas y ventas.

Esta decisión responde a la necesidad de simplificar la configuración del entorno local y de CI/CD, asegurando al mismo tiempo capacidades transaccionales y de concurrencia superiores a MySQL para el caso de uso crítico de asignación atómica de butacas (Escenario 1 — P0).

Asimismo, mantenemos la **Arquitectura Hexagonal (Puertos y Adaptadores)** definida en el ADR 0001: la lógica del dominio permanece totalmente desacoplada de PostgreSQL mediante el puerto `BoletoRepository`, mientras que `PostgresBoletoRepository` implementa la persistencia encapsulando las sentencias SQL y el mapeo de errores.

---

## 4. Consecuencias

### Positivas (Beneficios)

- **Facilidad de configuración y desarrollo local:** PostgreSQL levanta en segundos con Docker Compose o contenedor local, consumiendo menos de 100 MB de RAM en reposo frente a los 6 GB que requería Oracle.
- **Integridad y concurrencia optimizada:** Soporte nativo para restricción de unicidad compuesta atómica, MVCC de alto rendimiento y tipo `UUID` nativo.
- **Integración fluida con el stack TypeScript:** Integración directa mediante la biblioteca madura `pg` (`node-postgres`) con soporte de pool de conexiones.
- **Pruebas de integración automatizadas en CI:** Permite arrancar un contenedor de PostgreSQL real en los flujos de GitHub Actions en 3 segundos para ejecutar las pruebas de contrato de adaptadores.

### Negativas (Costos y Trade-offs)

- **Migración de esquemas iniciales:** Se requiere mantener scripts SQL DDL específicos de PostgreSQL (`CREATE TABLE IF NOT EXISTS`, tipo `UUID`) en `database/`.
- **Mapeo de errores específico:** El adaptador de infraestructura en TypeScript debe interpretar los códigos de error propios de PostgreSQL (código `23505` para violación de unicidad) para traducirlos a errores de dominio.
