# ADR 0004: Consolidación del backend y la rodaja vertical en TypeScript con Express

- **Fecha:** 2026-11-04
- **Estado:** Aceptado

---

## 1. Contexto

Durante la Entrega 1, el equipo presentó una disparidad arquitectónica observada por la cátedra (Sección 4 de la revisión): mientras el informe, el README y la ficha técnica declaraban un stack basado en Node.js, Express y TypeScript, la rodaja vertical de reserva de boletos se había prototipado de manera aislada en Python (`src/`), dejando las rutas del backend en TypeScript (`lumiereApp/backend/src/routes/reservas.routes.ts`) como meros stubs no funcionales y sin ningún ADR que justificara dicha divergencia.

Para la entrega final y la operación real del sistema Lumiere, era imperativo unificar el stack tecnológico del backend, eliminar la duplicidad de lenguajes y asegurar que la rodaja vertical esté plenamente integrada en el servidor de aplicación que consume el cliente web.

---

## 2. Alternativas consideradas

### Alternativa 1: Migrar todo el backend a Python

- **Descripción:** Reemplazar el servidor de Node.js/Express por un servidor Python (FastAPI o Flask) para alojar todas las rutas del sistema y conectarse al frontend.
- **Razón de descarte:** El frontend de Lumiere está desarrollado en React 18 con TypeScript y Vite. Cambiar el backend a Python fragmenta el ecosistema de dependencias del equipo, exige mantener entornos virtuales y gestores de paquetes duales (npm + pip) en las máquinas de desarrollo y complica la configuración de despliegue unificado.

### Alternativa 2: Mantener una arquitectura híbrida políglota (Microservicios)

- **Descripción:** Mantener un servicio en Python para la reserva de boletos y otro servicio en TypeScript para cartelera, usuarios y administración.
- **Razón de descarte:** Introduce complejidad innecesaria de comunicación entre procesos, balanceo, monitoreo y despliegue para una aplicación monolítica modular de cine.

### Alternativa 3: Consolidar el backend y la rodaja vertical en TypeScript sobre Node.js (Seleccionada)

- **Descripción:** Implementar la arquitectura hexagonal (dominio, puertos, adaptadores de memoria y PostgreSQL, y controladores Express) directamente en `lumiereApp/backend` en TypeScript.
- **Justificación:** 
  1. **Homogeneidad del stack:** Unifica todo el repositorio en TypeScript (frontend y backend), simplificando la curva de aprendizaje, el tooling y los pipelines de integración continua.
  2. **Ejecución moderna en Node.js 22:** Aprovecha la ejecución nativa de TypeScript con *type-stripping* en Node 22, permitiendo ejecutar pruebas automatizadas ultrarrápidas con el test runner nativo (`node:test`) sin sobrecarga de transpiladores pesados.
  3. **Conexión real de extremo a extremo:** La rodaja vertical deja de ser una clase aislada y se conecta directamente como endpoint HTTP (`POST /api/reservas`) en el servidor Express que atiende al frontend.

---

## 3. Decisión

**Adoptamos TypeScript como lenguaje único y oficial para el backend del sistema Lumiere (`lumiereApp/backend`), integrando en él la rodaja vertical de reservas bajo arquitectura hexagonal.**

1. **Estructura hexagonal en TypeScript:**
   - **Dominio (`src/domain/`):** Entidad `Boleto`, caso de uso `ReservarBoletoUseCase`, puerto `BoletoRepository` y errores de negocio (`AsientoOcupadoError`, `DatosInvalidosError`), sin dependencias de frameworks ni drivers externos.
   - **Infraestructura (`src/infrastructure/`):** Adaptador en memoria (`InMemoryBoletoRepository`) y adaptador de base de datos (`PostgresBoletoRepository` con el cliente `pg`), encapsulando el manejo de conexiones y la captura de errores SQL (código `23505`).
   - **Presentación (`src/presentation/` y `src/routes/`):** `ReservasController` y `reservasRouter` montados sobre Express en `/api/reservas`.

2. **Deprecación de la rodaja experimental en Python:**
   El código prototipo en `src/` queda formalmente reemplazado por la implementación productiva en TypeScript dentro de `lumiereApp/backend/src/`.

---

## 4. Consecuencias

### Positivas (Beneficios)

- **Unificación tecnológica:** Se resuelve la discrepancia entre el informe y el código fuente. Todo el sistema utiliza TypeScript y JavaScript estándar.
- **Endpoint HTTP funcional:** La rodaja cuenta con un punto de entrada real y ejecutable (`POST /api/reservas`), listo para ser consumido por el frontend en React.
- **Verificación automatizada en CI:** Las pruebas de contrato, dominio e integración HTTP corren de forma nativa en menos de 200 ms con `node --test`.
- **Alineación con el Modelo C4:** Los diagramas de contenedores y componentes reflejan con fidelidad la tecnología real (Contenedor Backend: Node.js 22 + Express + TypeScript).

### Negativas (Costos y Trade-offs)

- Se requirió reescribir las pruebas y adaptadores de Python a TypeScript, adaptando la sintaxis a los estándares de Node 22 (`erasableSyntaxOnly`).
