require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const { marked } = require('marked');
const session = require('express-session');
const multer = require('multer');

// Database & AI
const { db, run, get, all } = require('./database');
const aiService = require('./services/ai');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.argv.includes('-p') ? parseInt(process.argv[process.argv.indexOf('-p') + 1]) : 3000;

// Directories (Corrected for new structure: apps/dashboard -> ../../knowledge)
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'knowledge'); // Was ../Archivos
const VOICE_DIR = path.join(__dirname, 'public', 'voice-notes');

// Skills Directory (Corrected: apps/dashboard -> ../../core/skills)
const SKILLS_DIR = path.join(__dirname, '..', '..', 'core', 'skills');

// ─── Config ────────────────────────────────────────────────────────────────────
// Original ARCHIVOS_DIR and DINAMICAS_DIR are replaced by UPLOADS_DIR
const ARCHIVOS_DIR = UPLOADS_DIR;
const DINAMICAS_DIR = path.join(UPLOADS_DIR, 'dinamicas');

const DATA_DIR = path.join(__dirname, 'data'); // This remains
const TAGS_FILE = path.join(DATA_DIR, 'tags.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');


// Internal password
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || 'vsc2026';

// ─── Ensure data files ─────────────────────────────────────────────────────────
// Ensure directories exist
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
        }
    ];
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(defaultProjects, null, 2), 'utf-8');
}

// ─── Helper: Recursive file list ───────────────────────────────────────────────
function getFilesRecursively(dir, fileList = [], baseDir = null) {
    if (!baseDir) baseDir = dir;
    if (!fs.existsSync(dir)) return [];

    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            getFilesRecursively(filePath, fileList, baseDir);
        } else {
            if (path.extname(file).toLowerCase() === '.md') {
                fileList.push({
                    name: file,
                    path: path.relative(baseDir, filePath).replace(/\\/g, '/'),
                    size: stat.size,
                    category: path.basename(path.dirname(filePath)) // Just the immediate parent folder
                });
            }
        }
    });
    return fileList;
}


// ─── Middleware ─────────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('view cache', false);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/dinamicas', express.static(DINAMICAS_DIR));
app.use('/voice-notes', express.static(VOICE_DIR));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'vsc-hub-internal-2026',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

// ─── Auth Middleware ────────────────────────────────────────────────────────────
// API Key auth for external integrations (OpenClaw, webhooks, etc.)
async function apiKeyAuth(req, res, next) {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    if (!apiKey) return next();

    try {
        const keyRecord = await get('SELECT * FROM api_keys WHERE key = ? AND active = 1', [apiKey]);
        if (keyRecord) {
            // Set user context from API key
            const user = await get('SELECT id, username, role, department, expertise FROM users WHERE username = ?', [keyRecord.username]);
            req.apiKey = keyRecord;
            req.session = req.session || {};
            req.session.user = user || { id: 0, username: keyRecord.username, role: 'api' };
            req.session.authenticated = true;
            req.isApiRequest = true;
            // Update last_used
            run('UPDATE api_keys SET last_used = CURRENT_TIMESTAMP WHERE id = ?', [keyRecord.id]).catch(() => {});
        }
    } catch (err) {
        console.error('API Key auth error:', err);
    }
    next();
}

// Apply API key auth before session check
app.use(apiKeyAuth);

function requireAuth(req, res, next) {
    if (req.isApiRequest) return next();
    if (req.session && req.session.user) {
        return next();
    }
    // For API routes, return 401 JSON instead of redirect
    if (req.path.startsWith('/api/')) {
        return res.status(401).json({ error: 'Authentication required. Provide X-API-Key header or login.' });
    }
    res.redirect('/login');
}

// Make user available to all views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// ─── Routes ─────────────────────────────────────────────────────────────────────



// Login Action
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await get('SELECT * FROM users WHERE username = ?', [username.toLowerCase()]);

        if (user && await bcrypt.compare(password, user.password_hash)) {
            req.session.user = {
                id: user.id,
                username: user.username,
                role: user.role
            };
            req.session.authenticated = true; // Keep for backward compat if needed
            res.redirect('/');
        } else {
            res.render('login', { error: 'Credenciales inválidas' });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.render('login', { error: 'Error del sistema' });
    }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// ─── Multer Upload Config ───────────────────────────────────────────────────────
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
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// ─── Dynamic Page Mapping ───────────────────────────────────────────────────────
function findDynamicPage(filename) {
    const base = path.basename(filename, path.extname(filename)).toLowerCase();
    if (!fs.existsSync(DINAMICAS_DIR)) return null;

    const dirs = fs.readdirSync(DINAMICAS_DIR, { withFileTypes: true })
        .filter(d => d.isDirectory() && d.name !== 'Proximamente');

    for (const dir of dirs) {
        const dirWords = dir.name.toLowerCase().split(/[\s\-_]+/).filter(w => w.length > 3);
        const fileWords = base.split(/[\s\-_]+/).filter(w => w.length > 3);
        const overlap = dirWords.filter(w => fileWords.some(fw => fw.includes(w) || w.includes(fw)));

        if (overlap.length >= 2) {
            const folderPath = path.join(DINAMICAS_DIR, dir.name);
            const htmlFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.html'));
            if (htmlFiles.length > 0) {
                return {
                    folder: dir.name,
                    htmlFile: htmlFiles[0],
                    url: `/dinamicas/${encodeURIComponent(dir.name)}/${encodeURIComponent(htmlFiles[0])}`
                };
            }
        }
    }
    return null;
}

// ─── Tags Helpers ──────────────────────────────────────────────────────────────
function loadTags() {
    try {
        return JSON.parse(fs.readFileSync(TAGS_FILE, 'utf-8'));
    } catch { return {}; }
}

function saveTags(data) {
    fs.writeFileSync(TAGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Login ──────────────────────────────────────────────────────────────────────
app.get('/login', (req, res) => {
    if (req.session && req.session.authenticated) {
        return res.redirect('/');
    }
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { password } = req.body;
    if (password === AUTH_PASSWORD) {
        req.session.authenticated = true;
        res.redirect('/');
    } else {
        res.render('login', { error: 'Contraseña incorrecta' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// ─── Protected routes ──────────────────────────────────────────────────────────
app.use(requireAuth);

app.get('/', (req, res) => {
    res.render('index');
});

// ─── Files API ─────────────────────────────────────────────────────────────────
app.get('/api/archivos', (req, res) => {
    try {
        const tags = loadTags();
        let fileList = [];

        // 1. Physical Files
        if (fs.existsSync(ARCHIVOS_DIR)) {
            const files = fs.readdirSync(ARCHIVOS_DIR, { withFileTypes: true });
            fileList = files
                .filter(f => f.isFile())
                .map(f => {
                    const filePath = path.join(ARCHIVOS_DIR, f.name);
                    const stats = fs.statSync(filePath);
                    const ext = path.extname(f.name).toLowerCase();
                    const dynamicPage = findDynamicPage(f.name);
                    return {
                        name: f.name,
                        basename: path.basename(f.name, ext),
                        extension: ext,
                        type: ext === '.md' ? 'markdown' : ext === '.pdf' ? 'pdf' : 'other',
                        size: stats.size,
                        sizeFormatted: formatFileSize(stats.size),
                        modified: stats.mtime,
                        hasDynamic: !!dynamicPage,
                        dynamicUrl: dynamicPage ? dynamicPage.url : null,
                        tags: tags[f.name] || []
                    };
                });
        }

        // 2. Dynamic Apps (Standalone)
        if (fs.existsSync(DINAMICAS_DIR)) {
            const dynamicFolders = fs.readdirSync(DINAMICAS_DIR, { withFileTypes: true })
                .filter(d => d.isDirectory() && d.name !== 'Proximamente');

            dynamicFolders.forEach(dir => {
                // Check if this dynamic app is already linked to a file
                // We compare the folder name loosely with existing file basenames or dynamic links
                const isLinked = fileList.some(f => f.hasDynamic && f.dynamicUrl.includes(encodeURIComponent(dir.name)));

                if (!isLinked) {
                    // Find the entry point (html file)
                    const folderPath = path.join(DINAMICAS_DIR, dir.name);
                    const htmlFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.html'));
                    const entryFile = htmlFiles.length > 0 ? htmlFiles[0] : 'index.html';

                    fileList.push({
                        name: dir.name,
                        basename: dir.name,
                        extension: '.app',
                        type: 'app',
                        size: 0,
                        sizeFormatted: 'Guía Interactiva',
                        modified: new Date(),
                        hasDynamic: true,
                        dynamicUrl: `/dinamicas/${encodeURIComponent(dir.name)}/${encodeURIComponent(entryFile)}`,
                        tags: tags[dir.name] || ['guia', 'sistema']
                    });
                }
            });
        }

        res.json(fileList);
    } catch (err) {
        console.error('Error reading Archivos:', err);
        res.status(500).json({ error: 'Failed to read Archivos directory' });
    }
});

app.get('/archivo/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(ARCHIVOS_DIR, filename);

    if (!fs.existsSync(filePath)) return res.status(404).render('index');

    const ext = path.extname(filename).toLowerCase();
    const stats = fs.statSync(filePath);

    if (ext === '.pdf') {
        const dynamicPage = findDynamicPage(filename);
        if (dynamicPage) return res.redirect(dynamicPage.url);
    }

    if (ext === '.md') {
        const content = fs.readFileSync(filePath, 'utf-8');
        const htmlContent = marked(content);
        res.render('archivo', {
            filename, basename: path.basename(filename, ext),
            type: 'markdown', content: htmlContent,
            size: formatFileSize(stats.size), modified: stats.mtime
        });
    } else if (ext === '.pdf') {
        res.render('archivo', {
            filename, basename: path.basename(filename, ext),
            type: 'pdf', content: null,
            size: formatFileSize(stats.size), modified: stats.mtime
        });
    } else {
        res.render('archivo', {
            filename, basename: path.basename(filename, ext),
            type: 'other', content: null,
            size: formatFileSize(stats.size), modified: stats.mtime
        });
    }
});

app.get('/archivos-file/:filename', (req, res) => {
    const filePath = path.join(ARCHIVOS_DIR, req.params.filename);
    if (fs.existsSync(filePath)) res.sendFile(filePath);
    else res.status(404).send('File not found');
});

app.get('/descargar/:filename', (req, res) => {
    const filePath = path.join(ARCHIVOS_DIR, req.params.filename);
    if (fs.existsSync(filePath)) res.download(filePath);
    else res.status(404).send('File not found');
});

app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file provided' });
        const rawTags = req.body.tags || '';
        const tagList = rawTags.split(',').map(t => t.trim()).filter(t => t.length > 0);
        if (tagList.length > 0) {
            const tags = loadTags();
            tags[req.file.filename] = tagList;
            saveTags(tags);
        }
        res.json({
            success: true,
            filename: req.file.filename,
            size: formatFileSize(req.file.size),
            tags: tagList
        });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: 'Upload failed' });
    }
});

app.post('/api/tags', (req, res) => {
    try {
        const { filename, tags: newTags } = req.body;
        if (!filename) return res.status(400).json({ error: 'Filename required' });
        const allTags = loadTags();
        allTags[filename] = (newTags || []).map(t => t.trim()).filter(t => t.length > 0);
        saveTags(allTags);
        res.json({ success: true, tags: allTags[filename] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save tags' });
    }
});

// ─── DB-Based Ideas API ────────────────────────────────────────────────────────
app.get('/api/ideas', async (req, res) => {
    try {
        const { code_stage, para_type, area_id, assigned_to, page, limit: lim } = req.query;
        let sql = `SELECT id, text, audio_url as audioUrl, created_at as createdAt, status,
            ai_type, ai_category, ai_action, ai_summary,
            code_stage, para_type, related_area_id, distilled_summary, expressed_output,
            assigned_to, estimated_time, priority, project_id, created_by,
            ai_confidence, needs_review, last_reviewed,
            suggested_agent, suggested_skills, execution_status, execution_output,
            execution_error, executed_at, executed_by
            FROM ideas`;
        const conditions = [];
        const params = [];

        if (code_stage) { conditions.push('code_stage = ?'); params.push(code_stage); }
        if (para_type) { conditions.push('para_type = ?'); params.push(para_type); }
        if (area_id) { conditions.push('related_area_id = ?'); params.push(area_id); }
        if (assigned_to) { conditions.push('assigned_to = ?'); params.push(assigned_to); }

        let countSql = 'SELECT count(*) as total FROM ideas';
        if (conditions.length > 0) {
            const where = ' WHERE ' + conditions.join(' AND ');
            sql += where;
            countSql += where;
        }
        sql += ' ORDER BY created_at DESC';

        // Pagination
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(lim) || 50));
        const offset = (pageNum - 1) * limitNum;
        sql += ` LIMIT ${limitNum} OFFSET ${offset}`;

        const [ideas, countResult] = await Promise.all([
            all(sql, params),
            all(countSql, params)
        ]);
        const total = countResult[0]?.total || 0;

        res.json({ ideas, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
    } catch (err) {
        console.error('DB Error:', err);
        res.status(500).json({ error: 'Failed to fetch ideas' });
    }
});

app.post('/api/ideas', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) return res.status(400).json({ error: 'Text required' });

        const createdBy = req.session.user ? req.session.user.username : null;

        await run('INSERT INTO ideas (text, code_stage, created_by) VALUES (?, ?, ?)', [text.trim(), 'captured', createdBy]);
        let newIdea = await get('SELECT id, text FROM ideas ORDER BY id DESC LIMIT 1');

        // Auto-Process with AI (CODE: Capture → Organize) — pass speaker identity
        const analysis = await processAndSaveIdea(newIdea.id, newIdea.text, createdBy);

        // Handle multi-idea splits
        const ideaSelectCols = `id, text, audio_url as audioUrl, created_at as createdAt, status,
                ai_type, ai_category, ai_action, ai_summary,
                code_stage, para_type, related_area_id, assigned_to, estimated_time, priority, created_by,
                suggested_agent, suggested_skills, execution_status`;
        if (analysis && analysis.split && analysis.savedIds) {
            const allIdeas = await all(
                `SELECT ${ideaSelectCols} FROM ideas WHERE id IN (${analysis.savedIds.map(() => '?').join(',')})`,
                analysis.savedIds
            );
            res.json({ split: true, count: analysis.count, ideas: allIdeas });
        } else {
            newIdea = await get(`SELECT ${ideaSelectCols} FROM ideas WHERE id = ?`, [newIdea.id]);
            res.json(newIdea);
        }
    } catch (err) {
        console.error('DB Error:', err);
        res.status(500).json({ error: 'Failed to save idea' });
    }
});

app.post('/api/ideas/voice', upload.single('audio'), async (req, res) => {
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

        // Auto-Process — pass speaker identity for context-aware classification
        const analysis = await processAndSaveIdea(newIdea.id, newIdea.text, createdBy);

        // Handle multi-idea splits from voice
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
        console.error('Voice upload error:', err);
        res.status(500).json({ error: 'Failed to save voice note' });
    }
});

app.delete('/api/ideas', async (req, res) => {
    try {
        await run('DELETE FROM ideas');
        // Reset auto increment? Optional but good for clean slate
        await run('DELETE FROM sqlite_sequence WHERE name="ideas"');
        res.json({ message: 'Todas las ideas han sido eliminadas' });
    } catch (err) {
        console.error('DB Error:', err);
        res.status(500).json({ error: 'Failed to delete all ideas' });
    }
});

app.delete('/api/ideas/:id', async (req, res) => {
    try {
        await run('DELETE FROM ideas WHERE id = ?', [req.params.id]);
        res.json({ deleted: true });
    } catch (err) {
        console.error('DB Error:', err);
        res.status(500).json({ error: 'Failed to delete idea' });
    }
});

// ─── Skills API ──────────────────────────────────────────────────────────────────
app.get('/api/skills', async (req, res) => {
    try {
        const skills = getFilesRecursively(SKILLS_DIR);
        res.json(skills);
    } catch (err) {
        console.error('Skills error:', err);
        res.status(500).json({ error: 'Failed to fetch skills' });
    }
});

app.get('/api/skills/content', async (req, res) => {
    try {
        const { file } = req.query;
        if (!file) return res.status(400).json({ error: 'File path required' });

        // Security check: ensure path is within SKILLS_DIR
        const fullPath = path.join(SKILLS_DIR, file);
        if (!fullPath.startsWith(SKILLS_DIR)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        const content = fs.readFileSync(fullPath, 'utf-8');
        res.json({ content });
    } catch (err) {
        console.error('Skill content error:', err);
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});

// ─── AI API ────────────────────────────────────────────────────────────────────
// ─── AI Helper (CODE/PARA Enhanced) ─────────────────────────────────────────
async function processAndSaveIdea(ideaId, text, speakerUsername = null) {
    try {
        const contextItems = await all('SELECT key, content FROM context_items');
        let contextString = contextItems.map(c => `${c.key}: ${c.content}`).join('\n');

        const users = await all('SELECT username, role, department, expertise FROM users');
        const areas = await all('SELECT name FROM areas WHERE status = "active"');

        // Build speaker context for identity-aware classification
        let speakerContext = null;
        if (speakerUsername) {
            const speaker = users.find(u => u.username === speakerUsername);
            if (speaker) {
                speakerContext = {
                    username: speaker.username,
                    role: speaker.role,
                    department: speaker.department,
                    expertise: speaker.expertise
                };
            }
        }

        const analysis = await aiService.processIdea(text, contextString, users, areas, speakerContext);

        // Normalize to array (AI may return single object or array for multi-idea splitting)
        const ideas = Array.isArray(analysis) ? analysis : [analysis];
        const savedIds = [ideaId]; // Track all created idea IDs

        for (let idx = 0; idx < ideas.length; idx++) {
            const item = ideas[idx];
            if (!item || item.tipo === 'Error') continue;

            let currentIdeaId = ideaId;

            // For split ideas (idx > 0), create new idea records
            if (idx > 0) {
                const cleanText = item.texto_limpio || item.resumen || text;
                const result = await run(
                    'INSERT INTO ideas (text, code_stage, created_by) VALUES (?, ?, ?)',
                    [cleanText, 'captured', speakerUsername]
                );
                currentIdeaId = result.lastID;
                savedIds.push(currentIdeaId);
            } else if (item.texto_limpio && item.texto_limpio !== text) {
                // Update original idea text with cleaned version
                await run('UPDATE ideas SET text = ? WHERE id = ?', [item.texto_limpio, currentIdeaId]);
            }

            let areaId = null;
            if (item.suggested_area) {
                const area = await get('SELECT id FROM areas WHERE name = ?', [item.suggested_area]);
                if (area) areaId = area.id;
            }

            const confidence = typeof item.confidence === 'number' ? item.confidence : 0.5;
            const needsReview = item.needs_review || confidence < 0.6 ? 1 : 0;

            await run(`UPDATE ideas SET
                ai_type = ?, ai_category = ?, ai_action = ?, ai_summary = ?,
                status = 'processed', code_stage = 'organized',
                para_type = ?, related_area_id = ?,
                assigned_to = ?, estimated_time = ?, priority = ?,
                ai_confidence = ?, needs_review = ?,
                suggested_agent = ?, suggested_skills = ?
                WHERE id = ?`,
                [
                    item.tipo, item.categoria, item.accion_inmediata, item.resumen,
                    item.para_type || 'resource', areaId,
                    item.assigned_to, item.estimated_time, item.priority || 'media',
                    confidence, needsReview,
                    item.suggested_agent || null,
                    JSON.stringify(item.suggested_skills || []),
                    currentIdeaId
                ]
            );

            // Receipt: Log to inbox_log (audit trail)
            const logText = item.texto_limpio || item.resumen || text;
            await run(`INSERT INTO inbox_log (source, input_text, ai_confidence, ai_classification, routed_to, needs_review, original_idea_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    ideas.length > 1 ? 'voice-split' : 'idea',
                    logText.substring(0, 200),
                    confidence,
                    JSON.stringify({ tipo: item.tipo, categoria: item.categoria, para_type: item.para_type }),
                    item.suggested_area || 'inbox',
                    needsReview, currentIdeaId
                ]
            );

            if (item.waiting_for && item.waiting_for.delegated_to) {
                await run(`INSERT INTO waiting_for (description, delegated_to, delegated_by, related_idea_id, related_area_id)
                    VALUES (?, ?, ?, ?, ?)`,
                    [
                        item.waiting_for.description || item.accion_inmediata,
                        item.waiting_for.delegated_to,
                        speakerUsername || 'system', currentIdeaId, areaId
                    ]
                );
            }
        }

        // Return analysis + metadata about splits
        return Array.isArray(analysis)
            ? { items: analysis, split: true, count: ideas.length, savedIds }
            : analysis;
    } catch (err) {
        console.error("AI Helper Error:", err);
        return null;
    }
}

// ─── Agent Configuration ───────────────────────────────────────────────────────
const AGENTS = {
    'staffing': {
        name: 'Staffing Agent',
        role: 'Experto en Planificación de Dotación y Turnos',
        skillPath: path.join(SKILLS_DIR, 'customizable', 'create-staffing-plan.md')
    },
    'training': {
        name: 'Training Agent',
        role: 'Experto en Capacitación y Mallas Curriculares',
        skillPath: path.join(SKILLS_DIR, 'customizable', 'create-training-plan.md')
    },
    'finance': {
        name: 'Finance Agent',
        role: 'Analista Financiero de Presupuestos (OPEX)',
        skillPath: path.join(SKILLS_DIR, 'core', 'model-opex-budget.md')
    },
    'compliance': {
        name: 'Compliance Agent',
        role: 'Auditor de Cumplimiento Normativo',
        skillPath: path.join(SKILLS_DIR, 'core', 'audit-compliance-readiness.md')
    }
};

app.post('/api/ai/chat', async (req, res) => {
    const { message, agent } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    try {
        // Save user message
        await run('INSERT INTO chat_history (role, message) VALUES (?, ?)', ['user', message]);

        // Get context
        const history = await all('SELECT role, message FROM chat_history ORDER BY id DESC LIMIT 10');
        const contextItems = await all('SELECT key, content, para_type, code_stage FROM context_items');

        let dynamicSystemPrompt = null;
        let contextPrefix = "";

        // 1. Determine System Prompt based on Agent
        if (agent && AGENTS[agent]) {
            const agentConfig = AGENTS[agent];
            let skillContent = "No se encontró el archivo de skill.";

            if (fs.existsSync(agentConfig.skillPath)) {
                skillContent = fs.readFileSync(agentConfig.skillPath, 'utf-8');
            }

            dynamicSystemPrompt = `
            ERES EL AGENTE: ${agentConfig.name}
            ROL: ${agentConfig.role}

            TU CONOCIMIENTO PRINCIPAL (SOP):
            === INICIO SKILL ===
            ${skillContent}
            === FIN SKILL ===

            INSTRUCCIONES:
            1. Actúa ESTRICTAMENTE basándote en la Skill proporcionada.
            2. Si te preguntan algo fuera de tu skill, indica amablemente que solo eres experto en ese tema.
            3. Usa formato Markdown para tablas y listas.
            `;
        }

        // 2. RAG-enhanced context: score items by keyword relevance to user message
        const areasData = await all('SELECT name, description FROM areas WHERE status = "active"');
        const msgWords = message.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const scoredItems = contextItems.map(item => {
            const text = `${item.key} ${item.content}`.toLowerCase();
            let score = 0;
            msgWords.forEach(word => { if (text.includes(word)) score++; });
            if (item.code_stage === 'distilled') score += 1;
            return { ...item, relevance: score };
        }).sort((a, b) => b.relevance - a.relevance);

        const topItems = scoredItems.filter(i => i.relevance > 0).slice(0, 15);
        const baseItems = scoredItems.filter(i => i.relevance === 0).slice(0, 5);
        const selectedItems = [...topItems, ...baseItems];

        contextPrefix = "MEMORIA A LARGO PLAZO (Contexto relevante, ordenado por relevancia):\n";
        selectedItems.forEach(item => {
            const paraLabel = item.para_type ? ` [${item.para_type.toUpperCase()}]` : '';
            contextPrefix += `- ${item.key}${paraLabel}: ${item.content}\n`;
        });
        contextPrefix += "\nAREAS DE RESPONSABILIDAD ACTIVAS:\n";
        areasData.forEach(a => { contextPrefix += `- ${a.name}: ${a.description}\n`; });

        // Generate response
        // Note: We pass the Context Items as part of the user prompt context (or prepended to history) 
        // and the Agent Persona as the 'systemInstruction'.
        const userPrompt = `${contextPrefix}\n\nPREGUNTA USUARIO: ${message}`;

        const aiResponse = await aiService.generateResponse(userPrompt, history.reverse(), dynamicSystemPrompt);

        // Save AI response
        await run('INSERT INTO chat_history (role, message) VALUES (?, ?)', ['model', aiResponse]);

        res.json({ response: aiResponse });
    } catch (err) {
        console.error("AI Error:", err);
        res.status(500).json({ error: 'AI Service Error' });
    }
});

app.post('/api/ai/process', async (req, res) => {
    const { ideaId, text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text required' });

    try {
        const createdBy = req.session.user ? req.session.user.username : null;
        const analysis = await processAndSaveIdea(ideaId, text, createdBy);
        if (!analysis) return res.status(500).json({ error: 'Processing failed' });
        res.json(analysis);
    } catch (err) {
        console.error("AI Algo Error:", err);
        res.status(500).json({ error: 'Processing failed' });
    }
});

// ─── Preview API (analyze without saving — for voice confirmation step) ─────
app.post('/api/ai/preview', async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text required' });

    try {
        const createdBy = req.session.user ? req.session.user.username : null;
        const contextItems = await all('SELECT key, content FROM context_items');
        const contextString = contextItems.map(c => `${c.key}: ${c.content}`).join('\n');
        const users = await all('SELECT username, role, department, expertise FROM users');
        const areas = await all('SELECT name FROM areas WHERE status = "active"');

        let speakerContext = null;
        if (createdBy) {
            const speaker = users.find(u => u.username === createdBy);
            if (speaker) speakerContext = { username: speaker.username, role: speaker.role, department: speaker.department, expertise: speaker.expertise };
        }

        const analysis = await aiService.processIdea(text, contextString, users, areas, speakerContext);
        const items = Array.isArray(analysis) ? analysis : [analysis];
        res.json({ preview: true, items, split: items.length > 1, speaker: createdBy });
    } catch (err) {
        console.error("Preview Error:", err);
        res.status(500).json({ error: 'Preview failed' });
    }
});

// ─── New Agents ────────────────────────────────────────────────────────────────
const researchAgent = require('./services/researchAgent');
const reviewAgent = require('./services/reviewAgent');

app.post('/api/ai/research', async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query required' });

    try {
        // Fetch context to give the agent some memory
        const contextItems = await all('SELECT key, content FROM context_items');
        let contextString = contextItems.map(c => `${c.key}: ${c.content}`).join('\n');

        const result = await researchAgent.researchTopic(query, contextString);

        // Auto-save research result as Resource in PARA
        const contextKey = `research_${Date.now()}`;
        await run(`INSERT INTO context_items (key, content, category, para_type, code_stage, source)
            VALUES (?, ?, ?, 'resource', 'organized', 'research')`,
            [contextKey, result, 'research']);
        const savedItem = await get('SELECT id FROM context_items WHERE key = ?', [contextKey]);

        res.json({ response: result, saved_as_resource: true, context_id: savedItem?.id });
    } catch (err) {
        res.status(500).json({ error: 'Research failed' });
    }
});

app.post('/api/ai/review', async (req, res) => {
    try {
        // Fetch recent ideas (last 7 days ideally, but getting all active for now)
        const ideas = await all("SELECT * FROM ideas WHERE created_at >= datetime('now', '-7 days')");

        // If few ideas, fetch last 20 to have something to show
        let ideasToReview = ideas;
        if (ideas.length < 5) {
            ideasToReview = await all("SELECT * FROM ideas ORDER BY created_at DESC LIMIT 20");
        }

        const review = await reviewAgent.generateWeeklyReview(ideasToReview);

        // Mark all reviewed ideas
        const reviewedIds = ideasToReview.map(i => i.id);
        if (reviewedIds.length > 0) {
            await run(`UPDATE ideas SET last_reviewed = CURRENT_TIMESTAMP WHERE id IN (${reviewedIds.map(() => '?').join(',')})`, reviewedIds);
        }

        // Suggest stale ideas for archiving (organized but not progressed in 14+ days)
        const staleIdeas = await all(`SELECT id, text, ai_summary, code_stage, para_type, created_at
            FROM ideas WHERE code_stage IN ('captured', 'organized')
            AND created_at <= datetime('now', '-14 days')
            ORDER BY created_at ASC LIMIT 20`);

        res.json({ response: review, stale_ideas: staleIdeas, reviewed_count: reviewedIds.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Review failed' });
    }
});

app.get('/api/ai/context', async (req, res) => {
    try {
        const { para_type, code_stage } = req.query;
        let sql = 'SELECT * FROM context_items';
        const conditions = [];
        const params = [];

        if (para_type) { conditions.push('para_type = ?'); params.push(para_type); }
        if (code_stage) { conditions.push('code_stage = ?'); params.push(code_stage); }

        if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
        sql += ' ORDER BY para_type, category, key';

        const items = await all(sql, params);
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch context' });
    }
});

app.post('/api/ai/context', async (req, res) => {
    const { key, content, category, para_type, code_stage, source, related_project_id, related_area_id } = req.body;
    try {
        await run(`INSERT INTO context_items (key, content, category, para_type, code_stage, source, related_project_id, related_area_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [key, content, category, para_type || 'resource', code_stage || 'organized', source || 'manual', related_project_id, related_area_id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save context' });
    }
});

app.put('/api/ai/context/:id', async (req, res) => {
    const { key, content, category, para_type, code_stage, related_project_id, related_area_id } = req.body;
    const { id } = req.params;
    try {
        await run(`UPDATE context_items SET key = ?, content = ?, category = ?, para_type = ?, code_stage = ?,
            related_project_id = ?, related_area_id = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?`,
            [key, content, category, para_type, code_stage, related_project_id, related_area_id, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update context' });
    }
});

app.delete('/api/ai/context/:id', async (req, res) => {
    try {
        await run('DELETE FROM context_items WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete context' });
    }
});

// ─── Areas API (PARA) ────────────────────────────────────────────────────────
app.get('/api/areas', async (req, res) => {
    try {
        const areas = await all('SELECT * FROM areas ORDER BY status, name');
        for (const area of areas) {
            const ideasCount = await get('SELECT count(*) as c FROM ideas WHERE related_area_id = ?', [area.id]);
            const contextCount = await get('SELECT count(*) as c FROM context_items WHERE related_area_id = ?', [area.id]);
            area.ideas_count = ideasCount ? ideasCount.c : 0;
            area.context_count = contextCount ? contextCount.c : 0;
        }
        res.json(areas);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch areas' });
    }
});

app.post('/api/areas', async (req, res) => {
    const { name, description, icon, horizon } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    try {
        await run('INSERT INTO areas (name, description, icon, horizon) VALUES (?, ?, ?, ?)',
            [name, description || '', icon || '📂', horizon || 'h2']);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create area' });
    }
});

app.put('/api/areas/:id', async (req, res) => {
    const { name, description, icon, horizon, status } = req.body;
    try {
        await run('UPDATE areas SET name = ?, description = ?, icon = ?, horizon = ?, status = ? WHERE id = ?',
            [name, description, icon, horizon, status, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update area' });
    }
});

app.delete('/api/areas/:id', async (req, res) => {
    try {
        await run('UPDATE areas SET status = "archived" WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to archive area' });
    }
});

// ─── Ideas CODE Actions ─────────────────────────────────────────────────────
app.post('/api/ideas/:id/organize', async (req, res) => {
    const { para_type, area_id, project_id } = req.body;
    try {
        await run(`UPDATE ideas SET code_stage = 'organized', para_type = ?, related_area_id = ?, project_id = ? WHERE id = ?`,
            [para_type, area_id, project_id, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to organize idea' });
    }
});

app.post('/api/ideas/:id/distill', async (req, res) => {
    try {
        const idea = await get('SELECT * FROM ideas WHERE id = ?', [req.params.id]);
        if (!idea) return res.status(404).json({ error: 'Idea not found' });

        const contextItems = await all('SELECT key, content FROM context_items');
        const contextString = contextItems.map(c => `${c.key}: ${c.content}`).join('\n');
        const distilled = await aiService.distillContent(idea.text, contextString);

        await run(`UPDATE ideas SET code_stage = 'distilled', distilled_summary = ? WHERE id = ?`,
            [distilled.resumen_destilado, req.params.id]);
        res.json(distilled);
    } catch (err) {
        res.status(500).json({ error: 'Distill failed' });
    }
});

app.post('/api/ideas/:id/express', async (req, res) => {
    const { output } = req.body;
    try {
        await run(`UPDATE ideas SET code_stage = 'expressed', expressed_output = ? WHERE id = ?`,
            [output || 'Expresado', req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Express failed' });
    }
});

// ─── Idea Automation Pipeline: Execute with Agent ──────────────────────────
app.post('/api/ideas/:id/execute', requireAuth, async (req, res) => {
    const ideaId = req.params.id;
    const { agent, skills } = req.body;
    const executedBy = req.session.user ? req.session.user.username : 'system';

    try {
        const idea = await get('SELECT * FROM ideas WHERE id = ?', [ideaId]);
        if (!idea) return res.status(404).json({ error: 'Idea not found' });

        const agentKey = agent || idea.suggested_agent;
        if (!agentKey || !AGENTS[agentKey]) {
            return res.status(400).json({ error: 'Invalid or missing agent' });
        }

        // Resolve skills
        let skillPaths = skills;
        if (!skillPaths || skillPaths.length === 0) {
            try { skillPaths = JSON.parse(idea.suggested_skills || '[]'); } catch (e) { skillPaths = []; }
        }
        if (skillPaths.length === 0) {
            skillPaths = [path.relative(SKILLS_DIR, AGENTS[agentKey].skillPath).replace(/\\/g, '/')];
        }

        // Mark as running
        await run(`UPDATE ideas SET execution_status = 'running', suggested_agent = ?, suggested_skills = ?, executed_by = ? WHERE id = ?`,
            [agentKey, JSON.stringify(skillPaths), executedBy, ideaId]);

        // Load skill file contents
        const skillContents = [];
        for (const skillPath of skillPaths) {
            const fullPath = path.join(SKILLS_DIR, skillPath);
            if (fs.existsSync(fullPath)) {
                skillContents.push(fs.readFileSync(fullPath, 'utf-8'));
            }
        }

        if (skillContents.length === 0) {
            await run(`UPDATE ideas SET execution_status = 'failed', execution_error = ? WHERE id = ?`, ['No skill files found', ideaId]);
            return res.status(400).json({ error: 'No skill files found for execution' });
        }

        // Build context
        const contextItems = await all('SELECT key, content FROM context_items');
        const contextString = contextItems.map(c => `${c.key}: ${c.content}`).join('\n');

        // Execute
        const result = await aiService.executeWithAgent(idea.text, agentKey, skillContents, contextString);

        if (result.success) {
            await run(`UPDATE ideas SET execution_status = 'completed', execution_output = ?, executed_at = CURRENT_TIMESTAMP, code_stage = 'expressed', expressed_output = ? WHERE id = ?`,
                [result.output, `Auto-ejecutado por ${AGENTS[agentKey].name}`, ideaId]);

            // Save as context resource for future RAG
            await run(`INSERT INTO context_items (key, content, category, para_type, code_stage, source) VALUES (?, ?, ?, 'resource', 'expressed', ?)`,
                [`execution_${ideaId}_${agentKey}`, result.output.substring(0, 5000), idea.ai_category || 'General', `agent:${agentKey}`]);

            res.json({ success: true, output: result.output, agent: agentKey, executedBy });
        } else {
            await run(`UPDATE ideas SET execution_status = 'failed', execution_error = ? WHERE id = ?`, [result.error, ideaId]);
            res.status(500).json({ error: 'Execution failed', details: result.error });
        }
    } catch (err) {
        console.error('Execute Error:', err);
        await run(`UPDATE ideas SET execution_status = 'failed', execution_error = ? WHERE id = ?`, [err.message, ideaId]).catch(() => {});
        res.status(500).json({ error: 'Execution failed' });
    }
});

app.get('/api/ideas/:id/execution-output', requireAuth, async (req, res) => {
    try {
        const idea = await get('SELECT execution_output, execution_status, execution_error, executed_at, executed_by, suggested_agent FROM ideas WHERE id = ?', [req.params.id]);
        if (!idea) return res.status(404).json({ error: 'Idea not found' });
        res.json(idea);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch execution output' });
    }
});

app.get('/api/agents', requireAuth, (req, res) => {
    const agentList = Object.entries(AGENTS).map(([key, config]) => ({
        key, name: config.name, role: config.role,
        skillFile: path.basename(config.skillPath)
    }));
    res.json(agentList);
});

// ─── Context PARA Actions ────────────────────────────────────────────────────
app.post('/api/ai/context/:id/distill', async (req, res) => {
    try {
        const item = await get('SELECT * FROM context_items WHERE id = ?', [req.params.id]);
        if (!item) return res.status(404).json({ error: 'Context item not found' });

        const distilled = await aiService.distillContent(item.content);
        await run(`UPDATE context_items SET code_stage = 'distilled', distilled_summary = ? WHERE id = ?`,
            [distilled.resumen_destilado, req.params.id]);
        res.json(distilled);
    } catch (err) {
        res.status(500).json({ error: 'Distill failed' });
    }
});

app.post('/api/ai/context/:id/archive', async (req, res) => {
    try {
        await run(`UPDATE context_items SET para_type = 'archive', code_stage = 'expressed' WHERE id = ?`, [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Archive failed' });
    }
});

// ─── Waiting For API (GTD Delegation) ────────────────────────────────────────
app.get('/api/waiting-for', async (req, res) => {
    try {
        const items = await all(`SELECT w.*, i.text as idea_text, a.name as area_name
            FROM waiting_for w
            LEFT JOIN ideas i ON w.related_idea_id = i.id
            LEFT JOIN areas a ON w.related_area_id = a.id
            ORDER BY w.status, w.created_at DESC`);
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch waiting-for items' });
    }
});

app.post('/api/waiting-for', async (req, res) => {
    const { description, delegated_to, delegated_by, related_idea_id, related_project_id, related_area_id, due_date } = req.body;
    if (!description) return res.status(400).json({ error: 'Description required' });
    try {
        await run(`INSERT INTO waiting_for (description, delegated_to, delegated_by, related_idea_id, related_project_id, related_area_id, due_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [description, delegated_to, delegated_by, related_idea_id, related_project_id, related_area_id, due_date]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create waiting-for item' });
    }
});

app.put('/api/waiting-for/:id/complete', async (req, res) => {
    try {
        await run(`UPDATE waiting_for SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?`, [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to complete' });
    }
});

app.delete('/api/waiting-for/:id', async (req, res) => {
    try {
        await run('DELETE FROM waiting_for WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete' });
    }
});

// ─── Inbox Log API (Receipt — audit trail) ──────────────────────────────────
app.get('/api/inbox-log', async (req, res) => {
    try {
        const { page, limit: lim } = req.query;
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(lim) || 30));
        const offset = (pageNum - 1) * limitNum;

        const [items, countResult] = await Promise.all([
            all(`SELECT * FROM inbox_log ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offset}`),
            get('SELECT count(*) as total FROM inbox_log')
        ]);
        const total = countResult?.total || 0;

        res.json({ items, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch inbox log' });
    }
});

app.put('/api/inbox-log/:id/review', async (req, res) => {
    try {
        await run(`UPDATE inbox_log SET reviewed = 1 WHERE id = ?`, [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to mark reviewed' });
    }
});

// ─── Fix Button (one-click reclassification) ────────────────────────────────
app.post('/api/ideas/:id/fix', async (req, res) => {
    const { ai_type, ai_category, para_type, assigned_to, priority, area_id } = req.body;
    try {
        const updates = [];
        const params = [];

        if (ai_type) { updates.push('ai_type = ?'); params.push(ai_type); }
        if (ai_category) { updates.push('ai_category = ?'); params.push(ai_category); }
        if (para_type) { updates.push('para_type = ?'); params.push(para_type); }
        if (assigned_to) { updates.push('assigned_to = ?'); params.push(assigned_to); }
        if (priority) { updates.push('priority = ?'); params.push(priority); }
        if (area_id !== undefined) { updates.push('related_area_id = ?'); params.push(area_id); }
        updates.push('needs_review = 0');

        if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

        params.push(req.params.id);
        await run(`UPDATE ideas SET ${updates.join(', ')} WHERE id = ?`, params);

        // Also mark the inbox_log entry as reviewed
        await run(`UPDATE inbox_log SET reviewed = 1 WHERE original_idea_id = ?`, [req.params.id]);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fix idea' });
    }
});

// ─── Digest API (Tap on Shoulder — proactive summary) ───────────────────────
app.post('/api/ai/digest', async (req, res) => {
    try {
        const ideas = await all("SELECT * FROM ideas WHERE created_at >= datetime('now', '-7 days') ORDER BY created_at DESC");
        const waitingFor = await all("SELECT * FROM waiting_for WHERE status = 'waiting'");
        const contextItems = await all('SELECT key, content FROM context_items');
        const contextString = contextItems.map(c => `${c.key}: ${c.content}`).join('\n');
        const areas = await all('SELECT a.*, (SELECT count(*) FROM ideas WHERE related_area_id = a.id) as ideas_count, (SELECT count(*) FROM context_items WHERE related_area_id = a.id) as context_count FROM areas a WHERE a.status = "active"');

        const digest = await aiService.generateDigest(ideas, waitingFor, contextString, areas);
        res.json({ response: digest });
    } catch (err) {
        console.error('Digest error:', err);
        res.status(500).json({ error: 'Digest failed' });
    }
});

// ─── Stats API (CODE/PARA) ───────────────────────────────────────────────────
app.get('/api/stats/code', async (req, res) => {
    try {
        const stages = await all(`SELECT code_stage, count(*) as count FROM ideas GROUP BY code_stage`);
        const result = { captured: 0, organized: 0, distilled: 0, expressed: 0 };
        stages.forEach(s => { if (s.code_stage && result.hasOwnProperty(s.code_stage)) result[s.code_stage] = s.count; });
        const nullCount = await get(`SELECT count(*) as c FROM ideas WHERE code_stage IS NULL`);
        result.captured += nullCount ? nullCount.c : 0;
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch CODE stats' });
    }
});

app.get('/api/stats/para', async (req, res) => {
    try {
        const types = await all(`SELECT para_type, count(*) as count FROM ideas WHERE para_type IS NOT NULL GROUP BY para_type`);
        const result = { project: 0, area: 0, resource: 0, archive: 0 };
        types.forEach(t => { if (t.para_type && result.hasOwnProperty(t.para_type)) result[t.para_type] = t.count; });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch PARA stats' });
    }
});

app.get('/api/stats/overview', async (req, res) => {
    try {
        const [ideas, projects, areas, context, waiting] = await Promise.all([
            get('SELECT count(*) as c FROM ideas'),
            get('SELECT count(*) as c FROM projects'),
            get('SELECT count(*) as c FROM areas WHERE status = "active"'),
            get('SELECT count(*) as c FROM context_items'),
            get('SELECT count(*) as c FROM waiting_for WHERE status = "waiting"')
        ]);
        res.json({
            ideas: ideas.c, projects: projects.c, areas: areas.c,
            context: context.c, waiting: waiting.c
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch overview stats' });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await all('SELECT id, username, role, department, expertise FROM users');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// ─── Projects API (SQLite) ──────────────────────────────────────────────────────
app.get('/api/projects', async (req, res) => {
    try {
        // Migration check: If DB is empty, try to seed from JSON once
        // Migration check: If DB is empty or we force it, try to seed from JSON
        const count = await get('SELECT count(*) as c FROM projects');

        if (count.c === 0 && fs.existsSync(PROJECTS_FILE)) {
            console.log('🔄 Migrating projects.json to SQLite...');
            const jsonData = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));

            for (const p of jsonData) {
                // Use INSERT OR IGNORE to prevent crashing if re-run
                await run(`INSERT OR IGNORE INTO projects (id, name, description, url, icon, status, tech, created_at) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [p.id, p.name, p.description, p.url, p.icon, p.status, (p.tech || []).join(','), p.createdAt]
                );
            }
            console.log('✅ Projects migration completed.');
        }

        const projects = await all('SELECT * FROM projects ORDER BY created_at DESC');
        // Parse tech back to array for frontend compatibility
        const formatted = projects.map(p => ({
            ...p,
            tech: p.tech ? p.tech.split(',') : []
        }));
        res.json(formatted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

app.post('/api/projects', async (req, res) => {
    const { name, description, url, icon, status, tech } = req.body;
    if (!name || !url) return res.status(400).json({ error: 'Name and URL required' });

    try {
        const id = Date.now().toString();
        const techStr = (tech || []).map(t => t.trim()).join(',');
        await run(`INSERT INTO projects (id, name, description, url, icon, status, tech) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, name, description, url, icon, status || 'active', techStr]
        );
        res.json({ id, name, status });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save project' });
    }
});

app.delete('/api/projects/:id', async (req, res) => {
    try {
        await run('DELETE FROM projects WHERE id = ?', [req.params.id]);
        res.json({ deleted: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// Link Idea to Project
app.put('/api/ideas/:id/project', async (req, res) => {
    const { projectId } = req.body;
    const { id } = req.params;
    try {
        await run('UPDATE ideas SET project_id = ? WHERE id = ?', [projectId, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to link project' });
    }
});

// ─── Orchestrator API ──────────────────────────────────────────────────────────
const orchestratorBridge = require('./services/orchestratorBridge');

app.post('/api/orchestrator/execute', async (req, res) => {
    const { command, args } = req.body;
    // Security check: Only admin
    const user = req.session.user;
    // if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

    try {
        const result = await orchestratorBridge.executeCommand(command, args || []);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: typeof err === 'string' ? err : 'Execution failed' });
    }
});

// ─── Reportability API (Per-Consultant Checklists + Activity Reports) ──────
app.get('/api/reportability', async (req, res) => {
    try {
        const users = await all('SELECT id, username, role, department, expertise FROM users');
        const today = new Date().toISOString().split('T')[0];
        const report = [];

        for (const user of users) {
            // Ideas assigned to this user
            const assigned = await all(
                `SELECT id, text, ai_type, ai_category, para_type, code_stage, priority, related_area_id, created_at
                 FROM ideas WHERE assigned_to = ? ORDER BY priority DESC, created_at DESC`,
                [user.username]
            );

            // Waiting-for items delegated to this user
            const waiting = await all(
                `SELECT w.*, a.name as area_name FROM waiting_for w
                 LEFT JOIN areas a ON w.related_area_id = a.id
                 WHERE w.delegated_to = ? AND w.status = 'waiting'
                 ORDER BY w.due_date ASC`,
                [user.username]
            );

            // Today's checklist state
            const checklist = await all(
                `SELECT dc.*, i.text as idea_text, i.ai_type, i.ai_category, i.priority, i.para_type
                 FROM daily_checklist dc
                 LEFT JOIN ideas i ON dc.idea_id = i.id
                 WHERE dc.username = ? AND dc.date = ?`,
                [user.username, today]
            );

            // Stats
            const completedToday = checklist.filter(c => c.completed).length;
            const totalTasks = assigned.filter(i => ['Tarea', 'Proyecto', 'Delegacion'].includes(i.ai_type)).length;
            const byStage = { captured: 0, organized: 0, distilled: 0, expressed: 0 };
            assigned.forEach(i => { const s = i.code_stage || 'captured'; if (byStage.hasOwnProperty(s)) byStage[s]++; });

            // Group assigned by area
            const areas = await all('SELECT id, name, icon FROM areas WHERE status = "active"');
            const byArea = {};
            for (const a of areas) {
                const areaItems = assigned.filter(i => i.related_area_id == a.id);
                if (areaItems.length > 0) {
                    byArea[a.name] = { icon: a.icon, count: areaItems.length, items: areaItems };
                }
            }

            report.push({
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    department: user.department
                },
                stats: {
                    total_assigned: assigned.length,
                    total_tasks: totalTasks,
                    completed_today: completedToday,
                    checklist_total: checklist.length,
                    pending_waiting: waiting.length,
                    by_stage: byStage
                },
                assigned: assigned.slice(0, 20),
                waiting,
                checklist,
                by_area: byArea
            });
        }

        res.json(report);
    } catch (err) {
        console.error('Reportability error:', err);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

app.get('/api/checklist/:username', async (req, res) => {
    const { username } = req.params;
    const today = new Date().toISOString().split('T')[0];

    try {
        // Get all actionable ideas assigned to this user (Tarea, Proyecto, Delegacion)
        const assigned = await all(
            `SELECT id, text, ai_type, ai_category, para_type, code_stage, priority, related_area_id
             FROM ideas WHERE assigned_to = ? AND ai_type IN ('Tarea', 'Proyecto', 'Delegacion')
             ORDER BY CASE priority WHEN 'alta' THEN 1 WHEN 'media' THEN 2 WHEN 'baja' THEN 3 ELSE 4 END, created_at DESC`,
            [username]
        );

        // Auto-generate checklist entries for today if they don't exist
        for (const idea of assigned) {
            await run(
                `INSERT OR IGNORE INTO daily_checklist (username, idea_id, date) VALUES (?, ?, ?)`,
                [username, idea.id, today]
            );
        }

        // Get today's checklist with idea details
        const checklist = await all(
            `SELECT dc.id, dc.idea_id, dc.completed, dc.completed_at, dc.notes,
                    i.text, i.ai_type, i.ai_category, i.para_type, i.priority, i.related_area_id,
                    a.name as area_name, a.icon as area_icon
             FROM daily_checklist dc
             LEFT JOIN ideas i ON dc.idea_id = i.id
             LEFT JOIN areas a ON i.related_area_id = a.id
             WHERE dc.username = ? AND dc.date = ?
             ORDER BY dc.completed ASC,
                      CASE i.priority WHEN 'alta' THEN 1 WHEN 'media' THEN 2 WHEN 'baja' THEN 3 ELSE 4 END`,
            [username, today]
        );

        // Also get waiting-for items
        const waiting = await all(
            `SELECT w.*, a.name as area_name FROM waiting_for w
             LEFT JOIN areas a ON w.related_area_id = a.id
             WHERE w.delegated_to = ? AND w.status = 'waiting'`,
            [username]
        );

        res.json({ date: today, username, checklist, waiting });
    } catch (err) {
        console.error('Checklist error:', err);
        res.status(500).json({ error: 'Failed to generate checklist' });
    }
});

app.put('/api/checklist/:username/:ideaId/toggle', async (req, res) => {
    const { username, ideaId } = req.params;
    const today = new Date().toISOString().split('T')[0];

    try {
        const item = await get(
            'SELECT * FROM daily_checklist WHERE username = ? AND idea_id = ? AND date = ?',
            [username, ideaId, today]
        );

        if (!item) {
            await run(
                'INSERT INTO daily_checklist (username, idea_id, date, completed, completed_at) VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)',
                [username, ideaId, today]
            );
        } else {
            const newState = item.completed ? 0 : 1;
            await run(
                'UPDATE daily_checklist SET completed = ?, completed_at = ? WHERE id = ?',
                [newState, newState ? new Date().toISOString() : null, item.id]
            );
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to toggle checklist item' });
    }
});

app.get('/api/reportability/team-summary', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const users = await all('SELECT username, role, department FROM users');

        const summary = [];
        for (const u of users) {
            const totalAssigned = await get(
                'SELECT count(*) as c FROM ideas WHERE assigned_to = ?', [u.username]
            );
            const taskCount = await get(
                `SELECT count(*) as c FROM ideas WHERE assigned_to = ? AND ai_type IN ('Tarea', 'Proyecto', 'Delegacion')`,
                [u.username]
            );
            const completedToday = await get(
                'SELECT count(*) as c FROM daily_checklist WHERE username = ? AND date = ? AND completed = 1',
                [u.username, today]
            );
            const totalToday = await get(
                'SELECT count(*) as c FROM daily_checklist WHERE username = ? AND date = ?',
                [u.username, today]
            );
            const waitingCount = await get(
                `SELECT count(*) as c FROM waiting_for WHERE delegated_to = ? AND status = 'waiting'`,
                [u.username]
            );

            summary.push({
                username: u.username,
                role: u.role,
                department: u.department,
                total_assigned: totalAssigned?.c || 0,
                total_tasks: taskCount?.c || 0,
                completed_today: completedToday?.c || 0,
                checklist_total: totalToday?.c || 0,
                pending_waiting: waitingCount?.c || 0,
                completion_pct: totalToday?.c > 0 ? Math.round((completedToday?.c / totalToday?.c) * 100) : 0
            });
        }

        res.json(summary);
    } catch (err) {
        console.error('Team summary error:', err);
        res.status(500).json({ error: 'Failed to generate team summary' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// EXTERNAL API (OpenClaw / Webhooks)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── External Capture (simplified endpoint for OpenClaw) ─────────────────────
// POST /api/external/capture — capture an idea from external agent
// Body: { text, speaker?, source? }
// Requires: X-API-Key header
app.post('/api/external/capture', async (req, res) => {
    if (!req.isApiRequest) return res.status(401).json({ error: 'API key required' });

    const { text, speaker, source } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Text required' });

    try {
        const speakerUsername = speaker || req.apiKey.username;
        await run('INSERT INTO ideas (text, code_stage, created_by) VALUES (?, ?, ?)',
            [text.trim(), 'captured', speakerUsername]);
        const newIdea = await get('SELECT id, text FROM ideas ORDER BY id DESC LIMIT 1');

        const analysis = await processAndSaveIdea(newIdea.id, newIdea.text, speakerUsername);

        // Log source
        await run(`UPDATE inbox_log SET source = ? WHERE original_idea_id = ?`,
            [source || 'openclaw', newIdea.id]);

        if (analysis && analysis.split && analysis.savedIds) {
            const allIdeas = await all(
                `SELECT id, text, ai_type, ai_category, ai_action, ai_summary,
                code_stage, para_type, assigned_to, estimated_time, priority, created_by
                FROM ideas WHERE id IN (${analysis.savedIds.map(() => '?').join(',')})`,
                analysis.savedIds
            );
            res.json({
                success: true, split: true, count: analysis.count,
                ideas: allIdeas,
                message: `Capturado y separado en ${analysis.count} ideas.`
            });
        } else {
            const idea = await get(
                `SELECT id, text, ai_type, ai_category, ai_action, ai_summary,
                code_stage, para_type, assigned_to, estimated_time, priority, created_by
                FROM ideas WHERE id = ?`, [newIdea.id]
            );
            res.json({
                success: true, split: false, idea,
                message: `Capturado: ${idea.ai_summary || idea.text}`
            });
        }
    } catch (err) {
        console.error('External capture error:', err);
        res.status(500).json({ error: 'Capture failed' });
    }
});

// ─── External Query (read data for OpenClaw) ────────────────────────────────
// GET /api/external/summary — get a quick summary for the agent
app.get('/api/external/summary', async (req, res) => {
    if (!req.isApiRequest) return res.status(401).json({ error: 'API key required' });

    try {
        const { username } = req.query;
        const target = username || req.apiKey.username;

        const [stats, recentIdeas, pendingWaiting, todayChecklist] = await Promise.all([
            get('SELECT count(*) as c FROM ideas'),
            all(`SELECT id, text, ai_type, ai_category, ai_summary, para_type, priority, assigned_to, created_at
                 FROM ideas ORDER BY created_at DESC LIMIT 10`),
            all(`SELECT w.*, a.name as area_name FROM waiting_for w
                 LEFT JOIN areas a ON w.related_area_id = a.id
                 WHERE w.status = 'waiting' ORDER BY w.created_at DESC`),
            all(`SELECT dc.*, i.text as idea_text, i.priority
                 FROM daily_checklist dc LEFT JOIN ideas i ON dc.idea_id = i.id
                 WHERE dc.username = ? AND dc.date = ?`,
                [target, new Date().toISOString().split('T')[0]])
        ]);

        const completedToday = todayChecklist.filter(c => c.completed).length;

        res.json({
            total_ideas: stats.c,
            recent_ideas: recentIdeas,
            pending_delegations: pendingWaiting,
            today_checklist: {
                total: todayChecklist.length,
                completed: completedToday,
                pending: todayChecklist.length - completedToday,
                items: todayChecklist
            }
        });
    } catch (err) {
        console.error('External summary error:', err);
        res.status(500).json({ error: 'Summary failed' });
    }
});

// ─── External Digest (generate + return digest for OpenClaw) ─────────────────
app.get('/api/external/digest', async (req, res) => {
    if (!req.isApiRequest) return res.status(401).json({ error: 'API key required' });

    try {
        const ideas = await all("SELECT * FROM ideas WHERE created_at >= datetime('now', '-7 days') ORDER BY created_at DESC");
        const waitingFor = await all("SELECT * FROM waiting_for WHERE status = 'waiting'");
        const contextItems = await all('SELECT key, content FROM context_items');
        const contextString = contextItems.map(c => `${c.key}: ${c.content}`).join('\n');
        const areas = await all(`SELECT a.*,
            (SELECT count(*) FROM ideas WHERE related_area_id = a.id) as ideas_count,
            (SELECT count(*) FROM context_items WHERE related_area_id = a.id) as context_count
            FROM areas a WHERE a.status = 'active'`);

        const digest = await aiService.generateDigest(ideas, waitingFor, contextString, areas);
        res.json({ success: true, digest });
    } catch (err) {
        console.error('External digest error:', err);
        res.status(500).json({ error: 'Digest failed' });
    }
});

// ─── Webhook: Receive notifications from OpenClaw ────────────────────────────
// POST /api/webhook/openclaw — OpenClaw pushes events here
app.post('/api/webhook/openclaw', async (req, res) => {
    if (!req.isApiRequest) return res.status(401).json({ error: 'API key required' });

    const { event, payload } = req.body;
    if (!event) return res.status(400).json({ error: 'Event type required' });

    try {
        switch (event) {
            case 'task_completed': {
                // Mark a checklist item as complete from external
                const { username, idea_id } = payload || {};
                if (username && idea_id) {
                    const today = new Date().toISOString().split('T')[0];
                    await run('INSERT OR IGNORE INTO daily_checklist (username, idea_id, date) VALUES (?, ?, ?)',
                        [username, idea_id, today]);
                    await run(`UPDATE daily_checklist SET completed = 1, completed_at = CURRENT_TIMESTAMP
                        WHERE username = ? AND idea_id = ? AND date = ?`, [username, idea_id, today]);
                }
                res.json({ success: true, message: 'Task marked complete' });
                break;
            }
            case 'delegation_completed': {
                const { waiting_id } = payload || {};
                if (waiting_id) {
                    await run(`UPDATE waiting_for SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
                        [waiting_id]);
                }
                res.json({ success: true, message: 'Delegation resolved' });
                break;
            }
            case 'context_add': {
                const { key, content, category, para_type } = payload || {};
                if (key && content) {
                    await run(`INSERT OR REPLACE INTO context_items (key, content, category, para_type, code_stage, source)
                        VALUES (?, ?, ?, ?, 'organized', 'openclaw')`,
                        [key, content, category || 'business', para_type || 'resource']);
                }
                res.json({ success: true, message: 'Context saved' });
                break;
            }
            default:
                res.json({ success: true, message: `Event '${event}' acknowledged (no handler)` });
        }
    } catch (err) {
        console.error('Webhook error:', err);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// ─── API Key Management ──────────────────────────────────────────────────────
app.get('/api/keys', async (req, res) => {
    try {
        const keys = await all('SELECT id, name, username, permissions, active, last_used, created_at FROM api_keys');
        res.json(keys);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch API keys' });
    }
});

app.post('/api/keys', async (req, res) => {
    const { name, username } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });

    try {
        const crypto = require('crypto');
        const key = 'sb_' + crypto.randomBytes(24).toString('hex');
        await run('INSERT INTO api_keys (key, name, username, permissions) VALUES (?, ?, ?, ?)',
            [key, name, username || 'david', 'read,write']);
        res.json({ success: true, key, name });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create API key' });
    }
});

app.delete('/api/keys/:id', async (req, res) => {
    try {
        await run('DELETE FROM api_keys WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete API key' });
    }
});

// ─── Global Search API ─────────────────────────────────────────────────────
app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return res.status(400).json({ error: 'Query must be at least 2 characters' });

    try {
        const term = `%${q.trim()}%`;
        const [ideas, context, areas, waiting, projects] = await Promise.all([
            all(`SELECT id, text, ai_summary, ai_type, ai_category, para_type, code_stage, assigned_to, created_at as createdAt
                 FROM ideas WHERE text LIKE ? OR ai_summary LIKE ? OR ai_category LIKE ? ORDER BY created_at DESC LIMIT 20`,
                [term, term, term]),
            all(`SELECT id, key, content, category, para_type, code_stage
                 FROM context_items WHERE key LIKE ? OR content LIKE ? ORDER BY last_updated DESC LIMIT 20`,
                [term, term]),
            all(`SELECT id, name, description, icon, status FROM areas WHERE name LIKE ? OR description LIKE ? LIMIT 10`,
                [term, term]),
            all(`SELECT w.id, w.description, w.delegated_to, w.delegated_by, w.status, a.name as area_name
                 FROM waiting_for w LEFT JOIN areas a ON w.related_area_id = a.id
                 WHERE w.description LIKE ? LIMIT 10`, [term]),
            all(`SELECT id, name, description, status FROM projects WHERE name LIKE ? OR description LIKE ? LIMIT 10`,
                [term, term])
        ]);

        res.json({
            query: q.trim(),
            results: { ideas, context, areas, waiting, projects },
            counts: { ideas: ideas.length, context: context.length, areas: areas.length, waiting: waiting.length, projects: projects.length },
            total: ideas.length + context.length + areas.length + waiting.length + projects.length
        });
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ error: 'Search failed' });
    }
});

// ─── Analytics API (Trend Charts) ─────────────────────────────────────────
app.get('/api/stats/analytics', async (req, res) => {
    try {
        // Ideas per day (last 30 days)
        const ideasPerDay = await all(`SELECT date(created_at) as date, count(*) as count
            FROM ideas WHERE created_at >= datetime('now', '-30 days')
            GROUP BY date(created_at) ORDER BY date`);

        // Ideas per week (last 12 weeks)
        const ideasPerWeek = await all(`SELECT strftime('%Y-W%W', created_at) as week, count(*) as count
            FROM ideas WHERE created_at >= datetime('now', '-84 days')
            GROUP BY strftime('%Y-W%W', created_at) ORDER BY week`);

        // Completion rate per day (checklist)
        const completionPerDay = await all(`SELECT date,
            count(*) as total, sum(completed) as completed,
            ROUND(CAST(sum(completed) AS FLOAT) / count(*) * 100, 1) as rate
            FROM daily_checklist WHERE date >= date('now', '-30 days')
            GROUP BY date ORDER BY date`);

        // Most active areas
        const activeAreas = await all(`SELECT a.name, a.icon, count(i.id) as idea_count
            FROM areas a LEFT JOIN ideas i ON i.related_area_id = a.id
            WHERE a.status = 'active' GROUP BY a.id ORDER BY idea_count DESC`);

        // CODE pipeline flow
        const codeFlow = await all(`SELECT code_stage, count(*) as count FROM ideas GROUP BY code_stage`);

        // Ideas by type
        const byType = await all(`SELECT ai_type, count(*) as count FROM ideas WHERE ai_type IS NOT NULL GROUP BY ai_type ORDER BY count DESC`);

        // Ideas by priority
        const byPriority = await all(`SELECT priority, count(*) as count FROM ideas WHERE priority IS NOT NULL GROUP BY priority`);

        // Per-user productivity (last 30 days)
        const userProductivity = await all(`SELECT assigned_to as username, count(*) as ideas_created,
            sum(CASE WHEN code_stage = 'expressed' THEN 1 ELSE 0 END) as expressed,
            sum(CASE WHEN code_stage = 'distilled' THEN 1 ELSE 0 END) as distilled
            FROM ideas WHERE assigned_to IS NOT NULL AND created_at >= datetime('now', '-30 days')
            GROUP BY assigned_to`);

        res.json({ ideasPerDay, ideasPerWeek, completionPerDay, activeAreas, codeFlow, byType, byPriority, userProductivity });
    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({ error: 'Analytics failed' });
    }
});

// ─── Notifications Check API (Urgent Tasks) ───────────────────────────────
app.get('/api/notifications/check', async (req, res) => {
    try {
        const username = req.query.username || (req.session.user ? req.session.user.username : null);

        // High priority uncompleted tasks
        const urgentTasks = await all(`SELECT i.id, i.text, i.ai_summary, i.priority, i.assigned_to, a.name as area_name
            FROM ideas i LEFT JOIN areas a ON i.related_area_id = a.id
            WHERE i.priority = 'alta' AND i.code_stage NOT IN ('expressed')
            ${username ? 'AND i.assigned_to = ?' : ''}
            ORDER BY i.created_at DESC LIMIT 10`,
            username ? [username] : []);

        // Overdue delegations (3+ days old)
        const overdueDelegations = await all(`SELECT w.id, w.description, w.delegated_to, w.delegated_by, w.created_at, a.name as area_name
            FROM waiting_for w LEFT JOIN areas a ON w.related_area_id = a.id
            WHERE w.status = 'waiting' AND w.created_at <= datetime('now', '-3 days')
            ${username ? 'AND w.delegated_to = ?' : ''}
            ORDER BY w.created_at ASC LIMIT 10`,
            username ? [username] : []);

        // Unprocessed ideas (captured > 24h ago)
        const staleCaptures = await all(`SELECT id, text, created_at FROM ideas
            WHERE code_stage = 'captured' AND created_at <= datetime('now', '-1 day')
            ORDER BY created_at ASC LIMIT 5`);

        // Low-confidence items needing review
        const needsReview = await all(`SELECT id, text, ai_summary, ai_confidence, ai_type FROM ideas
            WHERE needs_review = 1 ORDER BY created_at DESC LIMIT 5`);

        const total = urgentTasks.length + overdueDelegations.length + staleCaptures.length + needsReview.length;

        res.json({
            total,
            urgent_tasks: urgentTasks,
            overdue_delegations: overdueDelegations,
            stale_captures: staleCaptures,
            needs_review: needsReview
        });
    } catch (err) {
        console.error('Notifications error:', err);
        res.status(500).json({ error: 'Notifications check failed' });
    }
});

// ─── Export API ────────────────────────────────────────────────────────────
app.get('/api/export', async (req, res) => {
    try {
        const [ideas, context, areas, waitingFor, projects, users] = await Promise.all([
            all('SELECT * FROM ideas ORDER BY created_at DESC'),
            all('SELECT * FROM context_items ORDER BY para_type, category'),
            all('SELECT * FROM areas'),
            all('SELECT * FROM waiting_for'),
            all('SELECT * FROM projects'),
            all('SELECT id, username, role, department, expertise FROM users')
        ]);

        const exportData = {
            version: '1.0',
            exported_at: new Date().toISOString(),
            source: 'SecondBrain Dashboard',
            data: { ideas, context, areas, waitingFor, projects, users }
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=secondbrain_export_${new Date().toISOString().split('T')[0]}.json`);
        res.json(exportData);
    } catch (err) {
        console.error('Export error:', err);
        res.status(500).json({ error: 'Export failed' });
    }
});

// ─── Import API ────────────────────────────────────────────────────────────
app.post('/api/import', async (req, res) => {
    try {
        const { data } = req.body;
        if (!data) return res.status(400).json({ error: 'No data provided' });

        let imported = { ideas: 0, context: 0, areas: 0, waitingFor: 0 };

        // Import areas first (other items may reference them)
        if (data.areas && Array.isArray(data.areas)) {
            for (const a of data.areas) {
                await run('INSERT OR IGNORE INTO areas (name, description, icon, status) VALUES (?, ?, ?, ?)',
                    [a.name, a.description, a.icon || '📂', a.status || 'active']);
                imported.areas++;
            }
        }

        // Import ideas
        if (data.ideas && Array.isArray(data.ideas)) {
            for (const i of data.ideas) {
                await run(`INSERT INTO ideas (text, ai_type, ai_category, ai_action, ai_summary,
                    code_stage, para_type, related_area_id, assigned_to, priority, created_by)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [i.text, i.ai_type, i.ai_category, i.ai_action, i.ai_summary,
                     i.code_stage || 'captured', i.para_type, i.related_area_id,
                     i.assigned_to, i.priority, i.created_by]);
                imported.ideas++;
            }
        }

        // Import context
        if (data.context && Array.isArray(data.context)) {
            for (const c of data.context) {
                await run(`INSERT INTO context_items (key, content, category, para_type, code_stage, source)
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [c.key, c.content, c.category, c.para_type || 'resource', c.code_stage || 'organized', c.source || 'import']);
                imported.context++;
            }
        }

        // Import waiting-for
        if (data.waitingFor && Array.isArray(data.waitingFor)) {
            for (const w of data.waitingFor) {
                await run(`INSERT INTO waiting_for (description, delegated_to, delegated_by, status)
                    VALUES (?, ?, ?, ?)`,
                    [w.description, w.delegated_to, w.delegated_by, w.status || 'waiting']);
                imported.waitingFor++;
            }
        }

        res.json({ success: true, imported });
    } catch (err) {
        console.error('Import error:', err);
        res.status(500).json({ error: 'Import failed' });
    }
});

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

app.listen(PORT, () => {
    console.log(`\n  ╔══════════════════════════════════════════╗`);
    console.log(`  ║   VALUE STRATEGY CONSULTING HUB          ║`);
    console.log(`  ║   Running at http://localhost:${PORT}        ║`);
    console.log(`  ║   Password: ${AUTH_PASSWORD}                       ║`);
    console.log(`  ╚══════════════════════════════════════════╝\n`);
});
