# Hipótesis de rendimiento (Paso 01)

> Este documento se escribe **antes** de medir. Se integra a `main` antes de que
> se suba cualquier script de carga o resultado, para que el historial de Git
> muestre que la predicción no se ajustó a los números.

- **Fecha:** 2026-11-25
- **Sistema bajo prueba:** stack de `compose.yaml` (servicio `app` Node 22 + Express 5, servicio `db` PostgreSQL 16)
- **Operación medida:** `POST /api/reservas` (rodaja vertical de reserva de butaca)
- **Escenario de calidad relacionado:** E6 en `docs/escenarios.md` (p95 < 300 ms, 0 % de errores 5xx)

## 1. Por qué medir `POST /api/reservas`

Es el único endpoint que hoy llega a la base de datos. El resto de rutas
(`/funciones`, `/peliculas`, `/salas`, etc.) son *stubs* que responden un JSON
fijo desde memoria (`src/routes/stub.ts`): medirlas solo mediría Express, no el
sistema.

Recorrido de una petición:

```
k6 ──HTTP──▶ Express (express.json, exigirJson)
              └─▶ ReservasController → ReservarBoletoUseCase
                    ├─ 1) buscarPorAsiento  → circuit breaker → pool.query(SELECT ...)
                    ├─ 2) guardar           → circuit breaker → pool.query(INSERT ...)   ← commit con fsync del WAL
                    └─ 3) publicar evento   → bus en memoria (Auditoría)
```

## 2. Componente que limita el rendimiento

**El pool de conexiones a PostgreSQL (`pg.Pool` en `lumiereApp/backend/src/db.ts`).**

### Por qué

1. **Tamaño por defecto: 10 conexiones.** `db.ts` no define `max`, así que
   `pg-pool` usa `max = 10`. Como mucho hay 10 consultas en curso a la vez; las
   demás esperan en la cola interna del pool.
2. **Dos idas y vueltas a la base por reserva.** El caso de uso hace un
   `SELECT` de verificación y después el `INSERT`. Cada `pool.query` pide una
   conexión, así que la petición pasa **dos veces** por la cola.
3. **El `INSERT` es lo caro.** Cada `INSERT` es una transacción con commit, y el
   commit espera el `fsync` del WAL al volumen de Docker. Es varias veces más
   lento que el `SELECT`, que se resuelve con el índice único
   `uk_boleto_funcion_asiento`.
4. **Node no es el cuello.** El trabajo en el proceso (parsear JSON, validar,
   crear UUID, publicar en el bus) es CPU liviana y el event loop solo espera
   E/S. La máquina de pruebas tiene CPU de sobra para un solo proceso Node.

Consecuencia: con pocas peticiones concurrentes la latencia es baja; cuando hay
más peticiones en vuelo que conexiones, **el throughput se aplana y lo que crece
es el tiempo de espera en la cola del pool** (Ley de Little: latencia ≈
concurrencia / throughput).

### Efecto secundario esperado: errores en cascada

`db.ts` fija `connectionTimeoutMillis: 1000` y `query_timeout: 1000`. Si una
petición espera **más de 1 s** por una conexión (o la consulta tarda más de
1 s), `pg` lanza error, el adaptador lo traduce a
`ServicioNoDisponibleError` (HTTP 503) y, con ≥ 50 % de fallas en 5 peticiones,
el circuit breaker (`src/infrastructure/resiliencia.ts`) se **abre 10 s** y
rechaza todo de inmediato. Es decir: pasado cierto nivel de carga no veremos un
p95 alto, sino una tasa de error que salta de golpe.

## 3. Números esperados

Estimación del tiempo que cada reserva ocupa conexiones:
`SELECT` ≈ 1–2 ms + `INSERT` con commit ≈ 6–8 ms (fsync en volumen Docker)
→ ≈ **8 ms de conexión por reserva**.

Throughput máximo ≈ 10 conexiones / 8 ms ≈ **1 250 req/s teórico**; con la
sobrecarga del driver y de HTTP esperamos que se aplane cerca de **600 req/s**.

| Carga k6 (VUs sin pausa) | p95 esperado | Throughput | Tasa de error |
|---|---|---|---|
| 50 VUs | ≈ 120 ms | ≈ 550–600 req/s | 0 % |
| **100 VUs** | **≈ 250 ms** | ≈ 600 req/s (aplanado) | 0 % |
| 200 VUs | ≈ 450 ms (no cumple E6) | ≈ 600 req/s (aplanado) | < 1 % |
| ≥ 600 VUs | — | cae | sube de golpe (503 por timeout de 1 s + circuito abierto) |

**Predicción principal (la que se contrasta en el Paso 03):** con la carga que
defina el script del Integrante 2, el **p95 de `POST /api/reservas` estará en
torno a 250 ms a 100 VUs** y crecerá casi lineal con los VUs, mientras el
throughput se queda fijo cerca de 600 req/s.

## 4. Cómo sabremos si la hipótesis es correcta o falsa

La hipótesis se **confirma** si al medir:

- el throughput deja de subir al agregar VUs mientras el p95 sigue subiendo;
- durante la prueba `docker stats` muestra al contenedor `app` **lejos** del
  100 % de una CPU (Node espera, no calcula);
- en PostgreSQL hay ~10 conexiones activas desde `app`
  (`SELECT count(*) FROM pg_stat_activity WHERE datname = 'boletos_db';`).

La hipótesis es **falsa** si:

- el contenedor `app` llega a ~100 % de una CPU con el pool sin saturar
  → el cuello sería el event loop de Node, no la base;
- el p95 está muy por debajo de lo previsto (p. ej. < 50 ms a 100 VUs)
  → la base y el pool no limitan a esta carga;
- aparecen errores 409 (`ASIENTO_OCUPADO`) o 400 → el script está midiendo
  rechazos de negocio, no el camino feliz (ver condiciones abajo).

## 5. Condiciones para que la medición sea válida

Acordadas con el Integrante 2 (script k6):

- **Asiento único por petición.** La restricción `UNIQUE (funcion_id, asiento)`
  devuelve 409 si se repite. El asiento solo admite letra + 1–2 dígitos
  (máx. 2 574 por función), así que el script debe variar `funcion_id`
  (p. ej. `funcion_id = "k6-<corrida>-<VU>"`) además del asiento.
- **Mismo archivo de orquestación siempre.** En `develop` conviven
  `compose.yaml` (app + db) y `docker-compose.yml` (backend + db + frontend);
  `docker compose` toma `compose.yaml` por defecto. Las mediciones usan
  `compose.yaml`, y se anota en el informe.
- **Base limpia entre corridas** (`docker compose down -v && docker compose up -d`)
  o un prefijo de `funcion_id` distinto por corrida, para que la tabla no crezca
  entre mediciones.
- **3 corridas seguidas**, descartando la primera (en frío: JIT de V8, caché de
  PostgreSQL y conexiones del pool sin abrir).
- Se reporta: **p95** de `http_req_duration`, **throughput** (`http_reqs/s`) y
  **tasa de error** (`http_req_failed`).
- Misma máquina y nada más pesado corriendo durante las corridas.

## 6. Qué cambiaríamos si se confirma (para el "Después")

Solo como dirección, no forma parte de la línea base:

1. Quitar el `SELECT` previo y dejar que el índice único rechace duplicados
   (ya traducido a `AsientoOcupadoError` según ADR 0003) → una sola ida a la base.
2. Ajustar `max` del pool (p. ej. 20) y medir de nuevo, sin superar el
   `max_connections` de PostgreSQL (100 por defecto).
