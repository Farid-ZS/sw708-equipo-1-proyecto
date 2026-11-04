# Lumiere — Sistema de Gestión y Reserva de Cines

Proyecto Integrador de Arquitectura de Soluciones de Software  
**Curso:** SW708 Arquitectura de Soluciones de Software — Sección U  
**Institución:** Facultad de Ingeniería Industrial y de Sistemas (FIIS) — Universidad Nacional de Ingeniería (UNI)  
**Profesor:** Elio Navarrete Vilca  

---

## 1. Integrantes del Equipo (Equipo N.° 1)

| N.° | Apellidos y Nombres | Código UNI | Usuario de GitHub | Correo Institucional | Rol Principal |
|:---:|---|:---:|:---:|:---:|---|
| 1 | Chavez Oliva, Carlos Daniel | 20232622E | [@carloz-chavez](https://github.com/carloz-chavez) | `carlos.chavez.o@uni.pe` | Coordinador / UI & Bitácora |
| 2 | Albornoz Azurza, Gonzalo Alessandro | 20232551K | [@gonzalouni](https://github.com/gonzalouni) | `gonzalo.albornoz.a@uni.pe` | Decisiones de Arquitectura (ADR) |
| 3 | Suazo Zanabria, Dino Paul Roel | 20231324K | [@SuazoDino](https://github.com/SuazoDino) | `dino.suazo.z@uni.pe` | Modelo C4 (Contexto, Contenedores, Componentes) |
| 4 | Vargas Ponce, Luis Angel | 20231314E | [@AngelVarP](https://github.com/AngelVarP) | `luis.vargas.p@uni.pe` | Rodaja Vertical, Pruebas y CI/CD |
| 5 | Zamudio Sánchez, Farid Paolo | 20231215G | [@Farid-ZS](https://github.com/Farid-ZS) | `farid.zamudio.s@uni.pe` | Escenarios de Calidad y Priorización |

---

## 2. Descripción del Sistema

**Lumiere** es una plataforma integral para la gestión de salas de cine y venta de boletos. Centraliza la cartelera, la reserva concurrente de butacas en tiempo real, la emisión de boletos digitales con identificadores únicos inmutables y la administración de funciones.

El sistema fue diseñado aplicando los principios de la **Arquitectura Hexagonal (Puertos y Adaptadores)** con núcleo de dominio aislado, garantizando alta cohesión, desacoplamiento estricto de la persistencia y control atómico de concurrencia para evitar la sobreventa (*overbooking*).

---

## 3. Stack Tecnológico

- **Backend:** Node.js (v22+), Express 5 y TypeScript.
- **Frontend:** React 18, Vite, TypeScript y Sass / CSS Modules.
- **Base de Datos:** PostgreSQL 16 con restricciones compuestas de unicidad y MVCC.
- **Estilo Arquitectónico:** Arquitectura Hexagonal con dominio limpio e inversión de dependencias ([ADR-0001](docs/adr/0001-eleccion-estilo-arquitectonico.md), [ADR-0004](docs/adr/0004-adopcion-typescript-backend.md)).
- **Mecanismo de Concurrencia:** Control atómico por índice único `UNIQUE (funcion_id, asiento)` con traducción determinista de excepciones de base de datos a excepciones de dominio ([ADR-0003](docs/adr/0003-bloqueo-pesimista-butacas.md)).
- **Testing:** Test runner nativo de Node.js (`node:test` y `node:assert/strict`) con ejecución directa de TypeScript vía *type stripping*.

---

## 4. Requisitos Previos

- **Node.js:** Versión 22.0.0 o superior recomendada (o Node 20 con soporte de módulos ESM).
- **PostgreSQL:** Versión 15 o 16 (local o mediante contenedor Docker).
- **Git:** Para control de versiones.

---

## 5. Instrucciones de Construcción y Ejecución

### 5.1. Clonar el Repositorio

```bash
git clone https://github.com/Farid-ZS/sw708-equipo-1-proyecto.git
cd sw708-equipo-1-proyecto
```

### 5.2. Configuración de la Base de Datos (PostgreSQL)

Crea la base de datos y ejecuta el script de inicialización de la tabla `boletos`:

```bash
# Opción A: Con psql local
psql -U postgres -c "CREATE DATABASE boletos_db;"
psql -U postgres -d boletos_db -f database/lab06_hexagonal/01_create_boletos.sql

# Opción B: Con Docker
docker run --name lumiere-postgres -e POSTGRES_PASSWORD=sw708_lab -e POSTGRES_USER=sw708 -e POSTGRES_DB=boletos_db -p 5432:5432 -d postgres:16
psql -h localhost -p 5432 -U sw708 -d boletos_db -f database/lab06_hexagonal/01_create_boletos.sql
```

### 5.3. Backend (API y Rodaja Vertical)

Entra en la carpeta del backend:

```bash
cd lumiereApp/backend
```

Configura las variables de entorno:

```bash
cp .env.example .env
```

*(Edita el archivo `.env` según tus credenciales de PostgreSQL si difieren del valor por defecto).*

#### Ejecución de Pruebas Automatizadas
Para verificar las reglas de negocio, los adaptadores (en memoria y PostgreSQL) y las pruebas de integración del controlador Express:

```bash
npm test
```

#### Iniciar el Servidor en Desarrollo
```bash
npm run dev
```

El servidor iniciará en: **`http://localhost:3000`**

- **Health check:** `GET http://localhost:3000/api/health`
- **Endpoint de Reservas (Rodaja Vertical):** `POST http://localhost:3000/api/reservas`
  - Ejemplo de carga útil (*payload*):
    ```json
    {
      "funcion_id": "F001",
      "asiento": "A12",
      "nombre_cliente": "Carlos Daniel Chavez"
    }
    ```
  - Respuestas esperadas:
    - **HTTP 201 Created:** Reserva exitosa con UUID generado y marca de tiempo.
    - **HTTP 400 Bad Request:** Asiento ya ocupado (`AsientoOcupadoError`) o datos incompletos (`DatosInvalidosError`).

### 5.4. Frontend (Aplicación Web)

En otra terminal, ingresa a la carpeta del cliente:

```bash
cd lumiereApp/frontend
npm install
npm run dev
```

La interfaz web quedará disponible en: **`http://localhost:5173`**

---

## 6. Estructura del Repositorio

```text
sw708-equipo-1-proyecto/
├── README.md                          # Guía principal de ejecución y arquitectura
├── .mailmap                           # Mapeo canónico de identidades de Git
├── .gitignore                         # Exclusión global (node_modules, venv, secretos)
├── database/                          # Scripts de base de datos DDL / esquemas
│   └── lab06_hexagonal/
│       └── 01_create_boletos.sql      # Definición de la tabla boletos con UNIQUE constraint
├── docs/                              # Documentación de arquitectura de soluciones
│   ├── arquitectura.md                # Informe oficial consolidado de arquitectura
│   ├── reglas-de-negocio.md           # Trazabilidad de reglas de negocio (RN-01 a RN-05)
│   ├── escenarios.md                  # Escenarios de calidad priorizados con instrumentos
│   ├── c4-modelo.md                   # Modelo C4 (Contexto, Contenedores, Componentes)
│   ├── costo-del-cambio.md            # Métricas del experimento arquitectónico
│   └── adr/                           # Registros de Decisiones de Arquitectura (ADRs)
│       ├── 0001-eleccion-estilo-arquitectonico.md
│       ├── 0002-adopcion-de-Postgresql.md
│       ├── 0003-bloqueo-pesimista-butacas.md
│       └── 0004-adopcion-typescript-backend.md
└── lumiereApp/                        # Aplicación integral del sistema
    ├── backend/                       # Servidor API en TypeScript con Arquitectura Hexagonal
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── app.ts                 # Configuración del servidor Express
    │       ├── index.ts               # Punto de entrada HTTP
    │       ├── db.ts                  # Pool de conexiones PostgreSQL
    │       ├── domain/                # Núcleo de Dominio (Boleto, Casos de Uso, Errores)
    │       ├── infrastructure/        # Adaptadores (PostgresBoletoRepository, InMemory)
    │       ├── presentation/          # Controladores HTTP (ReservasController)
    │       ├── routes/                # Rutas Express (/api/reservas, /api/peliculas...)
    │       └── tests/                 # Pruebas automatizadas (domain, adaptadores, e2e)
    └── frontend/                      # Cliente web en React 18 con Vite
```

---

## 7. Decisiones de Arquitectura Registradas (ADRs)

| ADR | Título | Estado |
|:---:|---|:---:|
| [ADR-0001](docs/adr/0001-eleccion-estilo-arquitectonico.md) | Elección del estilo arquitectónico hexagonal (Puertos y Adaptadores) con dominio aislado | Aceptado |
| [ADR-0002](docs/adr/0002-adopcion-de-Postgresql.md) | Adopción de PostgreSQL como gestor de base de datos con análisis comparativo frente a MySQL | Aceptado |
| [ADR-0003](docs/adr/0003-bloqueo-pesimista-butacas.md) | Control de concurrencia atómico mediante restricción de unicidad en PostgreSQL | Aceptado |
| [ADR-0004](docs/adr/0004-adopcion-typescript-backend.md) | Consolidación del backend y la rodaja vertical en TypeScript con Express | Aceptado |
