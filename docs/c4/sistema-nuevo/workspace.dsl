workspace {
    name "LumiereApp"

    model {
        cliente = person "Cliente" "Usuario que consulta cartelera, selecciona función y realiza reserva/compra de boletos."
        admin = person "Administrador" "Usuario con permisos para gestionar catálogo, funciones, salas, ventas y reportes."
        correo = softwareSystem "Sistema de correo electrónico" "Servicio externo para envío de notificaciones." "External"
        pagos = softwareSystem "Pasarela de pagos" "Servicio externo para procesamiento de pagos." "External"

        lumiere = softwareSystem "Lumiere App" "Sistema web monolítico modular para reserva y venta de boletos de cine." {
            spa = container "Aplicación Web SPA" "Interfaz para clientes y administración." "React" "Web Browser"
            api = container "API Backend" "API REST monolítica modular." "Node.js" "Server" {
                router = component "API Router" "Enruta las peticiones HTTP a cada módulo." "Express"
                mid = component "Middlewares" "CORS, JSON, manejo de errores." "Express"
                authMid = component "Auth RBAC" "Autenticación JWT y autorización por roles." "Express"
                authC = component "AuthController" "Adaptador primario HTTP - Autenticación." "Express"
                authU = component "AuthUseCase" "Aplica reglas de negocio de autenticación." "TypeScript"
                authP = component "AuthRepository Puerto" "Contrato de persistencia/autenticación." "Interface"
                authR = component "AuthRepository PG" "Implementa acceso a datos de autenticación." "TypeScript"
                pelC = component "PeliculasController" "Adaptador primario HTTP - Catálogo." "Express"
                pelU = component "GestionarCarteleraUseCase" "Aplica reglas de negocio del catálogo." "TypeScript"
                pelP = component "PeliculaRepository Puerto" "Contrato de persistencia de películas." "Interface"
                pelR = component "PostgresPeliculaRepository" "Implementa acceso a datos de películas." "TypeScript"
                funC = component "FuncionesController" "Adaptador primario HTTP - Funciones." "Express"
                funU = component "GestionarFuncionesUseCase" "Aplica reglas de negocio de funciones." "TypeScript"
                funP = component "FuncionRepository Puerto" "Contrato de persistencia de funciones." "Interface"
                funR = component "PostgresFuncionRepository" "Implementa acceso a datos de funciones." "TypeScript"
                salC = component "SalasController" "Adaptador primario HTTP - Salas." "Express"
                salU = component "GestionarSalasUseCase" "Aplica reglas de negocio de salas." "TypeScript"
                salP = component "SalaRepository Puerto" "Contrato de persistencia de salas." "Interface"
                salR = component "PostgresSalaRepository" "Implementa acceso a datos de salas." "TypeScript"
                sedC = component "SedesController" "Adaptador primario HTTP - Sedes." "Express"
                sedU = component "GestionarSedesUseCase" "Aplica reglas de negocio de sedes." "TypeScript"
                sedP = component "SedeRepository Puerto" "Contrato de persistencia de sedes." "Interface"
                sedR = component "PostgresSedeRepository" "Implementa acceso a datos de sedes." "TypeScript"
                rCtrl = component "ReservasController" "Adaptador primario HTTP - Reservas." "Express"
                rUC = component "ReservarBoletoUseCase" "Aplica reglas de negocio para reservar asiento." "TypeScript"
                rP = component "BoletoRepository Puerto" "Contrato de persistencia de boletos." "Interface"
                rR = component "PostgresBoletoRepository" "Implementa acceso a datos de boletos." "TypeScript"
                venC = component "VentasController" "Adaptador primario HTTP - Ventas." "Express"
                venU = component "ConfirmarVentaUseCase" "Orquesta la confirmación de venta." "TypeScript"
                venP = component "VentaRepository Puerto" "Contrato de persistencia de ventas." "Interface"
                venR = component "PostgresVentaRepository" "Implementa acceso a datos de ventas." "TypeScript"
                canC = component "CancelacionesController" "Adaptador primario HTTP - Cancelaciones." "Express"
                canU = component "CancelarBoletoUseCase" "Aplica reglas con trazabilidad inmutable." "TypeScript"
                canP = component "AuditoriaRepository Puerto" "Contrato de persistencia de auditoría." "Interface"
                canR = component "PostgresAuditoriaRepository" "Implementa acceso a datos de auditoría." "TypeScript"
                confC = component "ConfiteriaController" "Adaptador primario HTTP - Confitería." "Express"
                confU = component "GestionarConfiteriaUseCase" "Aplica reglas de negocio de confitería." "TypeScript"
                confP = component "ConfiteriaRepository Puerto" "Contrato de persistencia de confitería." "Interface"
                confR = component "PostgresConfiteriaRepository" "Implementa acceso a datos de confitería." "TypeScript"
                repC = component "ReportesController" "Adaptador primario HTTP - Reportes." "Express"
                repU = component "GenerarReporteUseCase" "Genera reportes administrativos." "TypeScript"
                repP = component "ReportesRepository Puerto" "Contrato de consulta de reportes." "Interface"
                repR = component "PostgresReportesRepository" "Implementa consultas de reportes." "TypeScript"
                infraDb = component "Infra Compartida (db.ts / pg.Pool)" "Gestiona el pool de conexiones a PostgreSQL." "TypeScript"
            }
            db = container "Base de datos" "Almacén transaccional PostgreSQL." "PostgreSQL" "Database"
        }

        cliente -> lumiere "Consulta cartelera, selecciona función y reserva/compra boletos"
        admin -> lumiere "Administra películas, funciones, salas, sedes, ventas y reportes"
        cliente -> spa "Usa desde navegador web"
        admin -> spa "Usa desde navegador web"
        spa -> api "Realiza peticiones HTTPS/REST (JSON)"
        api -> db "Lee y escribe datos (SQL vía pg)"
        api -> correo "Envía notificaciones (confirmaciones/cancelaciones)"
        api -> pagos "Solicita autorización y captura de pagos"
        router -> mid "Aplica middlewares"
        router -> authMid "Aplica autorización por roles"
        router -> authC "Enruta petición"
        router -> pelC "Enruta petición"
        router -> funC "Enruta petición"
        router -> salC "Enruta petición"
        router -> sedC "Enruta petición"
        router -> rCtrl "Enruta petición"
        router -> venC "Enruta petición"
        router -> canC "Enruta petición"
        router -> confC "Enruta petición"
        router -> repC "Enruta petición"
        authC -> authU "Invoca lógica de negocio"
        authU -> authP "Usa contrato"
        authR -> authP "Implementa puerto"
        authR -> infraDb "Solicita conexión/ejecución SQL"
        pelC -> pelU "Invoca lógica de negocio"
        pelU -> pelP "Usa contrato"
        pelR -> pelP "Implementa puerto"
        pelR -> infraDb "Solicita conexión/ejecución SQL"
        funC -> funU "Invoca lógica de negocio"
        funU -> funP "Usa contrato"
        funR -> funP "Implementa puerto"
        funR -> infraDb "Solicita conexión/ejecución SQL"
        salC -> salU "Invoca lógica de negocio"
        salU -> salP "Usa contrato"
        salR -> salP "Implementa puerto"
        salR -> infraDb "Solicita conexión/ejecución SQL"
        sedC -> sedU "Invoca lógica de negocio"
        sedU -> sedP "Usa contrato"
        sedR -> sedP "Implementa puerto"
        sedR -> infraDb "Solicita conexión/ejecución SQL"
        rCtrl -> rUC "Invoca lógica de negocio"
        rUC -> rP "Usa contrato"
        rR -> rP "Implementa puerto"
        rR -> infraDb "Solicita conexión/ejecución SQL"
        venC -> venU "Invoca lógica de negocio"
        venU -> venP "Usa contrato"
        venR -> venP "Implementa puerto"
        venR -> infraDb "Solicita conexión/ejecución SQL"
        canC -> canU "Invoca lógica de negocio"
        canU -> canP "Usa contrato"
        canR -> canP "Implementa puerto"
        canR -> infraDb "Solicita conexión/ejecución SQL"
        confC -> confU "Invoca lógica de negocio"
        confU -> confP "Usa contrato"
        confR -> confP "Implementa puerto"
        confR -> infraDb "Solicita conexión/ejecución SQL"
        repC -> repU "Invoca lógica de negocio"
        repU -> repP "Usa contrato"
        repR -> repP "Implementa puerto"
        repR -> infraDb "Solicita conexión/ejecución SQL"
        infraDb -> db "Ejecuta consultas SQL (pg)"
    }

    views {
        systemContext lumiere "Contexto" {
            include *
            autolayout lr
        }
        container lumiere "Contenedores" {
            include *
            autolayout lr
        }
        component api "Componentes" {
            include *
            autolayout lr
        }
        styles {
            element "Software System" {
                background #1168BD
                color #ffffff
            }
            element "Container" {
                background #438DD5
                color #ffffff
            }
            element "Component" {
                background #85BBF0
                color #000000
            }
            element "Person" {
                shape Person
                background #08427B
                color #ffffff
            }
            element "External" {
                background #999999
                color #ffffff
            }
            element "Database" {
                shape Cylinder
                background #438DD5
                color #ffffff
            }
            element "Web Browser" {
                shape WebBrowser
                background #438DD5
                color #ffffff
            }
            element "Server" {
                background #85BBF0
                color #000000
            }
        }
    }
}