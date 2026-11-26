import http from 'k6/http'
import { check, sleep } from 'k6'
import { Counter, Trend, Rate } from 'k6/metrics'

// ==============================================================================
// Métricas personalizadas para el informe de mediciones
// ==============================================================================
const reservasExitosas = new Counter('reservas_exitosas_201')
const asientosOcupados = new Counter('asientos_ocupados_409')
const erroresServidor = new Counter('errores_servidor_5xx')
const latenciaReservas = new Trend('latencia_reservas_ms')
const tasaErrorTecnico = new Rate('tasa_error_tecnico')

// ==============================================================================
// Configuración de Carga y Umbrales (Traducción del Escenario de Calidad)
// ==============================================================================
// Escenario E6 / E1: p(95) < 300 ms bajo concurrencia sostenida
export const options = {
  // Carga constante de usuarios virtuales para mediciones reproducibles de línea base
  vus: Number(__ENV.VUS || 50),
  duration: __ENV.DURATION || '30s',

  thresholds: {
    // Umbral de calidad del p95 exigido en el informe
    http_req_duration: ['p(95)<300'],
    // Tasa de errores HTTP inesperados (5xx o fallos de red) menor al 1%
    tasa_error_tecnico: ['rate<0.01'],
  },
}

// URL base del servicio (por defecto: servidor Express en puerto 3000 o localhost)
const BASE_URL = __ENV.TARGET_URL || __ENV.BASE_URL || 'http://localhost:3000'
const ENDPOINT = `${BASE_URL}/api/reservas`

// Identificador de la corrida: distinto en cada ejecución para no chocar con
// reservas de corridas anteriores (la base persiste entre corridas).
const RUN_ID = __ENV.RUN_ID || String(Date.now())

export default function () {
  // Cada corrida y cada VU reservan en su propia función, y cada iteración en
  // un asiento nuevo: así se mide la reserva completa (SELECT + INSERT) y no
  // solo rechazos 409 por asientos ya ocupados en corridas anteriores.
  // funcion_id cabe en VARCHAR(50); el asiento respeta el patrón letra + 1-2 dígitos.
  const funcionId = `K6-${RUN_ID}-${__VU}-${Math.floor(__ITER / 2574)}`
  const fila = String.fromCharCode(65 + (Math.floor(__ITER / 99) % 26)) // A..Z
  const numeroAsiento = (__ITER % 99) + 1 // 1..99
  const asiento = `${fila}${numeroAsiento}`
  
  const payload = JSON.stringify({
    funcion_id: funcionId,
    asiento: asiento,
    nombre_cliente: `Usuario-VU${__VU}-IT${__ITER}`,
  })

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: '10s',
  }

  const startTime = Date.now()
  const response = http.post(ENDPOINT, payload, params)
  const duration = Date.now() - startTime

  latenciaReservas.add(duration)

  // Validar respuestas conforme al contrato OpenAPI y ADR-0003:
  // - 201: Reserva confirmada exitosamente
  // - 409: Asiento ocupado (colisión de negocio esperada bajo alta concurrencia)
  const esExito = response.status === 201
  const esAsientoOcupado = response.status === 409
  const esErrorServidor = response.status >= 500

  if (esExito) {
    reservasExitosas.add(1)
    tasaErrorTecnico.add(0)
  } else if (esAsientoOcupado) {
    asientosOcupados.add(1)
    tasaErrorTecnico.add(0)
  } else {
    // Cualquier otro código (incluyendo 500, timeout o fallo de conexión) cuenta como error técnico
    tasaErrorTecnico.add(1)
    if (esErrorServidor) {
      erroresServidor.add(1)
    }
  }

  check(response, {
    'código es 201 o 409 (respuesta de negocio válida)': (r) => r.status === 201 || r.status === 409,
    'tiempo de respuesta < 300ms': (r) => r.timings.duration < 300,
    'cabecera Content-Type es JSON': (r) => (r.headers['Content-Type'] || '').includes('application/json'),
  })

  // Breve pausa para regular el ritmo de peticiones (10ms a 50ms)
  sleep(0.02)
}
