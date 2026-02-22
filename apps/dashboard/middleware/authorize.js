/**
 * Authorization middleware — Prevents IDOR (Insecure Direct Object Reference).
 * Verifies that the logged-in user owns the resource or is an admin.
 */
const { get } = require('../database');
const log = require('../helpers/logger');

/**
 * Checks if the current user owns a resource or is admin.
 * @param {string} table - DB table name
 * @param {string} ownerColumn - Column that stores the owner username
 * @param {string} [paramName='id'] - req.params key for the resource ID
 */
function requireOwnerOrAdmin(table, ownerColumn, paramName = 'id') {
    return async (req, res, next) => {
        const user = req.session?.user;
        if (!user) return res.status(401).json({ error: 'Authentication required' });

        // Admins can access anything
        if (user.role === 'admin') return next();

        const id = req.params[paramName];
        if (!id) return res.status(400).json({ error: 'Resource ID required' });

        try {
            const resource = await get(`SELECT ${ownerColumn} FROM ${table} WHERE id = ?`, [id]);
            if (!resource) return res.status(404).json({ error: 'Resource not found' });

            if (resource[ownerColumn] !== user.username) {
                return res.status(403).json({ error: 'Forbidden — you do not own this resource' });
            }

            next();
        } catch (err) {
            log.error('Authorization check failed', { table, id, error: err.message });
            res.status(500).json({ error: 'Authorization check failed' });
        }
    };
}

/**
 * Checks if user is admin.
 */
function requireAdmin(req, res, next) {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Authentication required' });
    if (user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    next();
}

/**
 * Checks that the :username param matches the logged-in user (or admin).
 */
function requireSelfOrAdmin(req, res, next) {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Authentication required' });
    if (user.role === 'admin') return next();

    const targetUsername = req.params.username;
    if (targetUsername && targetUsername !== user.username) {
        return res.status(403).json({ error: 'Forbidden — can only access your own data' });
    }
    next();
}

module.exports = { requireOwnerOrAdmin, requireAdmin, requireSelfOrAdmin };
