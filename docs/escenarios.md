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

## Tabla de priorización actualizada

| #   | Escenario                                      | Tipo                        | Impacto | Dificultad | Prioridad |
| --- | ---------------------------------------------- | --------------------------- | ------- | ---------- | --------- |
| 1   | Dos vendedores venden el mismo asiento         | Concurrencia / integridad   | Alto    | Alta       | P0        |
| 2   | Cancelación con registro                       | Auditoría / trazabilidad    | Alto    | Media      | P1        |
| 3   | Solo administradores en administración         | Seguridad de acceso         | Alto    | Baja       | P1        |
| 5   | El sistema se cae durante la jornada           | Disponibilidad              | Alto    | Media      | P1        |
| 6   | Consultar la cartelera por cuenta propia       | Autoservicio de información | Alto    | Baja       | P2        |
| 4   | Vender rápido con el mapa de asientos          | Usabilidad                  | Medio   | Baja       | P2        |
| 7   | Recuperar la entrada digital                   | Autoservicio de comprobante | Medio   | Baja       | P2        |
| 8   | Consultar el estado de una compra              | Autoservicio de seguimiento | Medio   | Baja       | P3        |
| 9   | Obtener información de una función antes de... | Autoservicio de consulta    | Medio   | Baja       | P3        |

### Justificación del orden

El escenario 1 se mantiene como el P0 indiscutible. Si la concurrencia falla y hay sobreventa, la viabilidad del proyecto se ve comprometida porque no resuelve el problema principal del negocio.

En el nivel P1 se agrupan los requisitos críticos para proteger la operación: la auditoría (2), la seguridad de acceso (3) y la disponibilidad (5). Estos protegen la operación diaria. Un sistema caído en horas pico o un cajero borrando ventas sin dejar rastro reproduce exactamente el caos que Lumiere quiere evitar. Aunque son críticos, el de acceso (3) es un quick win por su baja dificultad.

Para el bloque P2 agrupamos las funcionalidades de interacción directa y ágil: vender rápido en taquilla (4), consultar la cartelera (6) y recuperar la entrada digital (7). Son vitales para que el cine despache rápido y se eviten las colas inmensas. Estos escenarios garantizan la fluidez en el servicio al cliente, pero dependen de la estabilidad y seguridad proporcionada por los niveles P0 y P1.

Finalmente, en P3 dejamos el seguimiento del estado de compra (8) y la consulta detallada antes de asistir (9). Son características excelentes para redondear la experiencia del cliente y darle autonomía, pero si el equipo necesita priorizar tiempos de entrega para salir a producción, el negocio puede sobrevivir la primera semana de estreno sin ellos.

## Revisión de escenarios de calidad — Grupo N° 4

Defecto que cruza los 5 escenarios

Ninguno nombra el instrumento. Las medidas están numéricamente bien construidas (número + unidad + condición, que es justo lo que pide la guía), pero la pregunta de la crítica cruzada es literal: ¿con qué instrumento concreto se mide esto, y quién lo va a correr? Aquí no hay un solo k6, pytest, chaos script, OWASP ZAP ni nada. Comparado con el ejemplo de ComedorUNI (que sí nombra k6, toxiproxy, pip-audit), esto es la diferencia entre "sabemos qué queremos medir" y "sabemos cómo lo vamos a medir". Se corrige rápido, pero hay que corregirlo en los 5, no en uno.

Por escenario

1 — Doble venta (Concurrencia). El mejor de los cinco. La medida es agresiva y correcta (1000 intentos, 1 venta, 0 duplicados). Lo único que falta: el mecanismo. "El artefacto es el programa y la BD" no dice si la solución es un lock optimista, un SELECT ... FOR UPDATE, o una unique constraint. Sin nombrar el mecanismo, no sabes si el equipo sabe cómo van a lograrlo o solo qué quieren que pase. Instrumento sugerido: script de carga (k6/locust) disparando 1000 requests concurrentes al mismo asiento, verificado con un SELECT COUNT(\*) agrupado por asiento+función en la BD.

2 — Cancelación con auditoría. Tiene un problema de diseño, no de redacción: mezcla dos atributos de calidad en un solo escenario. "0 registros alterables" es integridad/auditoría (no-repudio). "Buscar el historial en <1s" es eficiencia de desempeño. Son dos exigencias distintas con dos instrumentos distintos (uno se prueba intentando un UPDATE/DELETE contra la tabla de auditoría y esperando rechazo; el otro se prueba con una query de performance). Yo lo partiría en dos escenarios, o sacaría la métrica de tiempo y la dejaría 100% enfocada en inmutabilidad. Instrumento para lo que sí es el foco: intentar UPDATE/DELETE directo sobre la tabla de auditoría (vía API y vía SQL directo) y confirmar que la BD lo rechaza (tabla append-only, o REVOKE UPDATE, DELETE a nivel de rol).

3 — Solo administradores. Este es el que más me preocupa como el "de seguridad de verdad". "Intenta usar funciones de administrador" es ambiguo entre intenta hacer clic en la UI y intenta llamar al endpoint directo con Postman/curl. Si el control solo vive en el frontend (ocultar botones), esto no pasa la prueba de seguridad real — cualquiera con el token de un vendedor común puede pegarle al endpoint admin directo. El escenario tiene que decir explícitamente que el ataque es a nivel de API, no de UI. Instrumento: colección de requests (Postman/Newman o script con requests) golpeando cada endpoint administrativo con un JWT de rol no-admin, esperando 401/403 en el 100% de los casos, corrida en CI en cada deploy — no a mano.

4 — Venta rápida (Usabilidad). El mejor definido en términos de persona ("vendedor nuevo con poco entrenamiento" — eso es exactamente cómo se escribe un escenario de usabilidad, con el perfil del usuario real). Un solo hueco: "1 error por cada 20 ventas" no dice qué cuenta como error (¿vendedor le da clic al asiento equivocado? ¿el sistema no le avisa que ya estaba ocupado?). Sin esa definición, dos personas midiendo el mismo test cuentan errores distintos. Instrumento: sesión de test de usabilidad con N vendedores nuevos, tareas guionadas, grabación de pantalla, conteo de clics por evento instrumentado en el frontend.

5 — Caída del sistema (Disponibilidad). Ojo con lo que en realidad están prometiendo: "se recupera en menos de 60 segundos" describe tiempo de reinicio, no alta disponibilidad. Si el servidor es un solo nodo y la recuperación es "se reinicia y ya", eso es tolerable para un cine (no es un sistema crítico de vida o muerte), pero hay que ser honestos en la ficha: esto es recuperación ante falla, no redundancia activa. Si de verdad hay un balanceador con instancia de respaldo, dilo explícito en el artefacto. Instrumento: chaos test tipo kill -9/docker stop sobre el proceso, con un probe de salud (/health) cada segundo midiendo tiempo de recuperación, y un script de reconciliación que compare el estado de asientos antes/después.

Sobre la tabla de priorización

Está bien pensada — me gusta la columna "Tipo" que agregaron, eso no lo tenía el ejemplo de referencia. Pero el profesor es explícito: "decir que todo es importante equivale a no haber priorizado", y aquí 3 de 5 escenarios comparten P1. El párrafo de abajo sí los desempata en prosa (auditoría, luego acceso por ser quick-win, luego disponibilidad), pero eso debería reflejarse en la tabla con un rango único 1–5, no solo en el texto. Si el profesor pide la tabla como evidencia y alguien la lee sin el párrafo, ve tres empates.

Veredicto tipo crítica cruzada

Si yo fuera el equipo que revisa esto en clase: Escenario 1 pasa. Escenarios 2, 3, 4 y 5 no pasan tal cual están — no porque las medidas estén mal pensadas, sino porque ninguno nombra el instrumento y quién lo corre, que es literalmente la única pregunta que hace la guía. Es una corrección rápida (agregar una frase de instrumento a cada uno), pero es la que tumba escenarios en el paso 04.
