# Bitácora de uso de IA — Laboratorio 12

## 1. Contexto y objetivo

- **Sistema:** Lumiere, sistema de gestión de cines.
- **Equipo:** Equipo 1.
- **Fecha:** 25/11/2026.
- **Herramientas identificadas:** ChatGPT y GitHub Copilot.
- **Actividad:** medición de rendimiento, identificación del cuello de
  botella y evaluación de una mejora.

Se revisaron el escenario de calidad E6, la hipótesis de rendimiento,
el script de carga de k6, la configuración de Docker Compose, el
dominio de Reservas, las restricciones de PostgreSQL y el
[informe de mediciones](mediciones/informe.md).

También se consideraron los siguientes aportes del equipo:

- [PR #57](https://github.com/Farid-ZS/sw708-equipo-1-proyecto/pull/57):
  hipótesis de rendimiento.
- [PR #58](https://github.com/Farid-ZS/sw708-equipo-1-proyecto/pull/58):
  escenario de carga y mediciones iniciales.
- [PR #59](https://github.com/Farid-ZS/sw708-equipo-1-proyecto/pull/59):
  eliminación de la consulta previa de reservas.
- [PR #61](https://github.com/Farid-ZS/sw708-equipo-1-proyecto/pull/61):
  diagnóstico del cuello de botella.
- [Issue #62](https://github.com/Farid-ZS/sw708-equipo-1-proyecto/issues/62):
  remedición y cierre del informe.

La IA sirvió como apoyo para revisar las decisiones técnicas,
organizar las pruebas, generar comandos y documentar los resultados.
Las mediciones se realizaron sobre el sistema contenerizado del
laboratorio anterior.

## 2. Consultas realizadas y alcance

Las preguntas de los pasos 01 al 05 representan los aspectos
abordados en la revisión técnica de los aportes del equipo, no una
transcripción literal de las conversaciones individuales con IA.
Las consultas del Paso 06 corresponden al trabajo realizado con
ChatGPT durante la remedición.

### Paso 01. Escritura de la hipótesis

La hipótesis fue elaborada previamente por el integrante responsable.
La revisión posterior se centró en la siguiente pregunta:

> ¿Qué indicadores permiten comprobar o refutar que el pool de
> conexiones de PostgreSQL es el principal cuello de botella?

La IA no debe intervenir en la formulación inicial de la hipótesis,
de acuerdo con las restricciones del laboratorio.

### Paso 02. Escenario de carga

> ¿Cómo representar el escenario de rendimiento E6 mediante k6,
> utilizando usuarios concurrentes, un umbral de p95 y métricas
> que distingan las respuestas de negocio de los errores técnicos?

### Paso 03. Medición del Antes

> ¿Cómo obtener una línea base reproducible mediante tres corridas
> consecutivas y evitar que las reservas anteriores produzcan
> respuestas 409 en lugar de medir el registro completo?

### Paso 04. Identificación del cuello de botella

> ¿Cómo relacionar las métricas de CPU, memoria, conexiones de
> PostgreSQL y EXPLAIN ANALYZE con la latencia y el throughput
> observados durante las pruebas de carga?

### Paso 05. Aplicación de una sola mejora

> ¿Qué efecto tiene eliminar la consulta SELECT previa a una reserva
> y delegar la detección de conflictos a la restricción de unicidad
> de PostgreSQL?

El commit original de la mejora registra la participación de
GitHub Copilot como coautor.

### Paso 06. Remedición y comparación

> ¿Cómo ejecutar el mismo escenario de k6 mediante Docker en
> Windows, guardar las evidencias y comparar los resultados
> posteriores a la mejora?

> ¿Es válido comparar mediciones obtenidas en máquinas diferentes
> y cómo se puede reproducir la línea base sin modificar la rama
> de trabajo?

> ¿Cómo interpretar una reducción del p95 y un aumento del
> throughput cuando también aumenta la tasa de errores HTTP 5xx?

## 3. Resumen de las respuestas de la IA

La revisión técnica relacionó el escenario de rendimiento E6 con
el endpoint `POST /api/reservas`, debido a que esta operación
representa una interacción real entre la aplicación y PostgreSQL.

El escenario de carga utiliza 100 usuarios virtuales constantes,
30 segundos de duración y una pausa de 20 ms entre iteraciones.
El script registra la latencia p95, el throughput, las respuestas
exitosas, los conflictos de negocio y los errores técnicos.

La generación de identificadores diferentes por corrida y usuario
permite evitar conflictos de asientos que impedirían medir el flujo
completo de creación de reservas.

El diagnóstico previo mostró que el throughput dejaba de crecer
al aumentar la concurrencia, mientras que el proceso Node.js
presentaba un uso elevado de CPU y PostgreSQL conservaba margen
en las conexiones observadas.

La mejora eliminó el SELECT previo y delegó la detección de
conflictos a la restricción de unicidad de PostgreSQL.

Durante el Paso 06, ChatGPT proporcionó comandos PowerShell para
ejecutar k6 mediante Docker, almacenar las evidencias JSON y TXT
y extraer las métricas de las corridas.

También se identificó que la línea base original y la remedición
se habían realizado en máquinas diferentes. Se propuso recuperar
la versión anterior mediante `git worktree` y repetir las
mediciones en la misma máquina.

La comparación local mostró una reducción aproximada del 13 %
en el p95 y un incremento del 17,45 % en el throughput. Sin
embargo, también se observó un aumento de los errores HTTP 5xx,
por lo que el cumplimiento del escenario E6 no fue completo.

## 4. Revisión de las recomendaciones

| Paso | Recomendación o aspecto revisado con IA | Revisión técnica | Resultado |
|---|---|---|---|
| 01 | Contrastar la hipótesis mediante indicadores verificables. | Se revisó la hipótesis después de su elaboración y se comparó con las mediciones disponibles. | La hipótesis original permanece refutada. |
| 02 | Utilizar k6 con métricas y umbrales relacionados con el escenario E6. | El script registra p95, throughput, respuestas 201, conflictos 409 y errores técnicos. | Escenario de carga disponible en el repositorio. |
| 03 | Ejecutar tres corridas y descartar la primera. | El equipo registró las tres ejecuciones y ajustó la generación de datos para evitar conflictos repetidos. | Línea base de 29,76 ms y 2 810,10 req/s, sin errores. |
| 04 | Contrastar CPU, conexiones y tiempo de consulta. | Las pruebas utilizaron 100, 200 y 600 VUs, docker stats, pg_stat_activity y EXPLAIN ANALYZE. | Node.js fue identificado como el principal candidato a cuello de botella. |
| 05 | Eliminar una consulta redundante y conservar la restricción de unicidad. | El commit `8b20309` incorpora la eliminación del SELECT previo y pruebas de dominio. | Se aplicó una sola mejora funcional de rendimiento. |
| 06 | Reproducir el Antes y el Después bajo condiciones comparables. | Se ejecutaron seis corridas locales y se verificó la igualdad del script mediante SHA256. | Reducción de latencia y aumento de throughput, acompañados de un incremento de errores. |

## 5. Sugerencias aceptadas

Durante la revisión técnica se consideraron adecuados el uso
de k6, la generación de identificadores diferentes por corrida
y usuario virtual, el descarte de la primera ejecución y la
conservación de las evidencias originales.

Para la remedición se aceptó utilizar la misma versión de k6
(`grafana/k6:1.3.0`), mantener el escenario de 100 VUs durante
30 segundos y ejecutar las pruebas contra el sistema levantado
mediante Docker Compose.

Debido a los conflictos con los puertos 5432 y 5433, se utilizó
el puerto externo 15432 para PostgreSQL, sin modificar la
comunicación interna de los servicios ni el archivo Compose.

También se aceptó reproducir la línea base mediante
`git worktree`, utilizando el commit `6ff0350`, para comparar
las versiones anterior y posterior a la mejora en la misma
máquina.

Se comprobó mediante SHA256 que ambas versiones utilizaban
exactamente el mismo script de carga.

Las evidencias fueron organizadas en
[`docs/evidencias/semana-12/`](evidencias/semana-12/),
siguiendo la estructura utilizada por el equipo en el
laboratorio anterior.

## 6. Sugerencias descartadas o matizadas

| Sugerencia o alternativa | Decisión | Motivo |
|---|---|---|
| Modificar la hipótesis después de conocer los resultados. | Descartada. | La hipótesis debe conservarse para contrastar la predicción con los resultados reales. |
| Utilizar un endpoint que no consulte PostgreSQL. | Descartada como alternativa de medición. | Los endpoints que funcionan como stubs no representan el flujo completo de reserva. |
| Reutilizar los mismos identificadores entre corridas. | Descartada en el escenario de carga. | Generaría conflictos 409 y alteraría el trabajo realizado por cada petición. |
| Aumentar el tamaño del pool de conexiones. | Alternativa no adoptada. | Las muestras disponibles no mostraron saturación completa del pool. |
| Aplicar varias optimizaciones simultáneamente. | Descartada. | El laboratorio exige aislar el efecto de una sola mejora. |
| Comparar directamente el Antes en Linux con el Después en Windows. | Descartada como evidencia causal suficiente. | Las diferencias de hardware, sistema operativo y red afectan los resultados. |
| Utilizar la primera corrida en el promedio final. | Descartada. | Se mantiene el protocolo de calentamiento establecido por el equipo. |
| Considerar los umbrales de k6 como prueba del cumplimiento completo de E6. | Matizada. | El script admite menos del 1 % de errores técnicos, mientras que E6 exige ausencia de errores HTTP 5xx. |
| Atribuir los errores 5xx directamente a la eliminación del SELECT. | Descartada como conclusión definitiva. | Los registros disponibles no permitieron identificar la causa específica. |
| Guardar las evidencias en `docs/mediciones/evidencias/despues/`. | Corregida por el integrante responsable. | Se mantuvo la organización del equipo en `docs/evidencias/semana-12/`. |

## 7. Límites y pendientes

La línea base original se obtuvo en una máquina Linux con un
procesador Intel Core Ultra 7 155H, mientras que la remedición
se realizó en Windows con Docker Desktop y un procesador
AMD Ryzen 5 7535HS.

Para reducir esta diferencia se reprodujo la línea base en
la misma máquina utilizada para el Después.

Los resultados de esta comparación fueron:

| Métrica | Antes reproducido | Después |
|---|---:|---:|
| Latencia p95 | 104,30 ms | 90,75 ms |
| Throughput | 986,97 req/s | 1 159,21 req/s |
| Tasa de error técnico | 0,1328 % | 0,3027 % |
| Errores HTTP 5xx | 75 | 211 |
| Carga | 100 VUs, 30 s | 100 VUs, 30 s |

La comparación presenta limitaciones: solo se utilizaron dos
corridas válidas por versión, la versión optimizada se midió
primero y existían otros contenedores PostgreSQL activos durante
las pruebas.

Aunque se utilizaron volúmenes independientes y la misma
generación de datos, los registros acumulados durante las
ejecuciones no fueron idénticos.

Los logs consultados de la aplicación y PostgreSQL no permitieron
identificar la causa de los errores HTTP 5xx.

El escenario E6 cumple el requisito de latencia, pero no el
requisito de ausencia de errores HTTP 5xx. Se propone conservar
provisionalmente la mejora y continuar con la investigación de
los errores y el perfilado del proceso Node.js.

La aceptación definitiva de la mejora queda pendiente de la
revisión del equipo.

No se dispone de las transcripciones individuales completas del
uso de IA de los integrantes 1 al 4. Sus aportes se documentaron
a partir de los cambios registrados, las evidencias del
repositorio y la revisión técnica posterior.

La verificación de integración continua del Pull Request de
cierre queda pendiente de su publicación.

## 8. Reflexión

La IA facilitó la revisión del escenario de carga, la comprensión
de las métricas y la preparación de los comandos necesarios
para reproducir las mediciones.

Uno de los principales aprendizajes fue reconocer que mantener
el mismo número de usuarios virtuales no garantiza por sí solo
una comparación válida, debido a la influencia del hardware,
el sistema operativo y los recursos disponibles.

Asimismo, una mejora en la latencia y el throughput no implica
necesariamente una mejora integral del sistema si también
aumenta la tasa de errores.

La elaboración inicial de la hipótesis, la ejecución de las
pruebas, la revisión de las métricas y las decisiones técnicas
permanecieron bajo responsabilidad de los integrantes.

Las evidencias reales permitieron distinguir las predicciones
de los resultados observados y reconocer las limitaciones
del experimento sin modificar la hipótesis original.