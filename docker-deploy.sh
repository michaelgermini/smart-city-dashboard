#!/bin/bash

# Script de déploiement Docker pour Smart City Dashboard
# Utilisation: ./docker-deploy.sh [dev|prod|stop|clean|logs]

set -e

PROJECT_NAME="smart-city-dashboard"
COMPOSE_FILE="docker-compose.yml"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Vérifier si Docker est installé
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker n'est pas installé. Veuillez installer Docker d'abord."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose n'est pas installé. Veuillez installer Docker Compose d'abord."
        exit 1
    fi
}

# Créer le fichier .env si nécessaire
create_env() {
    if [ ! -f ".env" ]; then
        log "Création du fichier .env..."
        cp env.docker.txt .env
        warning "Le fichier .env a été créé avec des valeurs par défaut."
        warning "Pensez à modifier les mots de passe pour la production !"
    fi
}

# Déploiement en développement
deploy_dev() {
    log "🚀 Déploiement en mode développement..."

    # Créer les volumes nécessaires
    docker volume create ${PROJECT_NAME}_timescaledb_data 2>/dev/null || true

    # Construire et démarrer les services
    docker-compose up -d --build

    # Attendre que les services soient prêts
    log "⏳ Attente du démarrage des services..."
    sleep 10

    # Vérifier l'état des services
    check_services

    log "✅ Application déployée avec succès !"
    log "🌐 Frontend: http://localhost:3000"
    log "🔧 Backend API: http://localhost:5000"
    log "🗄️ Base de données: localhost:5432"
}

# Déploiement en production
deploy_prod() {
    log "🚀 Déploiement en mode production..."

    # Créer les volumes nécessaires
    docker volume create ${PROJECT_NAME}_timescaledb_data 2>/dev/null || true

    # Construire les images sans cache pour la production
    docker-compose build --no-cache

    # Démarrer en mode détaché
    docker-compose up -d

    # Attendre que les services soient prêts
    log "⏳ Attente du démarrage des services..."
    sleep 15

    # Vérifier l'état des services
    check_services

    log "✅ Application déployée en production !"
    log "🌐 Application: http://localhost (via Nginx)"
    log "🔧 Backend API: http://localhost/api"
}

# Arrêter les services
stop_services() {
    log "🛑 Arrêt des services..."
    docker-compose down
    log "✅ Services arrêtés."
}

# Nettoyer complètement
clean_all() {
    log "🧹 Nettoyage complet..."

    # Arrêter et supprimer les conteneurs
    docker-compose down -v --remove-orphans

    # Supprimer les images
    docker-compose rm -f

    # Supprimer les volumes
    docker volume rm ${PROJECT_NAME}_timescaledb_data 2>/dev/null || true

    # Nettoyer les images non utilisées
    docker image prune -f

    # Nettoyer les volumes non utilisés
    docker volume prune -f

    log "✅ Nettoyage terminé."
}

# Afficher les logs
show_logs() {
    log "📋 Logs des services:"
    docker-compose logs -f
}

# Vérifier l'état des services
check_services() {
    log "🔍 Vérification de l'état des services..."

    # Vérifier les conteneurs
    if docker-compose ps | grep -q "Up"; then
        info "Conteneurs actifs:"
        docker-compose ps
    else
        error "Aucun conteneur actif trouvé"
        return 1
    fi

    # Tester la connectivité
    log "🔌 Test de connectivité..."

    # Tester le backend
    if curl -f http://localhost:5000/health &>/dev/null; then
        info "✅ Backend API accessible"
    else
        warning "⚠️ Backend API non accessible (peut être normal pendant le démarrage)"
    fi

    # Tester le frontend
    if curl -f http://localhost:3000 &>/dev/null; then
        info "✅ Frontend accessible"
    else
        warning "⚠️ Frontend non accessible (peut être normal pendant le démarrage)"
    fi
}

# Afficher l'aide
show_help() {
    echo "Script de déploiement Docker pour Smart City Dashboard"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev     Déploiement en mode développement"
    echo "  prod    Déploiement en mode production"
    echo "  stop    Arrêter tous les services"
    echo "  clean   Nettoyer complètement (supprime volumes)"
    echo "  logs    Afficher les logs des services"
    echo "  status  Vérifier l'état des services"
    echo "  help    Afficher cette aide"
    echo ""
    echo "Examples:"
    echo "  $0 dev          # Démarrer en développement"
    echo "  $0 prod         # Démarrer en production"
    echo "  $0 stop         # Arrêter les services"
    echo "  $0 clean        # Nettoyer complètement"
    echo "  $0 logs         # Voir les logs"
}

# Fonction principale
main() {
    check_docker
    create_env

    case "${1:-help}" in
        "dev")
            deploy_dev
            ;;
        "prod")
            deploy_prod
            ;;
        "stop")
            stop_services
            ;;
        "clean")
            clean_all
            ;;
        "logs")
            show_logs
            ;;
        "status")
            check_services
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Exécuter la fonction principale
main "$@"
