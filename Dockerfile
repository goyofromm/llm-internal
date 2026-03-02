# --- STAGE 1: Build ---
    FROM node:20-alpine AS builder
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm install
    
    COPY . .
    # Esto genera la carpeta /app/dist/src/main.js y arregla los alias
    RUN npm run build
    
    # --- STAGE 2: Run ---
    FROM node:20-alpine
    WORKDIR /app
    
    # Copiamos las dependencias y el código compilado
    COPY --from=builder /app/package*.json ./
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/dist ./dist
    
    # Variables de entorno por defecto
    ENV NODE_ENV=production
    EXPOSE 3000
    
    CMD ["npm", "run", "start:prod"]