const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { get, run } = require('../database');
const log = require('../helpers/logger');
const { supabase, supabaseAdmin, isSupabaseConfigured } = require('../services/supabase');
const { shouldRequire2FA } = require('../helpers/twofa');
const { auditLog } = require('../helpers/audit');

const router = express.Router();

// ─── Avatar upload config ───────────────────────────────────────────────────
const AVATARS_DIR = path.join(__dirname, '..', 'public', 'avatars');
if (!fs.existsSync(AVATARS_DIR)) fs.mkdirSync(AVATARS_DIR, { recursive: true });

const avatarUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, AVATARS_DIR),
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            const username = req.session?.user?.username || 'unknown';
            cb(null, `avatar_${username}_${Date.now()}${ext}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, allowed.includes(ext));
    },
    limits: { fileSize: 5 * 1024 * 1024 }
});

// ─── Login / Logout ─────────────────────────────────────────────────────────

router.get('/login', (req, res) => {
    if (req.session && req.session.authenticated) {
        return res.redirect('/');
    }
    res.render('login', { error: null, csrfToken: '', useLocalAuth: !isSupabaseConfigured() });
});

router.post('/login', async (req, res) => {
    const { email, username, password } = req.body;
    const useLocalAuth = !isSupabaseConfigured();

    // CSRF protection provided by sameSite:'lax' cookie + CORS config

    // Accept either email (Supabase) or username (local auth)
    const identifier = (email || username || '').trim();

    if (!identifier || !password) {
        return res.render('login', { error: 'Correo y contraseña son requeridos', csrfToken: '', useLocalAuth });
    }
    if (typeof identifier !== 'string' || identifier.length > 100 || typeof password !== 'string' || password.length > 128) {
        return res.render('login', { error: 'Credenciales inválidas', csrfToken: '', useLocalAuth });
    }

    try {
        // ─── Supabase Auth path ───────────────────────────────────────
        if (isSupabaseConfigured()) {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: identifier,
                password
            });

            if (error) {
                log.warn('Supabase login failed', { email: identifier, error: error.message });
                return res.render('login', { error: 'Credenciales inválidas', csrfToken: '', useLocalAuth });
            }

            const uid = data.user.id;
            const userEmail = data.user.email;
            const displayName = data.user.user_metadata?.display_name
                || data.user.user_metadata?.full_name
                || userEmail.split('@')[0];

            // Get role from user_roles table in Supabase
            let role = 'analyst'; // default
            const sbClient = supabaseAdmin || supabase;
            const { data: roleRow } = await sbClient
                .from('user_roles')
                .select('role')
                .eq('user_id', uid)
                .single();
            if (roleRow?.role) role = roleRow.role;

            // Get or create local profile in SQLite
            let profile = await get('SELECT * FROM users WHERE supabase_uid = ?', [uid]);
            if (!profile) {
                await run(
                    'INSERT INTO users (supabase_uid, username, role, department, expertise) VALUES (?, ?, ?, ?, ?)',
                    [uid, displayName, role, '', '']
                );
                profile = await get('SELECT * FROM users WHERE supabase_uid = ?', [uid]);
                log.info('Local profile created for Supabase user', { uid, username: displayName });
            } else {
                // Sync role from Supabase on each login
                if (profile.role !== role) {
                    await run('UPDATE users SET role = ? WHERE supabase_uid = ?', [role, uid]);
                }
            }

            req.session.user = {
                id: profile.id,
                supabase_uid: uid,
                username: profile.username || displayName,
                email: userEmail,
                role: role,
                department: profile.department || '',
                expertise: profile.expertise || '',
                avatar: profile.avatar || null
            };
            req.session.authenticated = true;
            log.info('Supabase login success', { email: userEmail, role });
            return res.redirect('/');
        }

        // ─── Local auth (PostgreSQL — staging / dev without Supabase) ─
        const user = await get('SELECT * FROM users WHERE username = ?', [identifier.toLowerCase()]);

        // Check if account is locked
        if (user && user.locked_until && new Date(user.locked_until) > new Date()) {
            const minutesLeft = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
            await run(
                'INSERT INTO user_login_attempts (user_id, username, ip_address, success) VALUES (?, ?, ?, ?)',
                [user.id, user.username, req.ip, false]
            );
            return res.render('login', {
                error: `Cuenta bloqueada temporalmente. Intenta en ${minutesLeft} minuto${minutesLeft > 1 ? 's' : ''}.`,
                csrfToken: '', useLocalAuth
            });
        }

        if (user && await bcrypt.compare(password, user.password_hash)) {
            // Clear any previous lock
            if (user.locked_until) {
                await run('UPDATE users SET locked_until = NULL WHERE id = ?', [user.id]);
            }

            // Record successful login attempt
            await run(
                'INSERT INTO user_login_attempts (user_id, username, ip_address, success) VALUES (?, ?, ?, ?)',
                [user.id, user.username, req.ip, true]
            );
            auditLog('login_success', { actor: user.username, target: user.username, ip: req.ip, userAgent: req.headers['user-agent'], details: { method: 'local' } });

            // Check if 2FA is required
            const need2FA = await shouldRequire2FA(user, req);

            if (need2FA) {
                req.session.pending2FA = {
                    userId: user.id,
                    username: user.username,
                    role: user.role,
                    department: user.department || '',
                    expertise: user.expertise || '',
                    avatar: user.avatar || null
                };
                return res.redirect('/2fa');
            }

            // No 2FA needed — complete login normally
            req.session.user = {
                id: user.id,
                username: user.username,
                role: user.role,
                department: user.department || '',
                expertise: user.expertise || '',
                avatar: user.avatar || null
            };
            req.session.authenticated = true;
            res.redirect('/');
        } else {
            // Record failed login attempt
            const failUser = await get('SELECT id FROM users WHERE username = ?', [identifier.toLowerCase()]);
            await run(
                'INSERT INTO user_login_attempts (user_id, username, ip_address, success) VALUES (?, ?, ?, ?)',
                [failUser?.id || null, identifier.toLowerCase(), req.ip, false]
            );
            auditLog('login_failure', { actor: identifier.toLowerCase(), target: identifier.toLowerCase(), ip: req.ip, userAgent: req.headers['user-agent'] });

            // Check if account should be locked (5 fails in 15 min)
            if (failUser) {
                const recentFails = await get(
                    "SELECT COUNT(*) as cnt FROM user_login_attempts WHERE user_id = ? AND success = FALSE AND created_at > NOW() - INTERVAL '15 minutes'",
                    [failUser.id]
                );
                if (parseInt(recentFails.cnt) >= 5) {
                    await run("UPDATE users SET locked_until = NOW() + INTERVAL '30 minutes' WHERE id = ?", [failUser.id]);
                    auditLog('account_lock', { actor: 'system', target: identifier.toLowerCase(), ip: req.ip, details: { reason: 'failed_attempts', count: parseInt(recentFails.cnt) } });
                    log.warn('Account locked due to failed attempts', { username: identifier, ip: req.ip });
                    return res.render('login', {
                        error: 'Cuenta bloqueada temporalmente por multiples intentos fallidos. Intenta en 30 minutos.',
                        csrfToken: '', useLocalAuth
                    });
                }
            }

            res.render('login', { error: 'Credenciales inválidas', csrfToken: '', useLocalAuth });
        }
    } catch (err) {
        log.error('Login error', { error: err.message });
        res.render('login', { error: 'Error del sistema', csrfToken: '', useLocalAuth });
    }
});

router.get('/logout', async (req, res) => {
    // Sign out from Supabase if configured
    if (isSupabaseConfigured() && req.session?.user?.supabase_uid) {
        try { await supabase.auth.signOut(); } catch (_) { /* ignore */ }
    }
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// ─── Profile (self-edit, requires auth — mounted after requireAuth) ─────────

// GET profile
router.get('/api/profile', async (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Authentication required' });

    try {
        const row = await get('SELECT id, username, role, department, expertise, avatar, created_at FROM users WHERE id = ?', [user.id]);
        if (!row) return res.status(404).json({ error: 'User not found' });
        res.json(row);
    } catch (err) {
        log.error('Profile fetch error', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// PUT profile (department, expertise)
router.put('/api/profile', async (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Authentication required' });

    const { department, expertise } = req.body;

    try {
        await run('UPDATE users SET department = ?, expertise = ? WHERE id = ?', [
            (department || '').trim(),
            (expertise || '').trim(),
            user.id
        ]);
        // Update session
        req.session.user.department = (department || '').trim();
        req.session.user.expertise = (expertise || '').trim();
        res.json({ success: true });
    } catch (err) {
        log.error('Profile update error', { error: err.message });
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// PUT profile avatar
router.put('/api/profile/avatar', avatarUpload.single('avatar'), async (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Authentication required' });
    if (!req.file) return res.status(400).json({ error: 'No image provided' });

    try {
        // Delete old avatar file if exists
        if (user.avatar) {
            const oldPath = path.join(__dirname, '..', 'public', user.avatar);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        const avatarUrl = `/avatars/${req.file.filename}`;
        await run('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, user.id]);
        req.session.user.avatar = avatarUrl;
        res.json({ success: true, avatar: avatarUrl });
    } catch (err) {
        log.error('Avatar upload error', { error: err.message });
        res.status(500).json({ error: 'Failed to upload avatar' });
    }
});

// PUT change own password
router.put('/api/profile/password', async (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Authentication required' });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 4) {
        return res.status(400).json({ error: 'Current password and new password (min 4 chars) required' });
    }

    try {
        // ─── Supabase Auth path ───
        if (user.supabase_uid && supabaseAdmin) {
            // Verify current password by attempting sign-in
            const { error: verifyErr } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword
            });
            if (verifyErr) {
                return res.status(403).json({ error: 'Current password is incorrect' });
            }
            // Update password in Supabase
            const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
                user.supabase_uid,
                { password: newPassword }
            );
            if (updateErr) {
                log.error('Supabase password update error', { error: updateErr.message });
                return res.status(500).json({ error: 'Failed to change password' });
            }
            auditLog('password_change', { actor: user.username, target: user.username, ip: req.ip, userAgent: req.headers['user-agent'], details: { method: 'supabase' } });
            return res.json({ success: true });
        }

        // ─── Local auth fallback ───
        const row = await get('SELECT password_hash FROM users WHERE id = ?', [user.id]);
        if (!row || !(await bcrypt.compare(currentPassword, row.password_hash))) {
            return res.status(403).json({ error: 'Current password is incorrect' });
        }
        const hash = await bcrypt.hash(newPassword, 10);
        await run('UPDATE users SET password_hash = ? WHERE id = ?', [hash, user.id]);
        auditLog('password_change', { actor: user.username, target: user.username, ip: req.ip, userAgent: req.headers['user-agent'], details: { method: 'local' } });
        res.json({ success: true });
    } catch (err) {
        log.error('Password change error', { error: err.message });
        res.status(500).json({ error: 'Failed to change password' });
    }
});

module.exports = { router, avatarUpload, AVATARS_DIR };
