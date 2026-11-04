UNIVERSIDAD NACIONAL DE INGENIERÍA
Facultad de Ingeniería Industrial y de Sistemas
Escuela Profesional de Ingeniería de Software

**SW708 Arquitectura de Soluciones de Software — Sección U**  
**Profesor:** Elio Navarrete Vilca  

# Informe del Proyecto Integrador — Sistema Lumiere

### Equipo N.º 1

| N.º | Apellidos y Nombres | Código UNI | Rol en el Equipo |
|:---:|---|:---:|---|
| 1 | Chavez Oliva, Carlos Daniel | 20232622E | Coordinador / UI & Bitácora |
| 2 | Albornoz Azurza, Gonzalo Alessandro | 20232551K | Decisiones de Arquitectura (ADRs) |
| 3 | Suazo Zanabria, Dino Paul Roel | 20231324K | Modelo C4 (Contexto, Contenedores, Componentes) |
| 4 | Vargas Ponce, Luis Angel | 20231314E | Rodaja Vertical, Pruebas de Dominio y CI/CD |
| 5 | Zamudio Sánchez, Farid Paolo | 20231215G | Escenarios de Calidad y Priorización |

| Repositorio Oficial | https://github.com/Farid-ZS/sw708-equipo-1-proyecto |
| --- | --- |
| Rama Principal | `main` / `develop` |

Lima, 2026

---

## Registro de Versiones

| Versión | Fecha | Autor | Descripción de la Modificación |
|:---:|:---:|:---:|---|
| 0.1 | 19/09/2026 | Equipo 1 | Elaboración inicial de escenarios de calidad y modelo C4 de Lumiere. |
| 0.2 | 11/10/2026 | Equipo 1 | Documentación de decisiones arquitectónicas (ADRs), adopción de PostgreSQL y medición del costo del cambio. |
| 0.3 | 14/10/2026 | Equipo 1 | Implementación de rodaja vertical, pruebas de contrato y validación de reglas arquitectónicas. |
| 1.0 | 17/10/2026 | Equipo 1 | Consolidación del informe de Entrega 1, evidencias de CI y bitácora de IA. |
| 1.1 | 04/11/2026 | Equipo 1 | Atención a observaciones docentes: consolidación de rodaja en TypeScript (ADR-0004), corrección de ADR-0003 (restricción UNIQUE atómica), robustecimiento de ADR-0002 (trade-offs MySQL), matriz formal de reglas de negocio (`docs/reglas-de-negocio.md`), unificación de identidades (`.mailmap`) y escenarios con instrumentos de medición. |

---

## Contenido

- [1. Resumen y Datos de la Entrega](#1-resumen-y-datos-de-la-entrega)
- [2. Escenarios de Calidad Priorizados](#2-escenarios-de-calidad-priorizados)
- [3. Modelo C4](#3-modelo-c4)
- [4. Decisiones de Arquitectura (ADRs)](#4-decisiones-de-arquitectura-adrs)
- [5. Diseño de la Interfaz](#5-diseño-de-la-interfaz)
- [6. Rodaja Vertical en TypeScript](#6-rodaja-vertical-en-typescript)
- [7. Bitácora de Uso de Inteligencia Artificial](#7-bitácora-de-uso-de-inteligencia-artificial)
- [8. Matriz de Pendientes para la Entrega Final](#8-matriz-de-pendientes-para-la-entrega-final)

---

## 1. Resumen y Datos de la Entrega

**Lumiere** es una plataforma de gestión de salas de cine y venta de boletos que centraliza la cartelera, la reserva de asientos en tiempo real, la emisión de comprobantes digitales y el control administrativo de funciones. El sistema fue desarrollado por nuestro equipo aplicando los principios de arquitectura de software del curso SW708: separación estricta de responsabilidades mediante **Arquitectura Hexagonal (Puertos y Adaptadores)**, persistencia relacional transaccional sobre **PostgreSQL 16**, y verificación continua con pruebas automatizadas.

Para la rodaja vertical se seleccionó la capacidad de **“Reservar boleto”**, debido a que concentra el núcleo crítico del negocio: validación estricta de datos obligatorios, verificación atómica de no-sobreventa (*overbooking*) ante alta concurrencia, y generación de identificadores inmutables con marca temporal.

#### Tabla 1.1. Responsabilidades de los Integrantes

| Apellidos y Nombres | Código UNI | Responsabilidad Principal |
|---|:---:|---|
| Albornoz Azurza, Gonzalo Alessandro | 20232551K | Decisiones de arquitectura (ADRs) con alternativas y trade-offs técnicos. |
| Chavez Oliva, Carlos Daniel | 20232622E | Diseño de interfaz de usuario, bitácora de IA y formato final. |
| Suazo Zanabria, Dino Paul Roel | 20231324K | Modelo C4 (Contexto, Contenedores, Componentes y fuente Structurizr DSL). |
| Vargas Ponce, Luis Angel | 20231314E | Rodaja vertical en TypeScript, pruebas de adaptadores, dominio y CI/CD. |
| Zamudio Sánchez, Farid Paolo | 20231215G | Escenarios de calidad medibles, priorización y reglas de negocio. |

#### Tabla 1.2. Datos de la Entrega Técnica

| Atributo | Detalle |
|---|---|
| **Repositorio** | https://github.com/Farid-ZS/sw708-equipo-1-proyecto |
| **Lenguaje y Stack** | **TypeScript 5**; Node.js (v22+) con Express 5 (backend), React 18 con Vite (frontend), PostgreSQL 16 (base de datos relacional). |
| **Comando para Construir y Probar** | `npm test --prefix lumiereApp/backend` |
| **Punto de Entrada de la Rodaja** | Endpoint HTTP `POST /api/reservas` montado sobre Express (`lumiereApp/backend/src/routes/reservas.routes.ts`). |
| **Estado de Pruebas** | 15 pruebas pasando en verde con el test runner nativo de Node.js (`node:test`). |

---

## 2. Escenarios de Calidad Priorizados

Los escenarios siguen la estructura formal de seis elementos (Fuente, Estímulo, Artefacto, Entorno, Respuesta y Medida) e incorporan su instrumento de verificación concreto y el responsable de su ejecución:

#### Tabla 2.1. Escenario E1 — Fiabilidad (Concurrencia e Integridad de Asientos)
| Elemento | Especificación |
|---|---|
| **Fuente** | Dos usuarios concurrentes (vendedores en taquilla física o clientes web). |
| **Estímulo** | Intentan reservar la misma butaca de la misma función en el mismo milisegundo. |
| **Artefacto** | Módulo de reservas de boletos y tabla `boletos` en PostgreSQL. |
| **Entorno** | Sala de alta demanda durante estreno comercial (alta contención). |
| **Respuesta** | Exactamente una venta se confirma con código HTTP 201; la otra solicitud es rechazada deterministamente con mensaje descriptivo y HTTP 400. 0 boletos duplicados en base de datos. |
| **Medida** | En 1000 solicitudes concurrentes dirigidas al mismo asiento: exactamente 1 reserva confirmada y 999 respuestas de rechazo; 0 registros duplicados. |
| **Instrumento** | Script de carga concurrente con **`k6`** disparando 1000 solicitudes paralelas, seguido de verificación SQL en PostgreSQL (`SELECT count(*) FROM boletos WHERE funcion_id = $1 AND asiento = $2`). |
| **Responsable** | Luis Angel Vargas Ponce. |
| **Decisión** | [ADR-0003](docs/adr/0003-bloqueo-pesimista-butacas.md) (Restricción atómica `UNIQUE (funcion_id, asiento)` con traducción de error `23505` a `AsientoOcupadoError`). |

#### Tabla 2.2. Escenario E2 — Seguridad (Inmutabilidad y Trazabilidad de Auditoría)
| Elemento | Especificación |
|---|---|
| **Fuente** | Empleado de taquilla autenticado. |
| **Estímulo** | Cancela un boleto e intenta posteriormente modificar o eliminar el registro histórico de cancelación. |
| **Artefacto** | Módulo de cancelaciones y registro de auditoría. |
| **Entorno** | Operación normal del cine; el usuario intenta alterar los registros mediante la API o sentencias SQL directas. |
| **Respuesta** | El sistema registra de manera inmutable quién canceló, fecha/hora, boleto y asientos liberados; el sistema rechaza cualquier intento de modificación o borrado posterior. |
| **Medida** | El 100% de las cancelaciones queda registrado con usuario y marca temporal; 0 modificaciones o eliminaciones permitidas (0 sentencias `UPDATE` o `DELETE` exitosas). |
| **Instrumento** | Prueba automatizada en `node:test` intentando invocar sentencias `UPDATE` y `DELETE` sobre el registro de cancelaciones con el rol operativo, verificando rechazo con error de integridad. |
| **Responsable** | Farid Paolo Zamudio Sánchez. |
| **Decisión** | [ADR-0001](docs/adr/0001-eleccion-estilo-arquitectonico.md) (Dominio desacoplado con repositorio de auditoría inmutable). |

#### Tabla 2.3. Escenario E3 — Seguridad (Control de Acceso por Roles - RBAC)
| Elemento | Especificación |
|---|---|
| **Fuente** | Usuario no autenticado o empleado con rol de vendedor estándar. |
| **Estímulo** | Intenta invocar endpoints administrativos restringidos (`/api/salas`, `/api/funciones`) mediante llamadas HTTP directas. |
| **Artefacto** | Middleware de autenticación y autorización JWT en Express. |
| **Entorno** | Sistema en operación accesible desde terminales de taquilla o red local. |
| **Respuesta** | El middleware intercepta la petición, deniega el acceso sin tocar el dominio y responde con HTTP 401 o HTTP 403. |
| **Medida** | De 100 intentos sin permisos de administrador, el 100% son rechazados y ninguno altera la configuración del cine. |
| **Instrumento** | Colección de pruebas de integración HTTP ejecutada automáticamente en CI simulando peticiones con tokens sin privilegios. |
| **Responsable** | Gonzalo Alessandro Albornoz Azurza. |
| **Decisión** | Middleware perimetral de autorización con tokens JWT en el adaptador primario Express. |

#### Tabla 2.4. Escenario E4 — Usabilidad (Agilidad en Venta con Mapa de Asientos)
| Elemento | Especificación |
|---|---|
| **Fuente** | Operador de taquilla nuevo o con entrenamiento básico. |
| **Estímulo** | Atiende a clientes presenciales para seleccionar función y butacas. |
| **Artefacto** | Interfaz web SPA en React con mapa interactivo de asientos en tiempo real. |
| **Entorno** | Fila de espera en taquilla en horario de alta afluencia. |
| **Respuesta** | El operador completa la venta mirando el mapa de asientos interactivo sin verificar cupos a mano ni salir del flujo. |
| **Medida** | Cada venta completada en menos de 5 clics y menos de 60 segundos; máximo 1 error por cada 20 ventas. |
| **Definición de Error** | *Se define formalmente como error la selección accidental de una butaca ocupada, un clic fuera del área interactiva, o el envío de formularios con datos de cliente vacíos que exija reiniciar el proceso.* |
| **Instrumento** | Sesión presencial de pruebas de usabilidad con 3 operadores, tareas guionadas, cronometraje, grabación y analítica de clics. |
| **Responsable** | Carlos Daniel Chavez Oliva. |
| **Decisión** | Interfaz SPA reactiva en React 18 con sincronización visual de estados de butacas y validación reactiva en cliente. |

#### Tabla 2.5. Escenario E5 — Fiabilidad (Recuperación ante Caídas y Consistencia Transaccional)
| Elemento | Especificación |
|---|---|
| **Fuente** | Falla abrupta del servidor (reinicio de Node.js, apagón o reinicio del contenedor). |
| **Estímulo** | Interrupción forzada del servicio mientras existen transacciones de reserva en curso. |
| **Artefacto** | Servidor de aplicación Express y motor PostgreSQL. |
| **Entorno** | Alta concurrencia al momento de la caída. |
| **Respuesta** | El 100% de las ventas confirmadas antes de la caída permanecen intactas; las reservas a medias se descartan (rollback), sin dejar butacas bloqueadas indefinidamente. |
| **Medida** | Recuperación completa del servicio en menos de 60 segundos tras el reinicio; 100% de transacciones incompletas abortadas limpiamente; 0 bloqueos residuales (*locks* colgados) en la tabla `boletos`. |
| **Instrumento** | Prueba de caos con `docker restart` durante ráfaga transaccional, sondeo a `/api/health` cada 1 segundo para medir tiempo de recuperación, y script SQL verificando ausencia de bloqueos huérfanos. |
| **Responsable** | Luis Angel Vargas Ponce. |
| **Decisión** | [ADR-0002](docs/adr/0002-adopcion-de-Postgresql.md) y [ADR-0003](docs/adr/0003-bloqueo-pesimista-butacas.md) (Transacciones ACID y WAL en PostgreSQL). |

#### Tabla 2.6. Escenario E6 — Rendimiento (Latencia de Consulta de Cartelera bajo Carga)
| Elemento | Especificación |
|---|---|
| **Fuente** | Múltiples clientes concurrentes consultando funciones y cartelera web. |
| **Estímulo** | Ráfaga sostenida de 500 solicitudes por segundo a `/api/peliculas` y `/api/funciones`. |
| **Artefacto** | Endpoints de consulta del backend y base de datos PostgreSQL. |
| **Entorno** | Viernes por la tarde previo a inicio de funciones de fin de semana. |
| **Respuesta** | El servidor entrega la lista actualizada de funciones vigentes con sus salas y disponibilidad sin degradar el tiempo de respuesta. |
| **Medida** | El 95% de las peticiones (percentil p95) responde en menos de 300 ms, con 0% de errores HTTP 500 bajo 500 req/s. |
| **Instrumento** | Script de carga con **`k6`** simulando 500 usuarios virtuales concurrentes durante 2 minutos hacia los endpoints de lectura. |
| **Responsable** | Gonzalo Alessandro Albornoz Azurza. |
| **Decisión** | [ADR-0002](docs/adr/0002-adopcion-de-Postgresql.md) (Consultas optimizadas con índices B-Tree en PostgreSQL) y pool de conexiones `pg.Pool`. |

#### Tabla 2.7. Escenario E7 — Modificabilidad (Adición de Nuevo Adaptador de Infraestructura)
| Elemento | Especificación |
|---|---|
| **Fuente** | Desarrollador del equipo de backend. |
| **Estímulo** | Requerimiento de incorporar un nuevo adaptador de persistencia alternativo o canal de notificación. |
| **Artefacto** | Capa de infraestructura y contratos de puertos en el núcleo de dominio. |
| **Entorno** | Mantenimiento evolutivo del sistema. |
| **Respuesta** | El nuevo adaptador se implementa satisfaciendo la interfaz del puerto existente sin requerir modificaciones en las clases de dominio. |
| **Medida** | Se requiere modificar 0 líneas de código en la capa de dominio (`src/domain/`); el nuevo adaptador pasa las pruebas de contrato en menos de 2 horas-hombre. |
| **Instrumento** | Verificación de diferencias de Git (`git diff --stat src/domain/`) comprobando 0 cambios en el dominio, y ejecución de la suite compartida (`src/tests/adaptadores.test.ts`). |
| **Responsable** | Farid Paolo Zamudio Sánchez. |
| **Decisión** | [ADR-0001](docs/adr/0001-eleccion-estilo-arquitectonico.md) y [ADR-0004](docs/adr/0004-adopcion-typescript-backend.md) (Arquitectura Hexagonal con Puertos y Adaptadores). |

---

### 2.1. Priorización de Escenarios

#### Tabla 2.8. Matriz de Priorización
| Escenario | Impacto en Negocio | Dificultad Técnica | Prioridad | Decisión Arquitectónica Asociada | Instrumento y Responsable |
|---|:---:|:---:|:---:|---|---|
| **E1 Fiabilidad** (Concurrencia) | Alto (3) | Alta (3) | **P0** | **ADR-0003**: Restricción `UNIQUE` atómica con traducción de error `23505`. | Script k6 (1000 req/s) — Luis Vargas |
| **E2 Seguridad** (Auditoría) | Alto (3) | Media (2) | **P1** | **ADR-0001**: Núcleo de dominio desacoplado con repositorio inmutable. | Test automatizado UPDATE/DELETE en `node:test` — Farid Zamudio |
| **E3 Seguridad** (RBAC) | Alto (3) | Baja (1) | **P1** | Middleware JWT y autorización de roles en Express. | Test HTTP en CI (HTTP 401/403) — Gonzalo Albornoz |
| **E5 Fiabilidad** (Recuperación) | Alto (3) | Media (2) | **P1** | **ADR-0002** y **ADR-0003**: Transacciones ACID y WAL en PostgreSQL. | Chaos test `docker restart` y healthcheck — Luis Vargas |
| **E4 Usabilidad** (Taquilla) | Medio (2) | Baja (1) | **P2** | Interfaz SPA reactiva en React 18 con sincronización de asientos. | Sesión de usabilidad presencial con 3 cajeros — Carlos Chavez |
| **E6 Rendimiento** (Latencia) | Medio (2) | Media (2) | **P2** | **ADR-0002**: Índices B-Tree en PostgreSQL y pool de conexiones `pg.Pool`. | Test de carga k6 (p95 < 300 ms) — Gonzalo Albornoz |
| **E7 Modificabilidad** (Adaptador) | Medio (2) | Media (2) | **P2** | **ADR-0001** y **ADR-0004**: Puertos y Adaptadores (Hexagonal) en TypeScript. | `git diff --stat` en dominio y pruebas de contrato — Farid Zamudio |

#### Justificación del Orden y Guía de Decisiones

El orden de priorización refleja las dependencias críticas del negocio:
1. **P0 (Escenario E1):** Vender dos veces el mismo asiento genera un daño operativo irreversible. Esta prioridad máxima guio de forma directa la adopción de **PostgreSQL (ADR-0002)** y la selección de la **restricción compuesta `UNIQUE (funcion_id, asiento)` (ADR-0003)** como mecanismo principal, asegurando que el motor de base de datos serialice las compras atómicamente a nivel de índice B-Tree.
2. **P1 (Escenarios E2, E3 y E5):** Protegen la viabilidad de la operación diaria. La necesidad de impedir fraudes en cancelaciones (E2), accesos no autorizados a la cartelera (E3) e inconsistencias tras reinicios del servidor (E5) guio el aislamiento del dominio mediante puertos inmutables y el uso estricto de transacciones ACID con Write-Ahead Logging (WAL).
3. **P2 (Escenarios E4, E6 y E7):** Garantizan la experiencia de usuario y la mantenibilidad del código: agilidad visual en taquilla (E4), alta capacidad de lectura en estrenos (E6), y facilidad para extender el software sin tocar el núcleo (E7). Estos escenarios motivaron la unificación completa del stack en **TypeScript y React 18 (ADR-0004)**.

---

## 3. Modelo C4

El sistema Lumiere se modela en tres niveles utilizando la notación C4 generada a partir de Structurizr DSL:

### 3.1. Nivel 1 — Diagrama de Contexto
Delimita el sistema Lumiere como una única caja que interactúa con dos roles humanos principales: el **Cliente** (que consulta la cartelera y compra entradas) y el **Operador de Taquilla / Administrador** (que gestiona funciones, salas y atiende ventas presenciales). No existen dependencias con pasarelas de pago externas ni programas de fidelización dentro del alcance del proyecto.

### 3.2. Nivel 2 — Diagrama de Contenedores
Abre el sistema en tres contenedores de ejecución:
1. **Terminal Web SPA (Frontend):** React 18, Vite y TypeScript, ejecutada en el navegador del usuario.
2. **Servidor de Aplicación (API Backend):** Node.js 22, Express 5 y TypeScript, que concentra la lógica de negocio, puertos y controladores HTTP en `http://localhost:3000`.
3. **Base de Datos Relacional:** PostgreSQL 16 (`boletos_db`), que almacena de forma persistente películas, funciones, salas, butacas y reservas mediante transacciones ACID.

### 3.3. Nivel 3 — Diagrama de Componentes (Backend)
Detalla el interior del Servidor de Aplicación bajo Arquitectura Hexagonal:
- **Adaptadores de Entrada (Presentación):** Controladores HTTP Express (`ReservasController`, `PeliculasController`, `FuncionesController`).
- **Capa de Aplicación:** Casos de uso (`ReservarBoletoUseCase`).
- **Núcleo de Dominio:** Entidades puras (`Boleto`), reglas de negocio (`AsientoOcupadoError`, `DatosInvalidosError`) y contratos de puertos (`BoletoRepository`).
- **Adaptadores de Salida (Infraestructura):** `PostgresBoletoRepository` (persistencia relacional con `pg.Pool`) e `InMemoryBoletoRepository` (doble de prueba en memoria).

---

## 4. Decisiones de Arquitectura (ADRs)

El repositorio registra formalmente cuatro decisiones de arquitectura en formato Nygard:

### ADR-0001. Elección del estilo arquitectónico hexagonal (Puertos y Adaptadores) con dominio aislado
- **Estado:** Aceptado ([docs/adr/0001-eleccion-estilo-arquitectonico.md](docs/adr/0001-eleccion-estilo-arquitectonico.md)).
- **Decisión:** Adoptar Arquitectura Hexagonal (Puertos y Adaptadores) con dependencias dirigidas hacia el dominio.
- **Aclaración Capas vs. Puertos y Adaptadores:** El concepto de *capas concéntricas* describe el principio lógico de separación y la dirección de dependencias (Clean Architecture), mientras que *Puertos y Adaptadores* describe la técnica concreta de implementación en código: el dominio define **Puertos** (interfaces como `BoletoRepository`), y la periferia implementa **Adaptadores** (PostgreSQL, memoria, controladores Express HTTP).
- **Trade-offs:** Se descartaron el monolito acoplado (riesgo de regresiones medido en el experimento del costo del cambio) y los microservicios distribuidos (complejidad excesiva de transacciones distribuidas para el tamaño del equipo).

### ADR-0002. Adopción de PostgreSQL como gestor de base de datos relacional
- **Estado:** Aceptado ([docs/adr/0002-adopcion-de-Postgresql.md](docs/adr/0002-adopcion-de-Postgresql.md)).
- **Decisión:** Reemplazar Oracle Database 21c XE por PostgreSQL 16.
- **Trade-offs técnicos reales frente a MySQL (InnoDB):**
  1. *MVCC vs Bloqueos de Rango:* InnoDB en MySQL utiliza aislamiento `REPEATABLE READ` con *gap locks* y *next-key locks*, causando bloqueos cruzados (*deadlocks*) frecuentes en inserciones simultáneas de butacas para una misma función. PostgreSQL resuelve la concurrencia con MVCC puro sin bloquear lectores ni saturar segmentos de rollback.
  2. *Índices Parciales:* PostgreSQL permite crear índices únicos condicionales (`CREATE UNIQUE INDEX ... WHERE ...`), ideal para butacas activas tras cancelaciones, característica ausente de forma nativa en MySQL 8.
  3. *Tipos Nativos:* PostgreSQL soporta el tipo nativo `UUID` de 16 bytes y `TIMESTAMPTZ`, mientras que MySQL exige emularlos en `VARCHAR(36)` (degradando índices agrupados) o `BINARY(16)` (añadiendo conversiones manuales).
  4. *Ligereza Operativa:* Contenedor oficial liviano (<140 MB) con arranque en 2 segundos en GitHub Actions.

### ADR-0003. Control de concurrencia atómico mediante restricción de unicidad en PostgreSQL para la reserva de butacas
- **Estado:** Aceptado ([docs/adr/0003-bloqueo-pesimista-butacas.md](docs/adr/0003-bloqueo-pesimista-butacas.md)).
- **Decisión:** Utilizar la restricción compuesta `CONSTRAINT uk_boleto_funcion_asiento UNIQUE (funcion_id, asiento)` a nivel de motor PostgreSQL como mecanismo principal de control de concurrencia atómica.
- **Mecanismo de captura:** El adaptador de persistencia (`PostgresBoletoRepository`) captura la excepción SQLSTATE `23505` (`unique_violation`) y la traduce inmediatamente a `AsientoOcupadoError`, el cual el controlador Express responde como HTTP 400. Esto elimina la necesidad de precargar una tabla pesada de butacas vacías por función para ejecutar `SELECT ... FOR UPDATE`, cerrando al 100% la condición de carrera del Escenario E1 (P0).

### ADR-0004. Consolidación del backend y la rodaja vertical en TypeScript con Express
- **Estado:** Aceptado ([docs/adr/0004-adopcion-typescript-backend.md](docs/adr/0004-adopcion-typescript-backend.md)).
- **Decisión:** Unificar el stack completo del sistema en TypeScript (frontend React 18 y backend Express 5), migrando la rodaja vertical de reservas a `lumiereApp/backend/src/`.
- **Justificación:** Elimina la discrepancia previa donde la rodaja vivía en Python y las rutas de Express eran stubs vacíos. Conecta la rodaja a un endpoint HTTP real y ejecutable (`POST /api/reservas`) y permite ejecutar pruebas en menos de 200 ms con `node:test`.

---

## 5. Diseño de la Interfaz

La interfaz de usuario está desarrollada como una Single Page Application (SPA) en **React 18** con **TypeScript**:

1. **Flujo de Venta Rápida en Taquilla:**
   - Selección de película y función en cartelera activa.
   - Carga del mapa interactivo de la sala con visualización en tiempo real de butacas disponibles, ocupadas y en selección.
   - Ingreso de datos de cliente y confirmación de la venta.
   - Emisión de confirmación con identificador de boleto generado por el backend.
2. **Frontera de Interfaz y Dominio:**
   - El frontend React consume exclusivamente la API REST mediante JSON (`/api/reservas`, `/api/funciones`, `/api/peliculas`).
   - Ninguna regla de negocio crítica (como la verificación de duplicidad o generación de UUIDs) depende del frontend; la validación final y la atomicidad residen en el backend y la base de datos.

---

## 6. Rodaja Vertical en TypeScript

La capacidad **“Reservar boleto”** funciona de extremo a extremo dentro de `lumiereApp/backend`:

### 6.1. Estructura de Paquetes en TypeScript

```text
lumiereApp/backend/src/
├── app.ts                                 # Configuración del servidor Express y middleware
├── index.ts                               # Punto de entrada de la aplicación HTTP
├── db.ts                                  # Pool de conexiones PostgreSQL (pg.Pool)
├── config.ts                              # Variables de entorno
├── domain/                                # Núcleo de Dominio puro
│   ├── cinema.ts                          # Entidad Boleto, UseCase, errores de negocio
│   └── puertos.ts                         # Contrato BoletoRepository (interfaz de salida)
├── infrastructure/                        # Adaptadores de Salida
│   ├── memoria.repository.ts              # InMemoryBoletoRepository (doble de prueba)
│   └── postgres.repository.ts             # PostgresBoletoRepository (PostgreSQL con captura 23505)
├── presentation/                          # Adaptadores de Entrada
│   └── reservas.controller.ts             # ReservasController (HTTP Express y programático)
├── routes/                                # Enrutador de Express
│   ├── index.ts                           # Router general (/api/...)
│   └── reservas.routes.ts                 # Montaje de POST /api/reservas y POST /api/reservas/reservar
└── tests/                                 # Pruebas automatizadas (node:test)
    ├── domain.test.ts                     # Pruebas unitarias de dominio y controlador
    ├── adaptadores.test.ts                # Pruebas de contrato compartidas (Memoria y PostgreSQL)
    └── e2e.test.ts                        # Pruebas de integración HTTP Express
```

### 6.2. Código Clave de Dominio y Puertos

```typescript
// lumiereApp/backend/src/domain/cinema.ts
export class Boleto {
  readonly id: string
  readonly funcionId: string
  readonly asiento: string
  readonly nombreCliente: string
  readonly reservadoEn: Date

  constructor(id: string, funcionId: string, asiento: string, nombreCliente: string, reservadoEn: Date = new Date()) {
    this.id = id
    this.funcionId = funcionId
    this.asiento = asiento
    this.nombreCliente = nombreCliente
    this.reservadoEn = reservadoEn
  }

  static crear(funcionId: string, asiento: string, nombreCliente: string): Boleto {
    return new Boleto(crypto.randomUUID(), funcionId, asiento, nombreCliente, new Date())
  }
}

export interface BoletoRepository {
  guardar(boleto: Boleto): Promise<void>
  buscarPorAsiento(funcionId: string, asiento: string): Promise<Boleto | null>
}

export class ReservarBoletoUseCase {
  private readonly repository: BoletoRepository

  constructor(repository: BoletoRepository) {
    this.repository = repository
  }

  async ejecutar(funcionId: string, asiento: string, nombreCliente: string): Promise<Boleto> {
    if (!funcionId?.trim() || !asiento?.trim() || !nombreCliente?.trim()) {
      throw new DatosInvalidosError('Faltan datos obligatorios')
    }

    const existente = await this.repository.buscarPorAsiento(funcionId.trim(), asiento.trim())
    if (existente !== null) {
      throw new AsientoOcupadoError(`El asiento ${asiento.trim()} ya está ocupado`)
    }

    const boleto = Boleto.crear(funcionId.trim(), asiento.trim(), nombreCliente.trim())
    await this.repository.guardar(boleto)
    return boleto
  }
}
```

### 6.3. Adaptador PostgreSQL con Control Atómico de Concurrencia

```typescript
// lumiereApp/backend/src/infrastructure/postgres.repository.ts
export class PostgresBoletoRepository implements BoletoRepository {
  private readonly pool: Pool

  constructor(pool: Pool) {
    this.pool = pool
  }

  async guardar(boleto: Boleto): Promise<void> {
    try {
      await this.pool.query(
        `INSERT INTO boletos (id, funcion_id, asiento, nombre_cliente, reservado_en)
         VALUES ($1, $2, $3, $4, $5)`,
        [boleto.id, boleto.funcionId, boleto.asiento, boleto.nombreCliente, boleto.reservadoEn]
      )
    } catch (error: unknown) {
      const err = error as { code?: string }
      // Código SQLSTATE 23505 = unique_violation en PostgreSQL
      if (err?.code === '23505') {
        throw new AsientoOcupadoError(`El asiento ${boleto.asiento} ya está ocupado`)
      }
      throw error
    }
  }

  async buscarPorAsiento(funcionId: string, asiento: string): Promise<Boleto | null> {
    const res = await this.pool.query(
      `SELECT id, funcion_id, asiento, nombre_cliente, reservado_en
       FROM boletos WHERE funcion_id = $1 AND asiento = $2`,
      [funcionId, asiento]
    )
    if (res.rows.length === 0) return null
    const row = res.rows[0]
    return new Boleto(String(row.id), String(row.funcion_id), String(row.asiento), String(row.nombre_cliente), new Date(row.reservado_en))
  }
}
```

### 6.4. Evidencia de Ejecución de Pruebas

Al ejecutar el comando unificado `npm test --prefix lumiereApp/backend`:

```text
> backend@1.0.0 test
> node --test --experimental-strip-types src/tests/domain.test.ts src/tests/adaptadores.test.ts src/tests/e2e.test.ts

✔ Contrato de Adaptador: En Memoria (5 pruebas pasadas)
✔ Contrato de Adaptador: PostgreSQL (1 prueba omitida cuando TEST_DATABASE_URL no está activa)
✔ Dominio: ReservarBoletoUseCase (4 pruebas pasadas)
✔ Presentación: ReservasController (3 pruebas pasadas)
✔ Integración HTTP: ReservasController con Express Handler (3 pruebas pasadas)

Total: 15 pruebas pasadas, 1 omitida, 0 fallos
Duración: 179 ms
```

---

## 7. Bitácora de Uso de Inteligencia Artificial

| Sesión / Fecha | Herramienta | Actividad Realizada | Qué se Aceptó | Qué se Descartó y por qué |
|:---:|---|---|---|---|
| Lab 2–3 | Claude / Codex | Revisión de escenarios de calidad y modelo C4 inicial. | Se adoptó la estructura formal de 6 elementos para escenarios y separación inicial de contenedores. | Se descartó imponer mecanismos de bloqueo específicos en la redacción de los escenarios. |
| Lab 4–5 | ChatGPT | Exploración de alternativas de arquitectura (ADRs) y costo del cambio. | Adopción de arquitectura en capas con dominio aislado y evaluación cuantitativa de líneas modificadas. | Se descartó el monolito sin capas (alto acoplamiento) y microservicios (sobrecosto en transacciones distribuidas). |
| Revisión Post-E1 | Gemini Assistant | Migración de la rodaja a TypeScript, resolución de fallas de concurrencia (código 23505) y formalización de reglas de negocio. | Se adoptó la consolidación completa en TypeScript (ADR-0004), corrección de ADR-0003 con restricción `UNIQUE` atómica, y creación de `docs/reglas-de-negocio.md` con trazabilidad a pruebas en `node:test`. | Se descartó mantener un backend dual (Python + TypeScript) para evitar fragmentación del tooling del equipo. |

---

## 8. Matriz de Pendientes para la Entrega Final

| Componente | Estado Actual | Qué Haremos para la Entrega Final |
|---|---|---|
| **Contrato OpenAPI** | Rutas Express funcionales para reservas y cartelera. | Elaborar `docs/api/openapi.yaml`, completar revisión cruzada con otro equipo e implementar validación automática de esquemas de request/response. |
| **Flujo Asíncrono por Eventos** | Transacciones síncronas directas contra PostgreSQL. | Implementar un patrón de eventos de dominio (por ejemplo, publicación asíncrona tras confirmación de boleto para disparar notificación o registro de auditoría independiente). |
| **Despliegue Contenerizado** | Servidores locales en Node 22 y PostgreSQL. | Configurar `docker-compose.yml` en la raíz que levante la base de datos PostgreSQL con migraciones automáticas, el backend en Express y el frontend en React. |
| **Medición de Rendimiento con k6** | Escenarios formalizados con instrumentos y scripts de prueba. | Ejecutar pruebas de carga sostenida con `k6`, recopilar métricas de latencia p95 y throughput antes y después de optimizaciones de índices en PostgreSQL. |
