# Pruebas de Carga y Rendimiento con k6 — Cines Lumiere

Este directorio contiene el script de pruebas de carga `escenario.js` desarrollado para el **Laboratorio de Mediciones y Rendimiento** (Paso 02).

El script traduce los escenarios de calidad del sistema (Escenarios **E1** y **E6** de `docs/escenarios.md`) simulando peticiones concurrentes a la API de reservas (`POST /api/reservas`), evaluando la latencia en el percentil 95 (`p95`), el throughput (peticiones/segundo) y la tasa de errores técnicos.

---

## 1. Requisitos Previos

Antes de ejecutar las pruebas, el backend de Cines Lumiere y la base de datos PostgreSQL deben estar levantados.

Puedes levantarlos con Docker Compose desde la raíz del repositorio:
```bash
docker compose up -d
```
O ejecutando el servidor localmente:
```bash
cd lumiereApp/backend
npm run start
```
El servidor escuchará en `http://localhost:3000`.

---

## 2. Instrucciones de Ejecución

### Opción A: Con k6 instalado localmente

Si tienes `k6` instalado en tu sistema:

```bash
# Ejecución estándar (50 VUs por 30 segundos)
k6 run carga/escenario.js

# Personalizando usuarios virtuales o duración
k6 run -e VUS=100 -e DURATION=45s carga/escenario.js

# Apuntando a otro host o puerto
k6 run -e TARGET_URL=http://localhost:3000 carga/escenario.js
```

### Opción B: Con Docker (sin instalar k6)

Si prefieres ejecutarlo mediante la imagen oficial de `k6`:

**En Linux / macOS / Git Bash:**
```bash
docker run --rm -i --network=host grafana/k6 run - < carga/escenario.js
```

**En Windows PowerShell:**
```powershell
Get-Content carga/escenario.js | docker run --rm -i --network=host grafana/k6 run -
```

*(Si usas Docker Desktop en Windows o macOS y `host.docker.internal` es necesario):*
```powershell
Get-Content carga/escenario.js | docker run --rm -i -e TARGET_URL=http://host.docker.internal:3000 grafana/k6 run -
```

---

## 3. Protocolo de Mediciones para el Equipo (Pasos 03 y 06)

Para registrar las mediciones en `docs/mediciones/informe.md`:

1. **Descarte de corrida en frío:** De las 3 corridas, la primera se **descarta** para evitar sesgos de inicialización de caché o conexiones del pool.
2. **Tres corridas consecutivas** con la misma carga (la del "Antes" fue 100 VUs, 30 s), guardando el resumen de cada una:
   ```bash
   for i in 1 2 3; do
     k6 run -e VUS=100 -e DURATION=30s -e RUN_ID=r$i-$(date +%s) \
       --summary-export docs/mediciones/evidencias/antes/antes-corrida-$i.json carga/escenario.js
   done
   ```
   **Datos sin repetir:** cada VU reserva en su propia función (`K6-<RUN_ID>-<VU>-…`) y cada iteración en un asiento nuevo (A1…Z99), así casi todas las respuestas son 201 y se mide la reserva completa (`SELECT` + `INSERT`). `RUN_ID` es opcional (por defecto se usa la hora), pero debe cambiar en cada corrida porque la base conserva las reservas anteriores.
3. **Métricas a registrar:**
   - **Latencia p(95):** Se obtiene de la métrica `http_req_duration ..........: p(95)=...ms`.
   - **Throughput:** Se calcula dividiendo `http_reqs` entre el tiempo total (ej. `... reqs/s`).
   - **Tasa de error técnico:** Se obtiene de `tasa_error_tecnico` (códigos 5xx o fallos de conexión).
   - **Respuestas de negocio:** Ver el recuento de `reservas_exitosas_201` y `asientos_ocupados_409`.
