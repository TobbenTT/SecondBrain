require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const session = require('express-session');
const { createClient: createRedisClient } = require('redis');
const { RedisStore } = require('connect-redis');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const compression = require('compression');
const log = require('./helpers/logger');

// Database
const { db, run, get, all, closeDb } = require('./database');

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
const { publicRouter: twofaPublicRoutes, protectedRouter: twofaProtectedRoutes } = require('./routes/twofa');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || (process.argv.includes('-p') ? parseInt(process.argv[process.argv.indexOf('-p') + 1]) : 3000);
const NODE_ENV = process.env.NODE_ENV || 'development';
const BUILD_ID = Date.now().toString(36); // unique per server start — used for update detection

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
    if (NODE_ENV === 'production') {
        log.error('SESSION_SECRET not set or using default — refusing to start in production');
        log.error('Generate one: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
        process.exit(1);
    }
    log.warn('Using default SESSION_SECRET — set a strong random value in .env for production');
}
if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32 && NODE_ENV === 'production') {
    log.warn('SESSION_SECRET is too short (< 32 chars) — consider using a 64-char hex string');
}
if (!process.env.TWOFA_ENCRYPTION_KEY && NODE_ENV === 'production') {
    log.warn('TWOFA_ENCRYPTION_KEY not set — 2FA features will fail. Generate: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
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
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://cdn.tailwindcss.com", "https://unpkg.com"],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'", "https://cdn.jsdelivr.net", "https://eypurbdkqfwnqiiucraq.supabase.co"],
            mediaSrc: ["'self'", "blob:"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'self'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        }
    },
    crossOriginEmbedderPolicy: false,
    // OWASP recommended headers
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
}));

// Additional OWASP headers not covered by helmet
app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(self), geolocation=(), payment=()');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    // Prevent caching of sensitive pages
    if (req.path.startsWith('/api/') || req.path === '/login' || req.path === '/2fa') {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
    next();
});

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
const downloadLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: 'Too many downloads. Try again in a minute.'
});
const searchLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: { error: 'Search rate limit exceeded.' }
});
const sensitiveReadLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: { error: 'Too many requests to this endpoint.' }
});
app.use('/api/', apiLimiter);
app.use('/api/ai/', aiLimiter);
app.use('/api/upload', uploadLimiter);
app.use('/api/ideas/voice', uploadLimiter);
app.use('/api/stats/', sensitiveReadLimiter);
app.use('/api/feedback', sensitiveReadLimiter);
app.use('/api/search', searchLimiter);
app.use('/api/admin/reportability', sensitiveReadLimiter);
app.use('/descargar/', downloadLimiter);

// ─── Performance: Compression ───────────────────────────────────────────────
app.use(compression({
    level: 6,
    threshold: 1024, // only compress responses > 1KB
    filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
    }
}));

// ─── Core Middleware ─────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('view cache', NODE_ENV === 'production');
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: NODE_ENV === 'production' ? '7d' : 0,
    etag: true,
    lastModified: true
}));
app.use('/dinamicas', express.static(DINAMICAS_DIR, { maxAge: '7d' }));
app.use('/voice-notes', express.static(VOICE_DIR, { maxAge: '1d' }));

// Session (hardened) — Redis if REDIS_HOST configured, else MemoryStore
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
let sessionStore;
let redisClient;
if (process.env.REDIS_HOST) {
    redisClient = createRedisClient({
        socket: {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT || '6379'),
        }
    });
    redisClient.connect().catch(err => {
        log.error('Redis connection failed', { error: err.message });
    });
    redisClient.on('error', err => log.error('Redis error', { error: err.message }));
    redisClient.on('connect', () => log.info('Redis connected', { host: process.env.REDIS_HOST }));
    sessionStore = new RedisStore({ client: redisClient });
} else {
    log.info('No REDIS_HOST configured — using MemoryStore for sessions');
}
app.use(session({
    store: sessionStore,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'sb.sid2',
    cookie: {
        maxAge: 1000 * 60 * 60 * 4,  // 4 hours (OWASP recommendation)
        httpOnly: true,
        sameSite: 'strict',           // Strict for intranet — blocks all cross-site requests
        secure: NODE_ENV === 'production' || NODE_ENV === 'staging'
    }
}));

// ─── Auth Middleware ──────────────────────────────────────────────────────────
app.use(apiKeyAuth);

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.buildId = BUILD_ID;
    next();
});

// ─── Health Check (public) ───────────────────────────────────────────────────
app.get('/health', async (req, res) => {
    try {
        await get('SELECT 1');
        let redisOk = null;
        if (redisClient) {
            try { redisOk = (await redisClient.ping()) === 'PONG'; } catch { redisOk = false; }
        }
        res.json({ status: 'ok', redis: redisOk, uptime: process.uptime(), timestamp: new Date().toISOString(), build: BUILD_ID });
    } catch (_err) {
        res.status(503).json({ status: 'error', error: 'Database unavailable' });
    }
});

// ─── Ollama Status (public) ─────────────────────────────────────────────────
const { OLLAMA_URL, OLLAMA_MODEL, warmup: ollamaWarmup } = require('./services/ollamaClient');

// Warmup Ollama on startup (non-blocking)
ollamaWarmup().catch(() => {});
app.get('/api/ollama/status', async (req, res) => {
    try {
        const resp = await fetch(`${OLLAMA_URL}/api/tags`, {
            signal: AbortSignal.timeout(1500),
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

// ─── Fireflies Webhook Proxy (API-key authenticated, forwards to Inteligencia-de-correos) ──
app.post('/webhook/fireflies', async (req, res) => {
    // Require API key authentication — blocks unauthenticated internet requests
    if (!req.isApiRequest) {
        return res.status(401).json({ error: 'API key required. Set X-API-Key header.' });
    }
    try {
        const correosUrl = process.env.CORREOS_URL || 'http://inteligencia-correos:3003';
        const resp = await fetch(`${correosUrl}/webhook/fireflies`, {
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

// ─── Telegram Webhook (incoming messages → create ideas) ─────────────────────
const telegram = require('./services/telegram');
const { processAndSaveIdea } = require('./helpers/ideaProcessor');
app.post('/webhook/telegram/:token', async (req, res) => {
    // Authenticate: token in URL must match our bot token
    if (req.params.token !== telegram.getToken()) {
        return res.sendStatus(403);
    }
    res.sendStatus(200); // Respond immediately to Telegram

    try {
        const msg = req.body && req.body.message;
        if (!msg || !msg.text || msg.from.is_bot) return;

        const chatId = msg.chat.id;
        const text = msg.text.trim();

        // /start — welcome message
        if (text === '/start' || text === '/start@VCS_HubBot') {
            return telegram.reply(chatId,
                '👋 <b>VCS Hub Bot</b>\n\n' +
                'Envia ideas al Hub con:\n' +
                '<code>/idea Tu idea aqui</code>\n\n' +
                'Escribe /help para mas info.');
        }

        // /help — usage instructions
        if (text === '/help' || text === '/help@VCS_HubBot') {
            return telegram.reply(chatId,
                '📖 <b>Comandos disponibles</b>\n\n' +
                '<code>/idea Texto de la idea</code> — Crea una nueva idea en el Hub\n' +
                '<code>/help</code> — Muestra este mensaje\n\n' +
                'La idea se procesa automaticamente con IA (clasificacion, prioridad, area).\n' +
                'Puedes verla en el dashboard: https://aiprowork.com');
        }

        // /idea — create idea
        const ideaMatch = text.match(/^\/idea(?:@VCS_HubBot)?\s+(.+)/s);
        if (!ideaMatch) return; // Ignore all other messages

        const ideaText = ideaMatch[1].trim();
        if (ideaText.length < 3 || ideaText.length > 10000) {
            return telegram.reply(chatId, 'La idea debe tener entre 3 y 10.000 caracteres.');
        }

        const sender = msg.from.first_name || msg.from.username || 'telegram';

        const result = await run('INSERT INTO ideas (text, code_stage, created_by) VALUES (?, ?, ?)',
            [ideaText, 'captured', `tg:${sender}`]);
        await processAndSaveIdea(result.lastID, ideaText, `tg:${sender}`);

        const preview = ideaText.length > 80 ? ideaText.substring(0, 80) + '...' : ideaText;
        await telegram.reply(chatId, `✅ Idea guardada: "${preview}"`);

        log.info('Idea created from Telegram', { ideaId: result.lastID, sender });
    } catch (err) {
        log.error('Telegram webhook error', { error: err.message });
    }
});

// ─── Public Routes ───────────────────────────────────────────────────────────
app.use('/login', loginLimiter);
app.use(authRoutes);
app.use(twofaPublicRoutes); // GET /2fa, POST /2fa (before requireAuth)

// ─── CSRF Protection for API routes ─────────────────────────────────────────
// HTML forms can only submit GET/POST. For POST, we require application/json
// (which triggers CORS preflight cross-origin), blocking form-based CSRF.
// PUT/DELETE/PATCH require JavaScript (fetch/XHR) → already CORS-protected.
app.use('/api/', (req, res, next) => {
    if (req.method !== 'POST') return next();
    if (req.isApiRequest) return next(); // X-API-Key authenticated
    const cl = req.headers['content-length'];
    if (!cl || cl === '0') return next(); // Action endpoints without body (e.g. /complete)
    const ct = (req.headers['content-type'] || '').toLowerCase();
    if (ct.includes('application/json') || ct.includes('multipart/form-data')) return next();
    return res.status(403).json({ error: 'Invalid content type. Use application/json.' });
});

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
app.use('/api/twofa', twofaProtectedRoutes);

// ─── Error Page Helper ──────────────────────────────────────────────────────
const ERROR_META = {
    400: { title: 'Solicitud Invalida', message: 'La solicitud no pudo ser procesada. Verifica los datos enviados.' },
    401: { title: 'No Autorizado', message: 'Necesitas iniciar sesion para acceder a este recurso.' },
    403: { title: 'Acceso Denegado', message: 'No tienes permisos para acceder a este recurso.' },
    404: { title: 'Pagina No Encontrada', message: 'El recurso que buscas no existe o fue movido a otra ubicacion.' },
    500: { title: 'Error del Servidor', message: 'Ocurrio un error interno. Por favor intenta de nuevo o contacta al administrador.' },
    502: { title: 'Bad Gateway', message: 'El servidor no pudo obtener una respuesta valida. Puede estar reiniciandose.' },
    503: { title: 'Servicio en Mantenimiento', message: 'El sistema esta temporalmente fuera de servicio. Volvera pronto.' },
};

function renderError(req, res, statusCode, customMessage) {
    const meta = ERROR_META[statusCode] || { title: 'Error', message: 'Se produjo un error inesperado.' };
    // API requests get JSON, browser requests get HTML page
    if (req.path.startsWith('/api/') || req.xhr || (req.headers.accept && !req.headers.accept.includes('text/html'))) {
        return res.status(statusCode).json({ error: customMessage || meta.message });
    }
    res.status(statusCode).render('error', {
        statusCode,
        title: meta.title,
        message: customMessage || meta.message,
    });
}

// ─── 404 Catch-All ──────────────────────────────────────────────────────────
app.use((req, res) => {
    const msg = `Not found: ${req.method} ${req.path}`;
    log.warn(msg);
    renderError(req, res, 404);
});

// ─── Centralized Error Handler ───────────────────────────────────────────────
const AppError = require('./helpers/AppError');
app.use((err, req, res, _next) => {
    if (err instanceof AppError && err.isOperational) {
        log.warn(err.message, { code: err.code, status: err.statusCode, path: req.path });
        if (req.path.startsWith('/api/')) {
            return res.status(err.statusCode).json({ error: err.message, code: err.code });
        }
        return renderError(req, res, err.statusCode, err.message);
    }
    const sanitizedStack = NODE_ENV === 'production' ? undefined : err.stack;
    log.error('Unhandled error', { error: err.message, stack: sanitizedStack, path: req.path, method: req.method });
    renderError(req, res, 500, NODE_ENV === 'production' ? undefined : err.message);
});

// ─── Server Start + Graceful Shutdown ────────────────────────────────────────
let server;
if (process.env.NODE_ENV !== 'test') {
    server = app.listen(PORT, () => {
        log.info('Server started', { port: PORT, env: NODE_ENV, url: `http://localhost:${PORT}` });
        // Start daily digest scheduler
        try {
            const { startDigestScheduler } = require('./services/digest');
            startDigestScheduler();
        } catch (_) {}

        // Register Telegram webhook for incoming ideas
        const appDomain = (process.env.APP_DOMAIN || '').trim();
        if (appDomain) {
            telegram.setupWebhook(appDomain).catch(() => {});
        }

        // Audit log retention: purge logs > 90 days (runs daily at 2 AM)
        try {
            const cron = require('node-cron');
            cron.schedule('0 2 * * *', async () => {
                try {
                    const { run: dbRun } = require('./database');
                    const result = await dbRun("DELETE FROM audit_log WHERE created_at < NOW() - INTERVAL '90 days'");
                    log.info('Audit log retention: purged old entries', { retention_days: 90 });
                } catch (err) {
                    log.error('Audit retention cron error', { error: err.message });
                }
            }, { timezone: process.env.DIGEST_TIMEZONE || 'America/Santiago' });
            log.info('Audit retention scheduler started', { cron: '0 2 * * *', retention_days: 90 });
        } catch (_) {}
    });
}

function gracefulShutdown(signal) {
    log.info('Graceful shutdown initiated', { signal });
    if (!server) {
        log.info('No server to close — exiting');
        process.exit(0);
        return;
    }
    server.close(async () => {
        try {
            await closeDb();
            log.info('Database closed — goodbye');
        } catch (err) {
            log.error('DB close error', { error: err.message });
        }
        process.exit(0);
    });
    setTimeout(() => {
        log.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
    log.error('Unhandled promise rejection', {
        reason: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined
    });
});

process.on('uncaughtException', (err) => {
    log.error('Uncaught exception — shutting down', { error: err.message, stack: err.stack });
    gracefulShutdown('uncaughtException');
});

module.exports = { app, server };
