const { run } = require('../database');
const log = require('./logger');

/**
 * Record a security audit event.
 * @param {string} eventType - e.g. 'login_success', 'password_change', '2fa_enable'
 * @param {object} opts
 * @param {string} [opts.actor] - who performed the action
 * @param {string} [opts.target] - who/what was affected
 * @param {string} [opts.ip] - IP address
 * @param {string} [opts.userAgent] - User-Agent header
 * @param {object} [opts.details] - extra context as JSON
 */
async function auditLog(eventType, { actor, target, ip, userAgent, details } = {}) {
    try {
        await run(
            'INSERT INTO audit_log (event_type, actor, target, ip_address, user_agent, details) VALUES (?, ?, ?, ?, ?, ?)',
            [eventType, actor || null, target || null, ip || null, userAgent || null, details ? JSON.stringify(details) : null]
        );
    } catch (err) {
        // Never let audit failures break the application
        log.error('Audit log write failed', { eventType, error: err.message });
    }
}

module.exports = { auditLog };
