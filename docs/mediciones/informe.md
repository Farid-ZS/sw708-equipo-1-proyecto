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

## Diagnóstico de cuello de botella (`POST /api/reservas`)

Objetivo: identificar qué parte del sistema limita el rendimiento de `POST /api/reservas` cuando aumentan los usuarios simultáneos, y compararlo con lo que planteaba `hipotesis.md` (que no fue modificada).

### Cómo se midió

- Se ejecutó `k6` durante 30 s con 100, 200 y 600 usuarios virtuales (VUs), una corrida por nivel.
- Mientras corría cada prueba se registró el uso de CPU y memoria de la aplicación (`app`) y de la base de datos (`db`) con `docker stats`, y las conexiones a PostgreSQL con `pg_stat_activity`. Se tomaron seis muestras por prueba.
- Todo corrió en una misma máquina con Windows y Docker Desktop.

### Resultados

| Usuarios (VUs) | Peticiones por segundo | Mediana | p95 | Errores | CPU `app` | CPU `db` | Conexiones activas (de 10) |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 100 | 1 177 | 61 ms | 97 ms | 0,00 % | ~97–113 % | ~35–64 % | 1–6 |
| 200 | 1 121 | 150 ms | 219 ms | 0,00 % | ~98–117 % | ~31–60 % | 1–6 |
| 600 | 1 083 | 514 ms | 650 ms | 0,32 % | ~91–122 % | ~17–59 % | 1–8 |

- El límite de la prueba (p95 menor a 300 ms) se cumple con 100 y 200 usuarios, y no se cumple con 600.
- Los errores de 600 usuarios fueron 106 peticiones rechazadas con `connection refused` al iniciar la prueba, cuando los 600 usuarios se conectan a la vez. No hubo errores 5xx ni 409.
- La memoria no fue un problema: `app` usó entre 106 y 230 MiB y `db` entre 86 y 109 MiB, de 2,84 GiB disponibles.
- Se vieron 11 conexiones abiertas a la base de datos en total; el pool de la aplicación es de 10.

### Verificación de la consulta de reservas

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM boletos WHERE funcion_id = '1' AND asiento = 'A1';
```

La consulta usa el índice `uk_boleto_funcion_asiento` y tarda ~0,05 ms. Esto cubre la consulta previa a la reserva; el `INSERT` no se midió por separado.

### Qué se observó

1. **El sistema deja de atender más peticiones aunque haya más usuarios.** De 100 a 600 usuarios las peticiones por segundo se mantienen en torno a 1 100 (bajan 8 %), pero la mediana de espera pasa de 61 ms a 514 ms. Más usuarios solo significan más espera.
2. **La base de datos tiene margen.** Su CPU no superó el 64 %, y como máximo 8 de las 10 conexiones del pool estaban activas, así que el pool nunca se llenó.
3. **La aplicación está al límite.** El contenedor `app` está en torno al 100 % de CPU o por encima en todas las pruebas. Node ejecuta el código de la aplicación en un solo hilo, de modo que ese hilo es el que se satura.

### Comparación con la hipótesis

La hipótesis decía que el límite estaba en el pool de conexiones de la base de datos y que Node no era el problema. Lo medido no lo respalda:

| Lo que planteaba la hipótesis | Lo medido | ¿Coincide? |
| :--- | :--- | :---: |
| El límite es el pool de conexiones | El pool nunca se llenó (1–8 activas de 10) | No |
| `app` está lejos del 100 % de CPU | `app` está en torno al 100 % o más | No |
| p95 ≈ 250 ms con 100 usuarios | 97 ms | No |
| p95 ≈ 450 ms con 200 usuarios | 219 ms | No |
| Throughput estancado en ≈ 600 req/s | Estancado, pero en ≈ 1 100 req/s | Solo la forma |
| Con 600 usuarios, errores 503 por timeouts | 0,32 % de error, sin ningún 503 | No |

Coincide el comportamiento general (las peticiones por segundo dejan de crecer y la espera aumenta), pero no la causa.

### Conclusión

El cuello de botella está en la aplicación (proceso Node), que se satura de CPU cuando hay muchos usuarios a la vez. No está en la consulta a `boletos` ni en el pool de conexiones de la base de datos. Por eso las mejoras que proponía la hipótesis (quitar la consulta previa y agrandar el pool) no deberían mejorar el rendimiento. El siguiente paso es perfilar el proceso Node para saber qué parte del trabajo por petición consume la CPU.

### Limitaciones

- Una sola corrida por nivel, con `k6` en la misma máquina que el sistema medido.
- Estas pruebas se hicieron en Windows con Docker Desktop y la sección "Antes" en Linux, por lo que los valores absolutos no son comparables entre ambas (con 100 usuarios: p95 de 97 ms aquí y 29,76 ms en "Antes"). Este diagnóstico se interpreta comparando los tres niveles medidos aquí.
- No se perfiló el proceso Node, así que no se sabe qué parte exacta del código consume la CPU. 

---
## Después de la mejora (Paso 06)

### Mejora aplicada

Mediante el commit `8b20309` se eliminó la consulta `SELECT` previa al
registro de una reserva. La detección de asientos ocupados se delegó a
la restricción de unicidad de PostgreSQL
`uk_boleto_funcion_asiento`.

Con este cambio, una reserva exitosa requiere una consulta menos a la
base de datos. No se modificaron el pool de conexiones, los índices,
el escenario de carga ni los parámetros del sistema.

### Entorno

| Dato | Valor |
|---|---|
| Fecha | 2026-11-25 |
| Commit medido | `a5ccef8` |
| Máquina | AMD Ryzen 5 7535HS (6 núcleos, 12 hilos), 32 GB RAM, Windows |
| Recursos de Docker | 12 procesadores lógicos y 15,28 GiB RAM |
| Stack | Docker Compose, Node 22 + Express 5 + PostgreSQL 16 |
| Generador de carga | `grafana/k6:1.3.0` |
| Carga | 100 VUs constantes, 30 s, pausa de 20 ms por iteración |
| Base de datos | Volumen independiente de pruebas |
| Ruido conocido | Dos contenedores PostgreSQL de otros proyectos activos |
| Evidencias | [`semana-12/`](../evidencias/semana-12/) |

Se utilizó el puerto externo 15432 para PostgreSQL debido a que los
puertos 5432 y 5433 estaban ocupados. La comunicación interna entre
la aplicación y PostgreSQL se mantuvo mediante `db:5432`.

El sistema se levantó con:

```powershell
$env:POSTGRES_PORT = "15432"

docker compose -p lumiere-lab12-despues -f compose.yaml up -d --build
```

### Corridas del Después

Se ejecutó el mismo script de carga utilizado en la línea base,
manteniendo los 100 VUs, los 30 segundos de duración y la pausa de
20 ms por iteración.

La primera corrida se descartó por calentamiento. El resultado del
Después corresponde al promedio de las corridas 2 y 3.

| Corrida | p95 | Throughput | Tasa de error técnico | Peticiones (201 / 409 / 5xx) | ¿Se usa? |
|---|---:|---:|---:|---|---|
| 1 (fría) | 88,96 ms | 1 256,91 req/s | 0 % | 37 784 / 0 / 0 | No |
| 2 | 97,34 ms | 1 107,05 req/s | 0,3004 % | 33 186 / 0 / 100 | Sí |
| 3 | 84,16 ms | 1 211,36 req/s | 0,3049 % | 36 297 / 0 / 111 | Sí |
| **Después (promedio 2–3)** | **90,75 ms** | **1 159,21 req/s** | **0,3027 %** | — | |

Los umbrales configurados en k6 se cumplieron en las tres corridas:
p95 menor a 300 ms y tasa de error técnico menor al 1 %.

Sin embargo, durante las dos corridas válidas se registraron 211
respuestas HTTP 5xx. Los logs consultados de Node.js y PostgreSQL
no permitieron determinar la causa específica de estos errores.

### Reproducción de la línea base en la misma máquina

La línea base original se realizó en Linux con un procesador Intel
Core Ultra 7 155H, mientras que el Después se ejecutó en Windows
con un procesador AMD Ryzen 5 7535HS.

Comparar directamente ambos resultados no permite determinar si las
diferencias se deben a la mejora o al entorno de ejecución.

Por este motivo, se reprodujo la línea base en la misma máquina
utilizada para el Después. Se recuperó el commit `6ff0350`, anterior
a la mejora, mediante `git worktree`:

```powershell
git worktree add --detach "$env:TEMP\lumiere-lab12-antes" 6ff0350
```

Se verificó la igualdad del script de carga mediante SHA256:

```powershell
Get-FileHash "carga/escenario.js"
Get-FileHash "$env:TEMP\lumiere-lab12-antes\carga\escenario.js"
```

Ambos archivos presentaron el mismo hash:

`A1101C44F9DCD82F3F4C9DF11AEEFBEB36AA711F3FD617C07403F1E156AE3CD7`

Se utilizaron proyectos Docker Compose independientes para evitar
compartir los datos generados entre ambas versiones. Se mantuvieron
la misma máquina, versión de k6, duración, usuarios virtuales y
configuración de carga.

| Corrida | p95 | Throughput | Tasa de error técnico | Peticiones (201 / 409 / 5xx) | ¿Se usa? |
|---|---:|---:|---:|---|---|
| 1 (fría) | 134,62 ms | 922,33 req/s | 0 % | 27 727 / 0 / 0 | No |
| 2 | 95,07 ms | 1 034,86 req/s | 0 % | 31 114 / 0 / 0 | Sí |
| 3 | 113,52 ms | 939,08 req/s | 0,2656 % | 28 162 / 0 / 75 | Sí |
| **Antes reproducido (promedio 2–3)** | **104,30 ms** | **986,97 req/s** | **0,1328 %** | — | |

La línea base original se conserva como evidencia del Paso 03.
La reproducción local constituye una medición complementaria para
evaluar el efecto de la mejora bajo condiciones más comparables.

### Comparación Antes vs. Después

| Qué | Antes reproducido | Después | Qué significa |
|---|---:|---:|---|
| Latencia p95 | 104,30 ms | 90,75 ms | Reducción aproximada del 13 % |
| Throughput | 986,97 req/s | 1 159,21 req/s | Incremento aproximado del 17,45 % |
| Tasa de error técnico | 0,1328 % | 0,3027 % | Aumento aproximado de 0,17 puntos porcentuales |
| Carga aplicada | 100 VUs, 30 s | 100 VUs, 30 s | Misma carga |
| Pausa entre iteraciones | 20 ms | 20 ms | Sin cambios |

La eliminación del `SELECT` previo mostró resultados favorables
en la comparación local:

- El p95 disminuyó aproximadamente 13,55 ms.
- El throughput aumentó aproximadamente 172,24 req/s.
- La tasa de error técnico aumentó aproximadamente 0,17 puntos
  porcentuales.
- Los errores HTTP 5xx pasaron de 75 a 211 en las corridas válidas.

Estos resultados indican una mejora observada en el rendimiento,
acompañada de un incremento en los errores. La cantidad reducida
de corridas no permite establecer una conclusión causal definitiva
sobre este incremento.

### Comparación con la línea base original

| Métrica | Antes original (Linux) | Antes reproducido (Windows) | Después (Windows) |
|---|---:|---:|---:|
| p95 | 29,76 ms | 104,30 ms | 90,75 ms |
| Throughput | 2 810,10 req/s | 986,97 req/s | 1 159,21 req/s |
| Error técnico | 0 % | 0,1328 % | 0,3027 % |
| Usuarios virtuales | 100 | 100 | 100 |
| Duración | 30 s | 30 s | 30 s |

Los resultados originales de Linux y los obtenidos en Windows no
son directamente comparables debido a las diferencias de hardware,
sistema operativo y configuración de red.

Por ello, las conclusiones sobre la mejora se sustentan principalmente
en las mediciones reproducidas en Windows.

### Comparación con la hipótesis

La hipótesis original identificaba al pool de conexiones de
PostgreSQL como el principal cuello de botella.

El diagnóstico del Paso 04 señaló que el proceso Node.js era el
componente más exigido bajo carga y que el pool de conexiones
todavía disponía de capacidad.

Aunque eliminar el `SELECT` previo mostró una reducción de latencia
y un aumento de throughput, esto no demuestra que PostgreSQL fuera
el cuello de botella. El cambio también reduce el trabajo que
realiza la aplicación al procesar cada reserva.

Por lo tanto, **la hipótesis original permanece refutada** por las
mediciones disponibles.

### Cumplimiento del escenario de calidad

| Criterio | Antes reproducido | Después | ¿Cumple después? |
|---|---:|---:|---|
| p95 menor a 300 ms | 104,30 ms | 90,75 ms | Sí |
| Errores HTTP 5xx iguales a 0 | 75 errores | 211 errores | No |
| Error técnico menor al 1 % (k6) | 0,1328 % | 0,3027 % | Sí |

El escenario E6 no se cumple completamente. Si bien la latencia
se encuentra dentro del límite establecido, todavía se producen
respuestas HTTP 5xx.

El cumplimiento de los umbrales configurados en k6 no implica
necesariamente el cumplimiento de todos los requisitos del escenario
de calidad.

### Decisión

Se propone mantener provisionalmente la mejora, debido a la reducción
observada del p95, el incremento del throughput y la eliminación de
una consulta redundante.

No obstante, su aceptación definitiva queda condicionada a investigar
los errores HTTP 5xx y verificar que el incremento observado no sea
una regresión de fiabilidad asociada al cambio.

Como siguiente actividad se propone:

- Identificar la causa de las respuestas HTTP 5xx.
- Perfilar el proceso Node.js para identificar las operaciones
  que consumen mayor tiempo de CPU.
- Repetir las mediciones para verificar la estabilidad de los
  resultados.

No se aplicaron estas modificaciones durante el laboratorio,
respetando la condición de introducir una sola mejora.

### Limitaciones

- La línea base original y el Después se ejecutaron inicialmente
  en máquinas diferentes.
- La comparación local se realizó ejecutando primero la versión
  optimizada y después la versión anterior.
- Se utilizaron volúmenes independientes y la misma generación
  de datos, pero no conjuntos de registros idénticos.
- Solo se consideraron dos corridas válidas por versión.
- El generador de carga y el sistema compartieron los recursos
  de Docker Desktop.
- Existían otros dos contenedores PostgreSQL activos durante
  las mediciones.
- No se determinó la causa específica de los errores HTTP 5xx.
- El p95 y la tasa de error reportados corresponden al promedio
  de las dos corridas válidas, no a una agregación global de
  todas las peticiones.

### Evidencias

**Después de la mejora:**

- [Corrida 1 — JSON](../evidencias/semana-12/despues-corrida-1.json)
- [Corrida 1 — TXT](../evidencias/semana-12/despues-corrida-1.txt)
- [Corrida 2 — JSON](../evidencias/semana-12/despues-corrida-2.json)
- [Corrida 2 — TXT](../evidencias/semana-12/despues-corrida-2.txt)
- [Corrida 3 — JSON](../evidencias/semana-12/despues-corrida-3.json)
- [Corrida 3 — TXT](../evidencias/semana-12/despues-corrida-3.txt)

**Reproducción de la línea base:**

- [Corrida 1 — JSON](../evidencias/semana-12/antes-controlado-corrida-1.json)
- [Corrida 1 — TXT](../evidencias/semana-12/antes-controlado-corrida-1.txt)
- [Corrida 2 — JSON](../evidencias/semana-12/antes-controlado-corrida-2.json)
- [Corrida 2 — TXT](../evidencias/semana-12/antes-controlado-corrida-2.txt)
- [Corrida 3 — JSON](../evidencias/semana-12/antes-controlado-corrida-3.json)
- [Corrida 3 — TXT](../evidencias/semana-12/antes-controlado-corrida-3.txt)

**Evidencias complementarias:**

- [Logs de Node.js](../evidencias/semana-12/despues-app.log)
- [Logs de PostgreSQL](../evidencias/semana-12/despues-db.log)
- [Commit de la mejora](https://github.com/Farid-ZS/sw708-equipo-1-proyecto/commit/8b20309)
- [Issue #62](https://github.com/Farid-ZS/sw708-equipo-1-proyecto/issues/62)