#!/bin/bash
# ============================================================================
# SecondBrain — Deploy Seguro
#
# Uso: ./deploy.sh [servicio]
#   ./deploy.sh              → deploy dashboard (default)
#   ./deploy.sh correos      → deploy inteligencia-correos
#   ./deploy.sh all          → deploy ambos
#
# Flujo:
#   1. git pull
#   2. Build nueva imagen (mientras la vieja sigue sirviendo)
#   3. Reemplazar container (nginx muestra pagina de mantenimiento ~3-5s)
#   4. Esperar health check
#
# Los datos son seguros: el volumen sb-data persiste entre containers.
# Los archivos en knowledge/ y core/skills/ son bind mounts del host.
# ============================================================================

set -euo pipefail

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; }
info() { echo -e "${BLUE}[→]${NC} $1"; }

REPO_DIR="${HOME}/SecondBrain"
SERVICE="${1:-dashboard}"

cd "$REPO_DIR"

# ─── Funciones ────────────────────────────────────────────────────────────────

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

# ─── Deploy Dashboard ────────────────────────────────────────────────────────

deploy_dashboard() {
    info "Descargando cambios..."
    git pull --ff-only

    # Build ANTES de parar — asi el downtime es solo el restart (~3-5s)
    info "Construyendo imagen nueva (el dashboard sigue funcionando)..."
    docker compose build dashboard
    log "Imagen construida"

    # Reemplazar container — nginx muestra maintenance.html durante estos segundos
    info "Reemplazando container (downtime ~3-5s, nginx muestra pagina de mantenimiento)..."
    docker compose up -d --no-deps dashboard

    # Esperar que arranque
    info "Esperando health check..."
    if wait_for_health 3000; then
        log "Dashboard desplegado y saludable"
    else
        err "Health check fallo despues de 60s"
        warn "Revisando logs..."
        docker logs --tail 20 secondbrain-dashboard
        exit 1
    fi
}

# ─── Deploy Correos ──────────────────────────────────────────────────────────

deploy_correos() {
    info "Descargando cambios..."
    git pull --ff-only

    info "Construyendo imagen correos..."
    docker compose build inteligencia-correos
    log "Imagen construida"

    info "Reemplazando container correos..."
    docker compose up -d --no-deps inteligencia-correos

    info "Esperando health check correos..."
    if wait_for_health 3003; then
        log "Inteligencia-de-correos desplegado"
    else
        warn "Health check correos no respondio — revisar: docker logs secondbrain-correos"
    fi
}

# ─── Main ─────────────────────────────────────────────────────────────────────

echo ""
echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     SecondBrain — Deploy Seguro      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
echo ""

# Asegurar que la pagina de mantenimiento existe
sudo mkdir -p /var/www/secondbrain
sudo cp deploy/maintenance.html /var/www/secondbrain/ 2>/dev/null || true

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
        echo "Uso: ./deploy.sh [dashboard|correos|all]"
        exit 1
        ;;
esac

echo ""
log "Deploy completado $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
