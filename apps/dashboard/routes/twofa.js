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
    getWebAuthnRPInfo,
    TRUST_DURATION_DAYS
} = require('../helpers/twofa');
const { auditLog } = require('../helpers/audit');

// WebAuthn — lazy-loaded to avoid crash if not installed
let simpleWebAuthn = null;
try {
    simpleWebAuthn = require('@simplewebauthn/server');
} catch (_) {
    // @simplewebauthn/server not installed — passkeys disabled
}

// ─── Public router (before requireAuth) ─────────────────────────────────────
const publicRouter = express.Router();

// GET /2fa — Render challenge page
publicRouter.get('/2fa', async (req, res) => {
    if (!req.session.pending2FA) return res.redirect('/login');
    // Check if user has passkeys registered
    let hasPasskeys = false;
    try {
        const row = await get('SELECT COUNT(*) as cnt FROM user_webauthn_credentials WHERE user_id = ?', [req.session.pending2FA.userId]);
        hasPasskeys = row && parseInt(row.cnt) > 0;
    } catch (_) {}
    res.render('twofa', {
        username: req.session.pending2FA.username,
        error: null,
        hasPasskeys
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
            auditLog('2fa_failure', { actor: pending.username, target: pending.username, ip: req.ip, userAgent: req.headers['user-agent'] });

            // Check if account should be locked (5 fails in 15 min)
            const recentFails = await get(
                "SELECT COUNT(*) as cnt FROM user_login_attempts WHERE user_id = ? AND success = FALSE AND created_at > NOW() - INTERVAL '15 minutes'",
                [userId]
            );
            if (parseInt(recentFails.cnt) >= 5) {
                await run("UPDATE users SET locked_until = NOW() + INTERVAL '30 minutes' WHERE id = ?", [userId]);
                auditLog('account_lock', { actor: 'system', target: pending.username, ip: req.ip, details: { reason: '2fa_failed_attempts', count: parseInt(recentFails.cnt) } });
                log.warn('Account locked due to failed 2FA attempts', { username: pending.username, ip: req.ip });
                delete req.session.pending2FA;
                return res.redirect('/login');
            }

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
        auditLog('2fa_success', { actor: pending.username, target: pending.username, ip: req.ip, userAgent: req.headers['user-agent'], details: { usedRecoveryCode } });
        res.redirect('/');
    } catch (err) {
        log.error('2FA verification error', { userId, error: err.message });
        res.render('twofa', { username: pending.username, error: 'Error del sistema. Intenta de nuevo.' });
    }
});

// POST /2fa/passkey/authenticate-begin — Start WebAuthn authentication challenge
publicRouter.post('/2fa/passkey/authenticate-begin', async (req, res) => {
    if (!simpleWebAuthn) return res.status(503).json({ error: 'Passkeys no disponibles' });
    const pending = req.session.pending2FA;
    if (!pending) return res.status(401).json({ error: 'No hay sesion pendiente' });

    try {
        const credentials = await all(
            'SELECT credential_id, public_key, counter, transports FROM user_webauthn_credentials WHERE user_id = ?',
            [pending.userId]
        );
        if (!credentials.length) return res.status(400).json({ error: 'No hay passkeys registradas' });

        const { rpID } = getWebAuthnRPInfo(req);
        const options = await simpleWebAuthn.generateAuthenticationOptions({
            rpID,
            allowCredentials: credentials.map(c => ({
                id: c.credential_id,
                transports: c.transports ? JSON.parse(c.transports) : undefined
            })),
            userVerification: 'preferred'
        });

        req.session.webauthnChallenge = options.challenge;
        res.json(options);
    } catch (err) {
        log.error('WebAuthn auth-begin error', { error: err.message });
        res.status(500).json({ error: 'Error al iniciar autenticacion' });
    }
});

// POST /2fa/passkey/authenticate-end — Verify WebAuthn authentication
publicRouter.post('/2fa/passkey/authenticate-end', async (req, res) => {
    if (!simpleWebAuthn) return res.status(503).json({ error: 'Passkeys no disponibles' });
    const pending = req.session.pending2FA;
    if (!pending) return res.status(401).json({ error: 'No hay sesion pendiente' });
    const challenge = req.session.webauthnChallenge;
    if (!challenge) return res.status(400).json({ error: 'No hay challenge pendiente' });

    try {
        const { rpID, origin } = getWebAuthnRPInfo(req);
        const credId = req.body.id;
        const credential = await get(
            'SELECT id, credential_id, public_key, counter FROM user_webauthn_credentials WHERE credential_id = ? AND user_id = ?',
            [credId, pending.userId]
        );
        if (!credential) return res.status(400).json({ error: 'Passkey no reconocida' });

        const verification = await simpleWebAuthn.verifyAuthenticationResponse({
            response: req.body,
            expectedChallenge: challenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            credential: {
                id: credential.credential_id,
                publicKey: Buffer.from(credential.public_key, 'base64url'),
                counter: credential.counter
            }
        });

        if (!verification.verified) {
            auditLog('passkey_failure', { actor: pending.username, target: pending.username, ip: req.ip, userAgent: req.headers['user-agent'] });
            return res.status(400).json({ error: 'Verificacion fallida' });
        }

        // Update counter and last_used
        await run('UPDATE user_webauthn_credentials SET counter = ?, last_used = NOW() WHERE id = ?',
            [verification.authenticationInfo.newCounter, credential.id]);
        await run('UPDATE users SET last_twofa_at = NOW() WHERE id = ?', [pending.userId]);

        // Complete session
        delete req.session.webauthnChallenge;
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

        log.info('WebAuthn 2FA verification successful', { username: pending.username });
        auditLog('passkey_authenticate', { actor: pending.username, target: pending.username, ip: req.ip, userAgent: req.headers['user-agent'] });
        res.json({ success: true, redirect: '/' });
    } catch (err) {
        log.error('WebAuthn auth-end error', { error: err.message });
        res.status(500).json({ error: 'Error de verificacion' });
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

        const passkeys = await all(
            'SELECT id, label, device_type, created_at, last_used FROM user_webauthn_credentials WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        res.json({
            available: hasKey,
            enabled: user?.twofa_enabled || false,
            enforced: user?.twofa_enforced || false,
            lastTwofaAt: user?.last_twofa_at || null,
            recoveryCodesRemaining: parseInt(unusedCodes?.cnt || 0),
            trustedDevices: devices,
            passkeys,
            passkeysAvailable: !!simpleWebAuthn
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
        auditLog('2fa_enable', { actor: req.session.user.username, target: req.session.user.username, ip: req.ip, userAgent: req.headers['user-agent'] });

        res.json({
            success: true,
            recoveryCodes: plainCodes
        });
    } catch (err) {
        log.error('2FA verify-setup error', { error: err.message });
        res.status(500).json({ error: 'Error al verificar 2FA' });
    }
});

// ─── Passkey Management ─────────────────────────────────────────────────────

// POST /api/twofa/passkey/register-begin — Start passkey registration
protectedRouter.post('/passkey/register-begin', async (req, res) => {
    if (!simpleWebAuthn) return res.status(503).json({ error: 'Passkeys no disponibles (instalar @simplewebauthn/server)' });
    try {
        const userId = req.session.user.id;
        const username = req.session.user.username;
        const { rpID, rpName } = getWebAuthnRPInfo(req);

        // Existing credentials to exclude
        const existing = await all('SELECT credential_id FROM user_webauthn_credentials WHERE user_id = ?', [userId]);

        const options = await simpleWebAuthn.generateRegistrationOptions({
            rpName,
            rpID,
            userName: username,
            userDisplayName: username,
            excludeCredentials: existing.map(c => ({ id: c.credential_id })),
            authenticatorSelection: {
                residentKey: 'preferred',
                userVerification: 'preferred'
            },
            attestationType: 'none'
        });

        req.session.webauthnRegChallenge = options.challenge;
        res.json(options);
    } catch (err) {
        log.error('Passkey register-begin error', { error: err.message });
        res.status(500).json({ error: 'Error al iniciar registro' });
    }
});

// POST /api/twofa/passkey/register-end — Complete passkey registration
protectedRouter.post('/passkey/register-end', async (req, res) => {
    if (!simpleWebAuthn) return res.status(503).json({ error: 'Passkeys no disponibles' });
    const challenge = req.session.webauthnRegChallenge;
    if (!challenge) return res.status(400).json({ error: 'No hay challenge pendiente' });

    try {
        const { rpID, origin } = getWebAuthnRPInfo(req);
        const verification = await simpleWebAuthn.verifyRegistrationResponse({
            response: req.body.credential,
            expectedChallenge: challenge,
            expectedOrigin: origin,
            expectedRPID: rpID
        });

        if (!verification.verified || !verification.registrationInfo) {
            return res.status(400).json({ error: 'Verificacion fallida' });
        }

        const { credential, credentialDeviceType } = verification.registrationInfo;
        const label = req.body.label || generateDeviceLabel(req.headers['user-agent']);

        await run(
            'INSERT INTO user_webauthn_credentials (user_id, credential_id, public_key, counter, device_type, transports, label) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                req.session.user.id,
                credential.id,
                Buffer.from(credential.publicKey).toString('base64url'),
                credential.counter,
                credentialDeviceType || 'singleDevice',
                JSON.stringify(req.body.credential?.response?.transports || []),
                label
            ]
        );

        delete req.session.webauthnRegChallenge;
        log.info('Passkey registered', { username: req.session.user.username, label });
        auditLog('passkey_register', { actor: req.session.user.username, target: req.session.user.username, ip: req.ip, userAgent: req.headers['user-agent'], details: { label } });
        res.json({ success: true, label });
    } catch (err) {
        log.error('Passkey register-end error', { error: err.message });
        res.status(500).json({ error: 'Error al registrar passkey' });
    }
});

// DELETE /api/twofa/passkey/:id — Remove a passkey
protectedRouter.delete('/passkey/:id', async (req, res) => {
    try {
        const result = await run(
            'DELETE FROM user_webauthn_credentials WHERE id = ? AND user_id = ?',
            [req.params.id, req.session.user.id]
        );
        if (result.changes === 0) return res.status(404).json({ error: 'Passkey no encontrada' });
        auditLog('passkey_delete', { actor: req.session.user.username, target: req.session.user.username, ip: req.ip, userAgent: req.headers['user-agent'] });
        res.json({ success: true });
    } catch (err) {
        log.error('Passkey delete error', { error: err.message });
        res.status(500).json({ error: 'Error al eliminar passkey' });
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
        await run('DELETE FROM user_webauthn_credentials WHERE user_id = ?', [userId]);
        await run('UPDATE users SET twofa_enabled = FALSE, last_twofa_at = NULL WHERE id = ?', [userId]);

        log.info('2FA deactivated', { username: req.session.user.username });
        auditLog('2fa_disable', { actor: req.session.user.username, target: req.session.user.username, ip: req.ip, userAgent: req.headers['user-agent'] });
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
