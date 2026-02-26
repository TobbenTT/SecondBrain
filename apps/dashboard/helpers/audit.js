const { run } = require('../database');
const log = require('./logger');
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.TWOFA_ENCRYPTION_KEY;
const ALGO = 'aes-256-gcm';

/**
 * Encrypt a string value (used for PII like IP addresses).
 * Returns "iv:authTag:ciphertext" in hex or null if no key configured.
 */
function encryptPII(plaintext) {
    if (!plaintext || !ENCRYPTION_KEY) return plaintext;
    try {
        const key = Buffer.from(ENCRYPTION_KEY, 'hex');
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv(ALGO, key, iv);
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');
        return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (err) {
        log.error('PII encrypt failed', { error: err.message });
        return plaintext; // Fallback to plaintext if encryption fails
    }
}

/**
 * Decrypt a PII value encrypted with encryptPII.
 * Returns plaintext or the original string if not encrypted.
 */
function decryptPII(ciphertext) {
    if (!ciphertext || !ENCRYPTION_KEY) return ciphertext;
    // Check if it looks like our encrypted format (hex:hex:hex)
    const parts = ciphertext.split(':');
    if (parts.length !== 3) return ciphertext; // Not encrypted, return as-is
    try {
        const key = Buffer.from(ENCRYPTION_KEY, 'hex');
        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];
        const decipher = crypto.createDecipheriv(ALGO, key, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (err) {
        return ciphertext; // Return as-is if decryption fails (old plaintext data)
    }
}

/**
 * Record a security audit event.
 * IP addresses are encrypted at rest using AES-256-GCM.
 * @param {string} eventType - e.g. 'login_success', 'password_change', '2fa_enable'
 * @param {object} opts
 * @param {string} [opts.actor] - who performed the action
 * @param {string} [opts.target] - who/what was affected
 * @param {string} [opts.ip] - IP address (will be encrypted)
 * @param {string} [opts.userAgent] - User-Agent header
 * @param {object} [opts.details] - extra context as JSON
 */
async function auditLog(eventType, { actor, target, ip, userAgent, details } = {}) {
    try {
        const encryptedIp = encryptPII(ip);
        await run(
            'INSERT INTO audit_log (event_type, actor, target, ip_address, user_agent, details) VALUES (?, ?, ?, ?, ?, ?)',
            [eventType, actor || null, target || null, encryptedIp || null, userAgent || null, details ? JSON.stringify(details) : null]
        );
    } catch (err) {
        // Never let audit failures break the application
        log.error('Audit log write failed', { eventType, error: err.message });
    }
}

module.exports = { auditLog, encryptPII, decryptPII };
