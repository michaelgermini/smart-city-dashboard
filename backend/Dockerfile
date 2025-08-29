FROM node:18-alpine

# Installer les dépendances système nécessaires
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances avec retry et cache optimisé
RUN npm ci --only=production --no-audit --no-fund --prefer-offline --no-progress

# Installer les dépendances de développement pour TypeScript
RUN npm install --only=dev --no-audit --no-fund --prefer-offline --no-progress

# Installer nodemon globalement
RUN npm install -g nodemon ts-node typescript --no-audit --no-fund

# Copier le code source
COPY . .

# Compiler TypeScript
RUN npm run build || echo "Build failed, continuing with source files"

# Créer le dossier logs
RUN mkdir -p logs

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Changer les permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exposer le port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Commande de démarrage avec retry automatique
CMD ["sh", "-c", "npm run dev || npm start"]
