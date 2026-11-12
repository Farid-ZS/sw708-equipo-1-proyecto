# Eventos de Lumiere

Flujo de hoy, de extremo a extremo:

```text
POST /api/reservas
  -> ReservasController
  -> ReservarBoletoUseCase (guarda el boleto)
  -> PublicadorDeEventos (puerto de salida, definido en el dominio)
  -> BusDeEventosEnMemoria (adaptador)
  -> Auditoría (consumidor, otro módulo)
```

## ReservaConfirmada

| Aspecto | Definición |
|---|---|
| Nombre | `ReservaConfirmada` (pasado: algo que ya ocurrió) |
| Cuándo se emite | Justo después de que `BoletoRepository.guardar` termina sin error, dentro de `ReservarBoletoUseCase.ejecutar`. No se emite si faltan datos (`DatosInvalidosError`) ni si el asiento ya está ocupado (`AsientoOcupadoError`). |
| Quién lo emite | Reservas, por el puerto `PublicadorDeEventos`. Reservas no conoce a ningún consumidor. |
| Quién lo consume | Auditoría (`lumiereApp/backend/src/auditoria/auditoria.ts`): registra la operación `RESERVA_CONFIRMADA`. |
| Inmutabilidad | Todos los campos son `readonly` y la instancia queda congelada (`Object.freeze`). |
| Dónde vive | Dominio de Reservas: `lumiereApp/backend/packages/reservas/src/domain/cinema.ts`. Sin imports de infraestructura. |

### Campos

| Campo | Tipo | Significado |
|---|---|---|
| `nombre` | `'ReservaConfirmada'` | Nombre fijo del evento |
| `boletoId` | texto (UUID) | Identificador único del boleto emitido |
| `funcionId` | texto | Función reservada |
| `asiento` | texto | Asiento reservado |
| `nombreCliente` | texto | Cliente que reservó |
| `ocurridoEn` | texto (ISO 8601) | Momento en que se guardó la reserva |

### ¿Qué pasa si el consumidor falla?

La reserva no se deshace: ya quedó guardada y el cliente igual recibe `201`. El bus en memoria atrapa el error del consumidor, lo reporta (por defecto con `console.error`) y sigue con los demás consumidores. En esta versión no hay reintento, así que el evento que falló no queda registrado en Auditoría.

## Adaptador y suscripción

- Puerto: `PublicadorDeEventos` (`publicar(evento)`), en el dominio.
- Adaptador: `BusDeEventosEnMemoria` (`packages/reservas/src/infrastructure/eventos.memoria.ts`), exportado como `@lumiere/reservas/eventos`.
- Suscripciones: solo en `lumiereApp/backend/src/composicion.ts`. Sumar otro consumidor es una línea `bus.suscribir(...)` allí; el caso de uso no cambia.

## Lo que todavía no se exige (semana 11)

Broker real (RabbitMQ, Kafka), garantías de entrega, idempotencia, orden de llegada y reintentos. Como el emisor solo conoce el puerto, pasar a un broker es cambiar el adaptador.

## Prueba que lo demuestra

`lumiereApp/backend/src/tests/flujo-eventos.test.ts`: llama al caso de uso (y al controlador) y verifica el registro en Auditoría, que una reserva rechazada no emite, que el evento es inmutable, que un consumidor roto no deshace la reserva y que sumar un consumidor no toca el caso de uso.