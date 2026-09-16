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

1. Clonar el repositorio y correr `composer install` y `npm install` para bajar todo el peso de las dependencias.
2. Duplicar el archivo `.env.example`, renombrarlo a `.env`, generar la key de la app y configurar las credenciales locales de MySQL.
3. Crear la base de datos vacía y ejecutar `php artisan migrate --seed` *(paso crítico, porque si no se corre el seeder con la data falsa, la vista principal se rompe al no encontrar películas)*.
4. Abrir dos terminales: en una correr `php artisan serve` y en la otra `npm run dev`.

## Qué le falta o qué le duele

- **Concurrencia frágil:** Al reservar butacas, si dos personas clickean el mismo asiento en el mismo segundo, la base de datos a veces no hace el bloqueo (lock) a tiempo y el sistema se marea.
- **Acoplamiento:** El módulo de ventas de dulcería está demasiado acoplado al de las entradas; el código es un controlador gigante que da miedo tocar porque si se cambia algo, se rompe el cálculo de los impuestos totales.
- **Rendimiento (Sin Caché):** No hay sistema de caché, así que cada vez que alguien entra al home, se hacen múltiples consultas pesadas a la base de datos para cargar la cartelera de la semana.