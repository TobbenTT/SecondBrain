require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const session = require('express-session');
const multer = require('multer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const log = require('./helpers/logger');

// Database
const { db, run, get, all } = require('./database');

// Middleware
const { apiKeyAuth, requireAuth } = require('./middleware/auth');
const { denyRole } = require('./middleware/authorize');
const blockConsultor = denyRole('consultor');

// Helpers
const { formatFileSize, loadTags, saveTags } = require('./helpers/utils');
const { processAndSaveIdea } = require('./helpers/ideaProcessor');

// Routes
const authRoutes = require('./routes/auth');
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

const app = express();
const PORT = process.argv.includes('-p') ? parseInt(process.argv[process.argv.indexOf('-p') + 1]) : 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ─── Directories ─────────────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'knowledge');
const VOICE_DIR = path.join(__dirname, 'public', 'voice-notes');
const SKILLS_DIR = path.join(__dirname, '..', '..', 'core', 'skills');
const ARCHIVOS_DIR = UPLOADS_DIR;
const DINAMICAS_DIR = path.join(UPLOADS_DIR, 'dinamicas');
const DATA_DIR = path.join(__dirname, 'data');
const TAGS_FILE = path.join(DATA_DIR, 'tags.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');

// ─── Ensure directories & data files ─────────────────────────────────────────
[UPLOADS_DIR, SKILLS_DIR, VOICE_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(TAGS_FILE)) fs.writeFileSync(TAGS_FILE, '{}', 'utf-8');
if (!fs.existsSync(PROJECTS_FILE)) {
    const defaultProjects = [
        {
            id: '1', name: 'Lililia', description: 'Plataforma de gestión y visualización con dashboard integrado.',
            icon: '🌸', status: 'active', url: 'http://localhost:3002',
            tech: ['Node.js', 'Express', 'EJS'], createdAt: new Date().toISOString()
        },
        {
            id: '2', name: 'Orchestrator Beta', description: 'Plataforma de orquestación de agentes IA para preparación operativa.',
            icon: '🤖', status: 'beta', url: 'http://localhost:3001',
            tech: ['Next.js', 'TypeScript', 'Tailwind'], createdAt: new Date().toISOString()
        },
        {
            id: '3', name: 'OpenClaw', description: 'Sistema multi-agente autónomo (PM→DEV→QA + Consulting→Reviewer) para SecondBrain.',
            icon: '🦞', status: 'active', url: '',
            tech: ['Python', 'SQLite', 'Gemini', 'Claude'], createdAt: new Date().toISOString()
        }
    ];
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(defaultProjects, null, 2), 'utf-8');
}

// ─── Startup Validation ──────────────────────────────────────────────────────
if (!process.env.GEMINI_API_KEY && process.env.NODE_ENV !== 'test') {
    log.error('FATAL: GEMINI_API_KEY not set in .env');
    process.exit(1);
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
            connectSrc: ["'self'", "https://cdn.jsdelivr.net"],
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

// ─── Multer Upload Config ────────────────────────────────────────────────────
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            if (req.path.includes('/ideas/voice')) return cb(null, VOICE_DIR);
            cb(null, ARCHIVOS_DIR);
        },
        filename: (req, file, cb) => {
            if (req.path.includes('/ideas/voice')) {
                return cb(null, `voice_${Date.now()}.webm`);
            }
            const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
            const ext = path.extname(originalName);
            const base = path.basename(originalName, ext);
            const finalName = fs.existsSync(path.join(ARCHIVOS_DIR, originalName))
                ? `${base}_${Date.now()}${ext}`
                : originalName;
            cb(null, finalName);
        }
    }),
    fileFilter: (req, file, cb) => {
        if (req.path.includes('/ideas/voice')) {
            if (file.mimetype.startsWith('audio/') || file.mimetype === 'video/webm') return cb(null, true);
        }
        const allowed = ['.md', '.pdf', '.txt', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido'), false);
        }
    },
    limits: { fileSize: 50 * 1024 * 1024 }
});

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

// Voice upload handler (needs multer, defined here because multer is in server.js)
app.post('/api/ideas/voice', blockConsultor, upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No audio file provided' });
        const textToSave = (req.body.text || 'Nota de voz').trim();
        const createdBy = req.session.user ? req.session.user.username : null;

        await run('INSERT INTO ideas (text, audio_url, code_stage, created_by) VALUES (?, ?, ?, ?)', [
            textToSave,
            `/voice-notes/${req.file.filename}`,
            'captured',
            createdBy
        ]);
        let newIdea = await get('SELECT id, text, audio_url as audioUrl, created_at as createdAt, status FROM ideas ORDER BY id DESC LIMIT 1');

        const analysis = await processAndSaveIdea(newIdea.id, newIdea.text, createdBy);

        if (analysis && analysis.split && analysis.savedIds) {
            const allIdeas = await all(
                `SELECT id, text, audio_url as audioUrl, created_at as createdAt, status,
                ai_type, ai_category, ai_action, ai_summary, created_by
                FROM ideas WHERE id IN (${analysis.savedIds.map(() => '?').join(',')})`,
                analysis.savedIds
            );
            res.json({ split: true, count: analysis.count, ideas: allIdeas });
        } else {
            newIdea = await get('SELECT id, text, audio_url as audioUrl, created_at as createdAt, status, ai_type, ai_category, ai_action, ai_summary, created_by FROM ideas WHERE id = ?', [newIdea.id]);
            res.json(newIdea);
        }
    } catch (err) {
        log.error('Voice upload error', { error: err.message });
        res.status(500).json({ error: 'Failed to save voice note' });
    }
});

// File upload handler (needs multer)
app.post('/api/upload', blockConsultor, upload.single('file'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file provided' });
        const rawTags = req.body.tags || '';
        const tagList = rawTags.split(',').map(t => t.trim()).filter(t => t.length > 0);
        if (tagList.length > 0) {
            const tags = loadTags(TAGS_FILE);
            tags[req.file.filename] = tagList;
            saveTags(TAGS_FILE, tags);
        }
        res.json({
            success: true,
            filename: req.file.filename,
            size: formatFileSize(req.file.size),
            tags: tagList
        });
    } catch (err) {
        log.error('Upload error', { error: err.message });
        res.status(500).json({ error: 'Upload failed' });
    }
});

// API Routes
app.use('/api/ideas', ideasRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/areas', areasRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api', gtdRoutes);      // /api/gtd/*, /api/waiting-for/*, /api/inbox-log/*, /api/checklist/*
app.use('/api', externalRoutes);  // /api/external/*, /api/webhook/*, /api/keys/*
app.use('/api', adminRoutes);     // /api/users, /api/projects, /api/search, /api/export, etc.
app.use('/api/comments', commentsRoutes);
app.use('/api/review', reviewRoutes);

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
