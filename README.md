# CineStar-Barrio

## Qué es

CineStar-Barrio es un sistema integral para la gestión de un cine. Centraliza la programación de la cartelera, la venta de entradas y la confitería.

El sistema permite seleccionar butacas durante la compra y brinda a los administradores control sobre la ocupación de las salas y la recaudación por función.

## Stack actual

- **Backend:** Node.js 20, Express y TypeScript.
- **Frontend:** React 18, Vite, TypeScript y React Router.
- **Base de datos:** Oracle Database 21c XE.
- **Lenguajes:** TypeScript, PL/SQL y CSS.
- **Autenticación:** JWT y `bcryptjs`.
- **Estilos:** CSS tradicional, sin Sass ni CSS Modules.
- **Despliegue:** Docker Compose.

## Cómo levantarlo

### Requisitos

- Docker Desktop para Windows.
- Docker Compose, incluido normalmente en Docker Desktop.
- Git.
- Al menos 6 GB de RAM disponibles para Docker por el uso de Oracle XE.

### Instalación y configuración

Clona el proyecto y entra en su carpeta:

```powershell
git clone https://github.com/gonzalouni/CineStar-Barrio.git
cd CineStar-Barrio
```

Copia `.env.example` como `.env` junto a `docker-compose.yml` y completa los valores localmente:

```powershell
Copy-Item .env.example .env
```

Variables esperadas:

```env
ORACLE_PASSWORD=
ORACLE_OPS_USER=
ORACLE_OPS_PASSWORD=
ORACLE_ADMIN_USER=
ORACLE_ADMIN_PASSWORD=

PORT=3000
DB_PORT=1521
DB_SERVICE=XEPDB1

JWT_SECRET=
JWT_EXPIRATION=8h
JWT_REFRESH_EXPIRATION=24h
NODE_ENV=development
```

El archivo `.env` contiene valores locales y no debe subirse al repositorio.

### Ejecución

Desde la raíz del proyecto:

```powershell
docker compose up --build
```

Servicios disponibles:

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:3000](http://localhost:3000)
- Oracle Database: puerto `1521`, servicio `XEPDB1`

## Dónde está cada cosa

```text
CineStar-Barrio/
├── docker-compose.yml       Orquesta Oracle, backend y frontend
├── .env.example             Plantilla de variables de entorno sin secretos
├── backend/                  API y lógica del servidor
│   ├── src/                  Código TypeScript del backend
│   ├── database/             Scripts y objetos PL/SQL de Oracle
│   └── Dockerfile            Imagen del backend
├── frontend/                 Interfaz web de React
│   ├── src/                  Componentes, páginas y estilos
│   └── Dockerfile            Imagen del frontend
└── README.md                 Guía del proyecto
```

La estructura exacta puede variar según la rama del proyecto, pero Docker Compose y `.env` se ubican en la raíz para coordinar todos los servicios.