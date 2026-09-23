# Leyenda del Modelo C4

**1. Qué muestra cada figura:**
El modelo expone la arquitectura actual de CineStar-Barrio. Muestra la interacción de clientes y administradores con la SPA en React 18, la comunicación vía JSON/HTTPS hacia el backend en Node.js/Express, y la persistencia hacia Oracle 21c XE. A nivel de componentes, el backend se divide en las siguientes responsabilidades lógicas:

- **Módulo de Seguridad:** Gestiona la autenticación, autorización y cuentas de usuario.
- **Catálogo de Cine:** Administra el registro de películas y la infraestructura de salas.
- **Programación de Funciones:** Gestiona la cartelera, horarios y asignación de películas.
- **Gestión de Reservas:** Procesa la selección de asientos y confirmación de entradas.
- **Analítica y Reportes:** Genera métricas, estadísticas y consultas para administración.
- **Gestor de Base de Datos:** Centraliza el pool de conexiones y transacciones hacia Oracle.

**2. Qué se dejó afuera a propósito:**
Se omitieron las tecnologías de la futura migración (NestJS, PostgreSQL) y el nombre "Lumiere" para documentar estrictamente el código `as-is`. Tampoco se incluyeron sistemas externos (pasarelas de pago o correos institucionales), ya que no existen en la implementación actual.

**3. Observación del equipo:**
Al modelar los componentes del backend, descubrimos que el "Gestor de Base de Datos" actúa como un embudo crítico. Todos los demás módulos (seguridad, catálogo, reservas) golpean directamente a Oracle a través de este único punto, sin ningún mecanismo de caché, balanceador o cola de mensajes intermedio. Esto hace evidente por qué el sistema sufre de concurrencia frágil al reservar butacas, tal como documentamos en la ficha del sistema.
