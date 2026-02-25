const express = require('express');
const bcrypt = require('bcryptjs');
const { get, run } = require('../database');
const log = require('../helpers/logger');
const tfa = require('../services/twoFactor');
const { isSupabaseConfigured, supabase } = require('../services/supabase');

const router = express.Router();

// All routes require authentication
router.use((req, res, next) => {
    if (!req.session?.user) return res.status(401).json({ error: 'Authentication required' });
    next();
});

// GET /api/2fa/status
router.get('/status', async (req, res) => {
    try {
        const userId = req.session.user.id;
        const enabled = await tfa.is2FAEnabled(userId);
        const devices = enabled ? await tfa.listDevices(userId) : [];
        const backupCodesLeft = enabled ? await tfa.getBackupCodesCount(userId) : 0;
        res.json({ enabled, devices, backupCodesLeft });
    } catch (err) {
        log.error('2FA status error', { error: err.message });
        res.status(500).json({ error: 'Error al obtener estado 2FA' });
    }
});

// POST /api/2fa/setup — Generate secret + QR
router.post('/setup', async (req, res) => {
    try {
        const userId = req.session.user.id;
        const username = req.session.user.username;

        // Check if already enabled
        if (await tfa.is2FAEnabled(userId)) {
            return res.status(400).json({ error: '2FA ya esta activado' });
        }

        const { secret, qrDataUrl } = await tfa.generateSecret(username);

        // Store secret (unverified) — replace any existing unverified
        await run('DELETE FROM totp_secrets WHERE user_id = $1', [userId]);
        await run(
            'INSERT INTO totp_secrets (user_id, secret, verified) VALUES ($1, $2, FALSE)',
            [userId, secret]
        );

        res.json({ qrDataUrl, secret });
    } catch (err) {
        log.error('2FA setup error', { error: err.message });
        res.status(500).json({ error: 'Error al configurar 2FA' });
    }
});

// POST /api/2fa/verify-setup — Confirm with valid code
router.post('/verify-setup', async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { token } = req.body;

        if (!token || token.length !== 6) {
            return res.status(400).json({ error: 'Codigo de 6 digitos requerido' });
        }

        const row = await get(
            'SELECT secret FROM totp_secrets WHERE user_id = $1 AND verified = FALSE',
            [userId]
        );
        if (!row) {
            return res.status(400).json({ error: 'No hay configuracion pendiente. Inicia el setup primero.' });
        }

        if (!tfa.verifyToken(row.secret, token)) {
            return res.status(400).json({ error: 'Codigo invalido. Intenta de nuevo.' });
        }

        // Activate 2FA
        await run(
            'UPDATE totp_secrets SET verified = TRUE WHERE user_id = $1',
            [userId]
        );

        // Generate backup codes
        const backupCodes = await tfa.generateBackupCodes(userId);

        log.info('2FA activated', { userId, username: req.session.user.username });
        res.json({ success: true, backupCodes });
    } catch (err) {
        log.error('2FA verify-setup error', { error: err.message });
        res.status(500).json({ error: 'Error al verificar codigo' });
    }
});

// POST /api/2fa/disable — Requires current password
router.post('/disable', async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'Contrasena requerida' });
        }

        // Verify password
        const user = req.session.user;
        if (user.supabase_uid && isSupabaseConfigured()) {
            const { error } = await supabase.auth.signInWithPassword({
                email: user.email,
                password
            });
            if (error) return res.status(403).json({ error: 'Contrasena incorrecta' });
        } else {
            const row = await get('SELECT password_hash FROM users WHERE id = $1', [userId]);
            if (!row || !(await bcrypt.compare(password, row.password_hash))) {
                return res.status(403).json({ error: 'Contrasena incorrecta' });
            }
        }

        // Remove all 2FA data
        await run('DELETE FROM totp_secrets WHERE user_id = $1', [userId]);
        await run('DELETE FROM backup_codes WHERE user_id = $1', [userId]);
        await run('UPDATE trusted_devices SET revoked = TRUE WHERE user_id = $1', [userId]);

        log.info('2FA disabled', { userId, username: req.session.user.username });
        res.json({ success: true });
    } catch (err) {
        log.error('2FA disable error', { error: err.message });
        res.status(500).json({ error: 'Error al desactivar 2FA' });
    }
});

// GET /api/2fa/backup-codes — Count remaining
router.get('/backup-codes', async (req, res) => {
    try {
        const count = await tfa.getBackupCodesCount(req.session.user.id);
        res.json({ remaining: count });
    } catch (err) {
        res.status(500).json({ error: 'Error' });
    }
});

// POST /api/2fa/backup-codes/regenerate
router.post('/backup-codes/regenerate', async (req, res) => {
    try {
        const userId = req.session.user.id;
        if (!(await tfa.is2FAEnabled(userId))) {
            return res.status(400).json({ error: '2FA no esta activado' });
        }
        const codes = await tfa.generateBackupCodes(userId);
        log.info('Backup codes regenerated', { userId });
        res.json({ backupCodes: codes });
    } catch (err) {
        log.error('Backup codes error', { error: err.message });
        res.status(500).json({ error: 'Error al regenerar codigos' });
    }
});

// DELETE /api/2fa/devices/:id
router.delete('/devices/:id', async (req, res) => {
    try {
        const deviceId = parseInt(req.params.id);
        if (isNaN(deviceId)) return res.status(400).json({ error: 'ID invalido' });
        await tfa.revokeDevice(deviceId, req.session.user.id);
        res.json({ success: true });
    } catch (err) {
        log.error('Device revoke error', { error: err.message });
        res.status(500).json({ error: 'Error al revocar dispositivo' });
    }
});

module.exports = router;
