# Acta de Ambigüedades

*Contrato evaluado (Proveedor):* API de Incidencias, Equipo 3 ([openapi.yaml](./openapi.yaml))
*Endpoint evaluado:* POST /v1/incidencias
*Operación:* crearIncidencia
*Equipo consumidor:* Equipo 1

---

## Lista de supuestos: contrato "Incidencias" (Equipo 3)

Llamada que escribimos con el contrato ajeno:

```bash
curl -i -X POST http://localhost:3001/v1/incidencias \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "id_tipo_incidencia": "6f1c2b9e-3a4d-4c8e-9f10-2b7d5a6c8e01",
    "descripcion": "Sensor de temperatura del contenedor fuera de rango",
    "grado_severidad": 4,
    "id_operacion": "0b7e4c2a-9d31-4f6a-8c5e-1a2b3c4d5e6f"
  }'
```

El token y los dos UUID los tomamos de los ejemplos del contrato: no encontramos de dónde sale un valor propio.

| Nº | Supuesto | Sustento |
|----|----------|----------|
| 1 | El token JWT se obtiene en otro endpoint que no está en este contrato, y cualquier usuario autenticado puede registrar una incidencia sobre cualquier operación. | El contrato declara `bearerAuth` y el `401`, pero no dice cómo se consigue el token, si hace falta un rol ni si hay un `403`. |
| 2 | Los UUID de `id_tipo_incidencia` e `id_operacion` se consultan en otros endpoints del sistema. | Los ejemplos traen UUID fijos, pero el contrato no dice de dónde sale un valor válido; sin eso solo se puede obtener un `422`. |
| 3 | El `id_estado_incidencia` de la respuesta es el de «Abierta» y existe un catálogo donde consultarlo. | La `description` dice que en un alta exitosa corresponde a `Abierta`, pero la respuesta solo trae el UUID. |
| 4 | `descripcion` ausente da `DESCRIPCION_VACIA`; `grado_severidad` ausente da `VALIDACION`. | El ejemplo `campo_ausente` usa `VALIDACION` para un campo obligatorio ausente, pero el ejemplo `descripcion_vacia` dice «ausente, vacía o solo espacios». `SEVERIDAD_INVALIDA` habla de «no es entero o fuera de rango» y no menciona la ausencia. |
| 5 | `null` se trata como campo ausente; `"4"` (texto) y `4.5` dan `SEVERIDAD_INVALIDA`; `descripcion: 123` da `VALIDACION`. | El contrato solo dice «no es entero». No habla de `null`, de `4.0` ni del tipo incorrecto en `descripcion` o en los UUID. |
| 6 | Si hay varios problemas a la vez se devuelve un solo error, evaluado en este orden: `401`, `400`, `422`, `409`. | Cada respuesta trae un solo `codigo`, pero no dice cuál sale con varios problemas (por ejemplo, tipo inexistente y operación finalizada: ¿`422` o `409`?). |
| 7 | Para saber qué campo falló en un `VALIDACION` hay que leer el `mensaje`. | El contrato manda decidir por `codigo` y nunca por `mensaje`, pero `VALIDACION` cubre campo ausente, UUID mal formado y campo desconocido, y el único dato del campo está en el `mensaje`, que puede cambiar sin subir la versión. |
| 8 | Una `descripcion` de más de 1000 caracteres da `400 VALIDACION`; el límite se mide después de quitar los espacios de los extremos, y la respuesta devuelve la descripción ya recortada. | El esquema tiene `maxLength: 1000`, pero ningún ejemplo ni `codigo` lo cubre. Dice que el servidor recorta los espacios, pero no cuándo mide el límite ni qué devuelve. |
| 9 | Un cuerpo vacío, un JSON roto o un `Content-Type` distinto de JSON dan `400 VALIDACION`. | La tabla dice «petición mal formada», pero los ejemplos solo muestran campos. No aclara si el tipo de contenido incorrecto da `400` o `415`. |
| 10 | Repetir la misma llamada crea una incidencia nueva con otro `codigo`. Si se corta la conexión, no se sabe si se guardó. | El contrato no dice nada de idempotencia ni de duplicados, y no hay `Idempotency-Key`. El `500` promete que no se guarda nada, pero un corte de red antes de recibir la respuesta no es un `500`. |
| 11 | Existe un `GET` por `id_incidencia` que no está en este contrato, para consultar lo que se creó. | El `201` no trae cabecera `Location` y el contrato no menciona ningún `GET`. |
| 12 | Cualquier estado de la operación distinto de `En curso` da `409 OPERACION_NO_ACTIVA`. | El ejemplo habla de «finalizada o cancelada», pero el contrato no lista los estados que existen. |
| 13 | El `201` no garantiza que se notificó a los supervisores con severidad 5, y el cliente no tiene forma de saberlo. | El contrato dice que la notificación es «de mejor esfuerzo» y que la respuesta sigue siendo `201` si falla; la respuesta no informa el resultado. |
| 14 | El `AAMM` del `codigo` sale de la hora del servidor, la secuencia se reinicia cada mes y nunca pasa de 9999. | `fecha_hora` sale en UTC (termina en `Z`): una incidencia del 30 de noviembre a las 23:30 en Lima ya es 1 de diciembre en UTC, y el contrato no dice si el `codigo` lleva `2611` o `2612`. El patrón `^INC-\d{4}-\d{4}$` solo admite cuatro dígitos para la secuencia. |