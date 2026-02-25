#!/bin/bash
# ─── SecondBrain PostgreSQL Restore ──────────────────────────────────────────
# Restores a backup file into the PostgreSQL container.
#
# Usage:
#   ./scripts/restore-pg.sh                          # Restore latest backup
#   ./scripts/restore-pg.sh backups/filename.sql.gz  # Restore specific file
#   ./scripts/restore-pg.sh --list                   # List available backups
#
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ─── Configuration ───────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_DIR/backups}"
CONTAINER="${PG_CONTAINER:-secondbrain-postgres}"
PG_USER="${PG_USER:-secondbrain}"
PG_DB="${PG_DB:-secondbrain}"

timestamp() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(timestamp)] $1"; }

# ─── List mode ────────────────────────────────────────────────────────────────
if [ "${1:-}" = "--list" ]; then
    echo "Available backups:"
    echo "─────────────────────────────────────────────"
    if [ -d "$BACKUP_DIR" ]; then
        ls -lht "$BACKUP_DIR"/secondbrain_*.sql.gz 2>/dev/null | awk '{print $5, $6, $7, $8, $9}' || echo "  (none)"
    else
        echo "  Backup directory not found: $BACKUP_DIR"
    fi
    exit 0
fi

# ─── Pre-checks ──────────────────────────────────────────────────────────────
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
    log "ERROR: Container '${CONTAINER}' is not running."
    exit 1
fi

# ─── Find backup file ────────────────────────────────────────────────────────
if [ -n "${1:-}" ]; then
    BACKUP_FILE="$1"
else
    # Find latest backup
    BACKUP_FILE=$(ls -t "$BACKUP_DIR"/secondbrain_*.sql.gz 2>/dev/null | head -1)
    if [ -z "$BACKUP_FILE" ]; then
        log "ERROR: No backups found in $BACKUP_DIR"
        log "Usage: $0 <backup-file.sql.gz>"
        exit 1
    fi
fi

if [ ! -f "$BACKUP_FILE" ]; then
    log "ERROR: File not found: $BACKUP_FILE"
    exit 1
fi

HUMAN_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log "Restore file: $(basename "$BACKUP_FILE") (${HUMAN_SIZE})"

# ─── Safety confirmation ─────────────────────────────────────────────────────
echo ""
echo "⚠  WARNING: This will OVERWRITE the current database '$PG_DB'."
echo "   File: $(basename "$BACKUP_FILE")"
echo ""
read -p "   Continue? (y/N): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    log "Restore cancelled by user."
    exit 0
fi

# ─── Create safety backup before restore ─────────────────────────────────────
log "Creating safety backup before restore..."
SAFETY_FILE="${BACKUP_DIR}/secondbrain_pre-restore_$(date '+%Y%m%d_%H%M%S').sql.gz"
docker exec "$CONTAINER" pg_dump -U "$PG_USER" -d "$PG_DB" \
    --no-owner --no-privileges --clean --if-exists \
    | gzip > "$SAFETY_FILE"
log "Safety backup: $(basename "$SAFETY_FILE")"

# ─── Restore ──────────────────────────────────────────────────────────────────
log "Restoring database..."

gunzip -c "$BACKUP_FILE" | docker exec -i "$CONTAINER" psql -U "$PG_USER" -d "$PG_DB" \
    --single-transaction --set ON_ERROR_STOP=off -q 2>&1 | tail -5

log "Restore completed successfully."

# ─── Verify ───────────────────────────────────────────────────────────────────
log "Verifying restore..."
echo ""
docker exec "$CONTAINER" psql -U "$PG_USER" -d "$PG_DB" -c "
    SELECT 'ideas' as tabla, count(*) as registros FROM ideas
    UNION ALL SELECT 'projects', count(*) FROM projects
    UNION ALL SELECT 'areas', count(*) FROM areas
    UNION ALL SELECT 'feedback', count(*) FROM feedback
    UNION ALL SELECT 'reuniones', count(*) FROM reuniones
    UNION ALL SELECT 'users', count(*) FROM users
    UNION ALL SELECT 'waiting_for', count(*) FROM waiting_for
    ORDER BY tabla;
"
echo ""
log "Done. Safety backup saved at: $(basename "$SAFETY_FILE")"
