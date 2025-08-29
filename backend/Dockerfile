FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (incluant dev pour TypeScript)
RUN npm install --retry 3
RUN npm install -g nodemon

# Copier le code source
COPY . .

# Compiler TypeScript
RUN npm run build

# Garder les dépendances de développement pour nodemon
# RUN npm prune --production

# Créer le dossier logs
RUN mkdir -p logs

# Exposer le port
EXPOSE 5000

# Commande de démarrage
CMD ["npm", "run", "dev"]
