const crypto = require('crypto');
const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const bcrypt = require('bcryptjs');
const { get, run, all } = require('../database');
const log = require('../helpers/logger');

const APP_NAME = 'VSC Hub';

// ─── TOTP Secret Management ────────────────────────────────────────────────

async function generateSecret(username) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(username, APP_NAME, secret);
    const qrDataUrl = await QRCode.toDataURL(otpauthUrl);
    return { secret, otpauthUrl, qrDataUrl };
}

function verifyToken(secret, token) {
    try {
        return authenticator.verify({ token, secret });
    } catch {
        return false;
    }
}

// ─── 2FA Status ─────────────────────────────────────────────────────────────

async function is2FAEnabled(userId) {
    const row = await get(
        'SELECT verified FROM totp_secrets WHERE user_id = $1',
        [userId]
    );
    return !!(row && row.verified);
}

async function getSecret(userId) {
    const row = await get(
        'SELECT secret FROM totp_secrets WHERE user_id = $1 AND verified = TRUE',
        [userId]
    );
    return row ? row.secret : null;
}

// ─── Backup Codes ───────────────────────────────────────────────────────────

async function generateBackupCodes(userId) {
    // Delete old codes
    await run('DELETE FROM backup_codes WHERE user_id = $1', [userId]);

    const codes = [];
    for (let i = 0; i < 10; i++) {
        const code = crypto.randomInt(10000000, 99999999).toString();
        codes.push(code);
        const hash = await bcrypt.hash(code, 10);
        await run(
            'INSERT INTO backup_codes (user_id, code_hash) VALUES ($1, $2)',
            [userId, hash]
        );
    }
    return codes;
}

async function verifyBackupCode(userId, code) {
    const rows = await all(
        'SELECT id, code_hash FROM backup_codes WHERE user_id = $1 AND used = FALSE',
        [userId]
    );
    for (const row of rows) {
        if (await bcrypt.compare(code, row.code_hash)) {
            await run(
                'UPDATE backup_codes SET used = TRUE, used_at = CURRENT_TIMESTAMP WHERE id = $1',
                [row.id]
            );
            return true;
        }
    }
    return false;
}

async function getBackupCodesCount(userId) {
    const row = await get(
        'SELECT COUNT(*) as count FROM backup_codes WHERE user_id = $1 AND used = FALSE',
        [userId]
    );
    return parseInt(row?.count || '0');
}

// ─── Trusted Devices ────────────────────────────────────────────────────────

function buildFingerprint(ip, userAgent) {
    const data = `${ip}|${userAgent || ''}`;
    return crypto.createHash('sha256').update(data).digest('hex');
}

function parseDeviceName(userAgent) {
    if (!userAgent) return 'Dispositivo desconocido';
    let browser = 'Navegador';
    let os = 'OS';
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Edg')) browser = 'Edge';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac OS')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
    return `${browser} en ${os}`;
}

async function checkTrustedDevice(userId, trustToken) {
    if (!trustToken) return false;
    const row = await get(
        `SELECT id FROM trusted_devices
         WHERE user_id = $1 AND trust_token = $2
           AND revoked = FALSE AND expires_at > CURRENT_TIMESTAMP`,
        [userId, trustToken]
    );
    if (row) {
        await run('UPDATE trusted_devices SET last_used_at = CURRENT_TIMESTAMP WHERE id = $1', [row.id]);
        return true;
    }
    return false;
}

async function createTrustedDevice(userId, { ip, userAgent }) {
    const fingerprint = buildFingerprint(ip, userAgent);
    const deviceName = parseDeviceName(userAgent);
    const trustToken = crypto.randomBytes(32).toString('hex');

    // Remove existing device with same fingerprint for this user
    await run(
        'DELETE FROM trusted_devices WHERE user_id = $1 AND device_fingerprint = $2',
        [userId, fingerprint]
    );

    await run(
        `INSERT INTO trusted_devices (user_id, device_fingerprint, device_name, ip_address, user_agent, trust_token, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP + INTERVAL '30 days')`,
        [userId, fingerprint, deviceName, ip, userAgent, trustToken]
    );
    return trustToken;
}

async function listDevices(userId) {
    return await all(
        `SELECT id, device_name, ip_address, created_at, last_used_at, expires_at
         FROM trusted_devices
         WHERE user_id = $1 AND revoked = FALSE AND expires_at > CURRENT_TIMESTAMP
         ORDER BY last_used_at DESC NULLS LAST`,
        [userId]
    );
}

async function revokeDevice(deviceId, userId) {
    await run(
        'UPDATE trusted_devices SET revoked = TRUE WHERE id = $1 AND user_id = $2',
        [deviceId, userId]
    );
}

// ─── Risk Scoring ───────────────────────────────────────────────────────────

async function calculateRiskScore(userId, { ip, userAgent, hour }) {
    let score = 0;
    const reasons = [];

    // Get last 20 successful logins
    const history = await all(
        `SELECT ip_address, user_agent, login_hour
         FROM login_history
         WHERE user_id = $1 AND success = TRUE
         ORDER BY created_at DESC LIMIT 20`,
        [userId]
    );

    if (history.length === 0) {
        // First login ever — no risk data, be lenient
        return { score: 10, reasons: ['Primer login registrado'] };
    }

    // 1. New IP (+30)
    const knownIPs = new Set(history.map(h => h.ip_address));
    if (!knownIPs.has(ip)) {
        score += 30;
        reasons.push('IP nueva');
    }

    // 2. New User-Agent (+20)
    const knownUAs = new Set(history.map(h => h.user_agent).filter(Boolean));
    if (userAgent && !knownUAs.has(userAgent)) {
        score += 20;
        reasons.push('Navegador/dispositivo nuevo');
    }

    // 3. Unusual hour (+15) — outside 80th percentile range
    if (typeof hour === 'number' && history.length >= 5) {
        const hours = history.map(h => h.login_hour).filter(h => h != null).sort((a, b) => a - b);
        if (hours.length >= 5) {
            const p10 = hours[Math.floor(hours.length * 0.1)];
            const p90 = hours[Math.floor(hours.length * 0.9)];
            if (hour < p10 || hour > p90) {
                score += 15;
                reasons.push('Horario inusual');
            }
        }
    }

    // 4. Recent failed attempts (+25)
    const failRow = await get(
        `SELECT COUNT(*) as count FROM login_history
         WHERE user_id = $1 AND success = FALSE
           AND created_at > CURRENT_TIMESTAMP - INTERVAL '1 hour'`,
        [userId]
    );
    if (parseInt(failRow?.count || '0') >= 3) {
        score += 25;
        reasons.push('Multiples intentos fallidos recientes');
    }

    return { score: Math.min(100, score), reasons };
}

// ─── Login History ──────────────────────────────────────────────────────────

async function logLogin(userId, { ip, userAgent, fingerprint, success, twoFaRequired, twoFaMethod, riskScore }) {
    const hour = new Date().getHours();
    await run(
        `INSERT INTO login_history (user_id, ip_address, user_agent, device_fingerprint, login_hour, success, two_fa_required, two_fa_method, risk_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [userId, ip || '', userAgent || '', fingerprint || '', hour, success !== false, twoFaRequired || false, twoFaMethod || null, riskScore || 0]
    );
}

module.exports = {
    generateSecret,
    verifyToken,
    is2FAEnabled,
    getSecret,
    generateBackupCodes,
    verifyBackupCode,
    getBackupCodesCount,
    buildFingerprint,
    checkTrustedDevice,
    createTrustedDevice,
    listDevices,
    revokeDevice,
    calculateRiskScore,
    logLogin
};
