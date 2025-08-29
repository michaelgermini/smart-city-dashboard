# 🏙️ Dashboard Smart City – Mobilité & Trafic (Genève)

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/smartcity-geneva/dashboard)
[![CI/CD](https://img.shields.io/github/actions/workflow/status/smartcity-geneva/dashboard/ci-cd.yml?branch=main)](https://github.com/smartcity-geneva/dashboard/actions)
[![Coverage](https://img.shields.io/codecov/c/github/smartcity-geneva/dashboard)](https://codecov.io/gh/smartcity-geneva/dashboard)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-20.10+-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/smartcity-geneva/dashboard)](https://github.com/smartcity-geneva/dashboard/issues)
[![GitHub stars](https://img.shields.io/github/stars/smartcity-geneva/dashboard)](https://github.com/smartcity-geneva/dashboard/stargazers)

Plateforme de visualisation en temps réel des données de mobilité urbaine pour la Ville de Genève.

## 🎯 Objectif

Aider les décideurs urbains, Citec et les opérateurs de transport à :

- 📊 **Surveiller** l'état du trafic et des flux de mobilité en temps réel
- 🚨 **Détecter** les anomalies et congestions automatiquement
- 🎯 **Optimiser** la gestion urbaine (circulation, stationnements, transports publics)
- 📈 **Analyser** les tendances et prédire les problèmes
- 🌱 **Améliorer** la qualité de vie des citoyens

## 🛠️ Architecture Technique

### 1. Sources de données
- Capteurs IoT de trafic (boucles magnétiques, radars, caméras intelligentes)
- Systèmes de stationnement intelligents (capteurs de places, barrières connectées)
- Données open data de Genève (mobilité, transports publics)
- APIs externes : météo, horaires TPG (Transports Publics Genevois)

### 2. Pipeline Data
- Ingestion via API REST / MQTT / WebSocket pour les capteurs
- Stockage intermédiaire dans TimescaleDB (PostgreSQL orienté séries temporelles)
- Traitement en streaming avec Node.js + WebSocket

### 3. Backend
- Node.js/Express avec TypeScript
- API REST pour les données agrégées
- Gestion de seuils & alertes
- Authentification sécurisée

### 4. Frontend (Dashboard)
- React avec TypeScript
- ECharts pour les visualisations
- Interface responsive et moderne

## 🚀 Installation

### Installation Rapide (Données Simulées)

```bash
# Cloner le projet
git clone <repository-url>
cd smart-city-dashboard

# Installer les dépendances
npm install

# Lancer avec Docker (recommandé)
./start.sh

# Ou lancer manuellement
npm run dev
```

### Installation avec Données IoT Réelles

```bash
# Utiliser le script spécial pour les données réelles
./start-with-real-data.sh

# Configurer les clés API dans le fichier .env :
# - WEATHER_API_KEY (OpenWeatherMap)
# - TPG_API_KEY (Transports Publics Genevois)
# - GENEVA_API_KEY (Open Data Genève)
# -  
```

## 📊 Fonctionnalités

### 🔌 Sources de Données IoT Réelles
- **Transports Publics Genevois (TPG)** : Position GPS, occupation, retards
- **Stationnement Public** : Places disponibles, taux d'occupation
- **Capteurs de Trafic** : Flux de véhicules, vitesse moyenne, congestion
- **Données Météo** : Impact sur la mobilité urbaine
- **Fallback Automatique** : Basculement vers les données simulées en cas d'erreur

### Trafic Routier
- Détection de congestion sur l'autoroute A1 et le Pont du Mont-Blanc
- Visualisation en temps réel avec ECharts
- Alertes automatiques en cas de saturation
- Données des capteurs IoT de la Ville de Genève

### Stationnement
- Suivi des parkings P+R en temps réel
- Disponibilité des places de stationnement
- Heatmap de densité par zone
- Données Open Data de la Ville de Genève

### Transports Publics
- Monitoring des véhicules TPG en temps réel
- Suivi de la ponctualité et des retards
- Visualisation des lignes et arrêts
- API officielle TPG intégrée

### Alertes et Notifications
- Système d'alertes automatiques
- Notifications en temps réel
- Historique des événements
- Seuils configurables par type de données

## ✨ Fonctionnalités Clés

### 🔴 **Temps Réel & Live Data**
- ⚡ **WebSocket** pour les mises à jour instantanées (< 1 seconde)
- 🔄 **Mise à jour automatique** toutes les 30 secondes
- 📡 **Streaming de données** depuis les capteurs IoT
- 🔔 **Notifications temps réel** pour les alertes critiques

### 📊 **Visualisations Avancées**
- 📈 **Graphiques ECharts** interactifs et responsives
- 🗺️ **Cartes géographiques** avec visualisation des flux
- 📊 **Tableaux de bord** personnalisables par rôle
- 📤 **Exports** PDF, CSV, JSON pour les rapports
- 🎨 **Thèmes** sombre/clair avec personnalisation

### 🛡️ **Sécurité Renforcée**
- 🔐 **Authentification JWT** avec rôles utilisateur
- 🚦 **Rate limiting** et protection DDoS
- 🔒 **Chiffrement** des données sensibles en transit/repos
- 📋 **Audit logs** complets avec traçabilité
- 🛡️ **Headers de sécurité** (CSP, HSTS, X-Frame-Options)

### 🤖 **Intelligence Artificielle**
- 🎯 **Détection d'anomalies** automatique
- 📈 **Prédictions de trafic** basées sur l'historique
- 🚨 **Alertes intelligentes** avec seuils dynamiques
- 📊 **Analytics** temps réel avec métriques clés

### 🔧 **APIs & Intégrations**
- 🌤️ **Météo intégrée** avec OpenWeatherMap
- 🚌 **Données TPG** temps réel
- 🅿️ **Parkings Genève** avec disponibilité live
- 🔗 **APIs REST** complètes avec documentation
- 📡 **WebHooks** pour intégrations tierces

## 🏗️ Structure du Projet

```
smart-city-dashboard/
├── backend/                 # API Node.js/Express
├── frontend/               # Dashboard React
├── database/               # Scripts et migrations
├── docs/                   # Documentation
└── docker/                 # Configuration Docker
```

## 🔧 Technologies Utilisées

- **Backend**: Node.js, Express, TypeScript, Socket.io
- **Frontend**: React, TypeScript, ECharts, Tailwind CSS
- **Base de données**: TimescaleDB (PostgreSQL)
- **Temps réel**: WebSocket, Socket.io
- **Déploiement**: Docker, Docker Compose

## 📈 Types de Visualisations

- **Line charts temps réel** → Évolution du trafic
- **Heatmaps** → Densité de circulation par zone
- **Gauge charts** → Niveau de saturation des axes
- **Maps GeoJSON** → Affichage géographique des points critiques
- **Bar charts** → Statistiques comparatives

## 🔐 Sécurité

- Authentification JWT
- Autorisation par rôles
- API sécurisée avec rate limiting
- Données chiffrées en transit

## 📚 Documentation

### 🚀 Démarrage rapide
- **[Installation](docs/INSTALLATION.md)** - Guide d'installation complet
- **[API Documentation](docs/API_DOCUMENTATION.md)** - Documentation complète de l'API
- **[Architecture](docs/ARCHITECTURE.md)** - Architecture technique détaillée

### 🔧 Développement
- **[Contribution](docs/CONTRIBUTING.md)** - Guide pour contribuer au projet
- **[Sécurité](docs/SECURITY.md)** - Mesures de sécurité et bonnes pratiques
- **[Dépannage](docs/TROUBLESHOOTING.md)** - Résolution des problèmes courants

### 📊 Données et Déploiement
- **[Sources de données](docs/DATA_SOURCES.md)** - Configuration des APIs externes
- **[Déploiement](docs/DEPLOYMENT.md)** - Guide de déploiement en production
- **[Historique](docs/CHANGELOG.md)** - Évolution du projet

## 🏃 Démarrage Rapide

### Avec Docker (Recommandé)

```bash
# Cloner le projet
git clone <repository-url>
cd smart-city-dashboard

# Lancer l'application
./start.sh

# Accéder au dashboard
# http://localhost:3000
```

### Développement Local

```bash
# Installer les dépendances
npm run setup

# Démarrer en mode développement
npm run dev

# L'application sera disponible sur :
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

## 🤝 Contribution

Nous accueillons les contributions ! Voir notre [guide de contribution](docs/CONTRIBUTING.md) pour :

- 📝 **Signaler un bug**
- 💡 **Proposer une fonctionnalité**
- 🛠️ **Contribuer du code**
- 📚 **Améliorer la documentation**

## 📞 Support

- 📧 **Email** : michael@germini.info
- 🐛 **Issues** : [GitHub Issues](https://github.com/michaelgermini/smart-city-dashboard/issues)
- 💬 **Discussions** : [GitHub Discussions](https://github.com/michaelgermini/smart-city-dashboard/discussions)
- 📖 **Documentation** : [docs/](docs/)

## 🙏 Remerciements

- **Ville de Genève** pour le soutien du projet
- **TPG** pour les données de transport
- **Open Data Genève** pour les données publiques
- **Communauté open source** pour les outils utilisés

## 👥 Contributeurs

Merci à toutes les personnes qui ont contribué à ce projet !

<a href="https://github.com/smartcity-geneva/dashboard/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=smartcity-geneva/dashboard" />
</a>

### Comment contribuer ?

Nous accueillons toutes les contributions ! Voir notre [guide de contribution](docs/CONTRIBUTING.md) pour :

- 🐛 **Signaler un bug**
- 💡 **Proposer une fonctionnalité**
- 🛠️ **Contribuer du code**
- 📚 **Améliorer la documentation**

## 🏢 Sponsors & Partenaires

### Institutions Publiques
- **Ville de Genève** - Partenaire principal
- **Citec** - Expertise technique
- **TPG** - Données de transport

### Partenaires Techniques
- **Open Data Genève** - Données publiques
- **MétéoSuisse** - Données météorologiques
- **Communauté Open Source** - Technologies utilisées

## 📈 Métriques du Projet

[![GitHub issues](https://img.shields.io/github/issues/smartcity-geneva/dashboard)](https://github.com/smartcity-geneva/dashboard/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/smartcity-geneva/dashboard)](https://github.com/smartcity-geneva/dashboard/pulls)
[![GitHub stars](https://img.shields.io/github/stars/smartcity-geneva/dashboard)](https://github.com/smartcity-geneva/dashboard/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/smartcity-geneva/dashboard)](https://github.com/smartcity-geneva/dashboard/network)

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

<div align="center">

**🏙️ Dashboard Smart City Genève**

*Fait avec ❤️ pour améliorer la mobilité urbaine de Genève*

[![Ville de Genève](https://img.shields.io/badge/Ville_de_Genève-Partner-blue)](https://www.geneve.ch/)
[![Citec](https://img.shields.io/badge/Citec-Partner-green)](https://www.citec.ch/)
[![TPG](https://img.shields.io/badge/TPG-Partner-orange)](https://www.tpg.ch/)

</div>
