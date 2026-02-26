/**
 * Lightweight input validation helpers.
 * Avoids pulling in a large library — these cover common patterns.
 */

function isNonEmptyString(val, maxLen = 10000) {
    return typeof val === 'string' && val.trim().length > 0 && val.length <= maxLen;
}

function isOptionalString(val, maxLen = 10000) {
    return val === undefined || val === null || (typeof val === 'string' && val.length <= maxLen);
}

function isPositiveInt(val) {
    const n = Number(val);
    return Number.isInteger(n) && n > 0;
}

function isDateString(val) {
    if (!val) return true; // optional
    return /^\d{4}-\d{2}-\d{2}$/.test(val);
}

function isOneOf(val, allowed) {
    return allowed.includes(val);
}

/**
 * Express middleware factory for body validation.
 * @param {Object} schema - { fieldName: { required, type, maxLen, oneOf, validate } }
 */
function validateBody(schema) {
    return (req, res, next) => {
        const errors = [];
        for (const [field, rules] of Object.entries(schema)) {
            const val = req.body[field];

            if (rules.required && (val === undefined || val === null || val === '')) {
                errors.push(`${field} is required`);
                continue;
            }
            if (val === undefined || val === null) continue;

            if (rules.type === 'string' && typeof val !== 'string') {
                errors.push(`${field} must be a string`);
            } else if (rules.type === 'string' && rules.maxLen && val.length > rules.maxLen) {
                errors.push(`${field} must be at most ${rules.maxLen} characters`);
            }
            if (rules.type === 'number' && typeof val !== 'number' && isNaN(Number(val))) {
                errors.push(`${field} must be a number`);
            }
            if (rules.type === 'array' && !Array.isArray(val)) {
                errors.push(`${field} must be an array`);
            }
            if (rules.oneOf && !rules.oneOf.includes(val)) {
                errors.push(`${field} must be one of: ${rules.oneOf.join(', ')}`);
            }
            if (rules.date && val && !isDateString(val)) {
                errors.push(`${field} must be YYYY-MM-DD format`);
            }
            if (rules.validate && !rules.validate(val)) {
                errors.push(`${field} is invalid`);
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({ error: errors.join('; ') });
        }
        next();
    };
}

/**
 * Validate password strength (OWASP compliant).
 * Requires: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char.
 * Returns { valid: boolean, error?: string }
 */
function validatePassword(password) {
    if (!password || typeof password !== 'string') return { valid: false, error: 'Contraseña requerida' };
    if (password.length < 8) return { valid: false, error: 'Minimo 8 caracteres' };
    if (password.length > 128) return { valid: false, error: 'Maximo 128 caracteres' };
    if (!/[A-Z]/.test(password)) return { valid: false, error: 'Debe contener al menos 1 mayuscula' };
    if (!/[a-z]/.test(password)) return { valid: false, error: 'Debe contener al menos 1 minuscula' };
    if (!/[0-9]/.test(password)) return { valid: false, error: 'Debe contener al menos 1 numero' };
    if (!/[^A-Za-z0-9]/.test(password)) return { valid: false, error: 'Debe contener al menos 1 caracter especial (!@#$%...)' };
    return { valid: true };
}

/**
 * Check if a password has been exposed in known data breaches.
 * Uses HaveIBeenPwned Passwords API with k-anonymity (only first 5 chars of SHA-1 sent).
 * Returns { breached: boolean, count?: number, error?: string }
 */
async function checkBreachedPassword(password) {
    const crypto = require('crypto');
    const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = sha1.substring(0, 5);
    const suffix = sha1.substring(5);

    try {
        const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
            headers: { 'User-Agent': 'ValueStrategy-Hub-BreachCheck' },
            signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) return { breached: false }; // fail open — don't block user on API error
        const text = await res.text();
        for (const line of text.split('\n')) {
            const [hashSuffix, count] = line.trim().split(':');
            if (hashSuffix === suffix) {
                return { breached: true, count: parseInt(count, 10) };
            }
        }
        return { breached: false };
    } catch {
        return { breached: false }; // fail open on network error
    }
}

module.exports = {
    isNonEmptyString,
    isOptionalString,
    isPositiveInt,
    isDateString,
    isOneOf,
    validateBody,
    validatePassword,
    checkBreachedPassword,
};
