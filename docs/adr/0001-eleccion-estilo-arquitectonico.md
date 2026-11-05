# ADR 0001: Elección del estilo arquitectónico hexagonal (Puertos y Adaptadores) con dominio aislado para Lumiere

- **Fecha:** 2026-10-11 (Actualizado: 2026-11-04)
- **Estado:** Aceptado

---

## 1. Contexto

El sistema `Lumiere` gestiona la cartelera, venta de boletos, asignación de butacas y confitería para salas de cine. El sistema heredado presentaba severos problemas de acoplamiento: un controlador monolítico gigante coordinaba la venta de entradas junto con la dulcería y la persistencia en base de datos. Cualquier modificación en los cálculos o reglas rompía partes no relacionadas del sistema.

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

### Alternativa 3: Arquitectura Hexagonal / Puertos y Adaptadores con inversión de dependencias hacia el dominio (Estilo Versión B)
- **Descripción:** Estructurar el backend organizando el código en un núcleo concéntrico de dominio protegido por fronteras explícitas: el **Dominio** (entidades y casos de uso) no depende de ningún componente externo; define **Puertos** (interfaces o contratos abstractos como `BoletoRepository`); y la infraestructura externa implementa **Adaptadores** (PostgreSQL, memoria, controladores Express HTTP) dirigidos hacia dichos puertos.
- **Justificación:** Es la evolución técnica y rigurosa de la arquitectura en capas tradicional: sustituye la dependencia transitiva jerárquica (presentación → servicio → base de datos) por una inversión de dependencias estricta (infraestructura → puertos del dominio ← presentación), garantizando que el núcleo de negocio sea 100% testeable sin base de datos ni red.

---

## 3. Decisión y Aclaración de la Relación Capas vs. Puertos y Adaptadores

**Adoptamos el estilo de Arquitectura Hexagonal (Puertos y Adaptadores) con dependencias dirigidas hacia el dominio** para el backend del sistema Lumiere.

Aclaramos formalmente la relación entre la noción de *capas concéntricas* y *puertos y adaptadores*:
1. **La visión lógica por capas:** Define las fronteras de responsabilidad desde el exterior hacia el centro: Capa de Presentación (controladores web/HTTP), Capa de Aplicación (casos de uso como `ReservarBoletoUseCase`), Capa de Dominio (entidades como `Boleto` y reglas de negocio puras) y Capa de Infraestructura (persistencia en PostgreSQL, clientes de red).
2. **La materialización técnica mediante Puertos y Adaptadores:** Para impedir que la lógica de aplicación dependa de la capa de infraestructura, el dominio define **Puertos** (interfaces como `BoletoRepository` en `src/domain/puertos.ts`), y la infraestructura implementa **Adaptadores** (como `PostgresBoletoRepository` e `InMemoryBoletoRepository`). La presentación actúa como un adaptador de entrada primario (`ReservasController`).

Así, hablar de *capas con dominio aislado* describe el principio de separación y el orden de dependencias concéntricas (Clean Architecture), mientras que *puertos y adaptadores* describe el mecanismo de diseño técnico utilizado en el código para conectar la periferia con el núcleo.

---

## 4. Consecuencias

### Positivas (Beneficios)
- **Cumplimiento del Escenario P0 (Integridad y Concurrencia):** Permite aislar la lógica de reserva y validación de asientos en un caso de uso de dominio puro, facilitando pruebas de estrés y contratos de persistencia sin acoplarse a Express ni a controladores web.
- **Intercambiabilidad de adaptadores y testabilidad inmediata:** El núcleo de reservas puede verificarse con pruebas unitarias en memoria en milisegundos (`InMemoryBoletoRepository`), mientras que la persistencia real se conecta con `PostgresBoletoRepository` respetando el mismo contrato.
- **Localización del cambio comprobada:** Como se midió en la Versión B del experimento del costo del cambio, las modificaciones en las reglas de negocio quedan estrictamente acotadas a clases de dominio.

### Negativas (Costos y Trade-offs)
- **Boilerplate e interfaces intermedias:** Requiere declarar contratos de puertos e interfaces separadas de las implementaciones concretas, aumentando la cantidad de archivos iniciales.
- **Sobrecarga de navegación:** Flujos simples de consulta deben atravesar el controlador, caso de uso, puerto y adaptador repositorio.
