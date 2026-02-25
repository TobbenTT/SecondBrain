#!/bin/bash
# ─── SecondBrain PostgreSQL Backup ───────────────────────────────────────────
# Automated pg_dump backups with 30-day retention.
#
# Usage:
#   ./scripts/backup-pg.sh              # Manual backup
#   ./scripts/backup-pg.sh --pre-deploy # Backup tagged as pre-deploy
#
# Setup (cron - daily at 3 AM):
#   0 3 * * * /root/SecondBrain/scripts/backup-pg.sh >> /var/log/secondbrain-backup.log 2>&1
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
RETENTION_DAYS=30
TAG="${1:-daily}"

# ─── Functions ───────────────────────────────────────────────────────────────
timestamp() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(timestamp)] $1"; }

# ─── Pre-checks ──────────────────────────────────────────────────────────────
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
    log "ERROR: Container '${CONTAINER}' is not running. Aborting."
    exit 1
fi

# ─── Create backup directory ─────────────────────────────────────────────────
mkdir -p "$BACKUP_DIR"

# ─── Generate filename ───────────────────────────────────────────────────────
DATE=$(date '+%Y%m%d_%H%M%S')
FILENAME="secondbrain_${TAG}_${DATE}.sql.gz"
FILEPATH="${BACKUP_DIR}/${FILENAME}"

# ─── Perform backup ──────────────────────────────────────────────────────────
log "Starting backup → ${FILENAME}"

docker exec "$CONTAINER" pg_dump -U "$PG_USER" -d "$PG_DB" \
    --no-owner --no-privileges --clean --if-exists \
    | gzip > "$FILEPATH"

# Verify backup is not empty
FILESIZE=$(stat -c%s "$FILEPATH" 2>/dev/null || stat -f%z "$FILEPATH" 2>/dev/null || echo "0")
if [ "$FILESIZE" -lt 100 ]; then
    log "ERROR: Backup file is too small (${FILESIZE} bytes). Backup may have failed."
    rm -f "$FILEPATH"
    exit 1
fi

HUMAN_SIZE=$(du -h "$FILEPATH" | cut -f1)
log "Backup completed: ${FILENAME} (${HUMAN_SIZE})"

# ─── Cleanup old backups ─────────────────────────────────────────────────────
DELETED=$(find "$BACKUP_DIR" -name "secondbrain_*.sql.gz" -mtime +${RETENTION_DAYS} -type f -print -delete | wc -l)
if [ "$DELETED" -gt 0 ]; then
    log "Cleaned up ${DELETED} backup(s) older than ${RETENTION_DAYS} days"
fi

# ─── Summary ─────────────────────────────────────────────────────────────────
TOTAL=$(find "$BACKUP_DIR" -name "secondbrain_*.sql.gz" -type f | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
log "Total backups: ${TOTAL} (${TOTAL_SIZE})"

# ─── Optional: Telegram notification ─────────────────────────────────────────
if [ -n "${TELEGRAM_BOT_TOKEN:-}" ] && [ -n "${TELEGRAM_CHAT_ID:-}" ]; then
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
        -d "chat_id=${TELEGRAM_CHAT_ID}" \
        -d "text=💾 Backup OK: ${FILENAME} (${HUMAN_SIZE})" \
        -d "parse_mode=HTML" \
        > /dev/null 2>&1 || true
fi
