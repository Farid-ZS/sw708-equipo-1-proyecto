# Bitácora de uso de IA — Laboratorio 11

## 1. Contexto y objetivo

- **Sistema:** Lumiere, sistema de gestión de cines.
- **Equipo:** Equipo 1.
- **Herramienta:** ChatGPT / Codex.
- **Actividad:** contenerización e implementación de patrones de resiliencia.

Revisamos el Dockerfile, `compose.yaml`, `.env.example`, el README, el adaptador PostgreSQL, el controlador de Reservas, el contrato OpenAPI y la [bitácora de resiliencia](resiliencia.md). También contrastamos los commits `cd7da79`, `53c0307`, `3f279d5` y `84ba0db`, el [issue #48](https://github.com/Farid-ZS/sw708-equipo-1-proyecto/issues/48), el [PR #49](https://github.com/Farid-ZS/sw708-equipo-1-proyecto/pull/49) y el [issue #55](https://github.com/Farid-ZS/sw708-equipo-1-proyecto/issues/55).

La IA sirvió para interpretar la configuración, contrastar las decisiones con el código y organizar las mediciones. 

## 2. Consultas realizadas y alcance

### Paso 01. Lectura del Dockerfile y Compose base

> ¿Cómo se relacionan las etapas de construcción y ejecución del Dockerfile con las dependencias, las variables de entorno y la comprobación de salud de Compose?

### Paso 02. Adaptación al sistema del equipo

> ¿Cómo adaptar la construcción de Node.js y TypeScript al workspace de Reservas y conectar la aplicación con PostgreSQL mediante variables de entorno y un archivo de ejemplo?

### Paso 03. Levantamiento desde un clon limpio

> ¿Qué comandos permiten construir y levantar los servicios desde un clon limpio y comprobar que la aplicación alcanza la base de datos?

### Paso 04. Inyección de fallas

> ¿Qué esperamos al detener PostgreSQL y cómo podemos medir diez solicitudes válidas, sus errores y el tiempo de recuperación con un límite externo de quince segundos?

### Paso 05. Aplicación del patrón de resiliencia

> ¿Cómo se aplican timeout, reintentos y circuit breaker en el adaptador, y por qué un conflicto de asiento no debe contarse como una falla de infraestructura?

### Paso 06. Repetición de la falla y comparación

> ¿Cómo comparar las mediciones antes y después del patrón, calcular el p95 y distinguir una respuesta 503 de un timeout del cliente?

## 3. Resumen de las respuestas de la IA

La revisión relacionó la construcción en dos etapas con la compilación del backend y el uso de una imagen de ejecución más pequeña. Compose configura aplicación y base mediante variables, comprueba la salud de PostgreSQL y espera esa condición antes de iniciar la aplicación. La versión histórica copiaba los manifiestos antes del código; la versión actual copia primero el backend completo para enlazar el workspace.

Para la falla se propuso utilizar `POST /api/reservas`, porque consulta PostgreSQL, y medir la recuperación después de restablecer la base. La revisión del patrón distinguió los límites del pool y del circuit breaker, los reintentos de lectura y el tratamiento de errores de negocio. La comparación se basó en los datos registrados y no atribuyó al circuito transiciones que no aparecieron en los logs.

## 4. Revisión de las recomendaciones

| Paso | Recomendación de la IA | Revisión técnica | Resultado |
|---|---|---|---|
| 01 | Separar construcción y ejecución. | El Dockerfile usa las etapas `builder` y `runner`. | Coincide con la implementación. |
| 02 | Configurar PostgreSQL y variables externas. | Compose utiliza PostgreSQL 16, variables y `healthcheck`; `.env.example` contiene valores de desarrollo. | Configuración disponible en el repositorio. |
| 03 | Construir y levantar con Compose. | El README documenta `docker compose up --build`; el commit `84ba0db` registra la verificación desde un clon limpio. | Procedimiento documentado. |
| 04 | Medir reservas con la base operativa y detenida. | Se probaron diez peticiones por condición y se restauró PostgreSQL. | La aplicación se reinició al detener la base; se registraron las respuestas observadas. |
| 05 | Proteger el repositorio con timeout y circuit breaker. | `opossum` protege por separado lectura y escritura; solo la lectura se reintenta. | Los parámetros coinciden con el PR #49. |
| 06 | Comparar tiempos, errores y recuperación. | Las mediciones y sus límites están en la bitácora de resiliencia. | No se observó apertura del circuito en los logs. |

## 5. Sugerencias aceptadas

La implementación existente usa dos etapas Docker, variables de entorno, comprobación de salud de PostgreSQL y un comando de arranque con Compose. En el Dockerfile histórico se copiaron los manifiestos antes del código para aprovechar la caché; posteriormente se cambió la copia para facilitar el enlace del workspace.

El patrón utiliza `opossum`, reintenta únicamente lecturas y devuelve HTTP 503 ante indisponibilidad. Para el experimento se aceptaron la comparación entre versiones, las hipótesis y la metodología de medición y recuperación. La elección de `develop` como base fue autorizada al comprobar que no existía `dev`.

## 6. Sugerencias descartadas o matizadas

| Sugerencia | Decisión | Motivo |
|---|---|---|
| Reintentar escrituras indiscriminadamente. | Descartada en la implementación. | Tras un timeout no se sabe si el INSERT se ejecutó. |
| Usar un endpoint que no consulte PostgreSQL. | Descartada para la medición. | El GET de detalle es un stub y no representa la dependencia. |
| Interpretar respuestas 503 como prueba de E6. | Descartada en el análisis. | E6 se refiere al rendimiento normal, que se evaluó por separado. |
| Suponer que sin patrón siempre habrá esperas largas. | Matizada en la hipótesis. | La duración depende de cómo se manifieste la falla. |
| Implementar manualmente el circuit breaker. | Alternativa no adoptada en el código revisado. | La implementación existente usa `opossum`. |
| Guardar contraseñas reales en el repositorio. | Evitada en la propuesta. | El archivo de ejemplo contiene valores de desarrollo; las credenciales reales deben mantenerse fuera del repositorio. |

## 7. Límites y pendientes

Al principio, el entorno restringido impidió acceder a Docker y actualizar las referencias de Git; se ejecutaron los comandos necesarios con permisos adicionales. La ejecución registró un reinicio de la aplicación en ambas versiones y no mostró apertura del circuito. La muestra de diez peticiones y una recuperación por versión no permite establecer el cumplimiento general de E5 o E6; además, las series compartieron recursos durante parte de la ejecución.

El controlador responde 503 ante indisponibilidad, pero el contrato OpenAPI revisado no declara esa respuesta. Las pruebas y la verificación de tipos pasaron en un contenedor temporal; las pruebas que requerían `TEST_DATABASE_URL` quedaron omitidas.

## 8. Reflexión

La IA facilitó la lectura de la infraestructura, la comprensión de los límites del patrón y la organización de las mediciones. La validación de hipótesis, la revisión de las decisiones y la interpretación de resultados permanecieron bajo responsabilidad de los integrantes; los registros reales permitieron distinguir lo esperado de lo observado.
