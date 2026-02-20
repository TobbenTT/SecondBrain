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
const port = process.env.PORT || 3000;

// ─── Config ────────────────────────────────────────────────────────────────────
const ARCHIVOS_DIR = path.join(__dirname, '..', 'Archivos');
const DINAMICAS_DIR = path.join(ARCHIVOS_DIR, 'dinamicas');
const DATA_DIR = path.join(__dirname, 'data');
const VOICE_DIR = path.join(DATA_DIR, 'voice_notes');
const TAGS_FILE = path.join(DATA_DIR, 'tags.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const SKILLS_DIR = path.join(__dirname, '..', '..', 'orchestrator beta', 'skills');

// Internal password
const AUTH_PASSWORD = 'vsc2026';

// ─── Ensure data files ─────────────────────────────────────────────────────────
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(VOICE_DIR)) fs.mkdirSync(VOICE_DIR, { recursive: true });
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
    secret: 'vsc-hub-internal-2026',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

// ─── Auth Middleware ────────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next();
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
        if (!fs.existsSync(ARCHIVOS_DIR)) return res.json([]);

        const tags = loadTags();
        const files = fs.readdirSync(ARCHIVOS_DIR, { withFileTypes: true });
        const fileList = files
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
        const ideas = await all('SELECT id, text, audio_url as audioUrl, created_at as createdAt, status, ai_type, ai_category, ai_action, ai_summary FROM ideas ORDER BY created_at DESC');
        res.json(ideas);
    } catch (err) {
        console.error('DB Error:', err);
        res.status(500).json({ error: 'Failed to fetch ideas' });
    }
});

app.post('/api/ideas', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) return res.status(400).json({ error: 'Text required' });

        await run('INSERT INTO ideas (text) VALUES (?)', [text.trim()]);
        let newIdea = await get('SELECT id, text, audio_url as audioUrl, created_at as createdAt, status FROM ideas ORDER BY id DESC LIMIT 1');

        // Auto-Process with AI
        await processAndSaveIdea(newIdea.id, newIdea.text);

        // Fetch updated idea
        newIdea = await get('SELECT id, text, audio_url as audioUrl, created_at as createdAt, status, ai_type, ai_category, ai_action, ai_summary FROM ideas WHERE id = ?', [newIdea.id]);

        res.json(newIdea);
    } catch (err) {
        console.error('DB Error:', err);
        res.status(500).json({ error: 'Failed to save idea' });
    }
});

app.post('/api/ideas/voice', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No audio file provided' });
        const textToSave = (req.body.text || 'Nota de voz').trim();

        await run('INSERT INTO ideas (text, audio_url) VALUES (?, ?)', [
            textToSave,
            `/voice-notes/${req.file.filename}`
        ]);
        let newIdea = await get('SELECT id, text, audio_url as audioUrl, created_at as createdAt, status FROM ideas ORDER BY id DESC LIMIT 1');

        // Auto-Process (Event with placeholder text, maybe AI categorizes it as Audio)
        await processAndSaveIdea(newIdea.id, newIdea.text);

        // Fetch updated
        newIdea = await get('SELECT id, text, audio_url as audioUrl, created_at as createdAt, status, ai_type, ai_category, ai_action, ai_summary FROM ideas WHERE id = ?', [newIdea.id]);

        res.json(newIdea);
    } catch (err) {
        console.error('Voice upload error:', err);
        res.status(500).json({ error: 'Failed to save voice note' });
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
// ─── AI Helper ─────────────────────────────────────────────────────────────────
async function processAndSaveIdea(ideaId, text) {
    try {
        // Fetch known context to seed the processing
        const contextItems = await all('SELECT key, content FROM context_items');
        let contextString = contextItems.map(c => `${c.key}: ${c.content}`).join('\n');

        const analysis = await aiService.processIdea(text, contextString);

        // Save analysis to DB if ideaId is present and no error
        if (ideaId && analysis && analysis.tipo !== 'Error') {
            await run(`UPDATE ideas SET 
                ai_type = ?, 
                ai_category = ?, 
                ai_action = ?, 
                ai_summary = ?, 
                status = 'processed' 
                WHERE id = ?`,
                [analysis.tipo, analysis.categoria, analysis.accion_inmediata, analysis.resumen, ideaId]
            );
        }
        return analysis;
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
        const contextItems = await all('SELECT key, content FROM context_items');

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

        // 2. Add Persistent Context (Memory)
        contextPrefix = "MEMORIA A LARGO PLAZO (Contexto del Usuario):\n";
        contextItems.forEach(item => {
            contextPrefix += `- ${item.key}: ${item.content}\n`;
        });

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
        const analysis = await processAndSaveIdea(ideaId, text);
        if (!analysis) return res.status(500).json({ error: 'Processing failed' });
        res.json(analysis);
    } catch (err) {
        console.error("AI Algo Error:", err);
        res.status(500).json({ error: 'Processing failed' });
    }
});

app.get('/api/ai/context', async (req, res) => {
    try {
        const items = await all('SELECT * FROM context_items ORDER BY category, key');
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch context' });
    }
});

app.post('/api/ai/context', async (req, res) => {
    const { key, content, category } = req.body;
    try {
        await run('INSERT INTO context_items (key, content, category) VALUES (?, ?, ?)', [key, content, category]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save context' });
    }
});

app.put('/api/ai/context/:id', async (req, res) => {
    const { key, content, category } = req.body;
    const { id } = req.params;
    try {
        await run('UPDATE context_items SET key = ?, content = ?, category = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
            [key, content, category, id]);
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

// ─── Projects API ──────────────────────────────────────────────────────────────
app.get('/api/projects', (req, res) => {
    try {
        const data = fs.readFileSync(PROJECTS_FILE, 'utf-8');
        res.json(JSON.parse(data));
    } catch { res.json([]); }
});

app.post('/api/projects', (req, res) => {
    try {
        const { name, description, url, icon, status, tech } = req.body;
        if (!name || !url) return res.status(400).json({ error: 'Name and URL required' });

        const data = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));
        const project = {
            id: Date.now().toString(),
            name: name.trim(),
            description: (description || '').trim(),
            url: url.trim(),
            icon: icon || '📦',
            status: status || 'active',
            tech: (tech || []).map(t => t.trim()).filter(t => t.length > 0),
            createdAt: new Date().toISOString()
        };
        data.push(project);
        fs.writeFileSync(PROJECTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
        res.json(project);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save project' });
    }
});

app.delete('/api/projects/:id', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));
        const filtered = data.filter(p => p.id !== req.params.id);
        fs.writeFileSync(PROJECTS_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
        res.json({ deleted: true });
    } catch { res.status(500).json({ error: 'Failed to delete project' }); }
});

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

app.listen(port, () => {
    console.log(`\n  ╔══════════════════════════════════════════╗`);
    console.log(`  ║   VALUE STRATEGY CONSULTING HUB          ║`);
    console.log(`  ║   Running at http://localhost:${port}        ║`);
    console.log(`  ║   Password: ${AUTH_PASSWORD}                       ║`);
    console.log(`  ╚══════════════════════════════════════════╝\n`);
});
