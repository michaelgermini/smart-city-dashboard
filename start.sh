#!/bin/bash

echo "🚀 Démarrage du Dashboard Smart City - Genève"
echo "=============================================="

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker d'abord."
    exit 1
fi

# Vérifier si Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez installer Docker Compose d'abord."
    exit 1
fi

# Créer le fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env à partir du template..."
    cp env.example .env
    echo "✅ Fichier .env créé. Veuillez le modifier selon vos besoins."
fi

# Construire et démarrer les services
echo "🔨 Construction des images Docker..."
docker-compose build

echo "🚀 Démarrage des services..."
docker-compose up -d

echo "⏳ Attente du démarrage des services..."
sleep 10

# Vérifier l'état des services
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
echo "📚 Commandes utiles :"
echo "   - Voir les logs: docker-compose logs -f"
echo "   - Arrêter: docker-compose down"
echo "   - Redémarrer: docker-compose restart"
echo ""
echo "🎯 Le dashboard est maintenant accessible à l'adresse :"
echo "   http://localhost:3000"
