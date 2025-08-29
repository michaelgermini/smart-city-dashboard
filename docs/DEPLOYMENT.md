# 🚀 Guide de Déploiement - Smart City Dashboard Genève

## Vue d'ensemble

Ce guide couvre le déploiement du dashboard Smart City pour différents environnements.

## 🏗️ Prérequis

### Infrastructure
- **Serveur** : Linux Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- **CPU** : 2 cœurs minimum (4 recommandé)
- **RAM** : 4 GB minimum (8 GB recommandé)
- **Stockage** : 20 GB SSD minimum

### Logiciels
- Docker 20.10+
- Docker Compose 2.0+
- Nginx (optionnel pour reverse proxy)
- SSL Certificate (Let's Encrypt recommandé)

### Réseau
- Ports ouverts : 80, 443, 3000, 5000
- Domaine configuré (ex: dashboard.smartcity.ch)
- Firewall configuré

## 📋 Environnements

### 1. Développement
Configuration pour les développeurs locaux.

### 2. Staging
Environnement de test avant production.

### 3. Production
Environnement de production avec haute disponibilité.

## 🔧 Déploiement Docker (Recommandé)

### Configuration de base

1. **Cloner le projet** :
```bash
git clone <repository-url>
cd smart-city-dashboard
```

2. **Configurer l'environnement** :
```bash
cp env.example .env
nano .env
```

3. **Variables d'environnement importantes** :
```bash
# Production
NODE_ENV=production
DB_PASSWORD=your_secure_password_here
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=https://dashboard.smartcity.ch
```

### Déploiement simple

```bash
# Construire et démarrer
docker-compose up -d --build

# Vérifier l'état
docker-compose ps

# Voir les logs
docker-compose logs -f
```

### Déploiement avec Nginx

1. **Configuration Nginx** :
```nginx
server {
    listen 80;
    server_name dashboard.smartcity.ch;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

2. **SSL avec Let's Encrypt** :
```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir le certificat
sudo certbot --nginx -d dashboard.smartcity.ch

# Configuration automatique SSL
sudo certbot renew --dry-run
```

## ☁️ Déploiement Cloud

### AWS

#### EC2 Instance
```bash
# Instance type recommandé
t3.medium (2 vCPU, 4 GB RAM)

# AMI Ubuntu Server 22.04 LTS
ami-0c7217cdde317cfec
```

#### RDS PostgreSQL
```yaml
# docker-compose.aws.yml
version: '3.8'
services:
  backend:
    environment:
      DB_HOST: your-rds-endpoint.rds.amazonaws.com
      DB_PORT: 5432
      DB_SSL: true
```

#### S3 pour les logs
```bash
# Configuration AWS CLI
aws configure

# Upload des logs
aws s3 sync ./logs s3://smartcity-logs/
```

### DigitalOcean

#### Droplet
```bash
# Configuration recommandée
Ubuntu 22.04 x64
2 GB RAM / 1 vCPU / 50 GB SSD
```

#### Managed Database
```bash
# Connection string
DB_HOST: db-mysql-nyc1-12345-do-user-1234567-0.b.db.ondigitalocean.com
DB_SSL: true
```

### Heroku

#### Procfile
```yaml
web: npm start
release: npm run db:migrate
```

#### Configuration Heroku
```bash
# Variables d'environnement
heroku config:set NODE_ENV=production
heroku config:set DB_URL=postgresql://...
heroku config:set JWT_SECRET=your_secret_here
```

## 🔒 Configuration de Sécurité

### Firewall (UFW)

```bash
# Installer UFW
sudo apt install ufw

# Configurer les règles
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Activer
sudo ufw enable
```

### Fail2Ban

```bash
# Installer Fail2Ban
sudo apt install fail2ban

# Configuration pour SSH
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Redémarrer
sudo systemctl restart fail2ban
```

### SSL/TLS

```bash
# Générer certificat auto-signé (temporaire)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/selfsigned.key \
  -out /etc/ssl/certs/selfsigned.crt

# Configuration Nginx SSL
server {
    listen 443 ssl http2;
    server_name dashboard.smartcity.ch;

    ssl_certificate /etc/ssl/certs/selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/selfsigned.key;
}
```

## 📊 Monitoring

### Métriques système

```bash
# Installation Prometheus + Grafana
docker run -d -p 9090:9090 prom/prometheus
docker run -d -p 3000:3000 grafana/grafana
```

### Logs centralisés

```bash
# Installation ELK Stack
docker run -d -p 5601:5601 -p 9200:9200 -p 5044:5044 sebp/elk
```

### Alertes

```bash
# Configuration des seuils d'alerte
TRAFFIC_CONGESTION_THRESHOLD=80
PARKING_OCCUPANCY_THRESHOLD=90
TRANSPORT_DELAY_THRESHOLD=10
```

## 🔄 Mise à jour et Rollback

### Stratégie Blue-Green

```bash
# Créer nouvelle version
docker tag smartcity-backend:latest smartcity-backend:v2

# Tester nouvelle version
docker run -d --name backend-test smartcity-backend:v2

# Basculer le trafic
docker-compose up -d backend-v2
docker-compose stop backend-v1

# Rollback si nécessaire
docker-compose up -d backend-v1
```

### Zero-Downtime Deployment

```bash
# Mise à jour avec health check
docker-compose up -d --scale backend=2
docker-compose up -d --scale backend=1
```

## 📈 Optimisations Performance

### Base de données

```sql
-- Optimisations PostgreSQL
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '16MB';
```

### Cache Redis

```yaml
# docker-compose.yml
services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

### CDN

```bash
# Configuration CloudFlare
# Activer le CDN pour les assets statiques
# Configurer le caching des API responses
```

## 🔧 Scripts de Déploiement

### Script de déploiement automatique

```bash
#!/bin/bash
# deploy.sh

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}🚀 Déploiement Smart City Dashboard${NC}"

# Vérifications pré-déploiement
echo "📋 Vérifications pré-déploiement..."

# Vérifier les variables d'environnement
if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}❌ DB_PASSWORD non configuré${NC}"
    exit 1
fi

# Backup de la base de données
echo "💾 Sauvegarde de la base de données..."
docker exec smartcity-timescaledb pg_dump -U postgres smart_city > backup_$(date +%Y%m%d_%H%M%S).sql

# Mise à jour du code
echo "📥 Mise à jour du code..."
git pull origin main

# Build des images
echo "🔨 Construction des images Docker..."
docker-compose build --no-cache

# Tests pré-déploiement
echo "🧪 Exécution des tests..."
docker-compose run --rm backend npm test
docker-compose run --rm frontend npm test

# Déploiement
echo "🚀 Déploiement..."
docker-compose up -d

# Health check
echo "🏥 Vérification de la santé..."
sleep 30

if curl -f http://localhost/health; then
    echo -e "${GREEN}✅ Déploiement réussi${NC}"
else
    echo -e "${RED}❌ Échec du déploiement - Rollback...${NC}"
    docker-compose down
    docker-compose up -d --scale backend=1
fi

# Nettoyage
echo "🧹 Nettoyage..."
docker system prune -f

echo -e "${GREEN}🎉 Déploiement terminé${NC}"
```

### Script de monitoring

```bash
#!/bin/bash
# monitor.sh

# Vérifier l'état des services
services=$(docker-compose ps --services --filter "status=running")

if [ -z "$services" ]; then
    echo "❌ Aucun service en cours d'exécution"
    exit 1
fi

# Vérifier les ports
if ! nc -z localhost 3000; then
    echo "❌ Frontend non accessible"
fi

if ! nc -z localhost 5000; then
    echo "❌ Backend non accessible"
fi

# Vérifier la base de données
if ! docker exec smartcity-timescaledb pg_isready -U postgres; then
    echo "❌ Base de données non accessible"
fi

echo "✅ Tous les services sont opérationnels"
```

## 📞 Support et Maintenance

### Contacts d'urgence
- **Équipe DevOps** : michael@germini.info
- **Support Technique** : michael@germini.info
- **Urgences** : +41 XX XXX XX XX

### Maintenance programmée
- **Fenêtres de maintenance** : Dimanche 02:00 - 04:00 CET
- **Notification** : 48h à l'avance par email
- **Durée maximale** : 2 heures

### Procédures d'urgence
1. **Incident critique** : Arrêt immédiat des services
2. **Restauration** : Utilisation des backups automatiques
3. **Communication** : Notification des stakeholders

## 🔍 Troubleshooting

### Problèmes courants

#### Mémoire insuffisante
```bash
# Augmenter les limites Docker
docker-compose.yml:
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

#### Base de données lente
```bash
# Optimiser PostgreSQL
docker exec -it smartcity-timescaledb psql -U postgres
ALTER SYSTEM SET shared_buffers = '512MB';
SELECT pg_reload_conf();
```

#### Problèmes réseau
```bash
# Vérifier la connectivité
docker network ls
docker network inspect smartcity-network
```

## 📋 Checklist de Déploiement

### Pré-déploiement
- [ ] Variables d'environnement configurées
- [ ] Certificats SSL valides
- [ ] Tests automatisés passent
- [ ] Backup de la base de données
- [ ] Documentation mise à jour

### Post-déploiement
- [ ] Services accessibles
- [ ] Logs sans erreurs
- [ ] Métriques de performance OK
- [ ] Alertes configurées
- [ ] Documentation utilisateur communiquée

### Maintenance
- [ ] Mises à jour de sécurité appliquées
- [ ] Logs archivés régulièrement
- [ ] Métriques surveillées
- [ ] Tests de performance exécutés

---

*Dernière mise à jour : Janvier 2024*
