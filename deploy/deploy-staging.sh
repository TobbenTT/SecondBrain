#!/bin/bash
# ============================================================================
# SecondBrain — Deploy Staging
#
# Uso: ./deploy-staging.sh [servicio]
#   ./deploy-staging.sh              → deploy dashboard staging (default)
#   ./deploy-staging.sh correos      → deploy correos staging
#   ./deploy-staging.sh all          → deploy ambos staging
#
# NO toca produccion. Usa docker-compose.staging.yml con puertos separados.
# ============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; }
info() { echo -e "${CYAN}[STAGING]${NC} $1"; }

REPO_DIR="${HOME}/SecondBrain"
COMPOSE_FILE="docker-compose.staging.yml"
SERVICE="${1:-dashboard}"

cd "$REPO_DIR"

wait_for_health() {
    local port=$1
    local max_attempts=30
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if wget -qO- --timeout=2 "http://127.0.0.1:${port}/health" > /dev/null 2>&1; then
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 2
    done
    return 1
}

# ─── Deploy Dashboard Staging ────────────────────────────────────────────────

deploy_dashboard() {
    info "Descargando cambios..."
    git pull --ff-only

    info "Construyendo imagen staging dashboard..."
    docker compose -f "$COMPOSE_FILE" build dashboard-staging
    log "Imagen construida"

    info "Reemplazando container staging..."
    docker compose -f "$COMPOSE_FILE" up -d --no-deps dashboard-staging

    info "Esperando health check (puerto 3010)..."
    if wait_for_health 3010; then
        log "Dashboard STAGING desplegado y saludable"
    else
        err "Health check fallo"
        docker logs --tail 20 staging-dashboard
        exit 1
    fi
}

# ─── Deploy Correos Staging ──────────────────────────────────────────────────

deploy_correos() {
    info "Descargando cambios..."
    git pull --ff-only

    info "Construyendo imagen staging correos..."
    docker compose -f "$COMPOSE_FILE" build inteligencia-correos-staging
    log "Imagen construida"

    info "Reemplazando container staging correos..."
    docker compose -f "$COMPOSE_FILE" up -d --no-deps inteligencia-correos-staging

    info "Esperando health check (puerto 3013)..."
    if wait_for_health 3013; then
        log "Correos STAGING desplegado"
    else
        warn "Health check correos staging no respondio"
        docker logs --tail 20 staging-correos
    fi
}

# ─── Main ─────────────────────────────────────────────────────────────────────

echo ""
echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   SecondBrain — Deploy STAGING       ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

# Verificar que el compose file existe
if [ ! -f "$COMPOSE_FILE" ]; then
    err "No se encontro $COMPOSE_FILE"
    exit 1
fi

# Crear knowledge-staging si no existe
mkdir -p knowledge-staging

case "$SERVICE" in
    dashboard)
        deploy_dashboard
        ;;
    correos)
        deploy_correos
        ;;
    all)
        deploy_dashboard
        echo ""
        deploy_correos
        ;;
    *)
        err "Servicio desconocido: $SERVICE"
        echo "Uso: ./deploy-staging.sh [dashboard|correos|all]"
        exit 1
        ;;
esac

echo ""
log "Deploy STAGING completado $(date '+%Y-%m-%d %H:%M:%S')"
echo -e "${CYAN}[→]${NC} Verificar en: https://staging.aiprowork.com"
echo ""
