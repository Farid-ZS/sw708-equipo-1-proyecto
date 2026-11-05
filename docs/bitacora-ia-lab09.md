# Bitácora de uso de IA — Laboratorio 09: Particiones y módulos

## 1. Contexto y objetivo

En el Laboratorio 09 de SW708 trabajamos sobre las particiones del sistema Lumiere y su relación con los módulos del build. La guía «Dos particiones, una elegida y la frontera en el build» exige comparar dos formas de organizar el sistema, justificar una elección frente a los escenarios de calidad de la semana 2 y expresar una frontera verificable mediante módulos y reglas de dependencia. Lo que se evalúa es el argumento para descartar la otra partición. Este trabajo corresponde a la sección 9 del informe final.

Esta bitácora reúne el trabajo documentado de identificación de fronteras, comparación, elección, construcción modular y verificación arquitectónica. La revisión corresponde a `develop` en el commit `6c5cc64d49db978c2b820247ec9f64b4fb29122e`. Tomamos como referencia de organización las bitácoras anteriores, especialmente [Laboratorios 04–05](bitacora-ia-lab4-5.md), y como antecedente directo la entrada del Paso 05 en [docs/bitacora-ia.md](bitacora-ia.md).

Distinguimos el sistema heredado, representado con Oracle en su documentación, de la implementación actual en TypeScript, Express y PostgreSQL. Esta última es un monolito modular: extraer un paquete no creó un microservicio ni un despliegue independiente.

## 2. Documentos, archivos y evidencias revisados

| Grupo | Fuentes y alcance |
|---|---|
| Particiones y escenarios | [Particiones A y B](particiones.md), [escenarios de calidad](escenarios.md), [reglas de negocio](reglas-de-negocio.md) y [ficha del sistema](ficha-del-sistema.md). |
| Decisiones arquitectónicas | [ADR-0001](adr/0001-eleccion-estilo-arquitectonico.md), [ADR-0002](adr/0002-adopcion-de-Postgresql.md), [ADR-0003](adr/0003-bloqueo-pesimista-butacas.md) y [ADR-0004](adr/0004-adopcion-typescript-backend.md). |
| Contexto y modelos | [README](../README.md), [informe de arquitectura](arquitectura.md), [C4 heredado](c4/sistema-heredado/leyenda.md) y [C4 actual](c4/sistema-nuevo/leyenda.md). Los modelos describen responsabilidades que no necesariamente están implementadas. |
| Módulos y construcción | [Manifest del backend](../lumiereApp/backend/package.json), [manifest de Reservas](../lumiereApp/backend/packages/reservas/package.json), [configuración del paquete](../lumiereApp/backend/packages/reservas/tsconfig.json), [build del host](../lumiereApp/backend/tsconfig.build.json), lockfile y [ruta de Reservas](../lumiereApp/backend/src/routes/reservas.routes.ts). |
| Límites y CI | [dependency-cruiser](../.dependency-cruiser.cjs), [manifest de la raíz](../package.json), [workflow](../.github/workflows/ci.yml) y capturas de [rojo](evidencias/semana-09/rojo.png), [verde](evidencias/semana-09/verde.png) y [CI verde](evidencias/semana-09/ci-verde.png). |
| Uso de IA y resultados | [Entrada del Paso 05](bitacora-ia.md), [informe del build modular](build-modular-lab09.md), bitácoras de [Lab04–05](bitacora-ia-lab4-5.md) y [Lab06](bitacora-ia-lab6.md), conversación conservada de implementación del Paso 05 e instrucciones de elaboración de esta bitácora. |
| Historial del equipo | Issues #28, #30, #32 y #34; PR #29, #31, #33, #35 y #36; commits identificados en la sección 11. |

Revisamos también el texto completo de la guía «Dos particiones, una elegida y la frontera en el build», facilitado como adjunto en la conversación de trabajo. La guía establece seis pasos: A en papel, B en papel, confrontación por escenarios, elección sustentada, construcción modular y reglas de límites con rojo/verde e integración continua. Los pasos 01–04 se realizan sin abrir el editor y se cierran en el aula. No se encontraron fotografías o registros que acrediten esa ejecución presencial; los documentos versionados conservan sus resultados escritos.

## 3. Uso de IA por paso del laboratorio

### Pasos 01 y 02: particiones e identificación de fronteras

Registramos una partición técnica y otra por capacidades, con sus responsabilidades y cuatro rastros de separación. El aporte aparece en el PR #36 y en el commit `cf87b92`, cuyo autor es Gonzalo Alessandro Albornoz Azurza.

Los archivos permiten revisar la propuesta y su incorporación a `develop`, pero no conservan una consulta de IA asociada a estos pasos. Por ello, atribuimos al integrante la contribución registrada, sin asignarle una herramienta o un prompt que no consta. La integración del PR acredita la incorporación del documento; no demuestra por sí sola cómo se revisó cada sugerencia durante su elaboración.

### Pasos 03 y 04: comparación y elección

Comparamos las alternativas frente a E1 y documentamos qué ganamos, qué perdemos y en qué condiciones cambiaría la decisión. El issue #28 y el PR #29 corresponden a este trabajo. El commit `4387375` identifica a Dino Paul Roel Suazo Zanabria, con usuario `SuazoDino`, como autor de la comparación.

La elección de B está expresada en el documento del equipo y precede a la extracción del workspace. No se conserva un prompt de estos pasos ni un registro de recomendaciones de IA aceptadas o rechazadas. La comparación y su justificación se incorporaron a `develop` mediante el PR #29.

### Paso 05: construcción modular

Carlos Daniel Chavez Oliva, como Arquitecto de Build, solicitó apoyo de Codex para implementar el issue #34. En este paso sí conservamos una consulta explícita y un registro de intervención sobre archivos. El prompt indicó:

> Implementar el Paso 05 del Laboratorio 09: "Partir el build en módulos".

La solicitud posterior precisó el issue #34, la rama `refactor/34-build-modular` y el uso exclusivo de npm workspaces. También exigió respetar la partición B, las reglas funcionales, los ADR y las pruebas, sin push, PR ni merge durante esa intervención.

La guía permite utilizar IA únicamente para la sintaxis del archivo de construcción, una vez decidida la partición en papel. La elección de B ya estaba documentada antes de esta consulta; no se conserva evidencia de su elaboración en papel. Consultamos Codex para revisar la estructura real, configurar manifests y exports, resolver imports y organizar la compilación. Su participación incluyó la generación y modificación de archivos de configuración, el traslado del código de Reservas y la ejecución de verificaciones. No se limitó a una explicación conceptual. La entrada previa de IA y el informe del build detallan ese alcance. El traslado de código, la modificación de imports y la ejecución asistida de verificaciones excedieron el uso de IA para sintaxis que permite la guía. Registramos esa diferencia sin reducir la intervención a una consulta de configuración.

La responsabilidad del Paso 05 corresponde a Carlos. El commit `c0a48df` y el PR #35 registran su entrega e incorporación a `develop`. Los comandos y resultados quedaron registrados durante la sesión asistida; no hay un acta separada de revisión humana de cada archivo. La restricción inicial de no publicar se refiere a esa sesión: el historial posterior sí confirma la integración del PR #35.

### Paso 06: regla de límites y evidencia rojo/verde

El issue #32 pidió añadir la regla al linter, provocar una violación y conservar las capturas roja y verde. El PR #33 incorporó dependency-cruiser, su ejecución en CI y las evidencias. El commit `abe92cd` identifica a Farid Paolo Zamudio Sánchez como autor de esta contribución.

Revisamos la configuración y el contenido de las tres capturas. Existe evidencia del rechazo de una dependencia prohibida y del estado corregido. No encontramos una consulta de IA correspondiente a la implementación de este paso. La declaración de Lab06 de que no se usó asistente pertenece a aquel laboratorio y no permite deducir lo ocurrido en Lab09.

### Consolidación de la bitácora

Para este documento se solicitó a Codex revisar las evidencias de todo el laboratorio, contrastar archivos e historial y redactar una bitácora independiente. La consulta está conservada en la conversación de trabajo. El apoyo incluyó lectura de fuentes, inspección visual de capturas, consulta de issues y PR y redacción del Markdown. El alcance documental no incorpora nuevas pruebas funcionales ni modifica la implementación.

## 4. Particiones A y B y justificación de la elegida

En las secciones 01 y 02 de [particiones.md](particiones.md) presentamos A como un corte técnico —frontend, API y persistencia— y B como un corte por capacidades, principalmente Reservas, Cartelera y Auditoría. Los cuatro rastros justifican la segunda propuesta:

| Rastro | Aplicación documentada |
|---|---|
| La palabra cambia | Reserva, función, disponibilidad y auditoría tienen significados y reglas distintos según la capacidad. |
| Cambian juntas | La butaca y el boleto pertenecen al flujo de reserva; los horarios a programación; el formato y conservación de eventos a auditoría. |
| Dueño distinto | Taquilla opera reservas, administración configura la programación y reportes consulta la historia. Se distinguen responsabilidades sobre las decisiones y los datos. |
| Ciclos distintos | Reservas atiende la compra en tiempo real, Cartelera sigue la programación administrativa y Auditoría conserva información para consultas posteriores. |

Estos rastros constituyen la fundamentación escrita de las fronteras. No se conserva una medición cuantitativa de cambios conjuntos que permita convertir el segundo rastro en un resultado estadístico del historial.

En las secciones 03 y 04, la comparación describe A como monolito con datos compartidos y B como módulos dueños de sus datos. Allí aparecen Reservas, Cartelera/Funciones, Salas, Confitería y Reportes. La conclusión del equipo favorece B por la localización de la regla de asientos, menor acoplamiento de datos y facilidad para probar Reservas de forma aislada.

| Criterio frente a E1 | Razón para elegir B |
|---|---|
| Alcance del cambio | La regla de exclusividad se concentra en Reservas y en la restricción de su tabla. |
| Propiedad de los datos | El adaptador de Reservas concentra la escritura de boletos. |
| Evolución y escalado | La frontera facilita una separación futura; actualmente todos los componentes siguen en el mismo proceso. |
| Pruebas | Dominio, adaptadores y controlador pueden verificarse con contratos y dobles de persistencia. |

La guía pide responder las cuatro preguntas para cada escenario de la semana 2 y revisar las cuatro señales de monolito distribuido. El cuadro conservado responde a E1, pero no incluye una comparación equivalente para los demás escenarios de `docs/escenarios.md`. Tampoco se encontró una revisión explícita de aquellas cuatro señales. La evaluación disponible sustenta la elección frente a E1, pero no acredita la comparación completa requerida.

Aceptamos como costo de esta elección la necesidad de contratos explícitos y de coordinar validaciones entre capacidades. El documento considera que una operación administrativa con baja concurrencia favorecería la simplicidad de A. E1, en cambio, exige evitar la doble reserva y establece una meta de 1 confirmación entre 1000 intentos concurrentes.

La documentación aún no utiliza una única descripción de A ni una lista uniforme de capacidades de B. Conservamos esa diferencia como hallazgo: no equivale a una nueva decisión arquitectónica. Asimismo, las menciones a Oracle y bloqueo pesimista en las primeras secciones no describen el mecanismo actual. Los ADR-0002 y 0003 establecen PostgreSQL y `UNIQUE (funcion_id, asiento)`, con traducción de `23505` a `AsientoOcupadoError`.

## 5. Construcción de módulos y responsabilidades

Materializamos la frontera de Reservas en `lumiereApp/backend/packages/reservas`. Es el único workspace de negocio declarado en el manifest del backend. Las demás capacidades documentadas no se presentan como paquetes ya construidos.

| Pieza | Responsabilidad actual |
|---|---|
| Dominio y puertos | `Boleto`, `BoletoRepository`, `ReservarBoletoUseCase` y errores de negocio; no dependen de Express ni de PostgreSQL. |
| Adaptadores | `InMemoryBoletoRepository` y `PostgresBoletoRepository` implementan el puerto. El segundo recibe el pool y traduce los errores de unicidad. |
| Presentación | `ReservasController` transforma la entrada y el resultado del caso de uso en respuestas HTTP. |
| Host Express | Conserva app, configuración, pool y composición de rutas. Consume el paquete por una dependencia explícita `@lumiere/reservas: 1.0.0`. |

Los exports públicos son `@lumiere/reservas`, `@lumiere/reservas/memoria`, `@lumiere/reservas/postgres` y `@lumiere/reservas/http`. Apuntan a JavaScript compilado y declaraciones de tipos. El build compila primero el paquete y después el host; los hooks de test e inicio preparan el paquete antes de consumirlo.

Mantuvimos `POST /api/reservas`, HTTP 201 para éxito y HTTP 400 para asiento ocupado o datos inválidos. El [DDL existente](../database/lab06_hexagonal/01_create_boletos.sql) conserva la restricción de unicidad. El informe del Paso 05 registra que los cinco archivos trasladados mantuvieron su contenido normalizando saltos de línea.

## 6. Reglas de límites y verificación en build/CI

La regla `dominio-limpio` de dependency-cruiser prohíbe dependencias desde `^src/domain/` hacia `^src/(infrastructure|presentation)/`, con severidad de error. Se ejecuta mediante `npm run lint:arquitectura`, que analiza `src` desde la raíz.

El workflow instala dependencias, prepara la tabla PostgreSQL, ejecuta pruebas, verifica tipos y aplica esa regla. Usa Node 22 y contempla eventos sobre `main` y `develop`. No hay un paso que construya el workspace del backend ni una regla equivalente que cubra su dominio extraído.

La [captura roja](evidencias/semana-09/rojo.png) muestra el rechazo de `src/domain/cinema.ts → src/infrastructure/memoria.ts`: una violación, 10 módulos y 17 dependencias. La [captura verde](evidencias/semana-09/verde.png) muestra cero violaciones, 10 módulos y 16 dependencias. La [captura de CI](evidencias/semana-09/ci-verde.png) muestra un check exitoso de «CI - Tests y Regla de Arquitectura / test (pull_request)».

El Paso 06 exige ampliar la regla activa de la semana 6 con la misma herramienta y demostrar el rechazo de un import prohibido entre módulos. Las capturas disponibles muestran una dependencia entre capas de la rodaja de la raíz; no muestran una violación de la frontera del workspace de Reservas. Además, el commit `abe92cd` retira `.importlinter` e incorpora dependency-cruiser al migrar la rodaja de la raíz de Python a TypeScript. El cambio de lenguaje explica el contexto técnico, pero no acredita el requisito de conservar la herramienta.

Hay, por tanto, evidencia de rojo y verde del control arquitectónico de la raíz. El rojo corresponde al linter, no a una falla del compilador TypeScript ni a una ejecución fallida de GitHub Actions. El comando y la relación prohibida permiten identificar el experimento, pero el diff temporal que introdujo el import no quedó conservado. La captura de CI tampoco muestra un SHA o número de ejecución para vincularla de manera independiente con un run concreto.

## 7. Resultados observados: comandos, errores y correcciones

Los siguientes resultados proceden del [informe del Paso 05](build-modular-lab09.md), de su registro de IA y de las capturas inspeccionadas. En esta revisión documental no volvimos a instalar dependencias ni a ejecutar las suites.

| Comando o comprobación | Resultado registrado |
|---|---|
| Pruebas iniciales del backend, sin dependencias instaladas | 10 pruebas pasaron; el archivo de adaptadores falló por no resolver `pg`. `tsc` tampoco estaba disponible. |
| `npm.cmd install --prefix lumiereApp/backend` y `npm.cmd ci --prefix lumiereApp/backend` | Instalación y enlace local correctos; npm ci instaló 158 paquetes. |
| `npm.cmd ls --prefix lumiereApp/backend @lumiere/reservas` | Paquete enlazado a `./packages/reservas`. |
| `npm.cmd run build --prefix lumiereApp/backend` | Compilación del paquete y del host, con artefactos JavaScript. |
| `npm.cmd run typecheck --prefix lumiereApp/backend` | Correcto después de corregir TS6133 por el import sin uso `afterEach`. |
| `npm.cmd test --prefix lumiereApp/backend`, sin BD de pruebas | 15 pruebas aprobadas y una omisión explícita de PostgreSQL. |
| Mismo comando con `TEST_DATABASE_URL` temporal | 20 pruebas aprobadas, sin fallos ni omisiones. |
| `npm.cmd test` de la raíz con PostgreSQL temporal | 16 pruebas aprobadas, sin omisiones. |
| `npm.cmd run typecheck` y `npm.cmd run lint:arquitectura` de la raíz | Tipos correctos y cero violaciones arquitectónicas. |
| HTTP real sobre el router compilado con memoria | Respuestas 201, 400 por duplicado y 400 por datos incompletos. |
| Dos inserciones concurrentes con PostgreSQL | Una confirmada y otra rechazada como `AsientoOcupadoError`; se comprobó la traducción de `23505`. |

El entorno registrado fue Windows, Node 24.18.0, npm 11.16.0 y PostgreSQL 16 en un contenedor temporal aislado. Se utilizó `npm.cmd` porque la política de PowerShell bloqueaba `npm.ps1`. El import sin uso se sustituyó por `after`, con cierre del pool al terminar las pruebas. Las comprobaciones HTTP y de concurrencia utilizaron scripts ad hoc; no quedaron como nuevas suites versionadas.

Estas verificaciones respaldan la extracción y la conservación del comportamiento de Reservas. El Paso 05 admite comenzar con un solo módulo cuando no alcanza el tiempo; el workspace de Reservas cumple esa condición de construcción, sin que ello complete los restantes requisitos del laboratorio. No constituyen una medición de la carga completa de E1 con 1000 solicitudes.

## 8. Tratamiento de recomendaciones de IA

| Tratamiento | Evidencia y alcance |
|---|---|
| Incorporadas en el Paso 05 | Un workspace funcional, exports compilados, dependencia explícita del host y compilación ordenada. Constan en manifests, scripts y PR #35. |
| Ajustadas durante la implementación asistida | Preparación de declaraciones antes del typecheck del host y corrección del import de pruebas con cierre del pool. Constan en el informe y en el commit `c0a48df`. |
| Decisiones previas respetadas | Partición B, TypeScript, monolito modular y arquitectura hexagonal. Proceden de la documentación del equipo y de los ADR, no de una elección nueva de Codex. |
| Pendientes | Ampliar límites y CI al host y al workspace productivo; figura en el informe del Paso 05 y coincide con las rutas actuales de la configuración. |
| Rechazadas | No se conserva una recomendación concreta de IA rechazada durante Lab09. Las restricciones del prompt, como no introducir Python o microservicios, no prueban que la IA los haya propuesto. |

Para los pasos 01–04 y 06 no contamos con un registro que permita clasificar recomendaciones de IA. Tampoco trasladamos a este laboratorio las consultas históricas de ChatGPT sobre los ADR ni las declaraciones de uso o no uso de laboratorios anteriores.

## 9. Problemas, limitaciones y evidencias pendientes

- No se conservan evidencias del trabajo en papel de los pasos 01–04 ni registros de consultas, herramientas y revisión humana de los pasos distintos del 05. La guía sí está disponible como adjunto de la conversación.
- La comparación cubre E1, pero faltan los cuadros de los demás escenarios y la revisión explícita de las cuatro señales de monolito distribuido.
- El apoyo de Codex registrado en el Paso 05 excedió la sintaxis del archivo de construcción permitida por la guía. Esta diferencia permanece documentada.
- La guía pide registrar el uso semanal en `docs/bitacora-ia.md`. La base revisada contiene allí la entrada del Paso 05; esta bitácora independiente amplía el registro, sin sustituir ni modificar aquel archivo.
- Las secciones de particiones difieren en la definición de A y en las capacidades de B. También mantienen referencias a Oracle, bloqueo pesimista y rutas anteriores a la extracción.
- Cartelera, Auditoría y otras responsabilidades descritas en los modelos no disponen de workspaces funcionales equivalentes al de Reservas. La existencia de rutas stub no acredita reglas de autorización, programación o auditoría implementadas.
- La regla y CI actuales verifican la rodaja de la raíz. Falta ampliar la regla sobre las fronteras del backend modular y conservar su prueba negativa y positiva. Tampoco está acreditada la continuidad de herramienta respecto de la semana 6.
- No se conserva el diff de la violación temporal ni un identificador de ejecución visible en la captura del CI. Sí se conservan las salidas roja y verde del linter.
- No hay evidencia de ejecución de k6 para la meta completa de E1. Los scripts ad hoc del Paso 05 y una revisión humana separada de sus resultados tampoco quedaron archivados como entregables reproducibles.

## 10. Reflexión sobre el uso de IA

El laboratorio nos permitió relacionar las fronteras del negocio con decisiones concretas de construcción. La comparación documentada favoreció B; la extracción de Reservas mostró cómo llevar esa decisión a un paquete consumible sin cambiar sus reglas. El experimento de dependency-cruiser, por su parte, hizo visible una dependencia que debía impedirse.

En el Paso 05 usamos Codex como apoyo técnico para configurar y modificar archivos, resolver problemas de compilación y ejecutar verificaciones. Reconocer esa intervención permite explicar con precisión cómo se obtuvo el resultado, manteniendo la responsabilidad del trabajo en el integrante y la decisión arquitectónica en el equipo.

Al contrastar documentación, código y capturas encontramos que una prueba verde tiene un alcance concreto: el control de la raíz no verifica automáticamente el workspace nuevo. Esta distinción fue uno de los aprendizajes más útiles de la revisión. También nos permitió separar los resultados registrados de las metas de calidad todavía no medidas. Al revisar la guía reconocimos otra diferencia: obtener un resultado técnicamente correcto no equivale a respetar el alcance permitido de IA. El registro de la intervención debe conservar esa distinción.

## 11. Referencias al trabajo del equipo

Los PR #29, #31, #33, #35 y #36 aparecen en la consulta de GitHub filtrada por fusionados con base `develop`; sus aportes también están presentes en el historial de la base revisada.

| Trabajo | Issue y PR | Commit y autor registrado |
|---|---|---|
| Particiones y cuatro rastros | [PR #36](https://github.com/Farid-ZS/sw708-equipo-1-proyecto/pull/36) | [cf87b92](https://github.com/Farid-ZS/sw708-equipo-1-proyecto/commit/cf87b928e2694ef23f7f7597a2cff24ffdab0eff), Gonzalo Alessandro Albornoz Azurza. |
| Comparación E1 y elección | [Issue #28](https://github.com/Farid-ZS/sw708-equipo-1-proyecto/issues/28), [PR #29](https://github.com/Farid-ZS/sw708-equipo-1-proyecto/pull/29) | [4387375](https://github.com/Farid-ZS/sw708-equipo-1-proyecto/commit/43873754cacfbfa91f590ce50687e20a643a6434), Dino Paul Roel Suazo Zanabria. |
| Separación de modelos C4 | [Issue #30](https://github.com/Farid-ZS/sw708-equipo-1-proyecto/issues/30), [PR #31](https://github.com/Farid-ZS/sw708-equipo-1-proyecto/pull/31) | [e735982](https://github.com/Farid-ZS/sw708-equipo-1-proyecto/commit/e7359824075088b675739ba81a8e436691094be4), Farid Paolo Zamudio Sánchez. |
| Regla arquitectónica y capturas | [Issue #32](https://github.com/Farid-ZS/sw708-equipo-1-proyecto/issues/32), [PR #33](https://github.com/Farid-ZS/sw708-equipo-1-proyecto/pull/33) | [abe92cd](https://github.com/Farid-ZS/sw708-equipo-1-proyecto/commit/abe92cd55a104694ff3d7731b80a2ccff5b3dba9), Farid Paolo Zamudio Sánchez. |
| Workspace de Reservas | [Issue #34](https://github.com/Farid-ZS/sw708-equipo-1-proyecto/issues/34), [PR #35](https://github.com/Farid-ZS/sw708-equipo-1-proyecto/pull/35) | [c0a48df](https://github.com/Farid-ZS/sw708-equipo-1-proyecto/commit/c0a48dfcd9a08593b555cb1c821b6783b6af4609), Carlos Daniel Chavez Oliva. |

La incorporación del PR #35 está registrada en el merge [6c5cc64](https://github.com/Farid-ZS/sw708-equipo-1-proyecto/commit/6c5cc64d49db978c2b820247ec9f64b4fb29122e). El informe del Paso 05 describe el estado al finalizar la sesión asistida; el historial confirma la integración realizada después.

La guía solicita integrar mediante Squash and merge. En el PR #35 el historial registra un merge con dos padres, por lo que esa integración no siguió la modalidad solicitada. No se encontró evidencia de la entrega individual en UNIVIRTUAL, cuyo plazo indicado en la guía fue el 4 de noviembre de 2026 a las 23:59.
