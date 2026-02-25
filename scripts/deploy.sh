#!/bin/bash
# ─── SecondBrain Deploy ──────────────────────────────────────────────────────
# Safe deploy: backup → git pull → rebuild → verify
#
# Usage:
#   ./scripts/deploy.sh                    # Deploy all services
#   ./scripts/deploy.sh dashboard          # Deploy only dashboard
#   ./scripts/deploy.sh --skip-backup      # Skip backup (not recommended)
#
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SERVICE="${1:-}"
SKIP_BACKUP=false

if [ "$SERVICE" = "--skip-backup" ]; then
    SKIP_BACKUP=true
    SERVICE=""
fi

timestamp() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(timestamp)] $1"; }

cd "$PROJECT_DIR"

# ─── Step 1: Pre-deploy backup ───────────────────────────────────────────────
if [ "$SKIP_BACKUP" = false ]; then
    log "Step 1/4: Creating pre-deploy backup..."
    if bash "$SCRIPT_DIR/backup-pg.sh" --pre-deploy; then
        log "Backup OK"
    else
        log "WARNING: Backup failed. Continue anyway? (y/N)"
        read -p "  > " CONFIRM
        if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
            log "Deploy cancelled."
            exit 1
        fi
    fi
else
    log "Step 1/4: Backup skipped (--skip-backup)"
fi

# ─── Step 2: Git pull ────────────────────────────────────────────────────────
log "Step 2/4: Pulling latest code..."
git pull --ff-only || {
    log "ERROR: git pull failed. Resolve conflicts before deploying."
    exit 1
}

# ─── Step 3: Rebuild & restart ────────────────────────────────────────────────
log "Step 3/4: Rebuilding containers..."
if [ -n "$SERVICE" ]; then
    docker compose up -d --build "$SERVICE"
else
    docker compose up -d --build
fi

# ─── Step 4: Health check ────────────────────────────────────────────────────
log "Step 4/4: Waiting for health check..."
sleep 10

HEALTH=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://localhost:3000/health 2>/dev/null || echo "000")
if [ "$HEALTH" = "200" ]; then
    log "Deploy successful! Dashboard is healthy."
else
    log "WARNING: Health check returned HTTP $HEALTH"
    log "Check logs: docker compose logs --tail=50 dashboard"
fi

echo ""
log "Deploy complete."
