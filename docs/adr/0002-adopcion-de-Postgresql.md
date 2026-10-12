
# ADR 0002: Adopción de PostgreSQL como sistema gestor de base de datos para Lumiere

- **Fecha:** 2026-10-11
- **Estado:** Aceptado

---

## 1. Contexto

El sistema `Lumiere` gestiona la cartelera, venta de boletos, asignación de butacas y confitería para salas de cine. Estas operaciones requieren almacenar información estructurada y garantizar la integridad de los datos durante las transacciones.

Inicialmente, el equipo seleccionó **Oracle Database 21c XE** como sistema gestor de base de datos, utilizando Node.js con Express y TypeScript para el backend.

Sin embargo, durante la preparación del entorno de desarrollo se identificaron dificultades relacionadas con la configuración de Oracle y el espacio de almacenamiento que requiere. Estas condiciones motivaron al equipo a evaluar una alternativa que permitiera simplificar el entorno de desarrollo y reducir el consumo de recursos.

Asimismo, el escenario de calidad de mayor prioridad definido para el sistema (**Escenario 1 — P0: Concurrencia e integridad de datos** en `docs/escenarios.md`) exige que, ante intentos simultáneos de compra sobre la misma butaca en una función, exactamente una venta se confirme y las demás sean rechazadas, evitando situaciones de sobreventa (*overbooking*).

Por ello, el gestor de base de datos seleccionado debe proporcionar soporte para transacciones, restricciones de integridad y mecanismos de control de concurrencia, sin incrementar innecesariamente la complejidad de configuración del entorno.

---

## 2. Alternativas consideradas

### Alternativa 1: Mantener Oracle Database 21c XE

- **Descripción:** Continuar utilizando Oracle Database 21c XE como sistema gestor de base de datos relacional, manteniendo la tecnología seleccionada inicialmente por el equipo.
- **Razón de descarte:** Aunque Oracle proporciona capacidades de gestión transaccional, integridad referencial y control de concurrencia, su configuración y consumo de espacio representaron dificultades para el entorno de desarrollo utilizado por el equipo. Mantenerlo implicaría conservar estas dificultades sin aportar una ventaja decisiva para las necesidades actuales de Lumiere.

### Alternativa 2: Adoptar MySQL

- **Descripción:** Utilizar MySQL como sistema gestor de base de datos relacional, aprovechando sus mecanismos de transacciones mediante InnoDB, restricciones de integridad e integración con aplicaciones desarrolladas en Node.js.
- **Razón de descarte:** Aunque MySQL representa una alternativa técnicamente viable, el equipo considera que PostgreSQL satisface sus necesidades de configuración, persistencia y control transaccional. Adoptar MySQL no presenta una ventaja suficientemente significativa frente a la solución seleccionada que justifique modificar nuevamente la decisión tecnológica.

### Alternativa 3: Adoptar PostgreSQL

- **Descripción:** Utilizar PostgreSQL como sistema gestor de base de datos relacional para almacenar la información de películas, funciones, salas, butacas, reservas, ventas y operaciones relacionadas con la confitería.
- **Justificación:** PostgreSQL facilita la configuración del entorno de desarrollo del equipo y permite reducir el espacio utilizado respecto de su instalación anterior de Oracle. Además, ofrece transacciones ACID, integridad referencial, restricciones y mecanismos de control de concurrencia necesarios para implementar las operaciones críticas del sistema.

---

## 3. Decisión

**Adoptamos PostgreSQL como sistema gestor de base de datos relacional para el sistema Lumiere, reemplazando Oracle Database 21c XE.**

Utilizamos PostgreSQL para administrar la persistencia de películas, funciones, salas, butacas, reservas, ventas y demás entidades del sistema.

Esta decisión responde principalmente a la necesidad de simplificar la configuración del entorno de desarrollo y reducir el consumo de espacio, manteniendo las capacidades transaccionales requeridas para las operaciones del negocio.

Asimismo, mantenemos la **Arquitectura en Capas con dependencias dirigidas hacia el dominio**, definida en el ADR 0001.

La lógica del dominio permanece independiente de PostgreSQL, mientras que la capa de infraestructura implementa las operaciones de persistencia mediante interfaces y contratos definidos por las capas internas.

Las operaciones críticas de reserva y venta deben utilizar mecanismos transaccionales adecuados para garantizar que una misma butaca no sea vendida simultáneamente a diferentes clientes.

---

## 4. Consecuencias

### Positivas (Beneficios)

- **Facilidad de configuración:** PostgreSQL simplifica la preparación y configuración del entorno de desarrollo respecto de las dificultades experimentadas con Oracle Database 21c XE.

- **Reducción del consumo de espacio:** El cambio permite utilizar una instalación de base de datos que requiere menos espacio en el entorno empleado por el equipo, facilitando su ejecución durante el desarrollo.

- **Integridad transaccional:** PostgreSQL proporciona transacciones ACID, restricciones de integridad y mecanismos de bloqueo que permiten implementar operaciones consistentes para la reserva y venta de butacas, contribuyendo al cumplimiento del Escenario 1 — P0.

- **Compatibilidad con el backend:** PostgreSQL dispone de controladores y bibliotecas compatibles con Node.js y TypeScript, facilitando su integración con los componentes de infraestructura.

- **Independencia del dominio:** La separación establecida en el ADR 0001 permite mantener las reglas de negocio independientes del gestor de base de datos, concentrando los detalles de persistencia en infraestructura.

### Negativas (Costos y Trade-offs)

- **Adaptación de la persistencia:** El reemplazo de Oracle requiere revisar las conexiones, consultas SQL y componentes de infraestructura que dependan del gestor anterior.

- **Migración de elementos específicos de Oracle:** Los procedimientos PL/SQL y otras funcionalidades particulares de Oracle que hayan sido implementados deben adaptarse o reemplazarse por alternativas compatibles con PostgreSQL.

- **Nuevas pruebas de integración:** Es necesario verificar que las operaciones de reserva, venta y actualización de butacas funcionen correctamente con PostgreSQL, especialmente cuando existen transacciones simultáneas.

- **Configuración del control de concurrencia:** Aunque PostgreSQL proporciona mecanismos transaccionales, evitar la sobreventa requiere implementar correctamente las transacciones, bloqueos y restricciones correspondientes. El uso del gestor no garantiza por sí solo la ausencia de overbooking.

- **Mantenimiento de la infraestructura:** El equipo asume la responsabilidad de administrar las conexiones, configuraciones, copias de seguridad y actualizaciones de PostgreSQL.
