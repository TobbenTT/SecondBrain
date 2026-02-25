#!/bin/bash
# Clean bad participant names from reuniones table
# Usage: ./scripts/clean-participants.sh
# Runs via the dashboard container's Node.js

set -e

DASHBOARD=$(docker ps --format '{{.Names}}' | grep -i dashboard | head -1)
if [ -z "$DASHBOARD" ]; then
    echo "❌ Dashboard container not running"
    exit 1
fi

echo "🧹 Cleaning bad participant names from reuniones..."

docker exec "$DASHBOARD" node -e "
const { pool } = require('/app/database');

const BLACKLIST = new Set([
    'participantes no identificados', 'error', 'estructura', 'fireflies',
    'ojo', 'anti', 'vantas', 'usuario de prueba', 'test', 'unknown',
    'n/a', 'na', 'none', 'null', 'undefined', 'sistema', 'system',
    'bot', 'ai', 'assistant', 'moderator', 'host'
]);

function isValid(name) {
    if (!name || typeof name !== 'string') return false;
    const t = name.trim();
    if (t.length < 2 || t.length > 80) return false;
    if (BLACKLIST.has(t.toLowerCase())) return false;
    if (/^\d+$/.test(t)) return false;
    if (/^https?:\/\//.test(t)) return false;
    return true;
}

(async () => {
    const { rows } = await pool.query(\"SELECT id, asistentes FROM reuniones WHERE asistentes != '[]' AND deleted_at IS NULL\");
    let cleaned = 0;
    for (const row of rows) {
        let arr;
        try { arr = JSON.parse(row.asistentes); } catch { continue; }
        const filtered = arr.filter(isValid);
        if (filtered.length !== arr.length) {
            const removed = arr.filter(n => !isValid(n));
            console.log('Reunion ' + row.id + ': removing', removed);
            await pool.query('UPDATE reuniones SET asistentes = \$1 WHERE id = \$2', [JSON.stringify(filtered), row.id]);
            cleaned++;
        }
    }
    console.log('Done. Cleaned ' + cleaned + ' reuniones.');
    process.exit(0);
})();
"

echo "✅ Cleanup complete"
