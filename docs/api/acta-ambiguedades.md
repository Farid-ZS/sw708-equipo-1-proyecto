# Acta de Ambigüedades — Resolución de Supuestos del Contrato de Incidencias

*Contrato evaluado (Proveedor):* Equipo 3 — API de Incidencias, versión inicial 1.0.0 ([openapi.yaml](https://github.com/Rafael716/sw708-equipo-3/blob/9e0d24ebcbff8d25be8b1f9eb20575faffa8b253/semana-10/docs/api/openapi.yaml))  
*Endpoint evaluado:* `POST /v1/incidencias`  
*Operación:* `crearIncidencia`  
*Equipo consumidor:* Equipo 1 — Cines Lumiere  
*Responsable de resolución:* Gonzalo Alessandro Albornoz Azurza (Integrante 2 — Decisiones de Arquitectura)  
*Documento base de supuestos analizado:* [`docs/api/supuestos-equipo-3.md`](./supuestos-equipo-3.md)

---

## 1. Contexto

En el marco del intercambio de contratos del Laboratorio 10 (Semana 10), el Equipo 1 formuló una petición `curl` y levantó sistemáticamente **14 supuestos** ante los vacíos técnicos detectados en la especificación inicial del endpoint `POST /v1/incidencias` del Equipo 3.

Como Integrante 2, la misión técnica consiste en:
1. Analizar cada uno de los 14 supuestos levantados en `docs/api/supuestos-equipo-3.md`.
2. Definir la **decisión arquitectónica** formal que resuelve la ambigüedad.
3. Especificar la **modificación exacta** que debe aplicarse al contrato OpenAPI para cerrar la brecha técnica.
4. Responder a las **tres interrogantes críticas** exigidas por la guía de laboratorio:
   - ¿Cuál es el comportamiento del sistema si se omite un campo?
   - ¿Qué código HTTP y estructura de cuerpo se devuelve ante un fallo?
   - ¿La llamada es idempotente (permite repetición sin alterar el estado erróneamente)?

---

## 2. Matriz de Resolución de Ambigüedades (14 Supuestos)

| Nº | Supuesto del Consumidor (`supuestos-equipo-3.md`) | Decisión Arquitectónica del Equipo | Modificación Exacta Aplicada al Contrato OpenAPI |
|:--:|---|---|---|
| **1** | **Autenticación y Roles:**<br>El token JWT se obtiene en otro endpoint y cualquier usuario autenticado puede registrar incidencias sobre cualquier operación. | Se ratifica el uso de `bearerAuth`. Para evitar ambigüedades de autorización se formaliza la respuesta **HTTP 403 Forbidden** con código `ROL_INSUFICIENTE` si el usuario no tiene permisos sobre la operación. Se documenta la referencia al servicio de autenticación en la descripción general. | - Añadir respuesta `403` en `paths./v1/incidencias.post.responses`.<br>- Usar esquema `ErrorResponse` con enum `ROL_INSUFICIENTE`.<br>- Especificar scopes requeridos en `security: - bearerAuth: [incidencias:write]`. |
| **2** | **Origen de UUIDs (`id_tipo_incidencia`, `id_operacion`):**<br>Se consultan en otros endpoints del sistema; sin eso solo se obtiene `422`. | Se establece que los identificadores corresponden a catálogos existentes. Si el UUID no existe en la base de datos, el sistema devuelve **HTTP 422 Unprocessable Entity** discriminando exactamente cuál recurso no existe (`TIPO_INCIDENCIA_INEXISTENTE` u `OPERACION_INEXISTENTE`). | - Añadir ejemplos específicos en `responses.422` diferenciando `codigo: TIPO_INCIDENCIA_INEXISTENTE` y `codigo: OPERACION_INEXISTENTE`.<br>- Documentar los endpoints de consulta `/v1/tipos-incidencia` y `/v1/operaciones` en la descripción. |
| **3** | **Estado inicial de la incidencia (`id_estado_incidencia`):**<br>La respuesta devuelve solo un UUID asumido como «Abierta», sin catálogo visible. | Toda incidencia creada nace invariablemente en estado `Abierta`. Se decide que el objeto de respuesta debe devolver tanto el UUID como el nombre descriptivo legible `estado: "Abierta"` para evitar que el cliente tenga que hacer una consulta adicional obligatoria. | - En el esquema `IncidenciaCreadaResponse`, añadir la propiedad `estado: { type: string, example: "Abierta" }` junto a `id_estado_incidencia`. |
| **4** | **Tratamiento de campos ausentes (`descripcion` vs `grado_severidad`):**<br>Ambigüedad entre códigos `DESCRIPCION_VACIA` y `VALIDACION`. | Se unifica la regla de validación de presencia: **Cualquier campo obligatorio ausente devuelve HTTP 400 con código categórico `CAMPO_OBLIGATORIO_AUSENTE`**, indicando el campo en el cuerpo. El código `DESCRIPCION_VACIA` se reserva únicamente para cuando el campo sí se envió pero tiene solo espacios. | - Definir en `components.schemas.ErrorResponse` el código `CAMPO_OBLIGATORIO_AUSENTE`.<br>- Clarificar en la descripción del 400 que ausencia de campo y campo vacío son evaluados con mensajes precisos. |
| **5** | **Valores nulos (`null`) y tipos incompatibles:**<br>No se aclara si `null` es campo ausente y qué devuelven tipos no numéricos o strings no válidos. | Se prohíbe explícitamente `nullable: true`. Enviar `null` o un tipo de dato erróneo (e.g. `"4"` string en lugar de `4` integer, o `descripcion: 123`) devuelve **HTTP 400** con código `TIPO_DATO_INVALIDO`. Se rechaza coerción implícita de tipos. | - Especificar en cada propiedad `nullable: false`.<br>- Agregar en el enum de `ErrorResponse` el valor `TIPO_DATO_INVALIDO` con ejemplo descriptivo. |
| **6** | **Precedencia de errores concurrentes:**<br>No se define el orden de evaluación si hay múltiples problemas simultáneos. | Se formaliza el pipeline de validación arquitectónica en capas con el siguiente orden de precedencia estricto: <br>1. **HTTP 401** (Autenticación / JWT expirado o ausente).<br>2. **HTTP 415** (Content-Type incorrecto).<br>3. **HTTP 400** (Sintaxis JSON, campos ausentes o tipos inválidos).<br>4. **HTTP 403** (Autorización sobre el recurso).<br>5. **HTTP 422** (Entidades relacionadas inexistentes: tipos/operaciones).<br>6. **HTTP 409** (Conflicto de negocio: operación no activa). | - Documentar explícitamente el orden de precedencia y cortocircuito (*fail-fast*) en la sección `description` del endpoint. |
| **7** | **Identificación programática del campo fallido:**<br>Para saber qué campo falló en `VALIDACION` el cliente dependía del `mensaje` textual. | Se prohíbe que el cliente parsee cadenas de texto libres. Se añade al esquema `ErrorResponse` una lista estructurada `detalles: [ { campo, motivo } ]` que permite al consumidor inspeccionar programáticamente qué campos fallaron sin depender del texto. | - Modificar `components.schemas.ErrorResponse` agregando la propiedad opcional `detalles`: `type: array, items: { type: object, properties: { campo: { type: string }, motivo: { type: string } } }`. |
| **8** | **Límite de `maxLength: 1000` y recorte de espacios:**<br>No se especifica si el límite se mide antes o después del `trim()`, ni qué devuelve la respuesta. | El servidor aplica `trim()` (eliminación de espacios en los extremos) **antes** de medir la longitud. Si la longitud tras el `trim()` supera los 1000 caracteres, devuelve **HTTP 400** con código `LONGITUD_EXCEDIDA`. La respuesta `201` devuelve la descripción ya saneada y recortada. | - Documentar en `properties.descripcion.description` la regla de saneamiento previo (*trimming*) antes del chequeo de `maxLength: 1000`. |
| **9** | **Cuerpo vacío, JSON malformado o `Content-Type` incorrecto:**<br>Ambigüedad entre responder 400 o 415. | Se desacopla el error sintáctico del de transporte: un `Content-Type` distinto de `application/json` devuelve **HTTP 415 Unsupported Media Type** con código `TIPO_CONTENIDO_NO_SOPORTADO`. Un JSON roto sintácticamente devuelve **HTTP 400** con código `JSON_MALFORMADO`. | - Añadir respuesta `415` con su respectivo ejemplo.<br>- Añadir en `responses.400` el ejemplo específico `jsonMalformado`. |
| **10** | **Idempotencia y reintentos ante cortes de red:**<br>El contrato no definía idempotencia ni `Idempotency-Key`; si se corta la red el cliente no sabe si se registró. | La operación `POST /v1/incidencias` **NO es idempotente de forma predeterminada**. Se incorpora el soporte opcional de la cabecera HTTP `Idempotency-Key` (UUID). Si el cliente envía la misma clave dentro de una ventana de 24 horas, el servidor devuelve la respuesta almacenada sin duplicar la incidencia. Si no se envía la cabecera, reintentar creará una nueva incidencia. | - Definir en `parameters` del POST la cabecera `Idempotency-Key: { in: header, required: false, schema: { type: string, format: uuid } }`.<br>- Explicar en `description` la política de reintentos y deduplicación. |
| **11** | **Consulta del recurso creado y cabecera `Location`:**<br>El `201` no traía cabecera `Location` ni referenciaba el `GET`. | Siguiendo RFC 9110, toda respuesta `201 Created` debe incluir obligatoriamente la cabecera **`Location: /v1/incidencias/{id_incidencia}`**. Asimismo, se formaliza la existencia del endpoint `GET /v1/incidencias/{id_incidencia}`. | - Añadir en `responses.201.headers` la cabecera `Location`.<br>- Declarar la ruta `GET /v1/incidencias/{id_incidencia}` en el catálogo de rutas. |
| **12** | **Estados de operación válidos y conflicto 409:**<br>El contrato solo decía «finalizada o cancelada», sin listar todos los estados posibles de una operación. | Se explicita el ciclo de vida de la operación: los únicos estados válidos son `Planificada`, `En curso`, `Pausada`, `Finalizada` y `Cancelada`. Registrar una incidencia únicamente está permitido en operaciones `En curso` o `Pausada`. En cualquier otro estado devuelve **HTTP 409** con código `OPERACION_NO_ACTIVA`. | - Documentar en el schema de la operación o en la descripción del 409 la lista cerrada de estados y cuáles son rechazados. |
| **13** | **Notificaciones asíncronas con severidad 5:**<br>El cliente no sabe si se notificó o falló la notificación de emergencia. | Se confirma la política de diseño por eventos desacoplados: la emisión de la notificación es asíncrona mediante eventos de dominio. El alta de la incidencia es la transacción principal; la notificación es eventual. Se añade en la respuesta `201` el campo booleano `notificacion_encolada: true` para certificar que el evento fue despachado al bus. | - En `IncidenciaCreadaResponse`, añadir `notificacion_encolada: { type: boolean, example: true }`. |
| **14** | **Zona horaria y formato del código correlativo (`INC-AAMM-NNNN`):**<br>Riesgo de discrepancia por huso horario (Lima vs UTC) y reinicio mensual. | Se define que el correlativo `AAMM` se calcula estrictamente en base a la marca temporal **UTC** generada por el servidor, garantizando consistencia absoluta con el campo `fecha_hora`. La secuencia `NNNN` es un correlativo mensual de 4 dígitos relleno con ceros (`0001` a `9999`). Si se supera 9999, la máscara se expande automáticamente a 5 dígitos (`INC-AAMM-NNNNN`). | - Documentar en la propiedad `codigo` que el prefijo `AAMM` se deriva de UTC y actualizar el patrón regex a `^INC-\d{4}-\d{4,6}$`. |

---

## 3. Respuestas Vinculantes a las Tres Interrogantes Críticas

### 3.1. ¿Cuál es el comportamiento del sistema si se omite un campo?
* **Código de respuesta:** `HTTP 400 Bad Request`.
* **Cuerpo devuelto:**
  ```json
  {
    "status": 400,
    "codigo": "CAMPO_OBLIGATORIO_AUSENTE",
    "error": "El campo 'descripcion' es obligatorio y no fue proporcionado",
    "detalles": [
      {
        "campo": "descripcion",
        "motivo": "Campo ausente o nulo"
      }
    ]
  }
  ```
* **Regla:** El adaptador HTTP ejecuta validación sintáctica inmediata antes de llegar a la lógica de negocio. Se evalúan y rechazan campos ausentes, valores `null` o estructuras que contengan propiedades no declaradas (`additionalProperties: false`).

### 3.2. ¿Qué código HTTP y estructura de cuerpo se devuelve ante un fallo?
El sistema devuelve siempre una estructura homogénea y tipada bajo el esquema `ErrorResponse`:
```json
{
  "status": 409,
  "codigo": "OPERACION_NO_ACTIVA",
  "error": "La operación 0b7e4c2a-9d31-4f6a-8c5e-1a2b3c4d5e6f se encuentra en estado 'Finalizada' y no admite nuevas incidencias",
  "detalles": []
}
```
* Códigos soportados: `400` (sintaxis/validación), `401` (sin token/expirado), `403` (sin permisos), `404` (recurso inexistente), `409` (conflicto de estado de negocio), `415` (media type no JSON), `422` (claves foráneas inexistentes) y `500` (error interno no controlado).
* El campo `codigo` es un enum formal e inmutable que permite a los clientes automatizar la toma de decisiones sin parsear texto.

### 3.3. ¿La llamada es idempotente (permite repetición sin alterar el estado erróneamente)?
* **Comportamiento por defecto:** La operación `POST` **no es naturalmente idempotente**. Enviar dos veces el mismo cuerpo generará dos registros de incidencias con identificadores (`id_incidencia`) y códigos correlativos (`codigo`) distintos.
* **Mecanismo de idempotencia opcional:** Para tolerar reintentos seguros ante cortes de red o timeouts, el cliente puede incluir la cabecera `Idempotency-Key: <UUID>`. Si la llamada se repite con la misma clave, el servidor devuelve exactamente la respuesta `201 Created` original sin volver a crear la incidencia ni emitir notificaciones duplicadas, garantizando la preservación del estado.
