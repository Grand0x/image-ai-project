# Étape de build
FROM node:18-alpine AS builder

WORKDIR /app

# Copie du package.json uniquement
COPY package.json ./

# Copie des fichiers de lock s'ils existent (fonctionne avec npm, yarn ou pnpm)
COPY package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# Installation des dépendances
RUN npm ci || npm install

# Copie du reste du code source
COPY . .

# Définition des ARGs pour les variables d'environnement de build
ARG NEXT_PUBLIC_CLIENT_ID
ARG NEXT_PUBLIC_CLIENT_SECRET

# Définition des variables d'environnement publiques pour le build
ENV NEXT_PUBLIC_CLIENT_ID=${NEXT_PUBLIC_CLIENT_ID}
ENV NEXT_PUBLIC_CLIENT_SECRET=${NEXT_PUBLIC_CLIENT_SECRET}

# Build de l'application
RUN npm run build

# Étape de production
FROM node:18-alpine AS runner

WORKDIR /app

# Définition des variables d'environnement pour le runtime
ENV NODE_ENV=production

# Copie des fichiers nécessaires depuis l'étape de build
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Exposition du port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"]