const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { get, run } = require('../database');
const log = require('../helpers/logger');

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
    res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render('login', { error: 'Usuario y contraseña son requeridos' });
    }
    if (typeof username !== 'string' || username.length > 50 || typeof password !== 'string' || password.length > 128) {
        return res.render('login', { error: 'Credenciales inválidas' });
    }

    try {
        const user = await get('SELECT * FROM users WHERE username = ?', [username.toLowerCase().trim()]);

        if (user && await bcrypt.compare(password, user.password_hash)) {
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
            res.render('login', { error: 'Credenciales inválidas' });
        }
    } catch (err) {
        log.error('Login error', { error: err.message });
        res.render('login', { error: 'Error del sistema' });
    }
});

router.get('/logout', (req, res) => {
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
        const row = await get('SELECT password_hash FROM users WHERE id = ?', [user.id]);
        if (!row || !(await bcrypt.compare(currentPassword, row.password_hash))) {
            return res.status(403).json({ error: 'Current password is incorrect' });
        }
        const hash = await bcrypt.hash(newPassword, 10);
        await run('UPDATE users SET password_hash = ? WHERE id = ?', [hash, user.id]);
        res.json({ success: true });
    } catch (err) {
        log.error('Password change error', { error: err.message });
        res.status(500).json({ error: 'Failed to change password' });
    }
});

module.exports = { router, avatarUpload, AVATARS_DIR };
