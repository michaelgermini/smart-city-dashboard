#!/bin/bash

echo "🚀 Démarrage du Dashboard Smart City - Genève avec Données IoT Réelles"
echo "=================================================================="

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker d'abord."
    exit 1
fi

# Vérifier si docker-compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez installer Docker Compose d'abord."
    exit 1
fi

# Créer le fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    cat > .env << EOF
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_city
DB_USER=postgres
DB_PASSWORD=password
PORT=5000
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=info
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Configuration des sources de données réelles
USE_REAL_DATA=true
WEATHER_API_KEY=your-weather-api-key
TPG_API_KEY=your-tpg-api-key
GENEVA_API_KEY=your-geneva-open-data-api-key
TRAFFIC_API_KEY=your-geneva-traffic-api-key

# Seuils d'alerte
TRAFFIC_CONGESTION_THRESHOLD=80
PARKING_OCCUPANCY_THRESHOLD=90
TRANSPORT_DELAY_THRESHOLD=10
EOF
    echo "✅ Fichier .env créé avec la configuration pour les données réelles"
    echo ""
    echo "⚠️  IMPORTANT: Veuillez configurer vos clés API dans le fichier .env :"
    echo "   - WEATHER_API_KEY: Clé OpenWeatherMap (https://openweathermap.org/api)"
    echo "   - TPG_API_KEY: Clé API TPG (contactez le service technique TPG)"
    echo "   - GENEVA_API_KEY: Clé Open Data Genève (https://data.ge.ch)"
    echo "   - TRAFFIC_API_KEY: Clé API trafic Genève (contactez la Ville de Genève)"
    echo ""
    echo "🔧 Pour utiliser les données simulées en attendant, changez USE_REAL_DATA=false"
    echo ""
    read -p "Appuyez sur Entrée pour continuer avec les données simulées ou Ctrl+C pour configurer les clés API..."
    
    # Modifier pour utiliser les données simulées par défaut
    sed -i 's/USE_REAL_DATA=true/USE_REAL_DATA=false/' .env
    echo "✅ Mode données simulées activé par défaut"
fi

echo "🔨 Construction des images Docker..."
docker-compose build

echo "🚀 Démarrage des services..."
docker-compose up -d

echo "⏳ Attente du démarrage des services..."
sleep 15

echo "📊 État des services :"
docker-compose ps

echo ""
echo "✅ Dashboard Smart City démarré avec succès !"
echo ""
echo "🌐 Accès aux services :"
echo "   - Dashboard Frontend: http://localhost:3000"
echo "   - API Backend: http://localhost:5000"
echo "   - Base de données: localhost:5432"
echo ""
echo "📋 Endpoints API disponibles :"
echo "   - GET /api/datasources/status - Statut des sources de données"
echo "   - GET /api/datasources/config - Configuration des sources"
echo "   - GET /api/datasources/test/:source - Test d'une source spécifique"
echo "   - GET /api/datasources/realtime - Données en temps réel"
echo ""
echo "🧪 Tests disponibles :"
echo "   - npm run test:data (dans le dossier backend)"
echo "   - npm run test:data:tpg"
echo "   - npm run test:data:parking"
echo "   - npm run test:data:traffic"
echo "   - npm run test:data:weather"
echo ""
echo "📚 Documentation :"
echo "   - docs/DATA_SOURCES.md - Guide des sources de données"
echo "   - docs/INSTALLATION.md - Guide d'installation complet"
echo ""
echo "🔍 Pour surveiller les logs :"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Pour arrêter les services :"
echo "   docker-compose down"
