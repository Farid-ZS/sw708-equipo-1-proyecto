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
                rCtrl = component "ReservasController" "Adaptador primario HTTP - Reservas." "Express"
                rUC = component "ReservarBoletoUseCase" "Aplica reglas de negocio para reservar asiento." "TypeScript"
                rP = component "BoletoRepository Puerto" "Contrato de persistencia de boletos." "Interface"
                rR = component "PostgresBoletoRepository" "Implementa acceso a datos de boletos." "TypeScript"
                evP = component "PublicadorDeEventos Puerto" "Contrato de salida: el dominio publica ReservaConfirmada sin conocer a los consumidores." "Interface"
                evBus = component "BusDeEventosEnMemoria" "Adaptador en memoria del puerto de eventos; entrega el evento a los consumidores suscritos." "TypeScript"
                audC = component "Auditoría de reservas (consumidor)" "Módulo aparte que reacciona a ReservaConfirmada y registra la operación." "TypeScript"
                pend = component "Módulos por construir (9)" "Auth RBAC, Autenticación, Catálogo, Funciones, Salas, Sedes, Ventas, Cancelaciones, Confitería y Reportes. Hoy sus rutas responden con un stub." "Express" "Por construir"
                infraDb = component "Infra Compartida (db.ts / pg.Pool)" "Gestiona el pool de conexiones a PostgreSQL." "TypeScript"
            }
            db = container "Base de datos" "Almacén transaccional PostgreSQL." "PostgreSQL" "Database"
        }

        cliente -> lumiere "Consulta cartelera, selecciona función y reserva/compra boletos"
        admin -> lumiere "Administra películas, funciones, salas, sedes, ventas y reportes"
        cliente -> spa "Usa desde navegador web"
        admin -> spa "Usa desde navegador web"
        spa -> api "Realiza peticiones HTTPS/REST (JSON)" "" "Por construir"
        api -> db "Lee y escribe datos (SQL vía pg)"
        api -> correo "Envía notificaciones (confirmaciones/cancelaciones)" "" "Por construir"
        api -> pagos "Solicita autorización y captura de pagos" "" "Por construir"
        router -> mid "Aplica middlewares"
        router -> pend "Enruta petición (hoy responde un stub)" "" "Por construir"
        router -> rCtrl "Enruta petición"
        rCtrl -> rUC "Invoca lógica de negocio"
        rUC -> rP "Usa contrato"
        rR -> rP "Implementa puerto"
        rR -> infraDb "Solicita conexión/ejecución SQL"
        rUC -> evP "Publica ReservaConfirmada"
        evBus -> evP "Implementa puerto"
        evBus -> audC "Entrega ReservaConfirmada"
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
            element "Por construir" {
                background #ffffff
                color #666666
                stroke #999999
                border dashed
                opacity 60
            }
            relationship "Por construir" {
                dashed true
                color #999999
            }
        }
    }
}