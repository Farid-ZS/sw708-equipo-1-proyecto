# ==============================================================================
# ETAPA 1: Construcción y compilación (Builder)
# ==============================================================================
FROM docker.io/library/node:22-alpine AS builder

WORKDIR /app

# 1. Copiar manifiestos de paquetes primero para aprovechar la caché de capas
COPY lumiereApp/backend/package*.json ./
COPY lumiereApp/backend/packages/reservas/package*.json ./packages/reservas/

# 2. Instalar dependencias completas para la compilación (limpio y determinista)
RUN npm ci

# 3. Copiar el código fuente completo del backend y paquetes
COPY lumiereApp/backend ./

# 4. Compilar los paquetes de reservas y el host Express
RUN npm run build

# 5. Podar dependencias de desarrollo para dejar solo las de producción
RUN npm prune --omit=dev

# ==============================================================================
# ETAPA 2: Entorno de ejecución ligero (Runner)
# ==============================================================================
FROM docker.io/library/node:22-alpine AS runner

WORKDIR /app

# Configuración de entorno de producción
ENV NODE_ENV=production
ENV PORT=3000

# Usar el usuario del sistema no privilegiado 'node' por seguridad
USER node

# Copiar manifiestos y dependencias de producción podadas
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/packages/reservas/package*.json ./packages/reservas/
COPY --chown=node:node --from=builder /app/node_modules ./node_modules

# Copiar únicamente los artefactos compilados (JavaScript)
COPY --chown=node:node --from=builder /app/packages/reservas/dist ./packages/reservas/dist
COPY --chown=node:node --from=builder /app/dist ./dist

# Puerto expuesto por el servidor Express
EXPOSE 3000

# Punto de entrada de la aplicación compilada
CMD ["node", "dist/index.js"]
