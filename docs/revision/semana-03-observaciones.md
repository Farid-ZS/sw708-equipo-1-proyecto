# Observaciones del docente · Semana 03

Revisión hecha sobre `main` el sábado 19 de setiembre de 2026, leyendo el repositorio completo.

Llega a tiempo: el Lab03 vence el miércoles 23 a las 23:59, así que todo lo de acá se puede corregir antes de la entrega.

Este archivo no se corrige solo: cada punto se atiende con un commit, y este pull request se cierra cuando el equipo responda acá mismo qué hizo con cada uno. Lo que decidan no hacer también vale, siempre que quede escrito el porqué.

## Lo que está bien hecho

- La ficha del sistema está completa y el campo 9, lo que le duele al sistema, está escrito con honestidad: concurrencia frágil al reservar butacas, acoplamiento entre dulcería y entradas, y ausencia de caché. De ahí van a salir varias decisiones del ciclo.
- Los escenarios están redactados con las seis partes y con medidas numéricas.
- Están trabajando varios: hay commits de cinco cuentas distintas, aunque una de ellas solo hizo el commit inicial.

## 1. Hay credenciales en un repositorio público

**Es lo primero y es urgente.** `docs/ficha-del-sistema.md` incluye, entre las líneas 58 y 109, el bloque completo de variables de entorno con sus contraseñas, la clave de firma de sesiones y los usuarios de prueba con sus contraseñas. El repositorio es público: cualquiera con el enlace las está viendo, y el buscador de GitHub también.

Qué hacer, en este orden:

1. **Cambiar esas credenciales en donde existan.** Mientras sigan siendo válidas, el problema sigue abierto, esté o no el archivo.
2. **Sacarlas del documento.** En la ficha va el nombre de las variables, no su valor: `ORACLE_PASSWORD=` y nada más.
3. **Dejar un `.env.example`** con las variables vacías, y el `.env` real fuera del repositorio, en el `.gitignore`.
4. Tener presente que **borrarlas no las saca del historial**: quedan en los commits anteriores. Por eso el paso 1 es el que cierra el problema de verdad.

Que sean claves de desarrollo no cambia nada: lo que se practica es el hábito, y en el trabajo esto es un incidente de seguridad.

## 2. El modelo C4 describe un sistema que todavía no existe

`docs/c4-modelo.md` lo dice en su propia nota de arranque: que es un modelo de referencia y no una extracción del código. Y se nota en el nivel 2, donde los contenedores son React con Vite, Node con Express o NestJS y PostgreSQL, es decir el stack al que quieren migrar. El sistema que hoy se levanta, según la misma ficha y el correo del coordinador, corre sobre **Oracle 21c XE**.

El laboratorio pide dibujar **el sistema que existe hoy**, aunque sea feo. Un diagrama del sistema deseado no sirve para lo que viene: en la semana 5 hay que reescribir una capacidad de punta a punta sobre lo que hay, y en la 9 hay que partir en módulos lo que hay.

Concreto:

- Rehacer los tres niveles sobre el sistema actual: el frontend que hoy existe, el backend Express que hoy existe y Oracle.
- Si quieren conservar el modelo del sistema al que apuntan, perfecto, pero como **segundo** documento y con otro nombre: `docs/c4-objetivo.md`. La diferencia entre los dos es justamente la decisión que van a sustentar en la semana 4.

## 3. Quedó texto de la IA pegado sin leer

La última línea de `docs/c4-modelo.md` dice:

> Si quieres, puedo dejarte ahora una versión más formal en formato de documento para entregar en clase, o una versión con diagramas en PlantUML para que la puedas pegar directamente en una presentación.

Eso no lo escribió el equipo: es la respuesta de una herramienta, copiada entera. Es la prueba de que el documento se pegó sin leerlo hasta el final.

No es un problema usar IA: el curso la usa y la pide. El problema es entregar sin leer. Dos cosas:

- Quitar esa línea y cualquier otra que no sea del equipo.
- Registrar en `semana-02/bitacora-ia.md` qué se le pidió para este documento, qué se aceptó y qué se corrigió. Hoy la bitácora no menciona el modelo C4.

## 4. La ficha se contradice consigo misma

- El campo 5, «Lenguaje y stack», dice PostgreSQL, NestJS y SASS.
- El campo 8, «Cómo se levanta hoy», clona `CineStar-Barrio` y levanta Oracle 21c XE.
- El correo del coordinador dice Oracle, React 18 y Express.

La ficha debe describir el sistema **tal como está hoy**. Lo que quieren cambiar va aparte, como decisión, no mezclado con la descripción.

De paso, el nombre baila: el sistema es Lumiere, el repositorio de origen es CineStar-Barrio y el correo titula el stack como «Stack de CineStar-Barrio». Una sola línea lo resuelve: «Lumiere, antes CineStar-Barrio, del curso SW609».

## 5. `node_modules` está versionado

`lumiereApp/backend/node_modules/` tiene más de dos mil archivos dentro del repositorio. Esa carpeta se regenera con `npm install` y nunca se sube: hace lento el clon, ensucia cada diff y esconde los cambios de verdad.

Falta un `.gitignore` en la raíz con, al menos, `node_modules/`, `.env`, `dist/` y `.DS_Store`.

## 6. Nadie está usando ramas ni pull requests

Trece commits, todos directo a `main`, y cero pull requests. Eso significa que ningún cambio de este proyecto lo ha revisado otra persona.

Desde esta semana:

- Una rama por tarea: `tipo/nombre-corto`.
- Un pull request por rama, revisado por alguien que no lo escribió.
- Commits con la convención: `tipo(alcance): descripción`, con `feat`, `fix`, `docs`, `refactor`, `test` o `chore`. Mensajes como «Nombres», «Stack Inicial» o «biracora de ia» no dicen qué cambió.

## 7. El README de la raíz tiene una sola línea

Hoy dice solo el nombre del repositorio. Debe decir, en una pantalla: qué es Lumiere, con qué stack corre hoy, cómo se levanta y dónde está cada cosa.

## Prioridad sugerida

| Orden | Punto | Por qué primero |
|---|---|---|
| 1 | Cambiar las credenciales expuestas (1) | El repositorio es público y siguen siendo válidas |
| 2 | Rehacer el C4 sobre el sistema real (2) | Es lo que se entrega el miércoles y lo que sostiene las semanas 5 y 9 |
| 3 | Limpiar el texto de la IA y la bitácora (3) | Cuesta cinco minutos y cambia la nota del laboratorio |
| 4 | Arreglar la ficha y el README (4 y 7) | Son la puerta de entrada al proyecto |
| 5 | `.gitignore` y flujo de ramas (5 y 6) | Ordenan todo lo que viene después |

Los puntos 1, 2 y 4 son candidatos naturales a los tres ADR de la semana 4: qué se hace con la gestión de secretos, si se migra el stack o no, y con qué alcance.

Elio Navarrete · SW708 Arquitectura de Soluciones de Software
