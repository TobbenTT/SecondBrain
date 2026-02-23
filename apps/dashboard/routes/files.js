const express = require('express');
const path = require('path');
const fs = require('fs');
const log = require('../helpers/logger');
const { marked } = require('marked');
const { safePath, formatFileSize, getFilesRecursively, findDynamicPage, loadTags, saveTags } = require('../helpers/utils');

const router = express.Router();

const UPLOADS_DIR = path.join(__dirname, '..', '..', '..', 'knowledge');
const ARCHIVOS_DIR = UPLOADS_DIR;
const DINAMICAS_DIR = path.join(UPLOADS_DIR, 'dinamicas');
const SKILLS_DIR = path.join(__dirname, '..', '..', '..', 'core', 'skills');
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
                        tags: tags[dir.name] || ['guia', 'sistema']
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

    if (ext === '.pdf') {
        const dynamicPage = findDynamicPage(filename, DINAMICAS_DIR);
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

// ─── Skill Documents API ────────────────────────────────────────────────────

const { run, all } = require('../database');

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

module.exports = router;
