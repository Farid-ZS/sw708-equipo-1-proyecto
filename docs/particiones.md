# Particiones del sistema Lumiere

Este documento registra la primera partición del sistema. La **Partición A** sigue
la estructura técnica que ya existe en el repositorio. La **Partición B** vuelve a
cortar el sistema por capacidades del negocio y usa los cuatro rastros para
justificar dónde conviene ubicar cada responsabilidad.

## 01. Partición A

### Criterio

La primera partición es técnica: cada módulo se agrupa según la capa en la que
vive y según el tipo de trabajo que realiza. No pretende ser todavía la mejor
partición del negocio; sirve como punto de comparación para la siguiente etapa.

### Frontend web

Esta capa recibe la interacción de los usuarios y presenta el estado del cine.
No debería decidir reglas críticas como si una butaca puede venderse o si dos
funciones se solapan.

- **Layout y navegación:** `Layout`, `Header` y `Footer`.
- **Acceso:** `Acceso`, formularios de inicio de sesión y manejo de sesión.
- **Cartelera:** `Home`, `Peliculas`, `PeliculaDetalle`, `PeliculaCard` y
  `PeliculaCarousel`.
- **Funciones y sedes:** `SedeSelector` y los datos de funciones y sedes.
- **Venta y disponibilidad:** `Poster`, selección de función y componentes que
  muestran la disponibilidad de butacas.
- **Restricciones de presentación:** `Restriccion` y mensajes para condiciones
  como clasificación de edad.
- **Estado compartido:** `context/sedeContext` y `SedeProvider`.

Entrada principal de la capa: acciones y consultas de los usuarios.
Salida principal: solicitudes HTTP a la API y vistas actualizadas.

### Servicios de aplicación y API

Esta capa expone los casos de uso, valida la entrada y coordina las reglas del
negocio con la persistencia. En el repositorio está representada por
`lumiereApp/backend/src` y sus rutas.

- **Autenticación y autorización:** `auth.routes.ts`; valida identidad, roles y
  permisos antes de permitir operaciones administrativas o de taquilla.
- **Cartelera y programación:** `peliculas.routes.ts` y `funciones.routes.ts`;
  consulta películas, crea o modifica funciones y valida las condiciones de
  programación.
- **Salas y butacas:** `salas.routes.ts`; administra salas, disposición y
  capacidad.
- **Reservas y ventas:** `reservas.routes.ts` y `ventas.routes.ts`; inicia la
  reserva o venta, verifica la disponibilidad y coordina la transacción.
- **Cancelaciones:** `cancelaciones.routes.ts`; libera la reserva o boleto y
  debe producir el evento auditable correspondiente.
- **Confitería:** `confiteria.routes.ts`; mantiene la operación de productos de
  confitería separada del cálculo de entradas, aunque pueda participar en una
  venta.
- **Reportes:** `reportes.routes.ts`; consulta ventas, ocupación,
  cancelaciones y registros para entregar información administrativa.
- **Composición de la API:** `app.ts`, `index.ts`, `config.ts` y `db.ts`;
  configuran la aplicación, sus rutas y el acceso a la base de datos.

Entrada principal de la capa: solicitudes del frontend con identidad y datos
del caso de uso. Salida principal: respuestas HTTP y operaciones sobre la base
de datos.

### Persistencia

Esta capa conserva el estado y garantiza integridad, transacciones y
concurrencia. Incluye Oracle, los scripts SQL y los adaptadores que encapsulan
el acceso a los datos.

- **Datos operativos:** películas, funciones, sedes, salas, butacas, reservas,
  ventas y productos de confitería.
- **Datos administrativos:** usuarios, roles y permisos.
- **Auditoría:** usuario responsable, operación, entidad afectada, fecha y
  resultado de operaciones críticas como reservas, ventas y cancelaciones.
- **Reglas de integridad:** unicidad de boletos, consistencia de estados de
  butacas y restricciones que evitan la doble venta.
- **Control de concurrencia:** transacciones y bloqueo de la butaca durante la
  reserva, en línea con el ADR de bloqueo pesimista.

Entrada principal de la capa: comandos y consultas parametrizadas desde los
servicios. Salida principal: datos consistentes, resultados de transacción y
registros de auditoría.

### Flujo técnico resumido

```text
Usuario
  -> Frontend web
  -> API y servicios de aplicación
  -> Persistencia y transacciones
  -> API
  -> Frontend web
```

La regla de esta partición es que el frontend no accede directamente a la base
de datos y la persistencia no conoce componentes visuales. La API funciona como
frontera entre ambas.

## 02. Partición B

### Criterio

La segunda partición corta por capacidades del negocio, no por tecnología. Las
capacidades principales identificadas son **Reservas**, **Cartelera** y
**Auditoría**. Cada una debe poder expresar sus propias reglas, datos y cambios
sin obligar a modificar las otras en cada evolución.

### Capacidad 1: Reservas

Responsabilidad: llevar una butaca desde la disponibilidad hasta una reserva,
venta o cancelación válida, evitando sobreventa.

Incluye:

- consultar disponibilidad por función;
- reservar y vender boletos;
- validar que la butaca no esté ocupada ni reservada en proceso;
- aplicar la transacción y el bloqueo de concurrencia;
- emitir un código único de boleto;
- cancelar y liberar la butaca;
- notificar a Auditoría las operaciones críticas.

Datos propios o bajo su control: función seleccionada, butacas, estado de
ocupación, reservas, ventas y boletos. Se relaciona con Cartelera para conocer
la función y con Auditoría para dejar trazabilidad, pero la decisión de vender
una butaca pertenece a Reservas.

### Capacidad 2: Cartelera

Responsabilidad: definir qué películas se exhiben, en qué sede o sala y en qué
horario.

Incluye:

- administrar películas y su clasificación;
- crear, modificar y consultar funciones;
- asociar una función con una sala;
- validar que no existan solapamientos;
- respetar el margen de limpieza de 30 minutos entre funciones;
- publicar la cartelera que Reservas puede ofrecer.

Datos propios o bajo su control: películas, clasificación, sedes, salas y
funciones. Cartelera no reserva butacas ni registra ventas; entrega a Reservas
la identidad y las condiciones de una función válida.

### Capacidad 3: Auditoría

Responsabilidad: conservar una evidencia confiable de quién hizo qué, sobre qué
entidad y cuándo.

Incluye:

- registrar reservas, ventas y cancelaciones;
- registrar modificaciones administrativas de películas, funciones, salas y
  permisos;
- asociar cada evento con el usuario autenticado y su marca temporal;
- permitir consultas para reportes e investigación de incidentes;
- mantener el registro aunque la interfaz o el flujo que originó el evento
  cambie.

Datos propios o bajo su control: eventos de auditoría, usuario responsable,
operación, entidad afectada, fecha, resultado y, cuando corresponda, detalle
del cambio. Auditoría recibe eventos de Reservas y Cartelera; no decide si una
reserva es válida ni si una función puede programarse.

### Fundamentación con los cuatro rastros

| Rastro | Evidencia observada | Consecuencia para la partición |
| --- | --- | --- |
| **La palabra cambia** | “Reserva”, “función”, “venta”, “cancelación” y “auditoría” no significan lo mismo para taquilla, administración y reportes. “Disponibilidad” es una consulta para el cliente, pero un estado transaccional para Reservas. | Cada capacidad conserva su propio vocabulario y sus reglas. No se crea un módulo genérico que mezcle cartelera, ventas y logs. |
| **Cambian juntas** | Los cambios de bloqueo pesimista, estado de butacas, reservas y boletos suelen pertenecer al mismo flujo. Por otro lado, un cambio en el margen de limpieza afecta programación, y un cambio en el formato de logs afecta Auditoría. | Reservas agrupa la transacción de la butaca y el boleto; Cartelera agrupa película, función y horario; Auditoría agrupa el registro y sus consultas. |
| **Dueño distinto** | Taquilla opera reservas, ventas y cancelaciones; administración configura películas, salas, funciones y permisos; reportes necesita consultar la historia. | El permiso y la responsabilidad de modificar Reservas, Cartelera y Auditoría se asignan a dueños diferentes. Los módulos se comunican mediante casos de uso o eventos, no compartiendo decisiones internas. |
| **Ciclos distintos** | Las reservas responden en tiempo real a la compra y a la concurrencia. La cartelera cambia según la programación administrativa. Auditoría debe conservar registros y se consulta con otra frecuencia, principalmente para reportes o incidentes. | Se separan los ciclos de cambio y consulta. Reservas prioriza consistencia inmediata; Cartelera prioriza programación válida; Auditoría prioriza trazabilidad e inmutabilidad. |

### Fronteras y dependencias

```text
Cartelera --publica función válida--> Reservas
Reservas --emite evento de reserva/venta/cancelación--> Auditoría
Cartelera --emite evento de cambio administrativo--> Auditoría
Reportes --consulta--> Reservas, Cartelera y Auditoría
Autenticación --autoriza operaciones--> Reservas, Cartelera y Auditoría
```

Estas relaciones no convierten las tres capacidades en una sola. Una reserva
necesita una función válida, pero Cartelera no necesita conocer el detalle de
la transacción de la butaca. Auditoría necesita recibir el resultado, pero no
debe duplicar la regla que lo produjo.

### Evidencia que queda en el repositorio

- Este archivo, `docs/particiones.md`, contiene las Particiones A y B.
- La Partición A se contrasta con `docs/c4-modelo.md`, la estructura de
  `lumiereApp/frontend` y las rutas de `lumiereApp/backend/src/routes`.
- La Partición B se sustenta en las reglas de negocio de
  `docs/ficha-del-sistema.md`, los escenarios de calidad y el ADR de bloqueo
  pesimista para reservas.
- El historial reciente muestra cambios específicos de reservas y concurrencia
  separados de cambios de películas y funciones. La existencia de una ruta
  exclusiva de auditoría queda como una decisión pendiente de implementación:
  por ahora es una responsabilidad transversal del backend, no una razón para
  mezclarla con Reservas o Cartelera.