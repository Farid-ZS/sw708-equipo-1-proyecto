# Escenarios de Calidad — Sistema Lumiere

## 1 — Dos vendedores venden el mismo asiento - Concurrencia e integridad de datos

- **Fuente:** Dos empleados: uno en taquilla y otro por teléfono.
- **Estímulo:** Al mismo tiempo quieren vender el mismo asiento de la misma función.
- **Artefacto:** El programa que tramita reservas y la base de datos de asientos.
- **Entorno:** Cine lleno, varios clientes esperando, los dos canales trabajando.
- **Respuesta:** Solo uno logra venderlo; el otro recibe el aviso "asiento ocupado" y no se guarda nada a medias.
- **Medida:** En 1000 intentos simultáneos por el mismo asiento: exactamente 1 venta y 999 avisos; el asiento nunca aparece vendido dos veces.

## 2 — Cancelación con registro - Auditoría / trazabilidad

- **Fuente:** Empleado de taquilla que cancela una reserva.
- **Estímulo:** Cancela un boleto y escribe un motivo.
- **Artefacto:** El módulo de cancelaciones y el registro de auditoría.
- **Entorno:** Cine funcionando normal; después el empleado intenta borrar o cambiar lo registrado.
- **Respuesta:** El sistema guarda quién canceló, cuándo, qué boleto y qué asientos quedaron libres; los asientos se liberan de inmediato y el empleado no puede modificar ni borrar ese registro.
- **Medida:** El 100% de las cancelaciones queda con empleado y fecha; 0 registros que el empleado pueda alterar; buscar el historial de un boleto tarda menos de 1 segundo.

## 3 — Solo administradores en la parte de administración - Seguridad de acceso

- **Fuente:** Una persona sin usuario, o un vendedor común.
- **Estímulo:** Intenta usar funciones de administrador: crear película, función o sala.
- **Artefacto:** El sistema de acceso y permisos del programa.
- **Entorno:** Cine operando normal, acceso desde cualquier computadora.
- **Respuesta:** El sistema lo rechaza y no le muestra ni le permite nada de administrador.
- **Medida:** De 100 intentos sin permiso, los 100 son rechazados y ninguno modifica la cartelera.

## 4 — Vender rápido con el mapa de asientos - Usabilidad

- **Fuente:** Vendedor de taquilla con muchos clientes esperando.
- **Estímulo:** Tiene que vender boletos para una función.
- **Artefacto:** La pantalla del vendedor con el mapa de asientos.
- **Entorno:** Cine lleno, vendedor nuevo con poco entrenamiento.
- **Respuesta:** La venta se hace en pocos pasos mirando el mapa, sin verificar a mano si hay lugar.
- **Medida:** Cada venta en menos de 5 clics y menos de 60 segundos; solo 1 error por cada 20 ventas; el mapa siempre muestra si el asiento está libre, ocupado o reservado.

## 5 — El sistema se cae durante la jornada - Disponibilidad

- **Fuente:** El servidor del sistema se apaga o se reinicia.
- **Estímulo:** El programa se interrumpe mientras hay ventas en curso.
- **Artefacto:** El servidor de la aplicación y la base de datos.
- **Entorno:** Cine lleno, ventas activas al momento de la caída.
- **Respuesta:** Las ventas ya confirmadas se conservan; las que estaban a medias se descartan sin dejar asientos ocupados por error, y el sistema vuelve a funcionar.
- **Medida:** Se recupera en menos de 60 segundos; se conservan todas las ventas confirmadas; ningún asiento queda en un estado raro.

## Tabla de priorización

| # | Escenario | Tipo | Impacto | Dificultad | Prioridad |
|---|-----------|------|---------|------------|-----------|
| 1 | Dos vendedores venden el mismo asiento | Concurrencia / integridad | Alto | Alta | P0 |
| 2 | Cancelación con registro | Auditoría / trazabilidad | Alto | Media | P1 |
| 3 | Solo administradores en administración | Seguridad de acceso | Alto | Baja | P1 |
| 4 | Vender rápido con el mapa de asientos | Usabilidad | Medio | Baja | P2 |
| 5 | El sistema se cae durante la jornada | Disponibilidad | Alto | Media | P1 |

### Justificación del orden

El escenario 1 es el único **P0** porque es la razón de ser del sistema: eliminar la sobreventa es el problema que justifica todo el proyecto, así que sin él los demás escenarios pierden sentido.

Le siguen en prioridad **P1** los tres que protegen la operación:

- La **auditoría** (permite confiar en las cancelaciones y responder ante reclamos).
- El **control de acceso** (evita usos indebidos del módulo administrativo).
- La **disponibilidad** (un sistema caído en horas pico reproduce exactamente el problema original de atención manual).

Aunque los tres son P1, el de acceso es de dificultad baja, por lo que conviene implementarlo temprano como *"quick win"*.

La **usabilidad** queda en **P2** porque no bloquea la operación: un sistema correcto pero algo menos cómodo sigue vendiendo entradas, y la mejora se afina mejor con feedback real de los vendedores de taquilla.