# Bitácora de uso de IA — Semana 03 / Laboratorio 03

## 1. Contexto y objetivo

- **Actividad:** «Tu sistema en C4, como código».
- **Sesión:** 19 de septiembre de 2026.
- **Fecha de revisión:** 23 de septiembre de 2026.
- **Equipo:** Equipo 1.
- **Sistema:** CineStar-Barrio, denominado también Lumiere.
- **Herramienta:** ChatGPT / Codex.

El objetivo fue revisar la documentación del modelo C4 y utilizar la IA como apoyo para identificar inconsistencias y preparar la bitácora de la semana.

El proyecto actual consiste en mejorar un sistema anterior. El modelo C4 de esta actividad corresponde al **proyecto original, antes del cambio de stack**.

## 2. Documentos y evidencias revisados

- Guía del Laboratorio 03.
- `README.md`.
- `docs/ficha-del-sistema.md`.
- `docs/escenarios.md`.
- `docs/c4-modelo.md`.
- `docs/c4/workspace.dsl`.
- `docs/c4/leyenda.md`.
- `docs/c4/docker-compose.yml`.
- `feedback.md`.


## 3. Consulta a la IA

### 3.1. Prompt para revisar y traducir el modelo del equipo

**Nota:** el siguiente prompt es una reconstrucción propuesta para su uso y validación por el equipo; no es una transcripción de una consulta original conservada.

> Somos el Equipo 1 y estamos trabajando en el modelo C4 de CineStar-Barrio para el Laboratorio 03. Nuestro proyecto busca mejorar un sistema anterior, pero esta actividad representa el sistema original, antes del cambio de stack. No utilices la nueva implementación de `lumiereApp/` para reemplazar las tecnologías o el alcance del original.
>
> Ya contamos con una propuesta de contexto, contenedores y componentes, junto con una leyenda de responsabilidades. En el modelo identificamos a Operador y Administrador; las terminales de Taquilla y Administración; el Servidor de Aplicación; y los esquemas Operativo y Administrativo/Auditoría en Oracle 21c XE.
>
> Para el Servidor de Aplicación propusimos ocho responsabilidades: Autenticación y Autorización, Cartelera y Funciones, Salas y Asientos, Reservas y Ventas, Cancelaciones, Consultas, Reportes y Auditoría / Logging.
>
> Queremos revisar esta propuesta y su expresión en Structurizr DSL, conservando las decisiones del equipo que estén respaldadas por el sistema original.
>
> Revisa `docs/c4/workspace.dsl`, `docs/c4/leyenda.md` y la ficha del sistema con estos objetivos:
>
> 1. Ayúdanos a corregir la sintaxis del DSL y explica los cambios necesarios para representar los tres niveles C4.
> 2. Comprueba que cada nivel mantenga su alcance y que los componentes se agrupen por responsabilidad. Si las dos terminales no tienen evidencia de ser aplicaciones independientes, señálalo antes de modificar su representación.
> 3. Revisa que los nombres y relaciones coincidan con la leyenda, que cada flecha exprese una acción y que las tecnologías y protocolos sean concretos. Cuando falte información del proyecto original, indica qué debemos confirmar; no la inventes.
> 4. Señala contradicciones entre la explicación y el modelo, especialmente en los accesos al Esquema Operativo y las relaciones con Auditoría.
> 5. No agregues caché, colas, balanceadores, servicios externos ni funcionalidades sin respaldo. Tampoco presentes una responsabilidad dibujada como prueba de que ya está implementada.
> 6. Separa las correcciones de sintaxis de las sugerencias de arquitectura. Devuelve los fragmentos de DSL que propones cambiar, su justificación y las preguntas que debe resolver el equipo.
>
> Usaremos tu respuesta como apoyo para revisar nuestro trabajo. La aceptación de los cambios y su contraste con el código original corresponden al equipo. No des por realizadas pruebas, correcciones ni validaciones que no se hayan ejecutado.


## 4. Resultado de la revisión

| Aspecto revisado | Hallazgo | Tratamiento |
|---|---|---|
| Niveles C4 | El DSL contiene las vistas de contexto, contenedores y componentes, con ocho componentes dentro del Servidor de Aplicación. | Se identificó una estructura correspondiente a los tres niveles solicitados. Su existencia no demuestra por sí sola fidelidad al código original. |
| Alcance del sistema | La revisión inicial comparó el modelo original con la nueva implementación. | Se corrigió esta interpretación tras la aclaración del equipo. El contraste debe realizarse con el proyecto anterior al cambio de stack. |
| Tecnologías | El DSL utiliza las etiquetas genéricas «Aplicación cliente» y «Backend». | Se recomienda precisar las tecnologías reales del proyecto original. |
| Separación de terminales | El modelo distingue Terminal de Taquilla y Terminal Administrativa. | Se debe comprobar en el sistema original que corresponden a aplicaciones independientes y no únicamente a pantallas o roles. |
| Acceso al Esquema Operativo | La leyenda atribuye acceso exclusivo a Reservas y Ventas, pero el DSL muestra otros componentes relacionados con ese esquema. | Se identificó una contradicción interna entre la leyenda y el modelo. |
| Relaciones con Auditoría | La leyenda afirma que solo Reservas y Ventas se relaciona con Auditoría, pero Cancelaciones también lo hace. | Se identificó una corrección necesaria en la explicación. |
| Protocolos | Algunas relaciones utilizan «API/TCP» o no precisan el mecanismo de comunicación. | Se recomienda indicar el protocolo o mecanismo real, sin asumir tecnologías no verificadas. |
| Alcance de confitería | La ficha incluye confitería y la leyenda excluye venta de alimentos. | Se requiere aclarar el alcance documental correspondiente al proyecto original. |

## 5. Qué se incorporó y qué se corrigió

### Incorporado en la bitácora

- La identificación de los documentos y evidencias disponibles.
- El prompt propuesto para apoyar la revisión del modelo elaborado por el equipo.
- La aclaración de que el C4 representa el proyecto original.
- Las observaciones del Equipo 3, distinguiéndolas de las aportaciones de la IA.
- Los pendientes que requieren comprobación o decisión del equipo.

### Corrección realizada durante la interacción

La IA interpretó inicialmente las diferencias de stack entre la documentación y `lumiereApp/` como posibles inconsistencias del modelo.

El equipo aclaró que se había realizado un cambio total de stack para el proyecto de mejora y que el C4 correspondía al sistema anterior. A partir de esa aclaración, se corrigió el alcance de la revisión.

Las diferencias con PostgreSQL, el nuevo frontend y las rutas temporales de la nueva implementación dejaron de utilizarse como prueba de errores del modelo original.

### Recomendaciones pendientes de aceptación

- Precisar las tecnologías y protocolos del sistema original.
- Comprobar la separación de las dos aplicaciones cliente.
- Corregir las afirmaciones de acceso exclusivo a datos y auditoría.
- Aclarar el alcance de confitería.
- Contrastar las responsabilidades representadas con el código original.


### Criterios aplicados

- No añadir caché, colas o balanceadores sin evidencia.
- No presentar funcionalidades propuestas como implementaciones comprobadas.
- No atribuir al equipo una consulta histórica que no se conserva.
- No presentar la revisión de IA como sustituto de la revisión cruzada.
- No afirmar que el equipo aceptó o descartó recomendaciones sin confirmación.

## 6. Revisión cruzada — Equipo 3

El feedback proporcionado identifica expresamente al **Equipo 3** como responsable de la revisión.

Sus principales observaciones fueron:

1. Corregir la afirmación de que Reservas y Ventas es el único componente relacionado con Auditoría.
2. Corregir la afirmación de que Reservas y Ventas es el único componente que accede al Esquema Operativo.
3. Retirar el particionamiento de la enumeración de mecanismos intermedios.
4. Revisar cómo se garantiza la ausencia de sobreventa en la persistencia.
5. Considerar los conflictos entre cancelación y reserva.
6. Revisar la expiración de reservas y los cambios de funciones o salas con reservas vigentes.
7. Precisar la cobertura y el comportamiento transaccional de la auditoría.
8. Mejorar las tecnologías, protocolos y descripciones del DSL.
9. Considerar una vista dinámica del escenario de concurrencia.

Las contradicciones entre leyenda y DSL se corroboraron en los archivos revisados. Las alternativas técnicas del feedback requieren evaluación contra el código original y no se presentan como soluciones ya implementadas.

La vista dinámica es una sugerencia adicional a las tres vistas solicitadas por la guía.

Estas observaciones pertenecen al Equipo 3. La IA ayudó a organizarlas y registrarlas, pero no sustituye al equipo revisor.

## 7. Información y evidencias pendientes

1. **Uso original de IA:** confirmar la herramienta, fecha y consulta realmente utilizada para elaborar o corregir el DSL, así como qué se aceptó y qué se modificó. El prompt propuesto no acredita por sí solo esa interacción anterior.
2. **Contraste con el código original:** comprobar las cajas y relaciones del modelo contra la versión anterior al cambio de stack.
3. **Decisiones sobre el feedback:** registrar qué recomendaciones del Equipo 3 se aceptan, corrigen, posponen o descartan y explicar los motivos.
4. **Borrador a mano:** se encontró `docs/c4/imagenes/borrador.jpeg`, pero no se inspeccionó su contenido. Corresponde comprobar que sea la fotografía solicitada y su ubicación respecto de la guía.
5. **Imágenes y sintaxis:** verificar que las tres imágenes correspondan al DSL final. En esta revisión no se ejecutó Structurizr ni se validó el renderizado.
6. **Publicación y entrega:** esta revisión no acredita un commit, push ni el envío individual a UNIVIRTUAL.

## 8. Reflexión

La IA sirvió como apoyo para organizar la documentación y detectar diferencias entre la explicación del sistema y las relaciones del modelo. Sin embargo, su primera interpretación mezcló el proyecto original con la nueva implementación.

La intervención del equipo fue necesaria para precisar el alcance y corregir esa interpretación. Esto muestra que las respuestas de la IA deben contrastarse con el contexto real del proyecto.

El feedback del Equipo 3 permitió identificar contradicciones concretas entre la leyenda y el DSL. El siguiente paso es evaluar esas observaciones contra el código original y registrar las decisiones del equipo. Un diagrama con sintaxis correcta no garantiza que represente fielmente el sistema.
