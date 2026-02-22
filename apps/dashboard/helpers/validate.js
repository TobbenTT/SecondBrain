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

module.exports = {
    isNonEmptyString,
    isOptionalString,
    isPositiveInt,
    isDateString,
    isOneOf,
    validateBody,
};
