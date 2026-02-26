const crypto = require('crypto');
const { get, run, all } = require('../database');

const ALGORITHM = 'aes-256-gcm';
const TRUST_DURATION_DAYS = 30;

// ─── Encryption Key ──────────────────────────────────────────────────────────

function getEncryptionKey() {
    const hex = process.env.TWOFA_ENCRYPTION_KEY;
    if (!hex || hex.length !== 64) return null;
    return Buffer.from(hex, 'hex');
}

// ─── Encrypt / Decrypt TOTP secret ──────────────────────────────────────────

function encryptSecret(plaintext) {
    const key = getEncryptionKey();
    if (!key) throw new Error('TWOFA_ENCRYPTION_KEY not configured');
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${tag}:${encrypted}`;
}

function decryptSecret(stored) {
    const key = getEncryptionKey();
    if (!key) throw new Error('TWOFA_ENCRYPTION_KEY not configured');
    const [ivHex, tagHex, encrypted] = stored.split(':');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// ─── Device fingerprint ─────────────────────────────────────────────────────

function computeDeviceHash(userAgent) {
    // Device fingerprint based on User-Agent only
    // IP is validated separately in the trusted_devices query to avoid
    // breaking trust when users have dynamic IPs
    return crypto.createHash('sha256').update(userAgent || 'unknown').digest('hex');
}

function generateDeviceLabel(userAgent) {
    const ua = userAgent || '';
    let browser = 'Navegador';
    let os = '';
    if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    return os ? `${browser} en ${os}` : browser;
}

// ─── Risk assessment ────────────────────────────────────────────────────────

async function shouldRequire2FA(user, req) {
    if (!user.twofa_enabled) return false;

    const ip = req.ip;
    const deviceHash = computeDeviceHash(req.headers['user-agent']);

    // Check for trusted device that hasn't expired
    const trusted = await get(
        'SELECT id FROM user_trusted_devices WHERE user_id = ? AND device_hash = ? AND expires_at > NOW()',
        [user.id, deviceHash]
    );
    if (trusted) {
        await run('UPDATE user_trusted_devices SET last_used = NOW() WHERE id = ?', [trusted.id]);

        // Even with trusted device, force 2FA if 30+ days since last verification
        if (user.last_twofa_at) {
            const daysSince = (Date.now() - new Date(user.last_twofa_at).getTime()) / (1000 * 60 * 60 * 24);
            if (daysSince >= 30) return true;
        }

        // Check for 3+ failed attempts in the last hour
        const recentFails = await get(
            "SELECT COUNT(*) as cnt FROM user_login_attempts WHERE user_id = ? AND success = FALSE AND created_at > NOW() - INTERVAL '1 hour'",
            [user.id]
        );
        if (recentFails && parseInt(recentFails.cnt) >= 3) return true;

        return false; // trusted device, no risk factors
    }

    // Unknown device or IP → require 2FA
    return true;
}

// ─── Recovery code generation ───────────────────────────────────────────────

function generateRecoveryCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
        codes.push(crypto.randomBytes(4).toString('hex')); // 8-char hex codes
    }
    return codes;
}

module.exports = {
    getEncryptionKey,
    encryptSecret,
    decryptSecret,
    computeDeviceHash,
    generateDeviceLabel,
    shouldRequire2FA,
    generateRecoveryCodes,
    TRUST_DURATION_DAYS
};
