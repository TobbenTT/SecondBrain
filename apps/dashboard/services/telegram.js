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

async function reply(chatId, text) {
    if (!BOT_TOKEN) return false;
    try {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
            signal: AbortSignal.timeout(10000)
        });
        return res.ok;
    } catch (err) {
        log.debug('Telegram reply failed', { error: err.message });
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

/**
 * Register webhook URL with Telegram Bot API.
 * Call once at startup when APP_DOMAIN is configured.
 */
async function setupWebhook(domain) {
    if (!BOT_TOKEN) return;
    const url = `https://${domain}/webhook/telegram/${BOT_TOKEN}`;
    try {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, allowed_updates: ['message'] }),
            signal: AbortSignal.timeout(10000)
        });
        const data = await res.json();
        if (data.ok) {
            log.info('Telegram webhook registered', { url });
        } else {
            log.warn('Telegram webhook registration failed', { description: data.description });
        }

        // Register bot commands (shown as suggestions in Telegram UI)
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                commands: [
                    { command: 'idea', description: 'Crear nueva idea en el Hub' },
                    { command: 'help', description: 'Ver comandos disponibles' }
                ]
            }),
            signal: AbortSignal.timeout(10000)
        }).catch(() => {});
    } catch (err) {
        log.warn('Telegram webhook setup error', { error: err.message });
    }
}

function getToken() { return BOT_TOKEN; }

module.exports = { isConfigured, send, reply, notifyNewIdea, notifyNewReunion, notifyDigest, setupWebhook, getToken };
