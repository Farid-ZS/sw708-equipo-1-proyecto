# Laboratorio 09 — Paso 05: build modular (#34)

Responsable: Carlos Daniel Chavez Oliva. Fecha: 4 de noviembre de 2026.

## Diagnóstico y alcance

Se verificó Git antes de editar: rama `refactor/34-build-modular`, árbol limpio.
Después de `git fetch origin`, HEAD y `origin/develop` coincidían en
`abe92cd55a104694ff3d7731b80a2ccff5b3dba9`. Se consultó el issue #34.
No había workspaces ni script de build en el backend. Las carpetas técnicas
no se convirtieron en paquetes independientes: se extrajo la capacidad Reservas,
respetando la partición B y los ADR 0001–0004.

La ejecución inicial, sin dependencias instaladas, pasó 10 pruebas y falló al
resolver `pg`; typecheck no encontraba `tsc`. Se usó `npm.cmd` porque PowerShell
bloquea el wrapper `npm.ps1` por su política de ejecución.

## Estructura y contratos

Antes: `backend/src/{domain,infrastructure,presentation}` contenía Reservas,
junto con las rutas, composición y pruebas en `backend/src`.

Ahora:

```text
lumiereApp/backend/
├── package.json                 # raíz privada de workspaces y host Express
├── package-lock.json            # instalación única de host y paquete local
├── tsconfig.build.json          # artefactos del host en dist/, sin tests
├── packages/reservas/
│   ├── package.json             # @lumiere/reservas 1.0.0
│   ├── tsconfig.json            # JavaScript + declaraciones en dist/
│   └── src/
│       ├── domain/{cinema,puertos}.ts
│       ├── infrastructure/{memoria,postgres}.repository.ts
│       └── presentation/reservas.controller.ts
└── src/                         # app, configuración, pool, rutas y tests
```

`workspaces: ["packages/reservas"]` enlaza un módulo con implementación real.
El host declara `@lumiere/reservas: 1.0.0` como dependencia explícita y consume
sus exports compilados. No se usa un alias de TypeScript para simular el paquete.

| Export | Contrato |
|---|---|
| `@lumiere/reservas` | Boleto, BoletoRepository, caso de uso y errores |
| `@lumiere/reservas/memoria` | Adaptador en memoria |
| `@lumiere/reservas/postgres` | Adaptador PostgreSQL con pool inyectado |
| `@lumiere/reservas/http` | Controlador y tipos de entrada/salida |

Dependencias: host → exports de Reservas; adaptadores/presentación → dominio.
Reservas declara `pg` y las herramientas/tipos necesarios para su compilación.
Express se usa solo como import de tipos dentro del paquete; su runtime y la
creación de rutas pertenecen al host. El dominio conserva únicamente `node:crypto`.
El paquete no importa el host ni crea un proceso o pool independiente.

Se conservaron sin cambios de contenido los cinco archivos extraídos (comparación
con HEAD normalizando CRLF). No se modificaron SQL, reglas ni respuestas HTTP.
Los tests siguen en el host y consumen el contrato público del workspace.

## Archivos

- Nuevos: este documento, `packages/reservas/package.json`, su `tsconfig.json`,
  los cinco archivos trasladados a `packages/reservas/src/` y `tsconfig.build.json`.
- Modificados: `backend/package.json`, `backend/package-lock.json`,
  `src/routes/reservas.routes.ts`, los tres archivos de `src/tests/`, README y
  `docs/bitacora-ia.md`.
- Las rutas anteriores de los cinco archivos se retiran por traslado; no se
  elimina código histórico de la raíz ni se modifica frontend, ADR o CI.
- En `adaptadores.test.ts` se sustituyó el import sin uso `afterEach`, que
  producía TS6133, por `after` para cerrar el pool PostgreSQL al finalizar.

## Ejecución reproducible

Desde la raíz (en otros shells se puede usar `npm` en lugar de `npm.cmd`):

```powershell
npm.cmd ci --prefix lumiereApp/backend
npm.cmd ls --prefix lumiereApp/backend @lumiere/reservas
npm.cmd run build --prefix lumiereApp/backend
npm.cmd run typecheck --prefix lumiereApp/backend
npm.cmd test --prefix lumiereApp/backend
```

Build compila primero Reservas y después el host; genera archivos `.js` reales.
Typecheck prepara las declaraciones del paquete antes de verificar el host,
por lo que también funciona tras una instalación limpia. `pretest`, `predev` y
`prestart` construyen el paquete antes de consumirlo. Desde `backend`,
`npm run start:compiled` ejecuta `dist/index.js` después de `npm run build`.
Los directorios dist quedan ignorados por el `.gitignore` existente del backend.

## Verificaciones ejecutadas

Entorno: Node 24.18.0, npm 11.16.0, Windows; PostgreSQL 16 en contenedor temporal
`lumiere-issue34-test`, puerto local 55434 y base exclusiva `lumiere_issue34`.
Se aplicó el DDL existente con `psql -v ON_ERROR_STOP=1` dentro del contenedor.
Se configuró `TEST_DATABASE_URL` solo para los procesos de verificación.

| Verificación | Resultado real |
|---|---|
| `npm.cmd install --prefix lumiereApp/backend` | Correcto; lockfile con enlace local |
| `npm.cmd ci --prefix lumiereApp/backend` | Correcto, 158 paquetes |
| `npm.cmd ls --prefix lumiereApp/backend @lumiere/reservas` | Enlace a `./packages/reservas` |
| Build y typecheck del backend | Correctos, también después de npm ci |
| Backend sin BD configurada | 15 pasan, 1 omisión explícita de PostgreSQL |
| Backend con PostgreSQL temporal | 20 pasan, 0 fallos, 0 omitidas |
| `npm.cmd ci`, `npm.cmd test` de la raíz con PostgreSQL temporal | Instalación correcta; 16 pasan, 0 omitidas |
| `npm.cmd run typecheck` de la raíz | Correcto |
| `npm.cmd run lint:arquitectura` de la raíz | 0 violaciones, 10 módulos, 16 dependencias |
| HTTP real sobre router compilado + memoria, puerto efímero | POST `/api/reservas`: 201, duplicado 400, datos vacíos 400 |
| Dos llamadas concurrentes a guardar en PostgreSQL | 1 éxito, 1 AsientoOcupadoError: UNIQUE y traducción 23505 verificadas |
| Comparación de los cinco archivos con HEAD | Contenido intacto normalizando saltos de línea |
| Revisión del grafo de imports relativos | Sin ciclos; paquete sin dependencia inversa al host |
| `git diff --check` | Correcto |

Las dos comprobaciones adicionales HTTP/concurrencia se ejecutaron mediante
scripts Node ad hoc usando los exports y el router compilado; no se incorporó
una nueva suite ni una herramienta de arquitectura. No se ejecutó el escenario
de carga de 1000 solicitudes de E1; dos inserciones no equivalen a esa medición.

## Pendientes del Paso 06

La CI actual usa Node y admite `develop`; no ejecuta Python. Sin embargo,
`npm ci`, tests, typecheck y dependency-cruiser apuntan a la rodaja de la raíz.
Su regla `^src/domain/` no cubre `backend/packages/reservas/src/domain/`.
La verificación verde de esa regla no acredita los límites del nuevo paquete.

El responsable del Paso 06 deberá extender dependency-cruiser existente para
cubrir host y workspace, prohibir ciclos, dependencias del dominio hacia
adaptadores/frameworks y dependencias de Reservas hacia el host. Los consumidores
deben usar los exports declarados, evitando accesos directos a src/dist internos.
También deberá integrar instalación, build, tipos y tests del backend en CI con
PostgreSQL de pruebas, manteniendo el destino `develop`. Este cambio no altera
el workflow ni sustituye la herramienta acordada. Las referencias históricas a
las rutas anteriores en ADR e informes se conservan; este documento registra
su correspondencia con las rutas actuales.

## Propuesta de entrega (sin ejecutar)

Commit: `build: extraer Reservas como npm workspace (#34)`.

PR hacia `develop`: **build: modularizar Reservas con npm workspaces (#34)**.

Descripción propuesta:

> Extrae dominio, puertos, adaptadores y controlador de Reservas a
> `@lumiere/reservas`, consumido explícitamente por el host Express mediante
> exports compilados. Incorpora build ordenado y generación de declaraciones,
> conserva reglas, SQL y respuestas, y registra el apoyo de IA y los pendientes
> de límites/CI del Paso 06.
>
> Validación: npm ci, build y typecheck correctos; 20 pruebas del backend y
> 16 de la raíz pasan con PostgreSQL 16 aislado. Smoke HTTP compilado y colisión
> concurrente UNIQUE/23505 correctos. Closes #34.

No se realizó commit, push, apertura de PR ni merge.
