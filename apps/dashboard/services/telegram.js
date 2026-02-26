const log = require('../helpers/logger');

const BOT_TOKEN = (process.env.TELEGRAM_OPENCLAW_BOT_TOKEN || '').trim();
const CHAT_ID  = (process.env.TELEGRAM_OPENCLAW_CHAT_ID || '').trim();

function isConfigured() {
    return !!(BOT_TOKEN && CHAT_ID);
}

async function send(text) {
    if (!isConfigured()) return false;
    try {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' }),
            signal: AbortSignal.timeout(10000)
        });
        if (!res.ok) log.warn('Telegram API error', { status: res.status });
        return res.ok;
    } catch (err) {
        log.debug('Telegram not available', { error: err.message });
        return false;
    }
}

async function notifyNewIdea(text, creator) {
    const preview = text.length > 120 ? text.substring(0, 120) + '...' : text;
    return send(`💡 <b>Nueva idea</b>\nPor: ${creator || 'anónimo'}\n\n${preview}`);
}

async function notifyNewReunion(titulo, asistentes, taskCount) {
    const parts = [`📋 <b>Nueva reunión sincronizada</b>\n${titulo}`];
    if (asistentes && asistentes.length) parts.push(`Participantes: ${asistentes.slice(0, 5).join(', ')}`);
    if (taskCount > 0) parts.push(`Tareas generadas: ${taskCount}`);
    return send(parts.join('\n'));
}

async function notifyDigest(username) {
    return send(`📊 <b>Digest diario generado</b>\nUsuario: ${username}`);
}

module.exports = { isConfigured, send, notifyNewIdea, notifyNewReunion, notifyDigest };
