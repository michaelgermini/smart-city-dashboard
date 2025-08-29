# 📚 Documentation API - Smart City Dashboard Genève

## Vue d'ensemble

Le backend fournit une API REST complète pour accéder aux données de mobilité urbaine de Genève.

**URL de base** : `http://localhost:5000/api`

## 🔐 Authentification

Toutes les requêtes nécessitent un token JWT dans le header `Authorization` :

```bash
Authorization: Bearer <your-jwt-token>
```

### Obtenir un token

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "your-password"
}
```

## 🚗 Trafic Routier

### Obtenir les données de trafic actuelles

```bash
GET /api/traffic/current
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-15T10:30:00Z",
    "routes": [
      {
        "id": "a1_bridge",
        "name": "Pont du Mont-Blanc",
        "congestion_level": 75,
        "avg_speed": 45,
        "vehicle_count": 1250,
        "status": "congested"
      }
    ]
  }
}
```

### Historique du trafic

```bash
GET /api/traffic/history?route=a1_bridge&hours=24
```

**Paramètres** :
- `route` (optionnel) : ID de la route
- `hours` (optionnel) : Nombre d'heures d'historique (défaut: 24)

## 🅿️ Stationnement

### Places disponibles

```bash
GET /api/parking/available
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-15T10:30:00Z",
    "parkings": [
      {
        "id": "parking_centre",
        "name": "Parking Centre Ville",
        "total_spaces": 500,
        "available_spaces": 125,
        "occupancy_rate": 75.0,
        "status": "busy"
      }
    ]
  }
}
```

### Détails d'un parking

```bash
GET /api/parking/{parking_id}
```

## 🚌 Transports Publics

### Position des véhicules

```bash
GET /api/transport/vehicles
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-15T10:30:00Z",
    "vehicles": [
      {
        "id": "tpg_12345",
        "line": "12",
        "latitude": 46.2044,
        "longitude": 6.1432,
        "speed": 25,
        "occupancy": 85,
        "delay": 2,
        "next_stop": "Bel-Air"
      }
    ]
  }
}
```

### Informations sur les lignes

```bash
GET /api/transport/lines
```

## 🚨 Alertes et Notifications

### Alertes actives

```bash
GET /api/alerts/active
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert_001",
        "type": "traffic",
        "severity": "high",
        "title": "Congestion importante A1",
        "description": "Trafic dense sur l'autoroute A1, direction Lausanne",
        "location": "Pont du Mont-Blanc",
        "timestamp": "2024-01-15T10:25:00Z",
        "active": true
      }
    ]
  }
}
```

### Créer une alerte

```bash
POST /api/alerts
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "traffic",
  "severity": "medium",
  "title": "Travaux sur la Route de Malagnou",
  "description": "Fermeture partielle de la route",
  "location": "Route de Malagnou"
}
```

## 📊 Données Sources

### État des sources de données

```bash
GET /api/datasources/status
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "sources": [
      {
        "name": "TPG API",
        "status": "online",
        "last_update": "2024-01-15T10:29:45Z",
        "response_time": 250,
        "error_count": 0
      },
      {
        "name": "Parking Genève",
        "status": "online",
        "last_update": "2024-01-15T10:29:30Z",
        "response_time": 180,
        "error_count": 1
      }
    ]
  }
}
```

## 🌤️ Données Météo

### Conditions actuelles

```bash
GET /api/weather/current
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "location": "Genève",
    "timestamp": "2024-01-15T10:30:00Z",
    "temperature": 8.5,
    "humidity": 65,
    "wind_speed": 12,
    "wind_direction": "NW",
    "conditions": "partiellement nuageux",
    "precipitation": 0.0
  }
}
```

## 📈 Statistiques

### Métriques générales

```bash
GET /api/stats/overview
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "period": "24h",
    "traffic": {
      "avg_congestion": 45.2,
      "total_vehicles": 125000,
      "incidents_count": 3
    },
    "parking": {
      "avg_occupancy": 68.5,
      "total_spaces": 15000,
      "available_spaces": 4800
    },
    "transport": {
      "avg_delay": 1.8,
      "total_vehicles": 450,
      "on_time_percentage": 92.3
    }
  }
}
```

## 🔌 WebSocket

### Connexion temps réel

```javascript
const socket = io('http://localhost:5000');

// Rejoindre les rooms
socket.emit('join-traffic');
socket.emit('join-parking');
socket.emit('join-transport');
socket.emit('join-alerts');

// Écouter les mises à jour
socket.on('traffic-update', (data) => {
  console.log('Mise à jour trafic:', data);
});

socket.on('parking-update', (data) => {
  console.log('Mise à jour parking:', data);
});

socket.on('alert-new', (data) => {
  console.log('Nouvelle alerte:', data);
});
```

### Événements WebSocket

| Événement | Description | Fréquence |
|-----------|-------------|-----------|
| `traffic-update` | Mise à jour des données de trafic | 30 secondes |
| `parking-update` | Mise à jour des places de parking | 60 secondes |
| `transport-update` | Mise à jour des véhicules TPG | 15 secondes |
| `alert-new` | Nouvelle alerte | Temps réel |
| `alert-resolved` | Alerte résolue | Temps réel |

## ⚠️ Gestion d'Erreurs

### Codes d'erreur HTTP

| Code | Description |
|------|-------------|
| 200 | Succès |
| 400 | Requête invalide |
| 401 | Non autorisé |
| 403 | Interdit |
| 404 | Ressource non trouvée |
| 429 | Trop de requêtes (rate limiting) |
| 500 | Erreur serveur |

### Structure d'erreur

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Les données fournies sont invalides",
    "details": {
      "field": "username",
      "reason": "Champ requis"
    }
  }
}
```

## 🔒 Rate Limiting

- **Requêtes API** : 100 requêtes/minute par IP
- **WebSocket** : Illimité (mais surveillé)
- **Headers de réponse** :
  ```
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1642156800
  ```

## 📝 Pagination

Pour les endpoints retournant beaucoup de données :

```bash
GET /api/traffic/history?page=1&limit=50
```

**Paramètres** :
- `page` : Numéro de page (défaut: 1)
- `limit` : Nombre d'éléments par page (défaut: 20, max: 100)

## 🔍 Filtrage et Tri

### Exemples de filtrage

```bash
# Filtrer par date
GET /api/alerts?start_date=2024-01-01&end_date=2024-01-15

# Filtrer par sévérité
GET /api/alerts?severity=high

# Trier par date
GET /api/traffic/history?sort=-timestamp
```

## 📊 Format des Données

### Timestamps
Tous les timestamps sont en UTC et au format ISO 8601 :
```json
"timestamp": "2024-01-15T10:30:00.000Z"
```

### Coordonnées GPS
Format décimal standard :
```json
{
  "latitude": 46.204391,
  "longitude": 6.143158
}
```

### Pourcentages
Toujours entre 0 et 100 :
```json
"occupancy_rate": 75.5
```

## 🔧 Développement

### Tester l'API

```bash
# Health check
curl http://localhost:5000/health

# Avec authentification
curl -H "Authorization: Bearer <token>" \
     http://localhost:5000/api/traffic/current
```

### Postman Collection

Importez le fichier `docs/postman_collection.json` pour tester tous les endpoints.

## 📞 Support

Pour des questions sur l'API :
- 📧 Email : michael@germini.info
- 📖 Documentation : `/docs/API_DOCUMENTATION.md`
- 🐛 Issues : [GitHub Issues](https://github.com/michaelgermini/smart-city-dashboard/issues)

---

*Dernière mise à jour : Janvier 2024*
