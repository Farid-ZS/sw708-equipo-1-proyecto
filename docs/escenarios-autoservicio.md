# Escenarios adicionales de calidad — Autoservicio del cliente

Estos escenarios complementan los cinco escenarios existentes de `docs/escenarios.md`. Se enfocan en acciones que el cliente puede realizar sin intervención de un vendedor y no repiten la concurrencia de ventas, la cancelación administrativa, los permisos de administrador, la usabilidad del vendedor ni la recuperación ante caídas.

## 6 — Consultar la cartelera por cuenta propia - Autoservicio de información

- **Fuente:** Cliente que desea elegir una película y una función.
- **Estímulo:** Consulta la cartelera y aplica filtros por película, fecha o función disponible.
- **Artefacto:** Interfaz pública de cartelera y servicio de consulta de funciones.
- **Entorno:** Cartelera publicada y varios clientes consultando el sistema al mismo tiempo.
- **Respuesta:** El sistema muestra únicamente funciones vigentes, con película, fecha, hora, sala y disponibilidad de butacas; el cliente puede consultar la información sin ayuda de un empleado.
- **Medida:** En 100 consultas de cartelera, las 100 responden en menos de 2 segundos y ninguna muestra una función vencida o inexistente.

## 7 — Recuperar la entrada digital - Autoservicio de comprobante

- **Fuente:** Cliente que ya tiene una compra confirmada.
- **Estímulo:** Solicita consultar o descargar nuevamente su entrada utilizando el identificador de la compra.
- **Artefacto:** Módulo de consulta de compras y generador de comprobantes digitales.
- **Entorno:** La compra existe y el cliente accede desde un navegador sin intervención de taquilla.
- **Respuesta:** El sistema valida la compra y permite visualizar o descargar el comprobante correspondiente, sin crear una venta nueva ni modificar la reserva original.
- **Medida:** En 100 consultas de compras válidas, las 100 muestran el comprobante correcto en menos de 3 segundos; 0 consultas generan una venta duplicada o muestran datos de otra compra.

## 8 — Consultar el estado de una compra - Autoservicio de seguimiento

- **Fuente:** Cliente con una compra confirmada o en proceso.
- **Estímulo:** Consulta el estado de su operación mediante el identificador proporcionado por el sistema.
- **Artefacto:** Módulo de consulta de estado de compra y registro de ventas.
- **Entorno:** Existen compras confirmadas y operaciones que no llegaron a completarse.
- **Respuesta:** El sistema informa si la operación está confirmada, pendiente o no completada, sin exponer compras de otros clientes y sin permitir que la consulta cambie el estado de la operación.
- **Medida:** En 100 consultas con identificadores válidos, las 100 devuelven el estado correspondiente; 0 consultas permiten acceder a datos de otra compra y 0 consultas modifican una venta.

## 9 — Obtener información de una función antes de asistir - Autoservicio de consulta

- **Fuente:** Cliente que necesita conocer los detalles de una función antes de decidir su visita.
- **Estímulo:** Selecciona una función de la cartelera para consultar sus datos disponibles.
- **Artefacto:** Vista pública de detalle de la función.
- **Entorno:** La función está publicada en la cartelera y el cliente no ha iniciado una venta.
- **Respuesta:** El sistema presenta la información disponible de la película, la clasificación por edad, la sala, la fecha y la hora, sin requerir asistencia del personal.
- **Medida:** En 100 consultas de funciones publicadas, las 100 muestran la información completa registrada y ninguna permite seleccionar una tarifa incompatible con la clasificación de la película.

## Justificación de no superposición

- No se prueba la venta simultánea de un asiento: eso pertenece al escenario 1.
- No se prueba la cancelación realizada por un empleado ni su auditoría: eso pertenece al escenario 2.
- No se prueban funciones administrativas ni permisos de empleados: eso pertenece al escenario 3.
- No se mide la rapidez de venta del vendedor ni su cantidad de clics: eso pertenece al escenario 4.
- No se provoca una caída ni se mide la recuperación del sistema: eso pertenece al escenario 5.

Los escenarios 6 a 9 se limitan a consulta y autoservicio posterior a una compra, por lo que no establecen nuevos criterios sobre concurrencia, autorización administrativa, cancelación, rendimiento del flujo de venta ni disponibilidad ante fallos.
