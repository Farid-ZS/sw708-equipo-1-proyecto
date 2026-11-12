# Bitácora de uso de IA — Laboratorio 10: APIs, Contratos y Eventos

## 1. Contexto y objetivo

- **Actividad:** Laboratorio de la Semana 10 — «APIs, Contratos y Eventos».
- **Equipo:** Equipo 1 — Cines Lumiere.
- **Integrante responsable de la bitácora:** Gonzalo Alessandro Albornoz Azurza (Integrante 2: Resolución de Ambigüedades y Bitácora IA).
- **Fecha:** 11 de noviembre de 2026.
- **Herramienta de IA utilizada:** ChatGPT / Asistente IA.
- **Alcance evaluado:** 
  - Paso 1: Generación del contrato OpenAPI inicial (`docs/api/openapi.yaml`).
  - Paso 2: Intercambio bilateral y formulación de supuestos sobre el contrato del Equipo 3 (`docs/api/supuestos-equipo-3.md`).
  - Paso 3: Resolución de ambigüedades del contrato de Lumiere tras la retroalimentación del consumidor, redacción del acta (`docs/api/acta-ambiguedades.md`) y actualización del contrato a versión 1.1.0 (`docs/api/openapi.yaml`).

El propósito de esta bitácora es registrar de forma rigurosa qué secciones de los contratos y artefactos fueron asistidas mediante Inteligencia Artificial, contrastar las sugerencias automáticas frente a las decisiones arquitectónicas tomadas por los integrantes humanos y documentar las correcciones aplicadas para asegurar el cumplimiento de las reglas del sistema Lumiere.

---

## 2. Documentos, archivos y evidencias revisados

| Grupo | Fuentes y alcance |
|---|---|
| Guía oficial del laboratorio | [Guía de Laboratorio Semana 10](../Guía%20de%20Laboratorio%20Semana%2010.md): misiones, criterios de diseño de contrato, 3 preguntas críticas y distribución de roles. |
| Contrato inicial y corregido | [OpenAPI 1.0.0 inicial y 1.1.0 corregido](api/openapi.yaml) para el endpoint `POST /api/reservas`. |
| Intercambio de supuestos | [Supuestos sobre el contrato del Equipo 3](api/supuestos-equipo-3.md) (API de Incidencias) elaborados por el Integrante 1. |
| Resolución de ambigüedades | [Acta de Ambigüedades](api/acta-ambiguedades.md) con la matriz de decisiones arquitectónicas y respuestas a preguntas críticas. |
| Decisiones y reglas previas | [ADR-0001 (Capas)](adr/0001-eleccion-estilo-arquitectonico.md), [ADR-0003 (Bloqueo y restricción UNIQUE contra sobreventa)](adr/0003-bloqueo-pesimista-butacas.md) y [Reglas de Negocio](reglas-de-negocio.md). |
| Código de la rodaja vertical | [Entidad Boleto y Caso de Uso](../lumiereApp/backend/packages/reservas/src/domain/cinema.ts) y [Controlador HTTP](../lumiereApp/backend/packages/reservas/src/presentation/reservas.controller.ts). |

---

## 3. Uso de IA por paso del laboratorio

### Paso 1: Diseño del contrato OpenAPI inicial (Integrante 1)

Para la concepción inicial de `docs/api/openapi.yaml` (endpoint `POST /api/reservas`), el Integrante 1 empleó un asistente de IA para acelerar la estructuración sintáctica en formato OpenAPI 3.1.0.

#### Secciones generadas mediante IA:
1. **Esqueleto y sintaxis OpenAPI 3.1.0:** Estructura de cabeceras (`openapi: 3.1.0`, `info`, `servers`, `paths`).
2. **Definición preliminar de esquemas DTO:** Creación inicial de `CrearReservaRequest` y `ReservaCreadaResponse`.
3. **Estructura básica de errores:** Propuesta inicial de `ErrorResponse` conteniendo `status`, `codigo` y `error`.

#### Correcciones y ajustes manuales aplicados por el equipo:
- La IA omitió las restricciones de nulidad y cadenas de espacios. El equipo incorporó manualmente `pattern: '.*\S.*'` y `additionalProperties: false` para forzar que los campos requeridos (`funcion_id`, `asiento`, `nombre_cliente`) contengan caracteres visibles.
- La IA propuso un código de error HTTP genérico `422 Unprocessable Entity` para datos faltantes; el equipo lo alineó al estándar acordado del proyecto usando `400 Bad Request` con código unificado `DATOS_INVALIDOS`.
- Se redactó manualmente la descripción de versionado semántico en la cabecera `info.description`.

---

### Paso 2: Intercambio bilateral y formulación de supuestos (`docs/api/supuestos-equipo-3.md`)

El Equipo 1 recibió el contrato inicial del Equipo 3 (`POST /v1/incidencias`). 
- Se formuló la llamada `curl` de prueba representativa.
- Se identificaron y documentaron los **14 supuestos y vacíos técnicos** en `docs/api/supuestos-equipo-3.md`.
- La IA colaboró en la clasificación inicial de las observaciones detectadas.

### Paso 3: Resolución de ambigüedades y elaboración del acta (`docs/api/acta-ambiguedades.md`) (Integrante 2)

El Integrante 2 (Gonzalo Albornoz) tomó la lista de los 14 supuestos de `docs/api/supuestos-equipo-3.md` y redactó el documento formal `docs/api/acta-ambiguedades.md`.

#### Misión cumplida en el acta:
1. **Matriz de 14 decisiones arquitectónicas:** Por cada uno de los 14 supuestos levantados, se definió la postura técnica de arquitectura y la modificación exacta aplicable al contrato OpenAPI.
2. **Respuesta a las tres interrogantes críticas:**
   - *Comportamiento ante omisión:* HTTP 400 con código `CAMPO_OBLIGATORIO_AUSENTE` y array estructurado de `detalles`.
   - *Estructura de error homogénea:* Esquema tipado `ErrorResponse` (`status`, `codigo`, `error`, `detalles`) para códigos 400, 401, 403, 404, 409, 415, 422 y 500.
   - *Idempotencia:* Definición de no-idempotencia nativa con soporte de cabecera opcional `Idempotency-Key` para reintentos transparentes.
3. **Actualización del contrato de Lumiere:** Se garantizó que nuestro propio contrato `docs/api/openapi.yaml` cumpla estrictamente con las lecciones aprendidas del intercambio, respondiendo a estas tres interrogantes críticas y dejando listo el artefacto para el Integrante 3.

---

## 4. Matriz de tratamiento de recomendaciones de IA

| Recomendación generada por IA | Decisión del equipo | Justificación y sustento arquitectónico |
|---|:---:|---|
| Utilizar cabecera `Idempotency-Key` en `POST /api/reservas`. | **Rechazada** | Complejidad innecesaria en la rodaja vertical actual. El reintento fallando con 409 protege el dominio de sobreventa de manera más simple y robusta. |
| Usar HTTP 422 para datos de entrada incompletos o con espacios. | **Rechazada** | En Lumiere, la ausencia o invalidez sintáctica de parámetros de entrada obligatorios se estandariza bajo `400 Bad Request` con código `DATOS_INVALIDOS`. |
| Esquema `ErrorResponse` con `status`, `codigo` y `error`. | **Aceptada** | Proporciona predictibilidad al consumidor y desacopla los mensajes de las trazas de infraestructura. |
| Inclusión de cabecera `Location` en la respuesta HTTP 201. | **Aceptada** | Alineada a REST y RFC 9110; suministra la URI canónica del boleto para recuperación de estado. |
| Regex estricto para validar código de butaca (`^[A-Za-z][0-9]{1,2}$`). | **Ajustada** | La IA propuso un regex numérico simple; el equipo lo adaptó a la distribución real de salas (fila alfabética + número de columna). |

---

## 5. Respuestas del equipo a las Tres Interrogantes Críticas

Las tres interrogantes exigidas por la guía del laboratorio fueron analizadas y resueltas de la siguiente forma:

1. **¿Cuál es el comportamiento del sistema si se omite un campo?**  
   El sistema responde con **HTTP 400 Bad Request** y el payload JSON `{ "status": 400, "codigo": "DATOS_INVALIDOS", "error": "Faltan datos obligatorios" }`. No se procesa la solicitud ni se invoca a la base de datos si falta algún campo, si es `null` o si contiene únicamente espacios.
2. **¿Qué código HTTP y estructura de cuerpo se devuelve ante un fallo?**  
   Se devuelven códigos HTTP estándar acompañados del esquema inmutable `ErrorResponse` (`status`: int, `codigo`: enum string, `error`: string). Casos formalizados: `400` (`DATOS_INVALIDOS`), `404` (`FUNCION_NO_ENCONTRADA`), `409` (`ASIENTO_OCUPADO`), `415` (`SOLICITUD_MALFORMADA`) y `500` (`ERROR_INTERNO`).
3. **¿La llamada es idempotente (permite repetición sin alterar el estado erróneamente)?**  
   **No es idempotente.** La repetición de una misma reserva devuelve `409 Conflict`. Esta no-idempotencia es deliberada y garantiza que bajo ninguna circunstancia se reserve dos veces la misma butaca ni se altere el estado original.

---

## 6. Reflexión sobre el proceso asistido por IA

El uso de Inteligencia Artificial en el diseño de contratos OpenAPI demostró ser eficaz para acelerar la escritura de especificaciones técnicas y esquemas repetitivos. No obstante, la experiencia de este laboratorio ratificó que la IA carece de contexto sobre los compromisos de concurrencia y las restricciones transaccionales particulares de un sistema en producción (como las garantías de no sobreventa del ADR-0003).

La intervención activa del equipo fue determinante para rechazar patrones sobrediseñados (como cabeceras de idempotencia no justificadas), establecer un modelo riguroso de errores semánticos y asegurar que el contrato publicado en `docs/api/openapi.yaml` (v1.1.0) sea una frontera formal y confiable para que los integrantes siguientes (generación de código y pruebas) implementen sus componentes sin incertidumbre técnica.

