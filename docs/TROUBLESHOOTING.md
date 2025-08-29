# 🔧 Guide de Dépannage - Smart City Dashboard Genève

Ce guide vous aide à résoudre les problèmes courants rencontrés lors du développement et du déploiement du dashboard Smart City.

## 📋 Problèmes Courants

### 🚀 Démarrage de l'Application

#### Le serveur ne démarre pas

**Symptômes** :
- Erreur de connexion à la base de données
- Port déjà utilisé
- Erreur de configuration

**Solutions** :

```bash
# 1. Vérifier les variables d'environnement
cat .env

# 2. Vérifier que la base de données est accessible
docker-compose ps

# 3. Vérifier les logs
docker-compose logs backend

# 4. Tester la connectivité de la base de données
docker exec -it smartcity-timescaledb psql -U postgres -d smart_city -c "SELECT 1;"

# 5. Redémarrer les services
docker-compose down
docker-compose up -d
```

#### Erreur "Port already in use"

```bash
# Identifier le processus utilisant le port
netstat -tulpn | grep :3000
netstat -tulpn | grep :5000

# Tuer le processus
sudo kill -9 <PID>

# Ou utiliser fuser
sudo fuser -k 3000/tcp
sudo fuser -k 5000/tcp
```

#### Erreur de mémoire Docker

```bash
# Augmenter la limite mémoire Docker
# Docker Desktop : Settings > Resources > Memory > 8GB minimum

# Ou ajouter des limites dans docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

### 🗄️ Problèmes de Base de Données

#### Connexion impossible à PostgreSQL

```bash
# Vérifier l'état du conteneur
docker-compose ps timescaledb

# Voir les logs
docker-compose logs timescaledb

# Redémarrer le service
docker-compose restart timescaledb

# Vérifier la configuration
docker exec smartcity-timescaledb cat /var/lib/postgresql/data/postgresql.conf | grep listen

# Test de connexion
docker exec -it smartcity-timescaledb psql -U postgres -d smart_city
```

#### Base de données corrompue

```bash
# Sauvegarder les données existantes (si possible)
docker exec smartcity-timescaledb pg_dump -U postgres smart_city > backup.sql

# Recréer la base de données
docker-compose down
docker volume rm smart-city-dashboard_timescaledb_data
docker-compose up -d timescaledb

# Attendre l'initialisation
sleep 30

# Restaurer la sauvegarde
docker exec -i smartcity-timescaledb psql -U postgres smart_city < backup.sql
```

#### Migration de données

```bash
# Créer une migration
docker exec -it smartcity-backend npx prisma migrate dev --name add_new_table

# Appliquer les migrations
docker exec -it smartcity-backend npx prisma migrate deploy

# Générer le client Prisma
docker exec -it smartcity-backend npx prisma generate
```

### 🌐 Problèmes Réseau

#### Problèmes de CORS

**Symptômes** :
- Erreurs CORS dans la console du navigateur
- Requêtes API bloquées

**Solutions** :

```typescript
// Vérifier la configuration CORS dans backend/src/index.ts
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
```

#### Problèmes de proxy

```nginx
# Vérifier la configuration nginx
server {
    listen 80;
    server_name localhost;

    location /api {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 🔐 Problèmes d'Authentification

#### Token JWT expiré

```typescript
// Vérifier la configuration JWT
const jwtConfig = {
  expiresIn: '24h', // Augmenter si nécessaire
  secret: process.env.JWT_SECRET
};

// Intercepteur pour renouveler automatiquement le token
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré, tenter de le renouveler
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post('/api/auth/refresh', {
            refreshToken
          });
          localStorage.setItem('token', response.data.token);
          // Retry la requête originale
          return axios(error.config);
        } catch (refreshError) {
          // Redirection vers la page de connexion
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
```

#### Problèmes de permissions

```typescript
// Vérifier les rôles utilisateur
const user = JSON.parse(localStorage.getItem('user'));

console.log('User role:', user.role);
console.log('User permissions:', user.permissions);

// Vérifier côté serveur
const requiredPermission = 'read:traffic';
if (!user.permissions.includes(requiredPermission)) {
  console.error('Permission denied:', requiredPermission);
}
```

### 📊 Problèmes de Données

#### Données ne se mettent pas à jour

```typescript
// Vérifier la connexion WebSocket
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to WebSocket');
  socket.emit('join-traffic');
});

socket.on('traffic-update', (data) => {
  console.log('Received traffic update:', data);
});

socket.on('connect_error', (error) => {
  console.error('WebSocket connection error:', error);
});
```

#### Données simulées au lieu de données réelles

```bash
# Activer les données réelles
echo "USE_REAL_DATA=true" >> .env

# Redémarrer les services
docker-compose down
docker-compose up -d

# Vérifier les logs
docker-compose logs backend | grep "Using real data"
```

#### API externes inaccessibles

```typescript
// Vérifier les clés API
console.log('Weather API Key:', process.env.WEATHER_API_KEY ? 'Set' : 'Missing');
console.log('TPG API Key:', process.env.TPG_API_KEY ? 'Set' : 'Missing');

// Tester les endpoints externes
curl "https://api.openweathermap.org/data/2.5/weather?q=Geneva&appid=YOUR_API_KEY"
curl "https://api.tpg.ch/v1/lines"
```

### 🎨 Problèmes d'Interface

#### Graphiques ECharts ne s'affichent pas

```typescript
// Vérifier l'importation d'ECharts
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { GridComponent, TooltipComponent } from 'echarts/components';

echarts.use([LineChart, CanvasRenderer, GridComponent, TooltipComponent]);

// Vérifier la configuration du graphique
const option = {
  xAxis: {
    type: 'category',
    data: xData
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    data: yData,
    type: 'line'
  }]
};

// Initialiser et rendre le graphique
const chart = echarts.init(document.getElementById('chart'));
chart.setOption(option);
```

#### Composants React ne se mettent pas à jour

```typescript
// Vérifier les dépendances useEffect
useEffect(() => {
  fetchData();
}, [routeId, refreshInterval]); // Ajouter toutes les dépendances

// Utiliser useCallback pour les fonctions
const fetchData = useCallback(async () => {
  try {
    setLoading(true);
    const response = await fetch('/api/traffic');
    const data = await response.json();
    setTrafficData(data);
  } catch (error) {
    console.error('Failed to fetch data:', error);
  } finally {
    setLoading(false);
  }
}, []);

// Forcer la mise à jour si nécessaire
const [refreshKey, setRefreshKey] = useState(0);
const refresh = () => setRefreshKey(prev => prev + 1);
```

### ⚡ Problèmes de Performance

#### Application lente

```bash
# Analyser les performances
# Chrome DevTools > Performance > Record

# Vérifier la taille des bundles
npm run build
ls -lh build/static/js/

# Optimiser les images
# Utiliser WebP et compresser les images
```

#### Mémoire pleine

```bash
# Vérifier l'utilisation mémoire
docker stats

# Ajouter des limites mémoire
services:
  frontend:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

#### Trop de requêtes API

```typescript
// Implémenter un cache
const cache = new Map();

const cachedFetch = async (url, ttl = 30000) => {
  const now = Date.now();
  const cached = cache.get(url);

  if (cached && (now - cached.timestamp) < ttl) {
    return cached.data;
  }

  const response = await fetch(url);
  const data = await response.json();

  cache.set(url, { data, timestamp: now });
  return data;
};
```

### 🔒 Problèmes de Sécurité

#### Erreurs de validation

```typescript
// Vérifier la validation des entrées
const validateInput = (input) => {
  // Sanitiser les entrées
  const sanitized = input.replace(/[<>]/g, '');

  // Valider le format
  if (!/^[a-zA-Z0-9\s]+$/.test(sanitized)) {
    throw new Error('Invalid input format');
  }

  return sanitized;
};
```

#### Erreurs de rate limiting

```bash
# Vérifier les headers de réponse
curl -I http://localhost:5000/api/traffic

# Headers attendus :
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 95
# X-RateLimit-Reset: 1642156800
```

### 🐳 Problèmes Docker

#### Images ne se construisent pas

```bash
# Construire avec plus de détails
docker-compose build --no-cache --progress=plain

# Vérifier les logs de construction
docker build -t smartcity-backend .
docker run --rm smartcity-backend npm test

# Nettoyer le cache Docker
docker system prune -a
```

#### Conteneurs s'arrêtent immédiatement

```bash
# Vérifier les logs du conteneur
docker-compose logs backend

# Exécuter le conteneur en mode interactif
docker run -it smartcity-backend sh

# Vérifier le CMD dans le Dockerfile
CMD ["npm", "start"]
```

#### Volumes Docker

```bash
# Lister les volumes
docker volume ls

# Inspecter un volume
docker volume inspect smart-city-dashboard_timescaledb_data

# Supprimer un volume (ATTENTION: perte de données)
docker volume rm smart-city-dashboard_timescaledb_data
```

## 🛠️ Outils de Diagnostic

### Scripts de diagnostic

```bash
#!/bin/bash
# diagnostic.sh

echo "=== Smart City Dashboard Diagnostic ==="
echo ""

echo "1. État des services Docker:"
docker-compose ps
echo ""

echo "2. Utilisation des ressources:"
docker stats --no-stream
echo ""

echo "3. Logs récents:"
docker-compose logs --tail=50
echo ""

echo "4. Variables d'environnement:"
cat .env | grep -v PASSWORD
echo ""

echo "5. Test de connectivité:"
curl -f http://localhost/health || echo "❌ API non accessible"
curl -f http://localhost:3000 || echo "❌ Frontend non accessible"
echo ""

echo "6. État de la base de données:"
docker exec smartcity-timescaledb psql -U postgres -d smart_city -c "SELECT COUNT(*) FROM traffic_data;" 2>/dev/null || echo "❌ Base de données inaccessible"
echo ""

echo "=== Fin du diagnostic ==="
```

### Monitoring continu

```typescript
// health-check.js
const axios = require('axios');

const services = [
  { name: 'Backend API', url: 'http://localhost:5000/health' },
  { name: 'Frontend', url: 'http://localhost:3000' },
  { name: 'Database', check: 'docker' }
];

const checkService = async (service) => {
  try {
    if (service.check === 'docker') {
      const { exec } = require('child_process');
      return new Promise((resolve) => {
        exec('docker-compose ps timescaledb', (error, stdout) => {
          if (error) resolve({ status: 'down', error: error.message });
          else if (stdout.includes('Up')) resolve({ status: 'up' });
          else resolve({ status: 'down' });
        });
      });
    } else {
      const response = await axios.get(service.url, { timeout: 5000 });
      return { status: 'up', responseTime: response.config.duration };
    }
  } catch (error) {
    return { status: 'down', error: error.message };
  }
};

const runHealthCheck = async () => {
  console.log('🔍 Vérification de santé des services...');

  for (const service of services) {
    const result = await checkService(service);
    const status = result.status === 'up' ? '✅' : '❌';

    console.log(`${status} ${service.name}: ${result.status}`);

    if (result.error) {
      console.log(`   Erreur: ${result.error}`);
    }

    if (result.responseTime) {
      console.log(`   Temps de réponse: ${result.responseTime}ms`);
    }
  }
};

runHealthCheck();
```

## 📞 Support et Escalade

### Niveaux de gravité

| Niveau | Description | Délai de réponse | Escalade |
|--------|-------------|------------------|----------|
| **Critique** | Service complètement indisponible | < 1h | Direction technique |
| **Élevé** | Fonctionnalité majeure défaillante | < 4h | Chef d'équipe |
| **Moyen** | Fonctionnalité mineure défaillante | < 24h | Équipe de développement |
| **Faible** | Problème mineur, contournement possible | < 72h | Issue GitHub |

### Procédure d'escalade

1. **Auto-diagnostic** : Utiliser les outils ci-dessus
2. **Documentation** : Vérifier la documentation existante
3. **Communauté** : Poser la question sur GitHub Discussions
4. **Support** : Créer une issue GitHub avec tous les détails
5. **Urgence** : Contacter directement l'équipe technique

### Informations à fournir

Lors de la création d'une issue de dépannage, incluez :

```markdown
## Environnement
- OS: Windows 10
- Node.js: 18.0.0
- Docker: 20.10.0
- Navigateur: Chrome 91

## Description du problème
Description claire et concise

## Étapes de reproduction
1. Démarrer l'application avec `npm run dev`
2. Aller à http://localhost:3000
3. Cliquer sur l'onglet Trafic
4. Voir l'erreur: "Failed to load traffic data"

## Logs
```
docker-compose logs --tail=100
```

## Comportement attendu
Les données de trafic devraient s'afficher dans le graphique

## Comportement actuel
Erreur 500 avec le message "Database connection failed"
```

---

*Dernière mise à jour : Janvier 2024*
