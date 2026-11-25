# Bitácora de resiliencia — Cines Lumiere

## 1. Objetivo

Evaluamos el comportamiento de las reservas ante la caída de PostgreSQL y la recuperación del servicio, antes y después de incorporar el patrón de resiliencia, como parte del [issue #55](https://github.com/Farid-ZS/sw708-equipo-1-proyecto/issues/55).

## 2. Hipótesis iniciales

- Si PostgreSQL deja de responder, las reservas que consultan la base fallarán; su tiempo de respuesta dependerá de cómo se manifieste la falla.
- Antes del patrón, el pool no tiene límites de conexión ni de consulta configurados explícitamente. Una conexión rechazada puede fallar rápidamente.
- Después del patrón, esperamos respuestas controladas y que el circuito abra cuando se cumpla el umbral de fallas, reduciendo las llamadas a la base mientras permanece abierto.
- Al restablecer PostgreSQL, esperamos que las reservas vuelvan a funcionar; si el circuito está abierto, la recuperación dependerá de la siguiente prueba permitida.

## 3. Entorno del experimento

Usamos los commits `cd7da79ba371663833205a080f4924e2e961e965` (antes) y `53c03077eddcbe068e467055f9caa0d6450bbfb9` (después), con Node 22 y PostgreSQL 16 en proyectos Docker Compose separados. Ambos commits tienen el mismo Dockerfile y esquema, pero no incluyen `compose.yaml`: usamos en ambos una copia del archivo de `develop` (`84ba0db`). Los puertos de aplicación fueron 13000 y 13001; las bases tuvieron volúmenes independientes.

Probamos `POST /api/reservas` con datos equivalentes y asientos distintos. En cada versión enviamos diez reservas con la base operativa, detuvimos `db` y enviamos diez más, secuencialmente, con un segundo de pausa después de cada respuesta y un límite externo de 15 s. Después iniciamos la base y repetimos solicitudes hasta recibir 201. Las horas de las tablas están en UTC, el 25 de noviembre de 2026. Las mediciones registran el tiempo hasta recibir las cabeceras HTTP; los cuerpos completos se conservan en las evidencias.

El inicio de la serie normal posterior coincidió con el final de la serie anterior y su recuperación. Los contenedores estaban aislados, pero compartían los recursos del equipo, por lo que la carga no fue estrictamente idéntica.

## 4. Inyección de fallas antes del patrón

Las diez reservas normales devolvieron 201. Al detener la base, el proceso de la aplicación terminó por un evento `error` no manejado del pool y Compose lo reinició. La primera petición falló en el cliente; las nueve siguientes recibieron HTTP 500. Los logs también muestran errores de resolución `ENOTFOUND db` y, durante el arranque de la base, `ECONNREFUSED`.

| N.º | Hora UTC | HTTP | Tiempo (ms) | Respuesta o error |
|---:|---|---:|---:|---|
| 1 | 21:46:52.126 | — | 13,81 | `TypeError: fetch failed` |
| 2 | 21:46:53.144 | 500 | 4019,86 | `ERROR_INTERNO` |
| 3 | 21:46:58.170 | 500 | 3949,22 | `ERROR_INTERNO` |
| 4 | 21:47:03.133 | 500 | 3980,05 | `ERROR_INTERNO` |
| 5 | 21:47:08.121 | 500 | 3958,00 | `ERROR_INTERNO` |
| 6 | 21:47:13.088 | 500 | 3964,72 | `ERROR_INTERNO` |
| 7 | 21:47:18.065 | 500 | 3981,89 | `ERROR_INTERNO` |
| 8 | 21:47:23.050 | 500 | 3993,44 | `ERROR_INTERNO` |
| 9 | 21:47:28.056 | 500 | 3973,72 | `ERROR_INTERNO` |
| 10 | 21:47:33.039 | 500 | 3989,23 | `ERROR_INTERNO` |

El cuerpo de cada 500 fue `{"status":500,"codigo":"ERROR_INTERNO","error":"Error interno del servidor"}`. No hubo timeouts del cliente.

## 5. Parámetros y justificación del patrón de resiliencia

| Parámetro | Valor en el código | Justificación |
|---|---|---|
| Timeout de conexión y consulta del pool | 1000 ms cada uno | Limitar esperas de la base; E6 establece p95 menor a 300 ms en condiciones normales. |
| Timeout del circuit breaker | 1500 ms | Protección adicional con un límite superior al del pool. |
| Umbral de fallas | 50 % | Detectar fallas frecuentes de infraestructura; los errores de negocio se filtran. |
| Volumen mínimo | 5 llamadas | Evitar abrir por una falla aislada. |
| Tiempo abierto | 10 000 ms | Volver a probar dentro del plazo de recuperación de E5, menor a 60 s. |
| Reintentos de lectura | 2, con 100 ms de espera | La lectura es idempotente; el timeout del breaker limita el conjunto de intentos. |
| Escrituras | Sin reintentos | Tras un timeout no se sabe si el INSERT llegó a ejecutarse. |
| Servicio no disponible | HTTP 503 | Comunicar la indisponibilidad sin confirmar una reserva no verificada. |

El código mantiene circuitos separados para lectura y escritura y excluye los errores de asiento ocupado y datos inválidos. El controlador emite 503, pero esta respuesta no está declarada en `docs/api/openapi.yaml`. Los timeouts de falla no prueban el cumplimiento de E6.

## 6. Inyección de fallas después del patrón

Las diez reservas normales devolvieron 201. Al detener la base también terminó el proceso por el error no manejado del pool y Compose lo reinició. La primera solicitud falló en el cliente; las demás recibieron 503 con el mensaje `El servicio de reservas no está disponible. Intenta de nuevo en unos segundos`.

| N.º | Hora UTC | HTTP | Tiempo (ms) | Respuesta o error |
|---:|---|---:|---:|---|
| 1 | 21:47:45.723 | — | 16,58 | `TypeError: fetch failed` |
| 2 | 21:47:46.754 | 503 | 1533,13 | `SERVICIO_NO_DISPONIBLE` |
| 3 | 21:47:49.293 | 503 | 1521,09 | `SERVICIO_NO_DISPONIBLE` |
| 4 | 21:47:51.828 | 503 | 1523,04 | `SERVICIO_NO_DISPONIBLE` |
| 5 | 21:47:54.361 | 503 | 1519,36 | `SERVICIO_NO_DISPONIBLE` |
| 6 | 21:47:56.884 | 503 | 1521,49 | `SERVICIO_NO_DISPONIBLE` |
| 7 | 21:47:59.412 | 503 | 1521,84 | `SERVICIO_NO_DISPONIBLE` |
| 8 | 21:48:01.950 | 503 | 1520,61 | `SERVICIO_NO_DISPONIBLE` |
| 9 | 21:48:04.480 | 503 | 1520,70 | `SERVICIO_NO_DISPONIBLE` |
| 10 | 21:48:07.011 | 503 | 1523,32 | `SERVICIO_NO_DISPONIBLE` |

No hubo timeouts del cliente. Los logs no registraron apertura, semiapertura ni cierre del circuito; tampoco permiten comprobar que se evitaran llamadas a PostgreSQL. La serie no demuestra un rechazo rápido por circuito abierto.

## 7. Comparación de resultados

Los indicadores incluyen los diez intentos, incluso el error de transporte. El p95 usa rango más cercano: ordenamos los diez tiempos y tomamos la posición `ceil(0,95 × 10) = 10`.

| Indicador durante la falla | Antes | Después |
|---|---:|---:|
| Mínimo (ms) | 13,81 | 16,58 |
| Máximo / p95 (ms) | 4019,86 | 1533,13 |
| Promedio (ms) | 3582,39 | 1372,12 |
| Mediana (ms) | 3976,89 | 1521,29 |
| Respuestas HTTP | 9 × 500 | 9 × 503 |
| Errores totales | 10 | 10 |
| Timeouts del cliente | 0 | 0 |
| Circuito | Sin patrón | Sin apertura observada |

El promedio de los diez intentos bajó 61,7 % y la mediana 61,7 %. La comparación incluye en ambos casos una falla de transporte durante el reinicio y no demuestra que el circuito se haya abierto.

| Aspecto | Resultado |
|---|---|
| Qué se apagó | El servicio PostgreSQL `db` con `docker compose stop db`. |
| Qué esperábamos que pasara | Fallas de reserva y, con el patrón, respuestas controladas y eventual apertura del circuito. |
| Qué pasó de verdad | Antes, la aplicación se reinició; hubo un error de transporte y nueve respuestas 500. |
| Qué cambió después de aplicar el patrón | Tras el reinicio, hubo un error de transporte y nueve respuestas 503; el circuito no mostró apertura en los logs. |

En condiciones normales el p95 fue 1980,42 ms antes y 157,84 ms después. Con solo diez peticiones por versión y una ejecución compartida, la muestra no basta para establecer el cumplimiento general de E6; el primer resultado tampoco cumple el umbral en esta muestra.

## 8. Recuperación del servicio

Desde el inicio de `docker compose start db` hasta la primera reserva exitosa transcurrieron 1648,83 ms antes y 727,72 ms después. En la primera versión hubo una respuesta 500 antes del éxito; en la segunda, la primera comprobación devolvió 201. Ambos tiempos observados son menores a los 60 s de E5, pero la muestra es una sola recuperación por versión y no permite concluir cumplimiento general. No observamos transiciones OPEN o HALF_OPEN.

## 9. Conclusiones

- En esta falla, el patrón cambió las respuestas posteriores al reinicio de 500 a 503 y redujo el tiempo observado; no evitó el reinicio inicial de la aplicación.
- No observamos la apertura ni el cierre del circuito, por lo que esta ejecución no demuestra su comportamiento en esos estados.
- Las dos versiones recuperaron una reserva exitosa en menos de dos segundos en esta ejecución. Se necesitan más mediciones para evaluar E5 y E6 con confianza.

## 10. Evidencias

Los registros originales de solicitudes y recuperación están en [antes.json](evidencias/lab11/antes.json) y [despues.json](evidencias/lab11/despues.json). Los logs de aplicación y PostgreSQL están en la misma carpeta. Los commits probados fueron `cd7da79ba371663833205a080f4924e2e961e965` y `53c03077eddcbe068e467055f9caa0d6450bbfb9`.
