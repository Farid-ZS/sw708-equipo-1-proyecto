workspace "CineStar-Barrio" "Arquitectura del sistema de cine" {

    model {
        // --- ACTORES ---
        cliente = person "Cliente" "Usuario que navega por la cartelera, selecciona horarios y reserva asientos." "Actor"
        administrador = person "Administrador" "Personal del cine. Gestiona películas, salas, reportes y permisos." "Actor"

        // --- SISTEMA PRINCIPAL ---
        cineStarBarrio = softwareSystem "CineStar-Barrio" "Sistema integral de gestión de reservas de cine." "Sistema" {
            
            frontend = container "Frontend SPA" "Aplicación web que provee la interfaz de usuario para clientes y personal." "React 18 / Vite / TypeScript" "WebBrowser"
            database = container "Base de Datos" "Almacena esquemas transaccionales, usuarios, permisos y configuración." "Oracle 21c XE" "Database"
            
            backend = container "API Backend" "API de servicios que procesa la lógica de negocio, autenticación y reservas." "Node.js / Express / TypeScript" "API" {
                // --- COMPONENTES DEL BACKEND ---
                seguridad = component "Módulo de Seguridad" "Gestiona la autenticación, autorización y cuentas de usuario." "Express Router / Controller"
                catalogo = component "Catálogo de Cine" "Administra el registro de películas y la infraestructura de salas." "Express Router / Controller"
                programacion = component "Programación de Funciones" "Gestiona la cartelera, horarios y asignación de películas." "Express Router / Controller"
                reservas = component "Gestión de Reservas" "Procesa la selección de asientos y confirmación de entradas." "Express Router / Controller"
                analitica = component "Analítica y Reportes" "Genera métricas, estadísticas y consultas para administración." "Express Router / Controller"
                dbManager = component "Gestor de Base de Datos" "Centraliza el pool de conexiones y transacciones hacia Oracle." "Node.js Module / OracleDB"
            }

            // --- RELACIONES INTERNAS (Contenedores) ---
            frontend -> backend "Realiza peticiones de datos a" "JSON/HTTPS"
            backend -> database "Lee y escribe registros en" "SQL"

            // --- RELACIONES: Frontend -> Componentes ---
            frontend -> seguridad "Inicia sesión y gestiona usuarios en" "JSON/HTTPS"
            frontend -> catalogo "Consulta el catálogo de películas en" "JSON/HTTPS"
            frontend -> programacion "Consulta las funciones disponibles en" "JSON/HTTPS"
            frontend -> reservas "Realiza el flujo de compra de boletos en" "JSON/HTTPS"
            frontend -> analitica "Solicita métricas para el dashboard en" "JSON/HTTPS"

            // --- RELACIONES: Componentes -> Gestor DB ---
            seguridad -> dbManager "Valida credenciales y roles mediante" "Llamada a función"
            catalogo -> dbManager "Lee y actualiza el catálogo mediante" "Llamada a función"
            programacion -> dbManager "Consulta horarios de cartelera mediante" "Llamada a función"
            reservas -> dbManager "Registra transacciones de compra mediante" "Llamada a función"
            analitica -> dbManager "Ejecuta consultas de agregación mediante" "Llamada a función"

            // --- RELACIONES: Gestor DB -> Base de Datos ---
            dbManager -> database "Ejecuta sentencias SQL y procedimientos almacenados en" "SQL / TCP"
        }

        // --- RELACIONES EXTERNAS (Contexto) ---
        cliente -> frontend "Visualiza cartelera y reserva entradas en" "HTTPS"
        administrador -> frontend "Gestiona operaciones internas y reportes en" "HTTPS"
    }

    views {
        systemContext cineStarBarrio "SystemContext" {
            include *
            autoLayout
        }

        container cineStarBarrio "ContainerView" {
            include *
            autoLayout
        }

        component backend "ComponentView" {
            include *
            autoLayout tb
        }
        
        // --- REGLAS VISUALES ---
        styles {
            element "Actor" {
                shape Person
                background #08427b
                color #ffffff
            }
            element "Sistema" {
                background #1168bd
                color #ffffff
            }
            element "WebBrowser" {
                shape WebBrowser
                background #438dd5
                color #ffffff
            }
            element "API" {
                shape RoundedBox
                background #438dd5
                color #ffffff
            }
            element "Database" {
                shape Cylinder
                background #2e6093
                color #ffffff
            }
        }
        
        theme default
    }
}