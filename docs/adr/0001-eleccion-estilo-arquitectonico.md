# ADR 0001: Elección del estilo arquitectónico en capas con dominio aislado para Lumiere

- **Fecha:** 2026-10-11
- **Estado:** Aceptado

---

## 1. Contexto

El sistema `Lumiere` gestiona la cartelera, venta de boletos, asignación de butacas y confitería para salas de cine. El sistema heredado presenta severos problemas de acoplamiento: un controlador monolítico gigante coordina la venta de entradas junto con la dulcería y la persistencia en base de datos. Cualquier modificación en los cálculos o reglas rompe partes no relacionadas del sistema.

Asimismo, el escenario de calidad de mayor prioridad definido para el sistema (**Escenario 1 — P0: Concurrencia e integridad de datos** en `docs/escenarios.md`) exige que, ante intentos simultáneos de compra sobre la misma butaca en una función, exactamente una venta se confirme y el resto sea rechazado sin estados intermedios ni sobreventa (*overbooking*). Para garantizar esta regla y la trazabilidad de auditoría (**Escenario 2 — P1**), es fundamental que la lógica del dominio (estado de butacas, transaccionalidad y reservas) esté completamente aislada de los controladores web y de la infraestructura de persistencia.

En el experimento de medición del costo del cambio (`docs/costo-del-cambio.md`), comprobamos cuantitativamente los riesgos de un diseño acoplado: en la **Versión A** (paquete único sin separación de capas), un solo cambio en la lógica de negocio modificó simultáneamente el modelo, el servicio y las pruebas (3 archivos y 83 líneas alteradas), requiriendo buscar en múltiples secciones entrelazadas y exponiendo al sistema a errores de regresión colaterales.

---

## 2. Alternativas consideradas

### Alternativa 1: Monolito sin capas / Transaction Script en paquete único (Estilo Versión A)
- **Descripción:** Mantener la lógica agrupada directamente en controladores o servicios que realizan consultas directas a la base de datos y manipulan el modelo sin fronteras arquitectónicas internas.
- **Razón de descarte:** Aunque permite implementar requerimientos iniciales con menor número de archivos, el experimento del costo del cambio demostró que el acoplamiento directo obliga a modificar simultáneamente el acceso a datos y la lógica, volviendo imposible aislar y probar las condiciones de concurrencia y bloqueo de butacas sin levantar toda la base de datos. Provoca regresiones accidentales en módulos independientes (como dulcería).

### Alternativa 2: Arquitectura de Microservicios distribuidos
- **Descripción:** Dividir el sistema en servicios independientes desplegados por separado (Servicio de Cartelera, Servicio de Venta/Reservas, Servicio de Confitería, Servicio de Autenticación), comunicados mediante HTTP/REST o mensajería asíncrona.
- **Razón de descarte:** Si bien proporciona un desacoplamiento físico total, introduce una complejidad operativa y de infraestructura desproporcionada para el tamaño del equipo y del sistema. La gestión de transacciones distribuidas (Saga / 2PC) dificultaría enormemente cumplir la meta estricta del Escenario 1 (integridad atómica inmediata en la reserva de asientos para evitar overbooking) sin agregar latencia significativa.

### Alternativa 3: Arquitectura en Capas con inversión de dependencias hacia el dominio (Estilo Versión B)
- **Descripción:** Estructurar el backend en capas bien definidas (Presentación/Controladores API, Casos de Uso/Aplicación, Dominio y Persistencia/Infraestructura), donde el dominio no depende de la base de datos ni del framework web.

---

## 3. Decisión

**Adoptamos el estilo de Arquitectura en Capas (Layered Architecture) con dependencias dirigidas hacia el dominio** para el backend del sistema Lumiere.

Las reglas críticas de negocio (como el bloqueo de butacas, validación de overbooking y cálculo de totales) residen en el núcleo de dominio, mientras que los controladores de Express/NestJS y los adaptadores de base de datos (PostgreSQL/Oracle) dependen de abstracciones definidas por la aplicación.

---

## 4. Consecuencias

### Positivas (Beneficios)
- **Cumplimiento del Escenario P0 (Integridad y Concurrencia):** Permite aislar la lógica de reserva y bloqueo de asientos en un servicio de dominio especializado, facilitando la implementación de transacciones atómicas y bloqueos (locks) sin interferencia de controladores de presentación ni de módulos secundarios como confitería.
- **Testabilidad y verificación rápida:** El núcleo de reservas y auditoría puede probarse exhaustivamente mediante pruebas unitarias puras y mocks en milisegundos, sin depender de conexiones activas a base de datos externa.
- **Localización del cambio:** Siguiendo la evidencia de la Versión B del experimento, las modificaciones en la lógica de negocio quedan acotadas a clases de dominio específicas, reduciendo la dispersión del código y evitando búsquedas ciegas antes de aplicar un cambio.

### Negativas (Costos y Trade-offs)
- **Mayor cantidad de archivos y boilerplate:** Como se evidenció en la Versión B del experimento, estructurar por capas incrementa el número de clases, contratos e interfaces intermedias requeridas para transferir datos (DTOs y mapeadores) entre capas.
- **Sobrecarga de navegación inicial:** Para requerimientos simples o consultas directas de solo lectura (como listar géneros de películas), el flujo debe atravesar el controlador, el servicio y el repositorio, lo que demanda unos minutos adicionales de desarrollo comparado con un script directo.
