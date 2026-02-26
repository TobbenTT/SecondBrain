const { get, run } = require('../database');
const log = require('../helpers/logger');

async function apiKeyAuth(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) return next();

    try {
        const keyRecord = await get('SELECT * FROM api_keys WHERE key = ? AND active = 1', [apiKey]);
        if (keyRecord) {
            const user = await get('SELECT id, username, role, department, expertise FROM users WHERE username = ?', [keyRecord.username]);
            req.apiKey = keyRecord;
            req.session = req.session || {};
            req.session.user = user || { id: 0, username: keyRecord.username, role: 'api' };
            req.session.authenticated = true;
            req.isApiRequest = true;
            run('UPDATE api_keys SET last_used = CURRENT_TIMESTAMP WHERE id = ?', [keyRecord.id]).catch(() => {});
        }
    } catch (err) {
        log.error('API Key auth error', { error: err.message });
    }
    next();
}

function requireAuth(req, res, next) {
    if (req.isApiRequest) return next();

    // Block sessions with pending 2FA (password passed but 2FA not yet verified)
    if (req.session && req.session.pending2FA && !req.session.authenticated) {
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({ error: '2FA verification required' });
        }
        return res.redirect('/2fa');
    }

    if (req.session && req.session.user) {
        return next();
    }
    if (req.path.startsWith('/api/')) {
        return res.status(401).json({ error: 'Authentication required. Provide X-API-Key header or login.' });
    }
    res.redirect('/login');
}

module.exports = { apiKeyAuth, requireAuth };
