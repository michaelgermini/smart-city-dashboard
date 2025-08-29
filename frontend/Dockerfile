FROM node:18-alpine

# Installer les dépendances système nécessaires
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances avec optimisation
RUN npm ci --only=production --no-audit --no-fund --prefer-offline --no-progress

# Installer les dépendances de développement pour le build
RUN npm install --only=dev --no-audit --no-fund --prefer-offline --no-progress

# Copier le code source
COPY . .

# Build l'application pour la production
RUN npm run build

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Changer les permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exposer le port
EXPOSE 3000

# Installer curl pour le health check
USER root
RUN apk add --no-cache curl
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Commande de démarrage optimisée pour production
CMD ["npm", "start"]
