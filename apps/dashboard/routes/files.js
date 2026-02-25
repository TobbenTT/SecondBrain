const express = require('express');
const path = require('path');
const fs = require('fs');
const log = require('../helpers/logger');
const { marked } = require('marked');
const { safePath, formatFileSize, getFilesRecursively, findDynamicPage, loadTags, saveTags } = require('../helpers/utils');
const { requireAdmin } = require('../middleware/authorize');
const simpleGit = require('simple-git');

const router = express.Router();

const UPLOADS_DIR = path.join(__dirname, '..', '..', '..', 'knowledge');
const ARCHIVOS_DIR = UPLOADS_DIR;
const DINAMICAS_DIR = path.join(UPLOADS_DIR, 'dinamicas');
const SKILLS_DIR = path.join(__dirname, '..', '..', '..', 'core', 'skills');
const REPO_ROOT = path.join(__dirname, '..', '..', '..');
const git = simpleGit(REPO_ROOT);
const DATA_DIR = path.join(__dirname, '..', 'data');
const TAGS_FILE = path.join(DATA_DIR, 'tags.json');

// ─── Files API ───────────────────────────────────────────────────────────────

router.get('/api/archivos', (req, res) => {
    try {
        const tags = loadTags(TAGS_FILE);
        let fileList = [];

        if (fs.existsSync(ARCHIVOS_DIR)) {
            const files = fs.readdirSync(ARCHIVOS_DIR, { withFileTypes: true });
            fileList = files
                .filter(f => f.isFile())
                .map(f => {
                    const filePath = path.join(ARCHIVOS_DIR, f.name);
                    const stats = fs.statSync(filePath);
                    const ext = path.extname(f.name).toLowerCase();
                    const dynamicPage = findDynamicPage(f.name, DINAMICAS_DIR);
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

        if (fs.existsSync(DINAMICAS_DIR)) {
            const dynamicFolders = fs.readdirSync(DINAMICAS_DIR, { withFileTypes: true })
                .filter(d => d.isDirectory() && d.name !== 'Proximamente');

            dynamicFolders.forEach(dir => {
                const isLinked = fileList.some(f => f.hasDynamic && f.dynamicUrl.includes(encodeURIComponent(dir.name)));

                if (!isLinked) {
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
                        tags: tags[dir.name] || []
                    });
                }
            });
        }

        res.json(fileList);
    } catch (err) {
        log.error('Error reading Archivos', { error: err.message });
        res.status(500).json({ error: 'Failed to read Archivos directory' });
    }
});

router.get('/archivo/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = safePath(ARCHIVOS_DIR, filename);
    if (!filePath) return res.status(403).send('Access denied');

    if (!fs.existsSync(filePath)) return res.status(404).render('index');

    const ext = path.extname(filename).toLowerCase();
    const stats = fs.statSync(filePath);

    // PDFs serve directly — interactive versions are linked via the file list UI
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

router.get('/archivos-file/:filename', (req, res) => {
    const filePath = safePath(ARCHIVOS_DIR, req.params.filename);
    if (!filePath) return res.status(403).send('Access denied');
    if (fs.existsSync(filePath)) res.sendFile(filePath);
    else res.status(404).send('File not found');
});

router.get('/descargar/:filename', (req, res) => {
    const filePath = safePath(ARCHIVOS_DIR, req.params.filename);
    if (!filePath) return res.status(403).send('Access denied');
    if (fs.existsSync(filePath)) res.download(filePath);
    else res.status(404).send('File not found');
});

router.post('/api/upload', (req, res, next) => { req._uploadType = 'file'; next(); });

router.post('/api/tags', (req, res) => {
    try {
        const { filename, tags: newTags } = req.body;
        if (!filename) return res.status(400).json({ error: 'Filename required' });
        const allTags = loadTags(TAGS_FILE);
        allTags[filename] = (newTags || []).map(t => t.trim()).filter(t => t.length > 0);
        saveTags(TAGS_FILE, allTags);
        res.json({ success: true, tags: allTags[filename] });
    } catch (_err) {
        res.status(500).json({ error: 'Failed to save tags' });
    }
});

// ─── Skills API ──────────────────────────────────────────────────────────────

router.get('/api/skills', async (req, res) => {
    try {
        const skills = getFilesRecursively(SKILLS_DIR);
        res.json(skills);
    } catch (err) {
        log.error('Skills error', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch skills' });
    }
});

router.get('/api/skills/content', async (req, res) => {
    try {
        const { file } = req.query;
        if (!file) return res.status(400).json({ error: 'File path required' });

        const fullPath = path.resolve(SKILLS_DIR, file);
        if (!fullPath.startsWith(path.resolve(SKILLS_DIR))) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        const content = fs.readFileSync(fullPath, 'utf-8');
        res.json({ content });
    } catch (err) {
        log.error('Skill content error', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});

// ─── Skill Edit API (Admin Only) ────────────────────────────────────────────

router.put('/api/skills/content', requireAdmin, async (req, res) => {
    try {
        const { file, content } = req.body;

        if (!file || typeof content !== 'string') {
            return res.status(400).json({ error: 'file and content are required' });
        }

        const fullPath = path.resolve(SKILLS_DIR, file);
        if (!fullPath.startsWith(path.resolve(SKILLS_DIR))) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        fs.writeFileSync(fullPath, content, 'utf-8');
        log.info('Skill updated', { file, user: req.session.user.username });

        const relativePath = path.relative(REPO_ROOT, fullPath).replace(/\\/g, '/');
        const skillName = path.basename(file, '.md').replace(/-/g, ' ');

        try {
            await git.add(relativePath);
            await git.commit(`Skill updated: ${skillName}`);
            await git.push('origin', 'main');
            log.info('Git push successful', { file: relativePath });
            res.json({ success: true, message: 'Skill guardado y publicado en GitHub' });
        } catch (gitErr) {
            log.error('Git operation failed', { error: gitErr.message, file: relativePath });
            res.json({
                success: true,
                warning: 'Skill guardado localmente, pero no se pudo publicar en GitHub: ' + gitErr.message
            });
        }

    } catch (err) {
        log.error('Skill update error', { error: err.message });
        res.status(500).json({ error: 'Failed to update skill' });
    }
});

// ─── Skill Documents API ────────────────────────────────────────────────────

const { run, get, all } = require('../database');
const multer = require('multer');

const SKILL_DOCS_DIR = path.join(UPLOADS_DIR, 'skill-docs');
if (!fs.existsSync(SKILL_DOCS_DIR)) fs.mkdirSync(SKILL_DOCS_DIR, { recursive: true });

const skillDocUpload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, SKILL_DOCS_DIR),
        filename: (_req, file, cb) => {
            const original = Buffer.from(file.originalname, 'latin1').toString('utf8');
            cb(null, `${Date.now()}_${original}`);
        }
    }),
    fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (['.md', '.pdf', '.txt', '.docx'].includes(ext)) cb(null, true);
        else cb(new Error('Tipo de archivo no permitido. Solo: .md, .pdf, .txt, .docx'), false);
    },
    limits: { fileSize: 50 * 1024 * 1024 }
});

router.get('/api/skill-documents', async (req, res) => {
    const { skill } = req.query;
    if (!skill) return res.status(400).json({ error: 'skill parameter required' });

    try {
        const docs = await all(
            'SELECT * FROM skill_documents WHERE skill_path = ? ORDER BY created_at DESC',
            [skill]
        );
        res.json(docs);
    } catch (err) {
        log.error('Skill documents fetch error', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch skill documents' });
    }
});

router.post('/api/skill-documents', async (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Authentication required' });
    if (!['admin', 'manager'].includes(user.role)) {
        return res.status(403).json({ error: 'Only admin or manager can link documents' });
    }

    const { skill_path, document_name, document_url, description } = req.body;
    if (!skill_path || !document_name) {
        return res.status(400).json({ error: 'skill_path and document_name required' });
    }

    try {
        const result = await run(
            'INSERT INTO skill_documents (skill_path, document_name, document_url, description, created_by) VALUES (?, ?, ?, ?, ?)',
            [skill_path, document_name, document_url || null, description || null, user.username]
        );
        res.json({ id: result.lastID, skill_path, document_name });
    } catch (err) {
        log.error('Skill document create error', { error: err.message });
        res.status(500).json({ error: 'Failed to create skill document' });
    }
});

// ─── Upload file to skill ───────────────────────────────────────────────────

router.post('/api/skill-documents/upload', (req, res, next) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Authentication required' });
    if (!['admin', 'manager'].includes(user.role)) {
        return res.status(403).json({ error: 'Only admin or manager can upload documents' });
    }
    next();
}, skillDocUpload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file provided' });
        const { skill_path, description } = req.body;
        if (!skill_path) return res.status(400).json({ error: 'skill_path required' });

        const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
        const result = await run(
            'INSERT INTO skill_documents (skill_path, document_name, file_path, description, created_by) VALUES (?, ?, ?, ?, ?)',
            [skill_path, originalName, req.file.filename, description || null, req.session.user.username]
        );

        log.info('Skill document uploaded', { id: result.lastID, skill_path, file: req.file.filename, user: req.session.user.username });
        res.json({ id: result.lastID, document_name: originalName, file_path: req.file.filename });
    } catch (err) {
        log.error('Skill document upload error', { error: err.message });
        res.status(500).json({ error: 'Failed to upload document' });
    }
});

// ─── Download skill document ────────────────────────────────────────────────

router.get('/api/skill-documents/download/:id', async (req, res) => {
    try {
        const doc = await get('SELECT * FROM skill_documents WHERE id = ?', [req.params.id]);
        if (!doc) return res.status(404).json({ error: 'Document not found' });
        if (!doc.file_path) return res.status(404).json({ error: 'No file associated' });

        const fullPath = path.join(SKILL_DOCS_DIR, doc.file_path);
        if (!fs.existsSync(fullPath)) return res.status(404).json({ error: 'File not found on disk' });

        res.download(fullPath, doc.document_name);
    } catch (err) {
        log.error('Skill document download error', { error: err.message });
        res.status(500).json({ error: 'Failed to download document' });
    }
});

// ─── Delete skill document ──────────────────────────────────────────────────

router.delete('/api/skill-documents/:id', async (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Authentication required' });
    if (!['admin', 'manager'].includes(user.role)) {
        return res.status(403).json({ error: 'Only admin or manager can delete documents' });
    }

    try {
        const doc = await get('SELECT * FROM skill_documents WHERE id = ?', [req.params.id]);
        if (!doc) return res.status(404).json({ error: 'Document not found' });

        // Delete file from disk if exists
        if (doc.file_path) {
            const fullPath = path.join(SKILL_DOCS_DIR, doc.file_path);
            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        }

        await run('DELETE FROM skill_documents WHERE id = ?', [req.params.id]);
        log.info('Skill document deleted', { id: req.params.id, user: user.username });
        res.json({ success: true });
    } catch (err) {
        log.error('Skill document delete error', { error: err.message });
        res.status(500).json({ error: 'Failed to delete document' });
    }
});

module.exports = router;
