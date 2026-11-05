# Observaciones del docente: Entrega 1

Revisión del 20 de octubre de 2026 sobre el commit `9b99379`, el que declara la carátula del informe. La tabla 1.2 declara otro (`11f20ef`); revisé los dos y califiqué `9b99379`, porque es el único que trae el ADR-0003. Con los cuatro equipos usé el mismo criterio: se revisa el commit que cada equipo declara en la primera página del informe. Por eso no se consideraron los commits posteriores a `9b99379` (`d4c42c2` y `4428422`, del 17 de octubre).

La nota ya está en UNIVIRTUAL. Este archivo es el detalle de por qué, y sirve para la entrega final.

**Cómo se cierra.** Respondan en un comentario de este pull request qué van a hacer con cada viñeta de las secciones 1 a 8. Lo que decidan no hacer también vale, siempre que quede escrito el porqué. Cuando hayan respondido todas, intégrenlo con **Squash and merge** (no con *Close pull request*) y borren la rama, como vimos en el taller: así este archivo queda en `docs/revision/` y el issue se cierra solo.

## Lo que está bien hecho

- **La estructura de la rodaja «Reservar boleto» va por buen camino.** `src/domain` no importa nada de infraestructura ni de presentación, y los adaptadores de memoria y de PostgreSQL pasan las mismas cinco pruebas de contrato (`test_adaptadores.py`).
- **La regla de arquitectura existe y corre.** El contrato `dominio-limpio` de import-linter está en el build, y la corrida de Actions sobre `9b99379` quedó en verde con PostgreSQL real como servicio.
- **El ADR-0001 se apoya en una medición propia**: el experimento del costo del cambio, con archivos y líneas.
- **El historial muestra el aporte de los cinco**, con ramas y pull requests.

## 1. Escenarios de calidad

Me refiero a los cinco escenarios del informe (tablas 2.1 a 2.5). Los escenarios 6 a 9 de `docs/escenarios.md` no están en el informe; si quieren que cuenten, llévenlos al informe con su instrumento.

- **Ningún escenario nombra su instrumento de medición**, aunque la revisión del Grupo 4, copiada al final de `docs/escenarios.md`, se los pidió para los cinco. Para cada uno: con qué herramienta se mide (k6, un script de concurrencia, una prueba automatizada, una sesión con usuarios) y quién lo corre.
- **Dos medidas no se pueden verificar.** En E4 no se define qué cuenta como error, y en E5 «ningún asiento queda en un estado raro» no es medible.
- **E2 mezcla dos atributos**: la inmutabilidad (auditabilidad) y la consulta en menos de 1 s (desempeño), y se rotula como Seguridad en la tabla 2.2.
- **Cuatro de cinco escenarios no tienen decisión que los atienda**, y falta el párrafo de la sección 2.1 que explique cómo la prioridad guió sus decisiones.
- **Cubren solo tres atributos**: fiabilidad (E1 y E5), seguridad (E2 y E3) y capacidad de interacción (E4). Faltan rendimiento y modificabilidad, que pide la sección 3.1 del enunciado.

## 2. Modelo C4

- **El modelo contradice al código.** Describe Oracle 21c XE con dos esquemas, y el ADR-0002 y la rodaja usan PostgreSQL.
- **Los componentes del nivel 3 no se pueden señalar en el código**, y la rodaja en Python no aparece en el modelo.
- Los contenedores no dicen su tecnología, aunque el repositorio tiene React con Vite y Express.
- Las figuras dicen «CineStar Barrio» y el resto del informe, «Lumiere». Elijan un nombre.
- En `docs/c4/leyenda.md` quedó pegado un feedback sobre otro modelo (sensoresIoT, dbMonitoreo) que no es de este sistema.

## 3. Decisiones de arquitectura

- **El ADR-0003 no se cumple en el código.** Propone `SELECT ... FOR UPDATE`, pero `PostgreBoletoRepository` consulta e inserta en conexiones separadas, cada una con su propia transacción y sin una que abarque las dos: es justo la ventana que el ADR describe. Además, su estado es Propuesto aunque el texto dice «Implementamos». Ojo: hoy no hay una fila por butaca que bloquear, así que agregar `FOR UPDATE` a la consulta actual no cierra la carrera. Para implementarlo necesitan una tabla de butacas por función; si no, cambien la decisión (por ejemplo, el UNIQUE como mecanismo principal, traduciendo la violación a `AsientoOcupadoError`).
- **La alternativa MySQL del ADR-0002 es de relleno**: no tiene un trade-off real frente a PostgreSQL.
- El ADR-0001 habla de capas, y el código y el informe hablan de puertos y adaptadores. Aclaren la relación.

## 4. Rodaja vertical

- **La rodaja vive aparte del sistema que declaran.** Está en Python (`src/`), mientras la ficha, el README y la tabla 1.2 dicen TypeScript con Express, donde las rutas de reservas siguen vacías. Ningún ADR explica el cambio de lenguaje. Decidan cuál es el sistema y escríbanlo como ADR.
- **No hay entrada que la levante**: en `9b99379` es una clase que devuelve un diccionario, sin endpoint HTTP ni comando.
- **La condición de carrera de E1 sigue abierta.** Con dos reservas simultáneas, el UNIQUE de la tabla hace fallar el segundo INSERT con un error de psycopg que el controlador no captura, en lugar de `AsientoOcupadoError`.

## 5. Informe y repositorio

- **El informe se contradice**: la carátula dice `9b99379` y la tabla 1.2 dice `11f20ef`; la tabla 1.2 declara TypeScript y Oracle, con un comando de construcción en Python; y el enlace de la CI es de otro commit (`956829b`), anterior al adaptador de PostgreSQL.
- **El README no permite construir.** Describe CineStar-Barrio, clona otro repositorio, pide un `docker-compose.yml` en la raíz que no existe y no dice cómo correr la rodaja (tampoco hay `requirements.txt`).
- **`node_modules` sigue versionado** (2133 archivos), como ya se observó en la semana 3.
- El informe no está en `docs/arquitectura.md`, que es la ruta que pide el enunciado (después lo subieron a `docs/informes/`), y tiene errores de concordancia y un título truncado («reserva de butac»).

## 6. Git, con lo que vimos en el taller

Lo bueno: trabajan con pull requests y la mayoría de ramas tiene tipo (`feat/`, `docs/`, `refactor/`). Lo que falta:

- No hay rama `develop`, como pide la Guía de Git (sección 3): todo entra directo a `main`.
- No abren issues, así que las ramas no llevan número de ticket (`tipo/numero-de-issue-descripcion`, como `feature/12-reserva-de-cupos`). Dos ramas no tienen tipo: `Zamudio-Sanchez`, que además es el nombre de una persona, y `docs-borrador-bitacora`.
- Las ramas no se borran después del merge: siguen 16 ya integradas.
- Los pull requests entran con merge y no con squash; por eso `main` tiene 21 commits de merge.
- Solo 14 de sus 43 commits (sin contar los de merge) usan prefijo. Mensajes como «2», «prueba test», «Ajuste-tiempo» o el texto por defecto de GitHub «Create test_adaptadores.py» no dicen qué cambió ni por qué.
- Saquen `node_modules` con `git rm -r --cached lumiereApp/backend/node_modules` (el `.gitignore` de `lumiereApp/backend` ya lo ignora) y agreguen `node_modules/` también al `.gitignore` de la raíz, como se pidió en la semana 3.

## 7. Identidad unificada

Cada usuario de GitHub, a quién pertenece y cómo aparece hoy en el historial:

| Integrante | Usuario de GitHub | Cómo aparece en los commits | Qué corregir |
|---|---|---|---|
| Chavez Oliva, Carlos Daniel | @carloz-chavez | «carloz-chavez» | Su nombre completo |
| Albornoz Azurza, Gonzalo Alessandro | @gonzalouni | «gonzalouni», con el correo privado de GitHub | Su nombre completo y su correo @uni.pe. Confirmen acá que esta cuenta es la de Gonzalo |
| Suazo Zanabria, Dino Paul Roel | @SuazoDino | «Dino Suazo» y, en los merges hechos desde GitHub, «DinZ-24» (el nombre de su perfil) | Su nombre completo, también en su perfil de GitHub |
| Vargas Ponce, Luis Angel | @AngelVarP | «LAngel_VP», unas veces con un correo personal y otras con el @uni.pe; dos de sus commits no quedaron enlazados a ninguna cuenta | Su nombre completo, y su @uni.pe agregado a su cuenta |
| Zamudio Sánchez, Farid Paolo | @Farid-ZS | «Farid Zamudio» y «Farid-ZS» (su perfil de GitHub no tiene nombre) | Su nombre completo, también en su perfil de GitHub |

Cada integrante, en su máquina, con su nombre completo y su correo @uni.pe:

```bash
git config --global user.name "Nombres Apellidos"
git config --global user.email "su.correo@uni.pe"
```

En GitHub, pongan ese mismo nombre en su perfil (los merges hechos desde la web toman el nombre del perfil) y agreguen su correo @uni.pe en *Settings > Emails*, para que sus próximos commits queden enlazados a su cuenta.

Para juntar lo que ya está en el historial, agreguen un archivo `.mailmap` en la raíz, con una línea por cada identidad vieja:

```text
Nombres Apellidos <su.correo@uni.pe> Nombre-viejo <correo-viejo>
```

Eso ordena `git log` y `git shortlog`; la web de GitHub sigue mostrando el nombre original de cada commit.

## 8. Sus reglas de negocio actuales

Agreguen `docs/reglas-de-negocio.md` con las reglas de negocio que el sistema cumple hoy. Para cada una: qué dice la regla, dónde vive en el código (archivo y función) y qué prueba la verifica, o «sin prueba». Con eso se revisan la rodaja y los escenarios de la entrega final.

## Prioridad sugerida

| Orden | Punto | Por qué primero |
|---|---|---|
| 1 | Decidir cuál es el sistema y escribirlo como ADR (4) | De eso dependen el C4, el README y la rodaja |
| 2 | Implementar el ADR-0003 o cambiar su decisión (3 y 4) | Es la regla del escenario de mayor prioridad |
| 3 | `docs/reglas-de-negocio.md` (8) | Es la base de la revisión de la entrega final |
| 4 | Instrumento en cada escenario (1) | Sin instrumento, el escenario no se puede medir |
| 5 | README con el que se pueda levantar el sistema, y `node_modules` fuera (5) | Cualquiera tiene que poder levantar el sistema |
