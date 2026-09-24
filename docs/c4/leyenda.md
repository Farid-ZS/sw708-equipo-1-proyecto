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

## 4. Feedback realizada por otro Grupo (Grupo1)

### Nivel 1 — Contexto

Bien resuelto y minimalista, que es justo lo que un diagrama de contexto debe ser: 2 personas, 3 sistemas externos, 1 sistema principal, relaciones implícitas activadas (`!impliedRelationships true`). No hay ruido visual. Nada que corregir aquí.

### Nivel 2 — Contenedores

Este es el diagrama que más atención necesita.

Con `include *` se agrupan en una sola vista: 2 personas + 3 sistemas externos + 5 contenedores del sistema (frontend, 2 módulos, 3 bases de datos) + ~13 relaciones. Con `autoLayout lr` (izquierda-derecha) y esa cantidad de nodos, Structurizr va a tender a generar líneas largas y cruzadas.

**Problema principal:** la relación

```
sensoresIoT -> dbMonitoreo "Registra posiciones y metricas de activos" "SQL"
```

entra desde afuera del sistema directo a un contenedor interno, sin pasar por ningún módulo del backend. Visualmente esa flecha va a "saltarse" el resto del diagrama y cruzar por encima de otras cajas.

| Modelo actual | Alternativa sugerida |
|---|---|
| `sensoresIoT -> dbMonitoreo` (salta el backend) | `sensoresIoT -> vigilanciaSensores -> dbMonitoreo` (pasa por el componente que ya existe para esto) |

Si en el código el sensor realmente escribe directo a Postgres, vale la pena confirmarlo — es poco común y rompe la convención C4 de que un sistema externo interactúa con el sistema a través de uno de sus contenedores.

**Otros puntos sobre esta vista:**

- **Demasiadas relaciones en una sola vista.** Con 13+ flechas entrando y saliendo de las 3 bases de datos, el diagrama se va a leer denso. Considera una vista adicional solo de "flujo de aplicación" (personas → frontend → módulos → sistemas externos, sin las bases de datos) y dejar el acceso a datos como detalle aparte.
- **Probar `autoLayout tb`** (top-bottom) en vez de `lr` para esta vista. Con personas arriba, frontend debajo, módulos debajo de eso y bases de datos al final, el flujo natural es vertical — normalmente da menos cruces que forzar todo de izquierda a derecha con 10 nodos.
- `dbShared` recibe flechas de ambos módulos backend desde direcciones distintas; si Structurizr lo dibuja feo, se puede fijar su posición manualmente en el centro-abajo para que ambas flechas entren limpias.

### Nivel 3 — Componentes (Módulo de Monitoreo)

Los 6 componentes son claros y están bien delimitados por responsabilidad. El único riesgo visual: 5 de los 6 componentes apuntan a `dbMonitoreo`, generando un patrón de "abanico" convergiendo en una sola caja.

Es aceptable en un diagrama de componentes (refleja lo que realmente pasa en el código), pero si se ve muy saturado al renderizarlo en Structurizr, vale la pena evaluar si conviene aceptar el abanico tal cual (es honesto con el código) o buscar una forma de agrupar visualmente esas líneas.

### Notación y estilo (bien logrado)

- Los colores siguen la convención C4 estándar: persona en azul oscuro, sistema externo en gris, contenedor en azul medio, componente en azul claro, base de datos en verde con forma de cilindro. Consistente y fácil de leer.
- El uso de la forma `Cylinder` para las bases de datos es el detalle correcto que mucha gente olvida — ayuda a diferenciar contenedores de aplicación vs. de datos de un vistazo.

### Resumen accionable

El **modelo** (contenido) está sólido. El ajuste pendiente es de **legibilidad visual**:

1. Separar la vista de contenedores en 2: flujo de aplicación / acceso a datos.
2. Probar `autoLayout tb` en el diagrama de contenedores.
3. Decidir qué hacer con la flecha directa `sensoresIoT -> dbMonitoreo` que cruza el diagrama (¿es real en el código, o debería pasar por `vigilanciaSensores`?).