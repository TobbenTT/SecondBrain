#!/bin/bash
# ─── Import Feedback from JSON ───────────────────────────────────────────────
# Imports feedback from the JSON export file into PostgreSQL.
#
# Usage:
#   ./scripts/import-feedback.sh FEEDBACK/feedback_export_2026-02-25.json
#
# Accepts the format exported by /api/feedback/export:
#   {"exported_at":"...","total":13,"feedback":[{...},{...}]}
#
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

CONTAINER="${PG_CONTAINER:-secondbrain-postgres}"
DASHBOARD="${DASHBOARD_CONTAINER:-secondbrain-dashboard}"
PG_USER="${PG_USER:-secondbrain}"
PG_DB="${PG_DB:-secondbrain}"
JSON_FILE="${1:-}"

if [ -z "$JSON_FILE" ]; then
    echo "Usage: $0 <feedback_export.json>"
    echo ""
    echo "Example: $0 FEEDBACK/feedback_export_2026-02-25.json"
    exit 1
fi

if [ ! -f "$JSON_FILE" ]; then
    echo "ERROR: File not found: $JSON_FILE"
    exit 1
fi

echo "Importing feedback from: $JSON_FILE"

# Count existing
BEFORE=$(docker exec "$CONTAINER" psql -U "$PG_USER" -d "$PG_DB" -tAc "SELECT count(*) FROM feedback" | tr -d ' ')
echo "Current feedback records: $BEFORE"

# Use node (via dashboard container) to generate SQL from JSON
docker cp "$JSON_FILE" "$DASHBOARD":/tmp/feedback-import.json

docker exec "$DASHBOARD" node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('/tmp/feedback-import.json','utf8'));
const items = data.feedback || data;
const esc = v => v == null ? 'NULL' : \"'\" + String(v).replace(/'/g, \"''\") + \"'\";
const sqls = items.map(i =>
    'INSERT INTO feedback (username, title, content, category, priority, status, admin_response, responded_by, created_at, resolved_at) ' +
    'SELECT ' + [i.username, i.title, i.content, i.category||'mejora', i.priority||'media', i.status||'abierto', i.admin_response, i.responded_by, i.created_at, i.resolved_at].map(esc).join(', ') +
    ' WHERE NOT EXISTS (SELECT 1 FROM feedback WHERE title = ' + esc(i.title) + ' AND username = ' + esc(i.username) + ');'
).join('\n');
fs.writeFileSync('/tmp/feedback-inserts.sql', sqls);
console.log('Generated ' + items.length + ' INSERT statements');
"

# Move SQL from dashboard → host → postgres and execute
docker cp "$DASHBOARD":/tmp/feedback-inserts.sql /tmp/feedback-inserts.sql
docker cp /tmp/feedback-inserts.sql "$CONTAINER":/tmp/feedback-inserts.sql
docker exec "$CONTAINER" psql -U "$PG_USER" -d "$PG_DB" -f /tmp/feedback-inserts.sql -q

# Clean up
docker exec "$DASHBOARD" rm -f /tmp/feedback-import.json
docker exec "$CONTAINER" rm -f /tmp/feedback-inserts.sql
rm -f /tmp/feedback-inserts.sql

AFTER=$(docker exec "$CONTAINER" psql -U "$PG_USER" -d "$PG_DB" -tAc "SELECT count(*) FROM feedback" | tr -d ' ')
IMPORTED=$((AFTER - BEFORE))

echo ""
echo "Done! Imported $IMPORTED new feedback records (skipped duplicates)."
echo "Total feedback records: $AFTER"
