# Leyenda del Modelo C4 — Lumiere App (CineStar Barrio)

## 1. Qué muestra cada figura

- **Nivel 1 — Contexto:** representamos nuestro sistema como una única caja
  (Lumiere App) junto a los dos roles que interactúan directamente con él:
  Cliente (consulta cartelera, selecciona función y reserva/compra boletos) y
  Administrador (gestiona películas, funciones, salas, sedes, ventas y
  reportes). Modelamos dos sistemas externos: el Sistema de correo electrónico
  (envío de confirmaciones y cancelaciones) y la Pasarela de pagos
  (autorización y captura de pagos). No modelamos programa de fidelización ni
  ningún otro servicio externo.

- **Nivel 2 — Contenedores:** abrimos el sistema en tres contenedores: la
  Aplicación Web SPA (React), que usan Cliente y Administrador desde el
  navegador; la API Backend (Node.js), una API REST monolítica modular que
  recibe las peticiones HTTPS/REST (JSON) de la SPA; y la Base de datos
  (PostgreSQL), almacén transaccional al que la API lee y escribe vía SQL. La
  API es además el único contenedor que se comunica con el correo y con la
  pasarela de pagos.

- **Nivel 3 — Componentes:** detallamos el interior de la API Backend. Está
  organizada en arquitectura hexagonal (puertos y adaptadores): un bloque
  transversal de entrada (Router, Middlewares y Auth RBAC), diez módulos de
  negocio y una pieza de infraestructura compartida hacia la base de datos.
  Se describen en la sección siguiente.

## 2. Responsabilidades de los componentes

### Componentes transversales

| Componente (nombre exacto en el DSL) | Responsabilidad |
|---|---|
| API Router | Enruta las peticiones HTTP a cada módulo |
| Middlewares | CORS, JSON y manejo de errores |
| Auth RBAC | Autenticación JWT y autorización por roles |
| Infra Compartida (db.ts / pg.Pool) | Gestiona el pool de conexiones a PostgreSQL; todos los repositorios pasan por él |

### Módulos de negocio

Cada módulo sigue el mismo patrón: **Controller** (adaptador primario HTTP) →
**UseCase** (reglas de negocio) → **Puerto** (interfaz de persistencia) ←
**Repository** (adaptador secundario que implementa el puerto y accede a datos
vía Infra Compartida).

| Módulo | Controller | UseCase | Puerto | Repository | Responsabilidad |
|---|---|---|---|---|---|
| Autenticación | AuthController | AuthUseCase | AuthRepository Puerto | AuthRepository PG | Reglas de negocio de autenticación |
| Catálogo | PeliculasController | GestionarCarteleraUseCase | PeliculaRepository Puerto | PostgresPeliculaRepository | Administra el catálogo de películas y la cartelera |
| Funciones | FuncionesController | GestionarFuncionesUseCase | FuncionRepository Puerto | PostgresFuncionRepository | Administra las funciones |
| Salas | SalasController | GestionarSalasUseCase | SalaRepository Puerto | PostgresSalaRepository | Administra las salas |
| Sedes | SedesController | GestionarSedesUseCase | SedeRepository Puerto | PostgresSedeRepository | Administra las sedes |
| Reservas | ReservasController | ReservarBoletoUseCase | BoletoRepository Puerto | PostgresBoletoRepository | Reglas de negocio para reservar un asiento |
| Ventas | VentasController | ConfirmarVentaUseCase | VentaRepository Puerto | PostgresVentaRepository | Orquesta la confirmación de la venta |
| Cancelaciones | CancelacionesController | CancelarBoletoUseCase | AuditoriaRepository Puerto | PostgresAuditoriaRepository | Cancela con trazabilidad inmutable (auditoría) |
| Confitería | ConfiteriaController | GestionarConfiteriaUseCase | ConfiteriaRepository Puerto | PostgresConfiteriaRepository | Administra la confitería |
| Reportes | ReportesController | GenerarReporteUseCase | ReportesRepository Puerto | PostgresReportesRepository | Genera reportes administrativos |

## 3. Qué se dejó afuera a propósito y Observación

**Qué dejamos afuera:** documentamos el diseño que asumimos, no una
implementación futura. Por eso omitimos:

- **Otros sistemas externos:** solo modelamos el correo electrónico y la
  pasarela de pagos; no incluimos ningún otro servicio externo.
- **Microservicios:** el backend se modela como un único contenedor (API REST
  monolítica modular), no como servicios separados.
- **Infraestructura no definida:** caché, cola de mensajes, balanceador de
  carga y despliegue; el diseño no los contempla.
- **Detalle interno de la SPA:** la Aplicación Web se modela como un solo
  contenedor, sin descomponerla en componentes.
- **Relaciones de componentes con sistemas externos:** las llamadas al correo y
  a la pasarela de pagos se modelan solo a nivel de contenedor (API Backend),
  no desde un componente específico.

**Observación crítica del equipo:** al armar el diagrama de componentes vimos
dos puntos delicados del diseño.

El primero está en **Reservas** y **Ventas**. Son los módulos que más cuidado
necesitan, porque si dos clientes intentan reservar el mismo asiento al mismo
tiempo, solo uno debe lograrlo. Entre estos módulos y la base de datos no
pusimos nada más (ni caché ni colas), así que evitar que un asiento se venda
dos veces depende de que esa parte quede bien programada.

El segundo es **Infra Compartida (db.ts / pg.Pool)**. Todos los módulos
guardan y leen datos pasando por ese mismo componente, por lo que si falla o se
queda corto, afecta a todo el sistema.

No es un error del modelo: así quedó el diseño que asumimos, y por eso lo
dejamos señalado.