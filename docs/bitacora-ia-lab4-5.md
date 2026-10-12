
# Bitácora de Uso de Inteligencia Artificial — Lumiere

- **Proyecto:** Lumiere — Sistema de Gestión de Cine
- **Laboratorio:** Lab04-05 — Semanas 4 y 5
- **Fecha:** 2026-10-11
- **Herramienta utilizada:** ChatGPT

---

## 1. Uso de IA — Semana 4: Decisiones Arquitectónicas

Durante la elaboración de los registros de decisiones arquitectónicas (ADR), se utilizó ChatGPT como herramienta de apoyo para proponer alternativas de diseño y tecnologías.

El equipo evaluó las alternativas y asumió la responsabilidad de seleccionar las decisiones arquitectónicas del sistema Lumiere.

### ADR 0001: Elección del estilo arquitectónico

**Decisión:** Arquitectura en Capas con dependencias dirigidas hacia el dominio.

**Alternativas propuestas mediante IA:**

1. Monolito sin capas / Transaction Script en paquete único.
2. Arquitectura de microservicios distribuidos.

**Alternativa seleccionada por el equipo:**

Arquitectura en Capas con dominio aislado.

**Alternativas descartadas:**

- **Monolito sin capas:** Se descartó por el acoplamiento entre componentes, que dificulta localizar modificaciones y aislar las reglas de negocio.
- **Microservicios distribuidos:** Se descartó por la complejidad operativa y la necesidad de coordinar transacciones distribuidas.

**Justificación:**

El equipo seleccionó la arquitectura en capas considerando los escenarios de calidad del sistema y los resultados del experimento del costo del cambio.

La estructura permite separar las reglas del dominio de los controladores y de la infraestructura, facilitando las pruebas independientes de la base de datos.

**Uso de IA:**

se utilizó para proponer alternativas arquitectónicas que fueron evaluadas y descartadas durante el proceso de decisión.

---

### ADR 0002: Adopción de PostgreSQL

**Decisión:** Reemplazar Oracle Database 21c XE por PostgreSQL.

**Alternativas propuestas mediante IA:**

1. Mantener Oracle Database 21c XE.
2. Adoptar MySQL.
3. Adoptar PostgreSQL.

**Alternativa seleccionada por el equipo:**

PostgreSQL.

**Alternativas descartadas:**

- **Oracle Database 21c XE:** Se descartó por las dificultades de configuración y el espacio que ocupaba en el entorno de desarrollo utilizado.
- **MySQL:** Se consideró técnicamente viable, pero no se identificó una ventaja suficiente respecto de PostgreSQL para modificar la decisión adoptada.

**Justificación:**

El equipo decidió utilizar PostgreSQL principalmente por su facilidad de configuración y por los recursos de almacenamiento requeridos en comparación con el entorno anterior basado en Oracle Database XE.

Además, PostgreSQL dispone de mecanismos transaccionales y restricciones de integridad apropiados para las operaciones de reserva y venta de butacas.

**Uso de IA:**

ChatGPT se utilizó como apoyo para proponer y comparar alternativas de gestores de bases de datos, así como para organizar un borrador del ADR en formato Markdown.

La decisión de reemplazar Oracle por PostgreSQL fue tomada por el equipo.

---

## 2. Uso de IA — Semana 5: Costo del Cambio

### Cuadro del costo del cambio

Los integrantes responsables realizaron las mediciones de las versiones A y B y elaboraron el cuadro comparativo utilizando los resultados obtenidos durante el experimento.

Las evidencias de las mediciones se encuentran almacenadas en el repositorio, dentro de las carpetas correspondientes a las versiones A y B.

**Declaración:**

No se usó asistente de inteligencia artificial para realizar las mediciones, analizar los resultados ni elaborar el cuadro del costo del cambio.

---

### Rodaja vertical del sistema Lumiere

El integrante responsable desarrolla una capacidad del sistema propio utilizando la estructura arquitectónica seleccionada en el ADR 0001.

La implementación debe mantener el dominio independiente de la infraestructura e incorporar una prueba de dominio que pueda ejecutarse sin levantar una base de datos.

**Declaración:**

No se usó asistente de inteligencia artificial para escribir el código ni las pruebas de la rodaja vertical.

---

## 3. Responsabilidad del Equipo

La inteligencia artificial se utilizó como herramienta de apoyo para generar alternativas durante la elaboración de los ADR.

El equipo asumió la responsabilidad de evaluar las alternativas, seleccionar las decisiones, justificar los descartes y verificar la coherencia de la documentación con el sistema Lumiere.

Para las actividades correspondientes al cuadro del costo del cambio y la rodaja vertical, no se utilizaron asistentes de inteligencia artificial, respetando las restricciones establecidas en el laboratorio.
