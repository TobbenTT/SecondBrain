#!/bin/bash
# ============================================================================
# SecondBrain — Zero-Downtime Deploy (Blue-Green)
#
# Uso: ./deploy.sh [servicio]
#   ./deploy.sh              → deploy dashboard (default)
#   ./deploy.sh correos      → deploy inteligencia-correos
#   ./deploy.sh all          → deploy ambos
#
# Flujo:
#   1. git pull
#   2. Build nueva imagen
#   3. Levantar nuevo container en puerto temporal
#   4. Esperar health check OK
#   5. Cambiar nginx al nuevo puerto
#   6. Apagar container viejo
#   7. Limpiar
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
NGINX_CONF="/etc/nginx/sites-available/secondbrain"
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

swap_nginx_port() {
    local new_port=$1
    # Reemplazar el puerto en el upstream del nginx
    sudo sed -i "s|server 127.0.0.1:[0-9]*;|server 127.0.0.1:${new_port};|" "$NGINX_CONF"

    if sudo nginx -t 2>/dev/null; then
        sudo systemctl reload nginx
        return 0
    else
        err "nginx config invalida — revirtiendo"
        return 1
    fi
}

get_current_port() {
    grep -oP 'server 127\.0\.0\.1:\K[0-9]+' "$NGINX_CONF" | head -1
}

# ─── Deploy Dashboard ────────────────────────────────────────────────────────

deploy_dashboard() {
    local LIVE_PORT
    LIVE_PORT=$(get_current_port)
    local NEW_PORT

    if [ "$LIVE_PORT" = "3000" ]; then
        NEW_PORT=3001
    else
        NEW_PORT=3000
    fi

    info "Dashboard: puerto actual=${LIVE_PORT}, nuevo=${NEW_PORT}"

    # 1. Pull
    info "Descargando cambios..."
    git pull --ff-only

    # 2. Build nueva imagen
    info "Construyendo imagen..."
    docker compose build dashboard

    # 3. Levantar nuevo container en puerto temporal
    info "Levantando container nuevo en puerto ${NEW_PORT}..."
    DASHBOARD_PORT=$NEW_PORT docker compose run -d \
        --name "secondbrain-dashboard-new" \
        -p "${NEW_PORT}:3000" \
        --no-deps \
        -e "PORT=3000" \
        dashboard

    # 4. Esperar health check
    info "Esperando health check en puerto ${NEW_PORT}..."
    if wait_for_health "$NEW_PORT"; then
        log "Health check OK"
    else
        err "Health check fallo despues de 60s — abortando"
        docker rm -f "secondbrain-dashboard-new" 2>/dev/null
        exit 1
    fi

    # 5. Cambiar nginx
    info "Cambiando nginx al puerto ${NEW_PORT}..."
    if swap_nginx_port "$NEW_PORT"; then
        log "Nginx apuntando a puerto ${NEW_PORT}"
    else
        err "Error al cambiar nginx — limpiando"
        docker rm -f "secondbrain-dashboard-new" 2>/dev/null
        exit 1
    fi

    # 6. Apagar container viejo
    info "Apagando container viejo..."
    docker rm -f "secondbrain-dashboard" 2>/dev/null || true
    sleep 1

    # 7. Renombrar nuevo container al nombre estandar
    docker rename "secondbrain-dashboard-new" "secondbrain-dashboard"

    log "Dashboard desplegado sin downtime (puerto ${NEW_PORT})"
}

# ─── Deploy Correos ──────────────────────────────────────────────────────────

deploy_correos() {
    info "Correos: deploy con rebuild rapido..."

    git pull --ff-only

    # Correos no tiene upstream en nginx, usa puerto fijo 3003
    # El downtime es minimo (~5s) y solo afecta webhooks de Fireflies
    docker compose up -d --build inteligencia-correos

    info "Esperando health check correos..."
    if wait_for_health 3003; then
        log "Inteligencia-de-correos desplegado"
    else
        warn "Health check correos no respondio, verificar logs: docker logs secondbrain-correos"
    fi
}

# ─── Main ─────────────────────────────────────────────────────────────────────

echo ""
echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   SecondBrain — Zero-Downtime Deploy ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
echo ""

# Copiar pagina de mantenimiento (por si es la primera vez)
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
