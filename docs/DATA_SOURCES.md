# 📊 Sources de Données IoT - Genève

Ce document décrit les sources de données réelles utilisées par le dashboard Smart City de Genève et comment les configurer.

## 🔧 Configuration

### Variables d'environnement

Ajoutez ces variables à votre fichier `.env` :

```bash
# Activation des données réelles (false = données simulées)
USE_REAL_DATA=false

# Clés API pour les sources de données
WEATHER_API_KEY=your-weather-api-key
TPG_API_KEY=your-tpg-api-key
GENEVA_API_KEY=your-geneva-open-data-api-key
TRAFFIC_API_KEY=your-geneva-traffic-api-key
```

## 🚌 Transports Publics Genevois (TPG)

### API TPG
- **URL de base** : `https://api.tpg.ch/v1`
- **Endpoints** :
  - `/vehicles` - Position des véhicules en temps réel
  - `/stops` - Informations sur les arrêts
  - `/schedules` - Horaires en temps réel

### Données récupérées
- Position GPS des véhicules
- Vitesse et direction
- Taux d'occupation
- Retards et horaires
- Prochain arrêt

### Configuration
```bash
TPG_API_KEY=votre-clé-api-tpg
```

## 🚗 Stationnement Public

### API Open Data Genève
- **URL de base** : `https://data.ge.ch/api`
- **Dataset** : `parkings-publics`
- **Format** : JSON via l'API Socrata

### Données récupérées
- Nombre total de places
- Places disponibles
- Taux d'occupation
- Horaires d'ouverture
- Tarifs

### Configuration
```bash
GENEVA_API_KEY=votre-clé-api-geneva
```

## 🚦 Capteurs de Trafic

### API Trafic Genève
- **URL de base** : `https://api.traffic.geneva.ch`
- **Endpoint** : `/sensors/current`

### Données récupérées
- Nombre de véhicules par minute
- Vitesse moyenne
- Niveau de congestion
- Statut des capteurs

### Configuration
```bash
TRAFFIC_API_KEY=votre-clé-api-trafic
```

## 🌤️ Données Météo

### OpenWeatherMap API
- **URL de base** : `https://api.openweathermap.org/data/2.5`
- **Endpoint** : `/weather`
- **Coordonnées** : Genève (46.2044, 6.1432)

### Données récupérées
- Température
- Humidité
- Précipitations
- Vitesse du vent
- Conditions météo

### Configuration
```bash
WEATHER_API_KEY=votre-clé-api-openweathermap
```

## 🔄 Gestion des Erreurs

Le système est conçu pour être robuste :

1. **Fallback automatique** : Si les données réelles ne sont pas disponibles, le système bascule automatiquement vers les données simulées
2. **Logging détaillé** : Toutes les erreurs sont enregistrées dans les logs
3. **Mise à jour continue** : Les tentatives de récupération se poursuivent selon les intervalles configurés

## 📊 Intervalles de Mise à Jour

| Service | Données Simulées | Données Réelles |
|---------|------------------|-----------------|
| Trafic | 5 secondes | 30 secondes |
| Stationnement | 10 secondes | 60 secondes |
| Transport | 8 secondes | 15 secondes |
| Météo | - | 300 secondes |

## 🚀 Activation des Données Réelles

1. **Configurer les clés API** :
   ```bash
   cp .env.example .env
   # Éditer .env avec vos vraies clés API
   ```

2. **Activer les données réelles** :
   ```bash
   USE_REAL_DATA=true
   ```

3. **Redémarrer les services** :
   ```bash
   npm run dev
   ```

## 📋 Sources de Données Disponibles

### Sources Officielles
- **TPG** : API officielle des Transports Publics Genevois
- **Open Data Genève** : Données publiques de la Ville de Genève
- **MétéoSuisse** : Données météorologiques officielles

### Sources Alternatives
- **Google Maps API** : Données de trafic en temps réel
- **Waze API** : Informations sur les incidents routiers
- **OpenStreetMap** : Données cartographiques

## 🔐 Sécurité

- Toutes les clés API sont stockées dans des variables d'environnement
- Les requêtes sont limitées en fréquence pour éviter la surcharge
- Les données sensibles ne sont jamais exposées dans les logs
- Connexions HTTPS obligatoires pour toutes les APIs externes

## 📈 Monitoring

Le système surveille automatiquement :
- La disponibilité des APIs
- La qualité des données reçues
- Les temps de réponse
- Les taux d'erreur

## 🛠️ Développement

Pour ajouter une nouvelle source de données :

1. Créer une nouvelle classe dans `DataConnectors.ts`
2. Implémenter les méthodes `fetchData()` et `transformData()`
3. Ajouter la configuration dans le `DataConnectorManager`
4. Mettre à jour la documentation

## 📞 Support

Pour obtenir des clés API ou de l'aide :
- **TPG** : Contactez le service technique TPG
- **Open Data Genève** : Consultez le portail open data
- **MétéoSuisse** : Inscription sur le site officiel
- **Projet** : michael@germini.info
