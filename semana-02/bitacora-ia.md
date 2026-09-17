Bitácora de uso de IA — Laboratorio 02

## 1. Contexto y objetivo

- **Sistema:** Lumiere, sistema de gestión de cines.
- **Equipo:** Equipo 1.
- **Herramienta:** ChatGPT / Codex.
- **Actividad:** Revisión de los cinco escenarios de calidad y su priorización, correspondiente al paso 05 del laboratorio «Tu sistema y tus escenarios».
- **Documentos revisados:** `docs/ficha-del-sistema.md` y `docs/escenarios.md` de `sw708-equipo-1-proyecto`, junto con la guía del laboratorio proporcionada en la conversación.

Se utilizó la IA para cuestionar si las medidas de los escenarios se pueden comprobar y para identificar ambigüedades. Esta bitácora documenta la revisión de los escenarios existentes; no acredita su elaboración inicial sin IA, la aprobación del profesor ni una crítica cruzada realizada por otro equipo.

## 2. Consulta realizada y alcance

La solicitud textual de esta interacción fue:

> Actúa como revisor crítico de escenarios de calidad de software y como abogado del diablo. Estamos trabajando en Lumiere, un sistema de gestión de cines que permite programar funciones, vender entradas, seleccionar butacas y gestionar confitería.
>
> Revisa la ficha del sistema, los cinco escenarios existentes y su tabla de priorización, usando como criterio la guía del Laboratorio 02 que te proporciono. Tu tarea es cuestionar y mejorar lo que ya escribimos, sin reemplazar las decisiones del equipo.
>
> Para cada escenario:
> 1. Comprueba que tenga fuente, estímulo, artefacto, entorno, respuesta y medida.
> 2. Pregunta: «¿Con qué instrumento concreto se mide esto, y quién lo va a correr?». Indica si el documento permite responder ambas partes.
> 3. Evalúa si la medida especifica un número, una unidad y condiciones reproducibles. Señala términos ambiguos, supuestos y criterios de éxito incompletos.
> 4. Propón un instrumento de medición, un procedimiento breve y el rol que podría ejecutarlo. Si no hay una persona asignada, indica «por designar».
> 5. Emite un veredicto: «pasa» o «requiere ajustes», justifícalo y propone una corrección concreta sin cambiar arbitrariamente los objetivos numéricos.
>
> Después, revisa si el impacto y la dificultad justifican la prioridad de cada escenario. Señala empates o contradicciones entre la tabla y su explicación, y propone un orden explícito de los cinco escenarios para que el equipo lo evalúe.
>
> Presenta el resultado en una tabla con estas columnas: escenario, observación, instrumento y procedimiento, responsable propuesto, veredicto y ajuste recomendado. Finaliza separando las recomendaciones fundamentadas de las sugerencias que requieren validación o conviene descartar, explicando el motivo.
>
> Basa tus observaciones en los documentos proporcionados. No inventes componentes, rutas de API, resultados de pruebas, responsables ni aprobaciones. Distingue lo documentado de lo propuesto y señala cualquier contradicción del stack que afecte las pruebas. No exijas elegir una solución técnica para considerar medible un escenario ni presentes esta revisión como la crítica cruzada de otro equipo.


> ¿Con qué instrumento concreto se mide esto, y quién lo va a correr?

El archivo de escenarios contiene una revisión previa, pero no registra su prompt original ni identifica al equipo revisor. Por ello, no se reproduce un prompt supuesto ni se atribuye esa revisión a una persona o herramienta sin evidencia.

## 3. Resumen de la respuesta de la IA

Los cinco escenarios tienen las seis partes rotuladas: fuente, estímulo, artefacto, entorno, respuesta y medida. Sin embargo, sus bloques originales no identifican instrumentos ni responsables de ejecución. La revisión agregada al final propone herramientas, pero todavía hace falta incorporar un procedimiento concreto en cada escenario.

También se detectaron expresiones que dificultan la medición, como «de inmediato», «1 error» y «estado raro». La tabla incluye impacto, dificultad y prioridad, aunque tres escenarios comparten P1 y el orden de implementación necesita quedar más claro.

## 4. Revisión por escenario

Los instrumentos y responsables siguientes son **propuestas pendientes de validación y asignación por el equipo**. No se ejecutaron pruebas durante esta revisión.

| Escenario | Pregunta planteada por la IA | Instrumento y comprobación propuestos | Responsable propuesto | Ajuste pendiente |
|---|---|---|---|---|
| 1. Evitar la doble venta | ¿Cómo se generan los intentos concurrentes y se verifica que solo una venta se confirma? | Prueba de carga con k6 o Locust sobre la misma función y asiento, más una consulta a la base de datos para contar ventas confirmadas. Registrar éxitos, rechazos por ocupación y errores técnicos por separado. | Integrante encargado de backend y base de datos, por designar. | Definir sincronización de intentos, datos iniciales y criterio de confirmación. No confundir 1000 solicitudes totales con 1000 intentos simultáneos. |
| 2. Cancelación con registro | ¿Cómo se comprueba que la cancelación queda registrada y el empleado no puede alterar la auditoría? | Pruebas de API con Postman/Newman y consultas de verificación de empleado, fecha, motivo, boleto y asientos. Intentar modificaciones con permisos equivalentes a los del actor evaluado. | Integrante encargado de pruebas y permisos, por designar. | Precisar el plazo de liberación de asientos y las condiciones para medir la consulta del historial en menos de un segundo. |
| 3. Acceso administrativo | ¿Se rechazan llamadas directas a la API además de ocultarse los botones? | Colección Postman/Newman con solicitudes sin autenticación y con un usuario vendedor. Comprobar el rechazo y que los datos no cambian. | Integrante encargado de autenticación y autorización, por designar. | Enumerar operaciones administrativas y distribuir los 100 intentos entre los casos definidos. |
| 4. Venta rápida | ¿Qué se considera un error y cómo se cuentan tiempo y clics? | Sesión de usabilidad con tareas guionadas, grabación de pantalla, cronómetro y hoja de observación. | Moderador y observador del equipo, por designar. | Definir cantidad de participantes, entrenamiento, inicio y fin de la tarea, y qué errores se contabilizan. Aclarar si «1 error por cada 20 ventas» significa como máximo uno. |
| 5. Recuperación ante caída | ¿Desde qué momento se cuentan los 60 segundos y cómo se comprueba la consistencia de las ventas? | Detención controlada de un servicio en un entorno de prueba, comprobación periódica de disponibilidad y comparación de ventas y asientos antes y después. | Integrante encargado del entorno y base de datos, por designar. | Precisar qué componente falla, cómo se reinicia y qué estados son inválidos. Verificar una operación de venta después de la recuperación. |

## 5. Sugerencias que se propone aceptar

Estas decisiones corresponden a la propuesta de revisión de esta interacción; el equipo debe ratificarlas e incorporarlas a `docs/escenarios.md`.

- **Añadir instrumento, procedimiento y responsable a cada escenario.** Permite que otra persona reproduzca la medición.
- **Probar la autorización mediante llamadas directas a la API.** La visibilidad de botones no demuestra que las operaciones estén protegidas.
- **Definir error de uso y estado inválido.** Evita que cada evaluador interprete las medidas de forma distinta.
- **Distinguir recuperación de alta disponibilidad.** Recuperarse en menos de 60 segundos no demuestra redundancia ni continuidad durante la caída.
- **Explicitar el orden de los cinco escenarios.** Se propone: concurrencia, auditoría, seguridad de acceso, recuperación y usabilidad, siguiendo el orden principal expuesto en la justificación actual. El equipo debe resolver si adelanta seguridad por su menor dificultad.

## 6. Sugerencias descartadas o matizadas

| Afirmación o sugerencia de la revisión previa | Decisión de esta revisión | Motivo |
|---|---|---|
| El escenario 1 pasa aunque ninguno identifica el instrumento ni quién lo ejecuta. | Descartar ese veredicto. | La guía exige responder ambas preguntas en cada escenario. El primero también necesita ajustes. |
| Es necesario elegir un bloqueo optimista, `SELECT ... FOR UPDATE` o una restricción única para que el escenario sea válido. | Posponer la elección técnica. | El escenario debe expresar una respuesta medible; la guía no exige decidir aquí el mecanismo de implementación. |
| Auditoría y tiempo de consulta obligan a dividir el escenario 2. | Matizar. | Se pueden distinguir las comprobaciones dentro del escenario o acotar su foco. Dividirlo no es una obligación de la guía y alteraría el conjunto de cinco escenarios. |
| Hay que intentar modificar la auditoría mediante SQL directo. | Condicionar al modelo de permisos. | Debe evaluarse con los permisos del actor previsto. Una prueba con privilegios de administrador no representa necesariamente lo que puede hacer un vendedor. |
| La recuperación puede medirse consultando `/health`. | Mantener solo como propuesta. | No se revisó el código ni se comprobó que exista esa ruta. Debe elegirse una comprobación disponible en el sistema real. |

## 7. Límites y pendientes

- No se revisó el código fuente de Lumiere ni se ejecutaron pruebas; las medidas son objetivos, no resultados obtenidos.
- Los cambios propuestos todavía deben incorporarse a los escenarios y asignarse a integrantes concretos.
- El encabezado «Grupo N°» de la revisión previa está incompleto. Debe identificarse al equipo que realmente realizó la crítica cruzada, si la hubo. La revisión de IA no reemplaza esa actividad.
- La ficha menciona PostgreSQL en el stack, pero Oracle XE en las instrucciones de arranque. Es necesario confirmar la base de datos real antes de preparar las consultas de verificación.
- La aprobación del profesor, los cambios versionados y la publicación en GitHub requieren evidencias independientes; esta bitácora no los da por realizados.

## 8. Reflexión

La IA ayudó a convertir medidas generales en preguntas comprobables y a detectar contradicciones en la revisión existente. Su aporte debe contrastarse con la guía y con el sistema real: sugerir una herramienta no demuestra que la prueba exista o que el requisito se cumpla. La selección de prioridades, los responsables y la aceptación final de los cambios corresponden al equipo.
