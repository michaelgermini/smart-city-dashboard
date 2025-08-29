# 🐳 Déploiement Docker - Smart City Dashboard

Ce guide explique comment déployer l'application Smart City Dashboard avec Docker.

## 📋 Prérequis

- **Docker** : Version 20.10+ ([Installation](https://docs.docker.com/get-docker/))
- **Docker Compose** : Version 2.0+ (inclus avec Docker Desktop)
- **4GB RAM** minimum disponible pour Docker
- **2GB** d'espace disque disponible

## 🚀 Déploiement Rapide

### 1. Préparation
```bash
# Aller dans le répertoire du projet
cd "C:\Users\mika\Desktop\Visualisation pour la mobilité urbaine & smart city"

# Rendre le script exécutable (Linux/Mac)
chmod +x docker-deploy.sh
```

### 2. Déploiement en Développement
```bash
# Utiliser le script automatisé
./docker-deploy.sh dev

# Ou directement avec docker-compose
docker-compose up -d
```

### 3. Accès à l'Application
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5000
- **Base de données** : localhost:5432
- **PgAdmin** (optionnel) : http://localhost:8080

## 🏗️ Architecture Docker

```
smart-city-dashboard/
├── docker-compose.yml          # Configuration principale
├── docker-compose.override.yml # Configuration développement
├── backend/
│   ├── Dockerfile             # Image backend Node.js
│   └── ...                    # Code source
├── frontend/
│   ├── Dockerfile             # Image frontend React
│   └── ...                    # Code source
├── nginx/
│   └── nginx.conf             # Configuration reverse proxy
└── env.docker.txt             # Variables d'environnement
```

### Services Docker

| Service | Image | Port | Description |
|---------|-------|------|-------------|
| **frontend** | Node.js 18 Alpine | 3000 | Interface utilisateur React |
| **backend** | Node.js 18 Alpine | 5000 | API REST + WebSocket |
| **timescaledb** | TimescaleDB | 5432 | Base de données PostgreSQL |
| **nginx** | Nginx Alpine | 80 | Reverse proxy (optionnel) |
| **pgadmin** | PgAdmin4 | 8080 | Interface admin DB (dev) |
| **redis** | Redis Alpine | 6379 | Cache (optionnel) |

## 📊 Commandes Utiles

### Gestion des Services
```bash
# Démarrer tous les services
docker-compose up -d

# Arrêter tous les services
docker-compose down

# Redémarrer un service spécifique
docker-compose restart backend

# Voir les logs
docker-compose logs -f

# Voir l'état des services
docker-compose ps
```

### Développement
```bash
# Reconstruction complète
docker-compose build --no-cache

# Démarrage avec outils de développement
docker-compose --profile tools up -d

# Démarrage avec cache Redis
docker-compose --profile cache up -d
```

### Maintenance
```bash
# Nettoyer les conteneurs arrêtés
docker-compose rm -f

# Supprimer les volumes (⚠️ perte de données)
docker-compose down -v

# Nettoyer les images non utilisées
docker image prune -f
```

## 🔧 Configuration

### Variables d'Environnement

Le fichier `env.docker.txt` contient toutes les variables nécessaires :

```bash
# Copier le fichier d'exemple
cp env.docker.txt .env

# Modifier selon vos besoins
nano .env
```

**Variables importantes :**
- `DB_PASSWORD` : Mot de passe PostgreSQL (à changer en production)
- `JWT_SECRET` : Clé secrète pour JWT (à sécuriser)
- `NODE_ENV` : `development` ou `production`

### Volumes Persistants

```yaml
volumes:
  timescaledb_data:
    driver: local
```

- **Localisation** : `/var/lib/docker/volumes/smart-city-dashboard_timescaledb_data/`
- **Contenu** : Données PostgreSQL persistantes
- **Sauvegarde** : `docker run --rm -v smart-city-dashboard_timescaledb_data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz -C /data .`

## 🚀 Déploiement en Production

### 1. Configuration de Production
```bash
# Créer un fichier .env de production
cp env.docker.txt .env.production
nano .env.production

# Variables importantes pour la production
NODE_ENV=production
DB_PASSWORD=votre_mot_de_passe_super_securise
JWT_SECRET=votre_cle_jwt_très_longue_et_complexe
```

### 2. Build Optimisé
```bash
# Build sans cache pour la production
docker-compose build --no-cache

# Démarrage en production
docker-compose up -d
```

### 3. Configuration Nginx (Recommandé)
```nginx
# nginx.conf pour la production
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔍 Dépannage

### Problèmes Courants

#### 1. Port Déjà Utilisé
```bash
# Voir quel processus utilise le port
netstat -ano | findstr :3000

# Changer le port dans docker-compose.yml
ports:
  - "3001:3000"  # Utiliser 3001 au lieu de 3000
```

#### 2. Mémoire Insuffisante
```bash
# Augmenter la mémoire Docker Desktop
# Settings > Resources > Memory > 4GB minimum

# Ou limiter les ressources dans docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
```

#### 3. Base de Données Non Accessible
```bash
# Vérifier l'état du conteneur
docker-compose ps timescaledb

# Voir les logs
docker-compose logs timescaledb

# Redémarrer la base de données
docker-compose restart timescaledb
```

#### 4. Application Ne Démarre Pas
```bash
# Vérifier les logs de tous les services
docker-compose logs

# Vérifier les logs d'un service spécifique
docker-compose logs backend

# Reconstruire les images
docker-compose build --no-cache
docker-compose up -d
```

### Logs et Monitoring

```bash
# Logs en temps réel
docker-compose logs -f

# Logs des dernières 100 lignes
docker-compose logs --tail=100

# Logs d'un service spécifique
docker-compose logs -f backend

# Statistiques des conteneurs
docker stats
```

### Tests de Santé

```bash
# Test de l'API
curl http://localhost:5000/health

# Test du frontend
curl http://localhost:3000

# Test de la base de données
docker-compose exec timescaledb psql -U postgres -d smart_city -c "SELECT version();"
```

## 📈 Optimisations

### Performance Docker
```yaml
# docker-compose.prod.yml
services:
  backend:
    environment:
      NODE_ENV: production
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Cache et Volumes
```yaml
# Utiliser des volumes nommés pour les performances
volumes:
  timescaledb_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/docker/volumes/timescaledb
```

### Sécurité
```yaml
# Utilisateur non-root dans les conteneurs
services:
  backend:
    user: "1001:1001"
    security_opt:
      - no-new-privileges:true
```

## 🔄 Mise à Jour

### Mise à Jour des Images
```bash
# Télécharger les dernières images
docker-compose pull

# Redémarrer avec les nouvelles images
docker-compose up -d
```

### Migration de Données
```bash
# Sauvegarder la base de données
docker-compose exec timescaledb pg_dump -U postgres smart_city > backup.sql

# Après mise à jour, restaurer si nécessaire
docker-compose exec -T timescaledb psql -U postgres smart_city < backup.sql
```

## 📚 Ressources Supplémentaires

- [Documentation Docker](https://docs.docker.com/)
- [Guide Docker Compose](https://docs.docker.com/compose/)
- [TimescaleDB Documentation](https://docs.timescale.com/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node)

## 🆘 Support

Si vous rencontrez des problèmes :

1. **Vérifiez les logs** : `docker-compose logs`
2. **Testez les services** : `docker-compose ps`
3. **Vérifiez la configuration** : `cat .env`
4. **Consultez la documentation** : `/docs/DOCKER_README.md`

---

*Dernière mise à jour : Janvier 2024*
