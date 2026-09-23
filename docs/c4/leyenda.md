# Leyenda del Modelo C4 — CineStar Barrio

## 1. Qué muestra cada figura

- **Nivel 1 — Contexto:** representamos nuestro sistema como una única caja
  (CineStar Barrio) junto a los dos roles que interactúan directamente con él:
  Operador (taquilla y teléfono, un mismo rol) y Administrador. No modelamos
  sistemas externos porque nuestro alcance no contempla ninguno: no manejamos
  pasarela de pago en línea, ni programa de fidelización, ni venta de alimentos.

- **Nivel 2 — Contenedores:** abrimos el sistema en dos aplicaciones cliente
  (Terminal de Taquilla y Terminal Administrativa) que consumen un Servidor de
  Aplicación central, el cual persiste contra Oracle 21c XE dividido en dos
  esquemas (Esquema Operativo y Esquema Administrativo/Auditoría), tal como nos
  exigía el proyecto: la base de datos debía ser obligatoriamente Oracle 21c XE,
  organizada en al menos dos esquemas. No fijamos lenguaje ni framework de las
  aplicaciones cliente ni del servidor, porque esa decisión quedaba libre a
  nuestro criterio como equipo de desarrollo.

- **Nivel 3 — Componentes:** detallamos el interior del Servidor de Aplicación en
  ocho responsabilidades lógicas, descritas en la sección siguiente.

## 2. Responsabilidades de los componentes

| Componente (nombre exacto en el DSL) | Responsabilidad |
|---|---|
| Autenticación y Autorización | Valida credenciales, roles y permisos de acceso por esquema |
| Cartelera y Funciones | Administra películas y funciones, valida solapamiento de horarios |
| Salas y Asientos | Configura la disposición de asientos de cada sala |
| Reservas y Ventas | Controla la concurrencia, ejecuta transacciones atómicas y emite el código único de boleto |
| Cancelaciones | Libera el asiento y dispara el registro de auditoría |
| Consultas | Expone disponibilidad en tiempo real e historial de reservas y ventas |
| Reportes | Genera métricas de ocupación, ventas y cancelaciones para administración |
| Auditoría / Logging | Registra operaciones críticas con usuario y marca de tiempo |

## 3. Qué se dejó afuera a propósito y Observación

**Qué dejamos afuera:** documentamos estrictamente lo que nos pedía la
especificación de requerimientos, no una implementación futura. Por eso omitimos:
cualquier stack tecnológico específico de cliente o backend, ya que esa decisión
quedaba libre a nuestro criterio; la pasarela de pago en línea, el programa de
fidelización y la venta de alimentos, excluidos explícitamente de nuestro
alcance; y cualquier mecanismo de infraestructura que no nos pidieron (caché,
cola de mensajes, balanceador).

**Observación crítica del equipo:** al modelar el nivel de componentes notamos
que todo el peso de negocio converge en un único componente, **Reservas y
Ventas**, que es el único que golpea directamente al Esquema Operativo bajo
presión concurrente —porque debe garantizar que un mismo asiento nunca quede en
más de una reserva, que no se pueda confirmar una venta si ya se alcanzó el cupo
de la sala, y que si dos operadores intentan reservar el mismo asiento al mismo
tiempo, solo uno de ellos tenga éxito— y es también el único componente con
relación directa hacia Auditoría. No incluimos ningún mecanismo intermedio
—caché, cola, particionamiento— entre ese componente y la base de datos. Esto no
es un descuido de nuestro modelo, sino un reflejo fiel de lo que se nos pidió,
pero nos deja en claro el punto de mayor riesgo del proyecto: si no implementamos
correctamente el control de concurrencia (mediante bloqueos, transacciones con
aislamiento adecuado o control optimista de versiones), toda la garantía de
"no sobreventa" de nuestro sistema depende de ese único componente.