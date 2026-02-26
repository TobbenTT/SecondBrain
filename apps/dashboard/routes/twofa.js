const express = require('express');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');
const { generateSecret, generateURI, verify: verifyTOTP } = require('otplib');
const { run, get, all } = require('../database');
const log = require('../helpers/logger');
const {
    encryptSecret, decryptSecret,
    computeDeviceHash, generateDeviceLabel,
    generateRecoveryCodes, getEncryptionKey,
    TRUST_DURATION_DAYS
} = require('../helpers/twofa');

// ─── Public router (before requireAuth) ─────────────────────────────────────
const publicRouter = express.Router();

// GET /2fa — Render challenge page
publicRouter.get('/2fa', (req, res) => {
    if (!req.session.pending2FA) return res.redirect('/login');
    res.render('twofa', {
        username: req.session.pending2FA.username,
        error: null
    });
});

// POST /2fa — Verify TOTP code or recovery code
publicRouter.post('/2fa', async (req, res) => {
    const pending = req.session.pending2FA;
    if (!pending) return res.redirect('/login');

    const { token, trustDevice } = req.body;
    const userId = pending.userId;

    if (!token || !token.trim()) {
        return res.render('twofa', { username: pending.username, error: 'Ingresa un codigo' });
    }

    try {
        const cleanToken = token.replace(/\s/g, '');
        let valid = false;
        let usedRecoveryCode = false;

        // Try TOTP first
        const totpRow = await get(
            'SELECT secret_encrypted FROM user_totp_secrets WHERE user_id = ? AND verified = TRUE',
            [userId]
        );
        if (totpRow) {
            const secret = decryptSecret(totpRow.secret_encrypted);
            valid = verifyTOTP({ token: cleanToken, secret });
        }

        // If TOTP failed, try recovery code
        if (!valid) {
            const codes = await all(
                'SELECT id, code_hash FROM user_recovery_codes WHERE user_id = ? AND used_at IS NULL',
                [userId]
            );
            for (const code of codes) {
                if (await bcrypt.compare(cleanToken, code.code_hash)) {
                    valid = true;
                    usedRecoveryCode = true;
                    await run('UPDATE user_recovery_codes SET used_at = NOW() WHERE id = ?', [code.id]);
                    break;
                }
            }
        }

        if (!valid) {
            await run(
                'INSERT INTO user_login_attempts (user_id, username, ip_address, success) VALUES (?, ?, ?, ?)',
                [userId, pending.username, req.ip, false]
            );
            return res.render('twofa', { username: pending.username, error: 'Codigo invalido. Intenta de nuevo.' });
        }

        // 2FA passed — save trusted device if requested
        if (trustDevice) {
            const deviceHash = computeDeviceHash(req.headers['user-agent']);
            const label = generateDeviceLabel(req.headers['user-agent']);
            const expiresAt = new Date(Date.now() + TRUST_DURATION_DAYS * 24 * 60 * 60 * 1000);
            await run(
                'INSERT INTO user_trusted_devices (user_id, device_hash, ip_address, label, expires_at) VALUES (?, ?, ?, ?, ?)',
                [userId, deviceHash, req.ip, label, expiresAt]
            );
        }

        // Update last 2FA verification timestamp
        await run('UPDATE users SET last_twofa_at = NOW() WHERE id = ?', [userId]);

        // Complete session
        req.session.user = {
            id: pending.userId,
            username: pending.username,
            role: pending.role,
            department: pending.department,
            expertise: pending.expertise,
            avatar: pending.avatar
        };
        req.session.authenticated = true;
        delete req.session.pending2FA;

        // Warn about remaining recovery codes
        if (usedRecoveryCode) {
            const remaining = await get(
                'SELECT COUNT(*) as cnt FROM user_recovery_codes WHERE user_id = ? AND used_at IS NULL',
                [userId]
            );
            req.session.recoveryWarning = parseInt(remaining.cnt);
        }

        log.info('2FA verification successful', { username: pending.username, usedRecoveryCode });
        res.redirect('/');
    } catch (err) {
        log.error('2FA verification error', { userId, error: err.message });
        res.render('twofa', { username: pending.username, error: 'Error del sistema. Intenta de nuevo.' });
    }
});

// ─── Protected router (after requireAuth, mounted on /api/twofa) ────────────
const protectedRouter = express.Router();

// GET /api/twofa/status — Current 2FA state for the logged-in user
protectedRouter.get('/status', async (req, res) => {
    try {
        const userId = req.session.user.id;
        const user = await get('SELECT twofa_enabled, twofa_enforced, last_twofa_at FROM users WHERE id = ?', [userId]);

        const unusedCodes = await get(
            'SELECT COUNT(*) as cnt FROM user_recovery_codes WHERE user_id = ? AND used_at IS NULL',
            [userId]
        );

        const devices = await all(
            'SELECT id, label, ip_address, last_used, expires_at, created_at FROM user_trusted_devices WHERE user_id = ? ORDER BY last_used DESC',
            [userId]
        );

        const hasKey = !!getEncryptionKey();

        res.json({
            available: hasKey,
            enabled: user?.twofa_enabled || false,
            enforced: user?.twofa_enforced || false,
            lastTwofaAt: user?.last_twofa_at || null,
            recoveryCodesRemaining: parseInt(unusedCodes?.cnt || 0),
            trustedDevices: devices
        });
    } catch (err) {
        log.error('2FA status error', { error: err.message });
        res.status(500).json({ error: 'Error al obtener estado 2FA' });
    }
});

// POST /api/twofa/setup — Begin TOTP enrollment (generate QR)
protectedRouter.post('/setup', async (req, res) => {
    try {
        if (!getEncryptionKey()) {
            return res.status(503).json({ error: '2FA no esta disponible (TWOFA_ENCRYPTION_KEY no configurada)' });
        }

        const userId = req.session.user.id;
        const username = req.session.user.username;

        // Check if already has verified TOTP
        const existing = await get(
            'SELECT verified FROM user_totp_secrets WHERE user_id = ?',
            [userId]
        );
        if (existing && existing.verified) {
            return res.status(400).json({ error: '2FA ya esta activado. Desactivalo primero para reconfigurar.' });
        }

        // Generate new secret
        const secret = generateSecret();
        const encrypted = encryptSecret(secret);

        // Upsert (replace unverified)
        if (existing) {
            await run('UPDATE user_totp_secrets SET secret_encrypted = ?, verified = FALSE, created_at = NOW() WHERE user_id = ?', [encrypted, userId]);
        } else {
            await run('INSERT INTO user_totp_secrets (user_id, secret_encrypted) VALUES (?, ?)', [userId, encrypted]);
        }

        // Generate QR code
        const uri = generateURI({ type: 'totp', label: username, issuer: 'ValueStrategy Hub', secret });
        const qrCodeDataUrl = await QRCode.toDataURL(uri);

        res.json({
            qrCodeDataUrl,
            manualEntryKey: secret,
            issuer: 'ValueStrategy Hub'
        });
    } catch (err) {
        log.error('2FA setup error', { error: err.message });
        res.status(500).json({ error: 'Error al configurar 2FA' });
    }
});

// POST /api/twofa/verify-setup — Confirm enrollment with valid code
protectedRouter.post('/verify-setup', async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { token } = req.body;

        if (!token || !token.trim()) {
            return res.status(400).json({ error: 'Codigo requerido' });
        }

        const totpRow = await get(
            'SELECT secret_encrypted, created_at FROM user_totp_secrets WHERE user_id = ? AND verified = FALSE',
            [userId]
        );
        if (!totpRow) {
            return res.status(400).json({ error: 'No hay setup pendiente. Inicia el proceso de nuevo.' });
        }

        // Expire unverified secrets after 3 minutes
        const ageMs = Date.now() - new Date(totpRow.created_at).getTime();
        if (ageMs > 3 * 60 * 1000) {
            await run('DELETE FROM user_totp_secrets WHERE user_id = ? AND verified = FALSE', [userId]);
            return res.status(410).json({ error: 'El codigo QR expiro. Genera uno nuevo.' });
        }

        const secret = decryptSecret(totpRow.secret_encrypted);
        const cleanToken = token.replace(/\s/g, '');
        const valid = verifyTOTP({ token: cleanToken, secret });

        if (!valid) {
            return res.status(400).json({ error: 'Codigo invalido. Verifica que el reloj de tu telefono este sincronizado.' });
        }

        // Mark as verified and enable 2FA
        await run('UPDATE user_totp_secrets SET verified = TRUE WHERE user_id = ?', [userId]);
        await run('UPDATE users SET twofa_enabled = TRUE, last_twofa_at = NOW() WHERE id = ?', [userId]);

        // Generate recovery codes
        const plainCodes = generateRecoveryCodes(10);
        // Delete old codes
        await run('DELETE FROM user_recovery_codes WHERE user_id = ?', [userId]);
        // Insert new ones (hashed)
        for (const code of plainCodes) {
            const hash = await bcrypt.hash(code, 10);
            await run('INSERT INTO user_recovery_codes (user_id, code_hash) VALUES (?, ?)', [userId, hash]);
        }

        log.info('2FA activated', { username: req.session.user.username });

        res.json({
            success: true,
            recoveryCodes: plainCodes
        });
    } catch (err) {
        log.error('2FA verify-setup error', { error: err.message });
        res.status(500).json({ error: 'Error al verificar 2FA' });
    }
});

// POST /api/twofa/disable — Turn off 2FA (requires password)
protectedRouter.post('/disable', async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { currentPassword } = req.body;

        if (!currentPassword) {
            return res.status(400).json({ error: 'Contrasena requerida' });
        }

        // Check if admin has enforced 2FA
        const user = await get('SELECT password_hash, twofa_enforced FROM users WHERE id = ?', [userId]);
        if (user.twofa_enforced) {
            return res.status(403).json({ error: '2FA es obligatorio para tu cuenta (configurado por admin)' });
        }

        // Verify password
        const match = await bcrypt.compare(currentPassword, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Contrasena incorrecta' });
        }

        // Clean up everything
        await run('DELETE FROM user_totp_secrets WHERE user_id = ?', [userId]);
        await run('DELETE FROM user_recovery_codes WHERE user_id = ?', [userId]);
        await run('DELETE FROM user_trusted_devices WHERE user_id = ?', [userId]);
        await run('UPDATE users SET twofa_enabled = FALSE, last_twofa_at = NULL WHERE id = ?', [userId]);

        log.info('2FA deactivated', { username: req.session.user.username });
        res.json({ success: true });
    } catch (err) {
        log.error('2FA disable error', { error: err.message });
        res.status(500).json({ error: 'Error al desactivar 2FA' });
    }
});

// DELETE /api/twofa/trusted-devices/:id — Remove specific trusted device
protectedRouter.delete('/trusted-devices/:id', async (req, res) => {
    try {
        const userId = req.session.user.id;
        const result = await run(
            'DELETE FROM user_trusted_devices WHERE id = ? AND user_id = ?',
            [req.params.id, userId]
        );
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Dispositivo no encontrado' });
        }
        res.json({ success: true });
    } catch (err) {
        log.error('Trusted device delete error', { error: err.message });
        res.status(500).json({ error: 'Error al eliminar dispositivo' });
    }
});

// DELETE /api/twofa/trusted-devices — Remove ALL trusted devices
protectedRouter.delete('/trusted-devices', async (req, res) => {
    try {
        const userId = req.session.user.id;
        await run('DELETE FROM user_trusted_devices WHERE user_id = ?', [userId]);
        res.json({ success: true });
    } catch (err) {
        log.error('Trusted devices clear error', { error: err.message });
        res.status(500).json({ error: 'Error al eliminar dispositivos' });
    }
});

module.exports = { publicRouter, protectedRouter };
