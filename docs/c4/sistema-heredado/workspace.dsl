workspace "CineStar Barrio" "Sistema de Gestión de Reservas y Venta de Entradas" {

    model {
        operador = person "Operador" "Atiende clientes presenciales (taquilla) y por teléfono; registra reservas, ventas y cancelaciones"
        administrador = person "Administrador" "Configura cartelera, salas, usuarios y consulta reportes"

        cineStar = softwareSystem "CineStar Barrio" "Centraliza cartelera, asientos, reservas, ventas y cancelaciones evitando sobreventa" {

            termTaquilla = container "Terminal de Taquilla" "Mapa de asientos, reservas, ventas, cancelaciones, consultas" "Aplicación cliente"
            termAdmin = container "Terminal Administrativa" "Cartelera, funciones, salas, usuarios, reportes" "Aplicación cliente"

            appServer = container "Servidor de Aplicación" "Autenticación, reglas de negocio, control de concurrencia, auditoría" "Backend" {
                auth = component "Autenticación y Autorización" "Valida credenciales, roles y permisos por esquema"
                cartelera = component "Cartelera y Funciones" "CRUD de películas/funciones, valida solapamiento de horarios"
                salas = component "Salas y Asientos" "Configura disposición de asientos por sala"
                reservas = component "Reservas y Ventas" "Control de concurrencia, transacciones atómicas, código único de boleto"
                cancelaciones = component "Cancelaciones" "Libera asientos y dispara registro de auditoría"
                consultas = component "Consultas" "Disponibilidad en tiempo real e historial"
                reportes = component "Reportes" "Ocupación, ventas, cancelaciones; exporta PDF/CSV"
                auditoria = component "Auditoría / Logging" "Registra operaciones críticas con usuario y timestamp"
            }

            dbOperativo = container "Esquema Operativo" "Películas, funciones, salas, asientos, reservas, ventas" "Oracle 21c XE" "Database"
            dbAdmin = container "Esquema Administrativo / Auditoría" "Usuarios, roles, logs, reportes" "Oracle 21c XE" "Database"
        }

        # Relaciones de contexto
        operador -> cineStar "Reserva y cancela entradas"
        administrador -> cineStar "Gestiona cartelera y reportes"

        # Relaciones de contenedores
        operador -> termTaquilla "Usa"
        administrador -> termAdmin "Usa"
        termTaquilla -> appServer "Solicitudes de reserva/venta/consulta" "API/TCP"
        termAdmin -> appServer "Solicitudes de administración/reportes" "API/TCP"
        appServer -> dbOperativo "Lee y escribe (transacciones atómicas)" "SQL"
        appServer -> dbAdmin "Lee y escribe (usuarios, logs, reportes)" "SQL"

        # Relaciones de componentes
        cartelera -> dbOperativo "Lee/escribe"
        salas -> dbOperativo "Lee/escribe"
        reservas -> dbOperativo "Lee/escribe"
        consultas -> dbOperativo "Lee"
        cancelaciones -> dbOperativo "Actualiza"
        cancelaciones -> auditoria "Notifica evento"
        reservas -> auditoria "Notifica evento"
        auditoria -> dbAdmin "Escribe logs"
        reportes -> dbAdmin "Lee logs/usuarios"
        reportes -> dbOperativo "Lee datos operativos"
        auth -> dbAdmin "Valida usuarios y roles"

        termTaquilla -> auth "Autentica"
        termAdmin -> auth "Autentica"
        termTaquilla -> reservas "Crea/consulta reservas y ventas"
        termTaquilla -> cancelaciones "Cancela reservas"
        termTaquilla -> consultas "Consulta disponibilidad"
        termAdmin -> cartelera "Administra"
        termAdmin -> salas "Administra"
        termAdmin -> reportes "Genera y exporta"
    }

    views {
        systemContext cineStar "Contexto" {
            include *
            autoLayout
        }

        container cineStar "Contenedores" {
            include *
            autoLayout
        }

        component appServer "Componentes" {
            include *
            autoLayout
        }

        styles {
            element "Person" {
                shape person
                background #999999
                color #ffffff
            }
            element "Software System" {
                background #a8112e
                color #ffffff
            }
            element "Container" {
                background #1168bd
                color #ffffff
            }
            element "Database" {
                shape cylinder
            }
            element "Component" {
                background #85bbf0
                color #000000
            }
        }
    }

}