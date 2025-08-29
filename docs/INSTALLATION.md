# 🏙️ Installation - Dashboard Smart City Genève

## Prérequis

### Système d'exploitation
- Windows 10/11, macOS 10.15+, ou Linux (Ubuntu 20.04+)
- 8 GB RAM minimum (16 GB recommandé)
- 10 GB d'espace disque libre

### Logiciels requis
- **Docker** (version 20.10+) : [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)
- **Docker Compose** (version 2.0+) : [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/)
- **Git** : [https://git-scm.com/downloads](https://git-scm.com/downloads)

### Navigateur web
- Chrome 90+, Firefox 88+, Safari 14+, ou Edge 90+

## Installation rapide

### 1. Cloner le projet
```bash
git clone <repository-url>
cd smart-city-dashboard
```

### 2. Configuration automatique
```bash
# Rendre le script exécutable (Linux/macOS)
chmod +x start.sh

# Démarrer le projet
./start.sh
```

### 3. Accès au dashboard
Ouvrez votre navigateur et allez à : **http://localhost:3000**

## Installation manuelle

### 1. Configuration de l'environnement
```bash
# Copier le fichier de configuration
cp env.example .env

# Éditer les variables selon vos besoins
nano .env
```

### 2. Démarrage avec Docker Compose
```bash
# Construire les images
docker-compose build

# Démarrer les services
docker-compose up -d

# Vérifier l'état
docker-compose ps
```

### 3. Installation locale (sans Docker)

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## Configuration

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `NODE_ENV` | Environnement d'exécution | `development` |
| `DB_HOST` | Hôte de la base de données | `localhost` |
| `DB_PORT` | Port de la base de données | `5432` |
| `DB_NAME` | Nom de la base de données | `smart_city` |
| `DB_USER` | Utilisateur de la base de données | `postgres` |
| `DB_PASSWORD` | Mot de passe de la base de données | `password` |
| `PORT` | Port du serveur backend | `5000` |
| `FRONTEND_URL` | URL du frontend | `http://localhost:3000` |

### Base de données

Le projet utilise **TimescaleDB** (extension PostgreSQL pour les séries temporelles) :

```sql
-- Connexion à la base de données
psql -h localhost -p 5432 -U postgres -d smart_city

-- Vérifier les extensions
\dx

-- Voir les tables
\dt
```

## Structure du projet

```
smart-city-dashboard/
├── backend/                 # API Node.js/Express
│   ├── src/
│   │   ├── services/       # Services métier
│   │   ├── routes/         # Routes API
│   │   ├── middleware/     # Middlewares
│   │   └── types/          # Types TypeScript
│   ├── package.json
│   └── Dockerfile
├── frontend/               # Dashboard React
│   ├── src/
│   │   ├── components/     # Composants React
│   │   └── App.tsx
│   ├── package.json
│   └── Dockerfile
├── docs/                   # Documentation
├── docker-compose.yml      # Configuration Docker
├── start.sh               # Script de démarrage
└── README.md
```

## Services disponibles

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | Dashboard React avec ECharts |
| Backend API | 5000 | API REST + WebSocket |
| TimescaleDB | 5432 | Base de données |
| Nginx | 80 | Reverse proxy (optionnel) |

## Commandes utiles

### Docker Compose
```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down

# Redémarrer un service
docker-compose restart backend

# Reconstruire les images
docker-compose build --no-cache
```

### Développement
```bash
# Installer toutes les dépendances
npm run install:all

# Démarrer en mode développement
npm run dev

# Tests
npm run test

# Build de production
npm run build
```

## Dépannage

### Problèmes courants

#### 1. Ports déjà utilisés
```bash
# Vérifier les ports utilisés
netstat -tulpn | grep :3000
netstat -tulpn | grep :5000

# Arrêter les processus
sudo kill -9 <PID>
```

#### 2. Problèmes de permissions Docker
```bash
# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Redémarrer la session
newgrp docker
```

#### 3. Base de données non accessible
```bash
# Vérifier l'état du conteneur
docker-compose ps timescaledb

# Voir les logs
docker-compose logs timescaledb

# Redémarrer le service
docker-compose restart timescaledb
```

#### 4. Problèmes de mémoire
```bash
# Augmenter la mémoire Docker (Docker Desktop)
# Settings > Resources > Memory: 8GB minimum
```

### Logs et debugging

```bash
# Logs en temps réel
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend

# Accès au shell d'un conteneur
docker-compose exec backend sh
docker-compose exec frontend sh
```

## Support

Pour obtenir de l'aide :
- 📧 Email : support@smartcity-geneva.ch
- 📖 Documentation : `/docs`
- 🐛 Issues : [GitHub Issues](https://github.com/smartcity-geneva/dashboard/issues)

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
