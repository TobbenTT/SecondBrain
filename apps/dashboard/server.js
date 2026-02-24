require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const log = require('./helpers/logger');

// Database
const { db, run, get, all } = require('./database');

// Middleware
const { apiKeyAuth, requireAuth } = require('./middleware/auth');

// Routes
const { router: authRoutes } = require('./routes/auth');
const ideasRoutes = require('./routes/ideas');
const aiRoutes = require('./routes/ai');
const filesRoutes = require('./routes/files');
const areasRoutes = require('./routes/areas');
const gtdRoutes = require('./routes/gtd');
const statsRoutes = require('./routes/stats');
const externalRoutes = require('./routes/external');
const adminRoutes = require('./routes/admin');
const commentsRoutes = require('./routes/comments');
const reviewRoutes = require('./routes/review');
const reunionesRoutes = require('./routes/reuniones');
const feedbackRoutes = require('./routes/feedback');
const uploadRoutes = require('./routes/upload');

const app = express();
app.set('trust proxy', 1);
const PORT = process.argv.includes('-p') ? parseInt(process.argv[process.argv.indexOf('-p') + 1]) : 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ─── Directories ─────────────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'knowledge');
const VOICE_DIR = path.join(__dirname, 'public', 'voice-notes');
const SKILLS_DIR = path.join(__dirname, '..', '..', 'core', 'skills');
const DINAMICAS_DIR = path.join(UPLOADS_DIR, 'dinamicas');
const DATA_DIR = path.join(__dirname, 'data');
const TAGS_FILE = path.join(DATA_DIR, 'tags.json');


// ─── Ensure directories & data files ─────────────────────────────────────────
[UPLOADS_DIR, SKILLS_DIR, VOICE_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(TAGS_FILE)) fs.writeFileSync(TAGS_FILE, '{}', 'utf-8');
// projects.json is no longer used — projects live in SQLite only

// ─── Startup Validation ──────────────────────────────────────────────────────
if (!process.env.GEMINI_API_KEY && process.env.NODE_ENV !== 'test') {
    log.warn('GEMINI_API_KEY not set — Gemini fallback disabled (Ollama is primary)');
}
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET === 'change-me-to-a-random-string') {
    log.warn('Using default SESSION_SECRET — set a strong random value in .env for production');
}

// ─── CORS ───────────────────────────────────────────────────────────────────
app.use(cors({
    origin: NODE_ENV === 'production'
        ? (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean)
        : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
}));

// ─── Security Middleware ─────────────────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://cdn.tailwindcss.com"],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'", "https://cdn.jsdelivr.net", "https://eypurbdkqfwnqiiucraq.supabase.co"],
            mediaSrc: ["'self'", "blob:"],
        }
    },
    crossOriginEmbedderPolicy: false
}));

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});
const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 15,
    message: { error: 'AI rate limit exceeded. Wait a moment.' }
});
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many login attempts. Try again in 15 minutes.' },
    skipSuccessfulRequests: true,
});
const uploadLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: 'Upload rate limit exceeded.' }
});
app.use('/api/', apiLimiter);
app.use('/api/ai/', aiLimiter);
app.use('/api/upload', uploadLimiter);
app.use('/api/ideas/voice', uploadLimiter);

// ─── Core Middleware ─────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('view cache', NODE_ENV === 'production');
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/dinamicas', express.static(DINAMICAS_DIR));
app.use('/voice-notes', express.static(VOICE_DIR));

// Session (hardened)
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'sb.sid',
    cookie: {
        maxAge: 1000 * 60 * 60 * 8,
        httpOnly: true,
        sameSite: 'lax',
        secure: NODE_ENV === 'production'
    }
}));

// ─── Auth Middleware ──────────────────────────────────────────────────────────
app.use(apiKeyAuth);

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// ─── Health Check (public) ───────────────────────────────────────────────────
app.get('/health', async (req, res) => {
    try {
        await get('SELECT 1');
        res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
    } catch (_err) {
        res.status(503).json({ status: 'error', error: 'Database unavailable' });
    }
});

// ─── Ollama Status (public) ─────────────────────────────────────────────────
const { OLLAMA_URL, OLLAMA_MODEL } = require('./services/ollamaClient');
app.get('/api/ollama/status', async (req, res) => {
    try {
        const resp = await fetch(`${OLLAMA_URL}/api/tags`, {
            signal: AbortSignal.timeout(3000),
        });
        if (!resp.ok) return res.json({ online: false, model: OLLAMA_MODEL });
        const data = await resp.json();
        const models = (data.models || []).map(m => m.name);
        const hasModel = models.some(n => n.startsWith(OLLAMA_MODEL));
        res.json({ online: true, model: OLLAMA_MODEL, hasModel, models });
    } catch (_err) {
        res.json({ online: false, model: OLLAMA_MODEL });
    }
});

// ─── Fireflies Webhook Proxy (public, forwards to Inteligencia-de-correos) ──
app.post('/webhook/fireflies', async (req, res) => {
    try {
        const resp = await fetch('http://localhost:3003/webhook/fireflies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
            signal: AbortSignal.timeout(10000),
        });
        const text = await resp.text();
        res.status(resp.status).send(text);
    } catch (err) {
        log.error('Fireflies proxy error', { error: err.message });
        res.status(502).json({ error: 'Inteligencia-de-correos no disponible' });
    }
});

// ─── Public Routes ───────────────────────────────────────────────────────────
app.use('/login', loginLimiter);
app.use(authRoutes);

// ─── Protected Routes ────────────────────────────────────────────────────────
app.use(requireAuth);

app.get('/', (req, res) => {
    res.render('index');
});

// File routes (mixed /archivo/* and /api/*)
app.use(filesRoutes);

// Upload routes (voice + file uploads with multer)
app.use(uploadRoutes);

// API Routes
app.use('/api/ideas', ideasRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/areas', areasRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api', reunionesRoutes);   // /api/reuniones/*, /api/webhook/reuniones
app.use('/api', gtdRoutes);      // /api/gtd/*, /api/waiting-for/*, /api/inbox-log/*, /api/checklist/*
app.use('/api', externalRoutes);  // /api/external/*, /api/webhook/*, /api/keys/*
app.use('/api', adminRoutes);     // /api/users, /api/projects, /api/search, /api/export, etc.
app.use('/api/comments', commentsRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/feedback', feedbackRoutes);

// ─── 404 Catch-All ──────────────────────────────────────────────────────────
app.use((req, res) => {
    const msg = `Not found: ${req.method} ${req.path}`;
    log.warn(msg);
    res.status(404).json({ error: 'Not found' });
});

// ─── Centralized Error Handler ───────────────────────────────────────────────
const AppError = require('./helpers/AppError');
app.use((err, req, res, _next) => {
    if (err instanceof AppError && err.isOperational) {
        log.warn(err.message, { code: err.code, status: err.statusCode, path: req.path });
        return res.status(err.statusCode).json({ error: err.message, code: err.code });
    }
    log.error('Unhandled error', { error: err.message, stack: err.stack, path: req.path, method: req.method });
    res.status(500).json({ error: NODE_ENV === 'production' ? 'Internal server error' : err.message });
});

// ─── Server Start + Graceful Shutdown ────────────────────────────────────────
let server;
if (process.env.NODE_ENV !== 'test') {
    server = app.listen(PORT, () => {
        log.info('Server started', { port: PORT, env: NODE_ENV, url: `http://localhost:${PORT}` });
    });
}

function gracefulShutdown(signal) {
    log.info('Graceful shutdown initiated', { signal });
    server.close(() => {
        db.close((err) => {
            if (err) log.error('DB close error', { error: err.message });
            log.info('Database closed — goodbye');
            process.exit(0);
        });
    });
    setTimeout(() => {
        log.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = { app, server };
