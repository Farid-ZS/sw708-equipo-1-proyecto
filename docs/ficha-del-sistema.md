## Nombre del sistema

**Lumiere**

## Origen

Curso de Sistema de Gestión de Base de Datos (SW-609).

## Integrantes que participaron

Carlos Chávez y Gonzalo Albornoz.

## Qué hace

Lumiere es un sistema integral para cines que centraliza la programación de la cartelera, venta de entradas y confitería.

- Permite a los usuarios la selección interactiva de butacas en tiempo real durante su compra.
- Brinda a los administradores control total sobre la ocupación de salas y la recaudación por función.

## Lenguaje y stack

- **Lenguaje:** TypeScript (Fullstack).
- **Framework:** Node.js (Express/NestJS) para el backend y React para el frontend.
- **Base de datos:** PostgreSQL.
- **Estilos:** SASS (con CSS Modules).
- **Herramienta de construcción:** Vite (empaquetado del frontend) y NPM/Yarn.

## Repositorio

[https://github.com/Farid-ZS/sw708-equipo-1-proyecto](https://github.com/Farid-ZS/sw708-equipo-1-proyecto)
*(El profesor del curso ya está agregado con permisos de colaborador/lectura para revisión).*

## Reglas de negocio

1. **Evitar overbooking:** Una butaca cuyo estado sea "ocupada" o "reservada en proceso" no puede ser vendida a otro usuario bajo ninguna circunstancia.
2. **Control de aforos cruzados:** No se puede programar una película en una sala si los horarios chocan o si no se respeta el margen obligatorio de 30 minutos de limpieza entre funciones.
3. **Restricción de edad:** El sistema no debe permitir la emisión de boletos con tarifa de "Niño" si la película tiene clasificación para mayores de 18 años.

## Cómo se levanta hoy (Sistema original)

1. **Instalar los requisitos**
   - Docker Desktop para Windows.
   - Docker Compose, incluido normalmente en Docker Desktop.
   - Git, si se clonará el repositorio.
   - Al menos 6 GB de RAM disponibles para Docker, debido a Oracle XE.

2. **Clonar o abrir el proyecto**
   ```powershell
   git clone https://github.com/gonzalouni/CineStar-Barrio.git
   cd CineStar-Barrio
   ```

3. **Crear el archivo `.env` en la raíz del proyecto**

   Debe estar junto a `docker-compose.yml`:

   ```env
   ORACLE_PASSWORD=uni123
   ORACLE_OPS_USER=CINESTAR_OPS
   ORACLE_OPS_PASSWORD=OpsPass2024!
   ORACLE_ADMIN_USER=CINESTAR_ADMIN
   ORACLE_ADMIN_PASSWORD=AdminPass2024!

   PORT=3000
   DB_PORT=1521
   DB_SERVICE=XEPDB1

   JWT_SECRET=cinestar-secret-change-me
   JWT_EXPIRATION=8h
   JWT_REFRESH_EXPIRATION=24h
   NODE_ENV=development
   ```

4. **Construir y levantar todos los servicios**

   Ejecutar desde la carpeta raíz:

   ```powershell
   docker compose up --build
   ```

   Se levantarán:
   - Oracle Database 21c XE.
   - Backend Node.js/Express en el puerto `3000`.
   - Frontend React/Vite en el puerto `5173`.

5. **Abrir la aplicación**

   Frontend:

   [http://localhost:5173](http://localhost:5173)

   Backend:

   [http://localhost:3000](http://localhost:3000)

6. **Iniciar sesión con usuarios de prueba**

   - Administrador:
     - Usuario: `admin`
     - Contraseña: `admin123`

   - Operador:
     - Usuario: `operador1`
     - Contraseña: `operador123`

   - Segundo operador:
     - Usuario: `operador2`
     - Contraseña: `operador123`

El proyecto necesita principalmente Docker Desktop y el archivo `.env`; no es necesario instalar Oracle, Node.js ni React directamente en Windows para usar el despliegue mediante Docker.

## Qué le falta o qué le duele

- **Concurrencia frágil:** Al reservar butacas, si dos personas clickean el mismo asiento en el mismo segundo, la base de datos a veces no hace el bloqueo (lock) a tiempo y el sistema se marea.
- **Acoplamiento:** El módulo de ventas de dulcería está demasiado acoplado al de las entradas; el código es un controlador gigante que da miedo tocar porque si se cambia algo, se rompe el cálculo de los impuestos totales.
- **Rendimiento (Sin Caché):** No hay sistema de caché, así que cada vez que alguien entra al home, se hacen múltiples consultas pesadas a la base de datos para cargar la cartelera de la semana.