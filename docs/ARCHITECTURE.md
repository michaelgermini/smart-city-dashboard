# 🏗️ Architecture Technique - Smart City Dashboard Genève

## Vue d'ensemble

Le dashboard Smart City de Genève est une plateforme de visualisation en temps réel des données de mobilité urbaine basée sur une architecture moderne et scalable.

## 🏛️ Architecture Générale

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Sources IoT   │────│   Backend API   │────│   Frontend UI   │
│   - Capteurs    │    │   Node.js/TS    │    │   React/TypeScript│
│   - APIs        │    │   - REST API    │    │   - ECharts      │
│   - MQTT        │    │   - WebSocket   │    │   - Dashboard    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Base de       │
                    │   Données       │
                    │   TimescaleDB   │
                    └─────────────────┘
```

## 🗂️ Structure du Projet

```
smart-city-dashboard/
├── backend/                    # API Backend
│   ├── src/
│   │   ├── config/            # Configuration base de données
│   │   ├── middleware/        # Middlewares (auth, rate limiting)
│   │   ├── routes/            # Routes API REST
│   │   ├── services/          # Logique métier
│   │   ├── types/             # Types TypeScript
│   │   ├── utils/             # Utilitaires
│   │   └── index.ts           # Point d'entrée
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                   # Interface utilisateur
│   ├── src/
│   │   ├── components/        # Composants React
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── Dockerfile
│   └── package.json
│
├── nginx/                      # Configuration reverse proxy
│   └── nginx.conf
│
├── docker-compose.yml          # Orchestration Docker
├── docs/                       # Documentation
└── env.example                 # Variables d'environnement
```

## 🔧 Technologies Utilisées

### Backend
- **Runtime** : Node.js 18+
- **Language** : TypeScript 5.2+
- **Framework** : Express.js 4.18+
- **Base de données** : TimescaleDB (PostgreSQL extension)
- **Temps réel** : Socket.io 4.7+
- **Authentification** : JWT (jsonwebtoken)
- **Sécurité** : Helmet, CORS, Rate Limiting
- **Logging** : Winston
- **Validation** : Joi
- **ORM** : pg (native PostgreSQL driver)

### Frontend
- **Framework** : React 18.2+
- **Language** : TypeScript 4.9+
- **Build tool** : Create React App
- **Styling** : Tailwind CSS 3.3+
- **Charts** : ECharts 5.4+ (via echarts-for-react)
- **Icons** : Heroicons
- **Routing** : React Router 6.18+
- **HTTP Client** : Axios 1.6+
- **Temps réel** : Socket.io-client 4.7+

### Infrastructure
- **Conteneurisation** : Docker 20.10+
- **Orchestration** : Docker Compose 2.0+
- **Reverse Proxy** : Nginx Alpine
- **Base de données** : TimescaleDB 2.10+
- **Monitoring** : Health checks intégrés

## 📊 Flux de Données

### 1. Collecte des Données

```
Sources Externes ──► Data Connectors ──► Transform ──► Stockage
     │                      │                     │         │
     ├─ TPG API            ├─ Validation         ├─ TimescaleDB
     ├─ Parking Genève     ├─ Normalisation      ├─ Cache Redis
     ├─ Capteurs Trafic    ├─ Agrégation         └─ Logs
     └─ Météo OpenWeather  └─ Filtrage
```

### 2. Traitement Temps Réel

```
Données Brutes ──► Services ──► WebSocket ──► Frontend
     │                      │                      │
     ├─ Validation         ├─ TrafficService     ├─ Mise à jour UI
     ├─ Transformation     ├─ ParkingService     ├─ Notifications
     ├─ Agrégation         ├─ TransportService   ├─ Graphiques
     └─ Cache              └─ AlertService       └─ Tableaux
```

### 3. API REST

```
Client HTTP ──► Routes ──► Middleware ──► Services ──► Base de Données
     │                      │                      │         │
     ├─ GET /api/traffic   ├─ Authentification   ├─ Queries├─ TimescaleDB
     ├─ POST /api/alerts   ├─ Validation         ├─ CRUD   ├─ Cache
     └─ WebSocket          ├─ Rate Limiting      └─ Logs   └─ Monitoring
```

## 🗃️ Modèle de Données

### Tables Principales

#### traffic_data
```sql
CREATE TABLE traffic_data (
    id SERIAL PRIMARY KEY,
    route_id VARCHAR(50) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    vehicle_count INTEGER,
    avg_speed DECIMAL(5,2),
    congestion_level INTEGER CHECK (congestion_level >= 0 AND congestion_level <= 100),
    weather_condition VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX idx_traffic_timestamp ON traffic_data (timestamp DESC);
CREATE INDEX idx_traffic_route ON traffic_data (route_id, timestamp DESC);
```

#### parking_data
```sql
CREATE TABLE parking_data (
    id SERIAL PRIMARY KEY,
    parking_id VARCHAR(50) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_spaces INTEGER NOT NULL,
    available_spaces INTEGER NOT NULL,
    occupancy_rate DECIMAL(5,2),
    status VARCHAR(20) CHECK (status IN ('open', 'closed', 'full')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### transport_data
```sql
CREATE TABLE transport_data (
    id SERIAL PRIMARY KEY,
    vehicle_id VARCHAR(50) NOT NULL,
    line_id VARCHAR(20) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    speed DECIMAL(5,2),
    occupancy_rate DECIMAL(5,2),
    delay_minutes INTEGER,
    next_stop VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### alerts
```sql
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(200),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔄 Services Métier

### TrafficService

**Responsabilités** :
- Collecte des données de trafic en temps réel
- Calcul des niveaux de congestion
- Détection d'anomalies
- Agrégation des données par route

**Méthodes principales** :
```typescript
class TrafficService {
  async fetchTrafficData(): Promise<TrafficData[]>
  calculateCongestionLevel(data: TrafficData): number
  detectAnomalies(data: TrafficData[]): Alert[]
  aggregateByRoute(data: TrafficData[]): RouteStats[]
}
```

### ParkingService

**Responsabilités** :
- Suivi des places de parking disponibles
- Calcul des taux d'occupation
- Alertes de saturation
- Statistiques par zone

### TransportService

**Responsabilités** :
- Suivi des véhicules TPG
- Calcul des retards moyens
- Monitoring de la ponctualité
- Données de fréquentation

### AlertService

**Responsabilités** :
- Gestion des seuils d'alerte
- Création automatique d'alertes
- Notification en temps réel
- Historique des incidents

## 🔌 Architecture API

### Endpoints REST

```
GET    /api/traffic/current          # Données trafic actuelles
GET    /api/traffic/history          # Historique trafic
GET    /api/parking/available        # Places parking
GET    /api/transport/vehicles       # Position véhicules
GET    /api/alerts/active           # Alertes actives
POST   /api/alerts                  # Créer alerte
GET    /api/weather/current         # Conditions météo
GET    /api/stats/overview          # Statistiques générales
```

### WebSocket Events

```typescript
// Client → Server
socket.emit('join-traffic');      // Rejoindre room trafic
socket.emit('join-parking');      // Rejoindre room parking
socket.emit('join-transport');    // Rejoindre room transport
socket.emit('join-alerts');       // Rejoindre room alertes

// Server → Client
socket.on('traffic-update', callback);
socket.on('parking-update', callback);
socket.on('transport-update', callback);
socket.on('alert-new', callback);
socket.on('alert-resolved', callback);
```

## 🔒 Sécurité

### Middleware de Sécurité

```typescript
// Helmet - Headers de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS - Cross-Origin Resource Sharing
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// Rate Limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
}));
```

### Authentification JWT

```typescript
// Génération du token
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Vérification du middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};
```

## 📈 Performance et Scalabilité

### Optimisations Base de Données

```sql
-- Partitionnement par temps (TimescaleDB)
SELECT create_hypertable('traffic_data', 'timestamp');

-- Index composites optimisés
CREATE INDEX CONCURRENTLY idx_traffic_composite
ON traffic_data (route_id, timestamp DESC, congestion_level);

-- Politiques de rétention
SELECT add_retention_policy('traffic_data', INTERVAL '1 year');
```

### Cache Redis

```typescript
// Cache des données fréquemment consultées
const CACHE_TTL = 300; // 5 minutes

class CacheService {
  async getTrafficData(routeId: string): Promise<TrafficData | null> {
    const cacheKey = `traffic:${routeId}`;
    const cached = await redis.get(cacheKey);

    if (cached) return JSON.parse(cached);

    const data = await this.fetchFromDB(routeId);
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(data));

    return data;
  }
}
```

### Load Balancing

```yaml
# docker-compose.prod.yml
services:
  backend:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## 🔍 Monitoring et Observabilité

### Métriques Collectées

```typescript
// Métriques Prometheus
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'smartcity_' });

// Métriques personnalisées
const httpRequestDuration = new client.Histogram({
  name: 'smartcity_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});
```

### Logs Structurés

```typescript
// Configuration Winston
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ],
});
```

### Health Checks

```typescript
// Endpoint de santé
app.get('/health', async (req, res) => {
  try {
    // Vérifier la base de données
    await pool.query('SELECT 1');

    // Vérifier les services externes
    await checkExternalAPIs();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

## 🧪 Tests et Qualité

### Structure des Tests

```
tests/
├── unit/                    # Tests unitaires
│   ├── services/
│   ├── routes/
│   └── utils/
├── integration/             # Tests d'intégration
│   ├── api/
│   └── database/
├── e2e/                     # Tests end-to-end
│   ├── frontend/
│   └── api/
└── fixtures/                # Données de test
```

### Configuration Jest

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

## 🚀 Déploiement

### Configuration Docker Multi-stage

```dockerfile
# Dockerfile.backend
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runner

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

USER node
EXPOSE 5000

CMD ["npm", "start"]
```

### Orchestration Kubernetes

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: smartcity-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: smartcity-backend
  template:
    metadata:
      labels:
        app: smartcity-backend
    spec:
      containers:
      - name: backend
        image: smartcity/backend:latest
        ports:
        - containerPort: 5000
        envFrom:
        - configMapRef:
            name: smartcity-config
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
```

## 📊 Métriques et KPIs

### Métriques Techniques
- **Disponibilité** : 99.9% SLA
- **Latence API** : < 200ms (moyenne)
- **Temps de réponse DB** : < 50ms
- **Utilisation CPU** : < 70%
- **Utilisation RAM** : < 80%

### Métriques Métier
- **Couverture données** : > 95% des sources
- **Précision données** : > 98%
- **Temps réel** : < 30 secondes de latence
- **Utilisation active** : > 500 utilisateurs/jour

## 🔄 Plan d'Évolution

### Phase 1 (Actuel)
- ✅ Dashboard de base avec données simulées
- ✅ Architecture temps réel
- ✅ API REST complète
- ✅ Interface responsive

### Phase 2 (Prochain)
- 🔄 Intégration données IoT réelles
- 🔄 Authentification avancée
- 🔄 Analytics prédictifs
- 🔄 API mobile

### Phase 3 (Futur)
- 📋 Machine Learning pour prédictions
- 📋 Edge computing pour latence réduite
- 📋 Intégration IoT complète
- 📋 Analytics temps réel avancés

---

*Dernière mise à jour : Janvier 2024*
