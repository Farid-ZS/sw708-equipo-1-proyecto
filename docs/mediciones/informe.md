# Informe de mediciones de rendimiento

- **Hipótesis:** [`hipotesis.md`](hipotesis.md) (integrada antes de medir)
- **Operación medida:** `POST /api/reservas`
- **Script:** `carga/escenario.js` (Integrante 2), con el ajuste de datos descrito abajo
- **Evidencia cruda:** [`evidencias/antes/`](evidencias/antes/) (resumen JSON y salida de k6 de cada corrida, más observación de recursos)

## Antes (línea base)

### Entorno

| Dato | Valor |
|---|---|
| Fecha | 2026-11-25 |
| Commit medido | `5405678` (`develop`) |
| Máquina | Intel Core Ultra 7 155H (22 hilos), 15 GiB RAM, Linux |
| Stack | `docker compose -f compose.yaml up -d --build` (app Node 22 + postgres:16), volumen limpio (`down -v`) antes de la corrida 1 |
| Generador de carga | `grafana/k6:1.3.0` en Docker con `--network=host`, misma máquina |
| Carga | 100 VUs constantes, 30 s, pausa de 20 ms por iteración (la del script) |
| Comando por corrida | `k6 run -e VUS=100 -e DURATION=30s -e RUN_ID=r<i>-<epoch> --summary-export antes-corrida-<i>.json carga/escenario.js` |
| Ruido conocido | Otros contenedores ajenos encendidos en la máquina (Kafka, Redis, n8n), sin carga durante la medición |

### Ajuste al script antes de medir

El script original genera solo **250 asientos distintos** (función y fila salen
del mismo `__ITER % 5`, por 50 números). La corrida 1 los ocupaba en segundos y
las corridas 2 y 3 habrían sido casi solo respuestas 409, que ejecutan el
`SELECT` pero nunca el `INSERT`: no se habría medido una reserva real.

Se cambió solo la generación de datos: cada corrida (`RUN_ID`) y cada VU usan su
propia `funcion_id`, y cada iteración un asiento nuevo (A1…Z99). Carga, umbrales
y métricas quedaron igual. Resultado: **100 % de respuestas 201** en las tres
corridas, sin 409.

### Corridas

La corrida 1 se descarta (en frío). La línea base es el promedio de las
corridas 2 y 3.

| Corrida | p95 `http_req_duration` | Throughput (`http_reqs`/s) | Tasa de error (`tasa_error_tecnico`) | Peticiones (201 / 409 / 5xx) | ¿Se usa? |
|---|---|---|---|---|---|
| 1 (fría) | 32,81 ms | 2 864,5 req/s | 0 % | 86 050 / 0 / 0 | No |
| 2 | 30,08 ms | 2 800,5 req/s | 0 % | 84 092 / 0 / 0 | Sí |
| 3 | 29,44 ms | 2 819,7 req/s | 0 % | 84 675 / 0 / 0 | Sí |
| **Antes (promedio 2–3)** | **29,76 ms** | **2 810,1 req/s** | **0 %** | — | |

Otros percentiles (corridas 2 / 3): mediana 14,05 / 13,98 ms; p90 24,73 / 24,35 ms;
máximo 195,63 / 80,03 ms.

El umbral del script (p95 < 300 ms, error técnico < 1 %) se cumplió en las tres
corridas.

### Observación de recursos (durante la corrida 2)

Tres muestras con `docker stats` y `pg_stat_activity`
([`observacion-corrida-2.txt`](evidencias/antes/observacion-corrida-2.txt)):

| Muestra | CPU `app` (Node) | CPU `db` (PostgreSQL) | Conexiones abiertas del pool | Conexiones ejecutando consulta |
|---|---|---|---|---|
| 1 | 121 % | 85 % | 10 | 1 |
| 2 | 107 % | 84 % | 10 | 5 |
| 3 | 106 % | 83 % | 10 | 3 |

### Comparación con la hipótesis

| Métrica | Esperado (`hipotesis.md`, 100 VUs) | Medido (Antes) | ¿Coincide? |
|---|---|---|---|
| p95 | ≈ 250 ms | 29,76 ms | **No**: ~8 veces menor |
| Throughput | ≈ 600 req/s (aplanado) | 2 810 req/s | **No**: ~4,7 veces mayor |
| Tasa de error | 0 % | 0 % | Sí |
| Pool saturado (10 conexiones ocupadas) | Sí | Abiertas 10, ocupadas solo 1–5 | **No** |
| CPU de `app` lejos del 100 % | Sí | 106–121 % | **No** |

**La hipótesis queda refutada** según los propios criterios de la sección 4 de
`hipotesis.md`:

- El p95 está por debajo de 50 ms a 100 VUs, así que la base y el pool no limitan
  a esta carga.
- El pool nunca estuvo lleno: de 10 conexiones, solo 1 a 5 ejecutaban consultas
  en cada muestra, así que no hubo cola de espera relevante.
- El contenedor `app` superó el 100 % de CPU. Node ejecuta el código de la
  aplicación en un solo hilo (el resto del exceso son hilos de GC y del
  sistema), así que el componente más cargado es el **proceso Node**, no
  PostgreSQL.
- La estimación de costo del `INSERT` (6–8 ms por el `fsync`) fue muy
  pesimista: la latencia mediana de **toda la petición** fue de 14 ms con 100
  peticiones en vuelo.

Lectura de los números: con 100 VUs y 20 ms de pausa, la Ley de Little da
100 / (0,020 s + 0,0153 s) ≈ 2 830 req/s, igual a lo medido. El throughput
quedó fijado por la carga que pidió el script y no por un tope del sistema. Por
lo tanto, **esta carga no basta para saber dónde se satura el sistema**: para
encontrar el tope habría que subir VUs hasta que el throughput deje de crecer.
Con lo observado, el primer candidato a cuello es el event loop de Node (CPU
del proceso ~100 %), no el pool.

### Consecuencia para el "Después"

La mejora que proponía la hipótesis (quitar el `SELECT` previo o agrandar el
pool) ataca un componente que **no** fue el cuello en esta medición, así que no
se espera que mueva el p95. Antes de optimizar conviene repetir la medición con
más carga (p. ej. 200, 400 y 800 VUs) para ubicar el punto de saturación y
confirmar si el límite es el proceso Node.
