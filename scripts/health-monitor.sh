#!/bin/bash
# ─── SecondBrain Health Monitor ──────────────────────────────────────────────
# Monitors the dashboard and sends Telegram alerts when it goes down.
#
# Setup:
#   1. Create a Telegram bot via @BotFather → get the BOT_TOKEN
#   2. Get your chat ID via @userinfobot or @getmyid_bot → CHAT_ID
#   3. Set env vars or edit this file:
#        export TELEGRAM_BOT_TOKEN="123456:ABC-DEF..."
#        export TELEGRAM_CHAT_ID="987654321"
#   4. Add to crontab (every 2 minutes):
#        */2 * * * * /root/SecondBrain/scripts/health-monitor.sh
#
# ─────────────────────────────────────────────────────────────────────────────

# ─── Configuration ───────────────────────────────────────────────────────────
SITE_URL="${MONITOR_URL:-https://aiprowork.com}"
HEALTH_URL="${SITE_URL}/health"
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"
STATE_FILE="/tmp/secondbrain-monitor-state"
LOG_FILE="/var/log/secondbrain-monitor.log"
TIMEOUT=15  # seconds

# ─── Functions ───────────────────────────────────────────────────────────────
timestamp() {
    date '+%Y-%m-%d %H:%M:%S'
}

log_msg() {
    echo "[$(timestamp)] $1" >> "$LOG_FILE"
}

send_telegram() {
    local message="$1"
    if [ -z "$TELEGRAM_BOT_TOKEN" ] || [ -z "$TELEGRAM_CHAT_ID" ]; then
        log_msg "WARNING: Telegram not configured. Message: $message"
        return 1
    fi
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
        -d "chat_id=${TELEGRAM_CHAT_ID}" \
        -d "text=${message}" \
        -d "parse_mode=HTML" \
        > /dev/null 2>&1
}

# ─── Health Check ────────────────────────────────────────────────────────────
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$HEALTH_URL" 2>/dev/null)
CURL_EXIT=$?

# Determine status
if [ "$CURL_EXIT" -ne 0 ]; then
    STATUS="unreachable"
    DETAIL="Connection failed (timeout or DNS error)"
elif [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 400 ]; then
    STATUS="up"
    DETAIL="HTTP $HTTP_CODE"
else
    STATUS="down"
    DETAIL="HTTP $HTTP_CODE"
fi

# Read previous state
PREV_STATE="unknown"
if [ -f "$STATE_FILE" ]; then
    PREV_STATE=$(cat "$STATE_FILE")
fi

# ─── State Transitions ──────────────────────────────────────────────────────
NOW=$(timestamp)
HOSTNAME=$(hostname 2>/dev/null || echo "VPS")

if [ "$STATUS" != "up" ] && [ "$PREV_STATE" = "up" -o "$PREV_STATE" = "unknown" ]; then
    # Was UP, now DOWN → Alert
    log_msg "ALERT: Site is $STATUS ($DETAIL)"
    send_telegram "$(cat <<EOF
🔴 <b>CAIDA DETECTADA</b>

<b>Servicio:</b> SecondBrain Dashboard
<b>URL:</b> ${SITE_URL}
<b>Estado:</b> ${STATUS} (${DETAIL})
<b>Servidor:</b> ${HOSTNAME}
<b>Hora:</b> ${NOW}

El equipo tecnico ha sido notificado.
Verificar con: <code>docker logs secondbrain-dashboard</code>
EOF
)"
    echo "$STATUS" > "$STATE_FILE"

elif [ "$STATUS" = "up" ] && [ "$PREV_STATE" != "up" ] && [ "$PREV_STATE" != "unknown" ]; then
    # Was DOWN, now UP → Recovery alert
    log_msg "RECOVERY: Site is back up ($DETAIL)"
    send_telegram "$(cat <<EOF
🟢 <b>SERVICIO RESTAURADO</b>

<b>Servicio:</b> SecondBrain Dashboard
<b>URL:</b> ${SITE_URL}
<b>Estado:</b> Operativo (${DETAIL})
<b>Servidor:</b> ${HOSTNAME}
<b>Hora:</b> ${NOW}

El sistema ha vuelto a la normalidad.
EOF
)"
    echo "up" > "$STATE_FILE"

elif [ "$STATUS" != "up" ] && [ "$PREV_STATE" != "up" ] && [ "$PREV_STATE" != "unknown" ]; then
    # Still down → Log but don't spam
    log_msg "STILL DOWN: $STATUS ($DETAIL)"

else
    # All good
    log_msg "OK: $DETAIL"
    echo "up" > "$STATE_FILE"
fi
