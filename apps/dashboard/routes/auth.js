const express = require('express');
const bcrypt = require('bcryptjs');
const { get } = require('../database');
const log = require('../helpers/logger');

const router = express.Router();

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
                role: user.role
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

module.exports = router;
