const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const log = require('../helpers/logger');
const { run, get, all } = require('../database');
const { formatFileSize, loadTags, saveTags } = require('../helpers/utils');
const { processAndSaveIdea } = require('../helpers/ideaProcessor');
const { denyRole } = require('../middleware/authorize');
const ai = require('../services/ai');

const blockConsultor = denyRole('consultor');
const router = express.Router();

// ─── Directories ─────────────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, '..', '..', '..', 'knowledge');
const VOICE_DIR = path.join(__dirname, '..', 'public', 'voice-notes');
const ARCHIVOS_DIR = UPLOADS_DIR;
const DINAMICAS_DIR = path.join(UPLOADS_DIR, 'dinamicas');
const DATA_DIR = path.join(__dirname, '..', 'data');
const TAGS_FILE = path.join(DATA_DIR, 'tags.json');

// ─── Auto-generate dynamic page from PDF ────────────────────────────────────
async function generateDynamicFromPdf(filePath, basename) {
    try {
        const pdfParse = require('pdf-parse');
        const buffer = fs.readFileSync(filePath);
        const { text } = await pdfParse(buffer);

        if (!text || text.trim().length < 100) {
            log.info('PDF too short for dynamic page', { pdf: basename });
            return;
        }

        const html = await ai.generateDynamicPage(text, basename);
        if (!html) {
            log.warn('AI returned no HTML for dynamic page', { pdf: basename });
            return;
        }

        const dirPath = path.join(DINAMICAS_DIR, basename);
        if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

        const htmlName = basename.toLowerCase().replace(/\s+/g, '') + '.html';
        fs.writeFileSync(path.join(dirPath, htmlName), html, 'utf-8');
        log.info('Dynamic page generated from PDF', { pdf: basename, dir: basename, html: htmlName });
    } catch (err) {
        log.error('Dynamic page generation failed', { pdf: basename, error: err.message });
    }
}

// ─── Multer Config ───────────────────────────────────────────────────────────
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

// ─── Multer Error Handler ────────────────────────────────────────────────────
function handleMulterError(err, req, res, _next) {
    if (err instanceof multer.MulterError) {
        const messages = {
            LIMIT_FILE_SIZE: 'El archivo excede el tamaño máximo permitido (50MB)',
            LIMIT_UNEXPECTED_FILE: 'Campo de archivo inesperado',
        };
        log.warn('Upload rejected', { code: err.code, path: req.path });
        return res.status(400).json({ error: messages[err.code] || `Error de upload: ${err.code}` });
    }
    if (err && err.message === 'Tipo de archivo no permitido') {
        log.warn('File type rejected', { path: req.path, originalname: req.file?.originalname });
        return res.status(400).json({ error: 'Tipo de archivo no permitido. Solo se aceptan: .md, .pdf, .txt, .docx' });
    }
    // Catch-all: filesystem errors, permission errors, etc.
    log.error('Upload error', { error: err.message, code: err.code, path: req.path });
    res.status(500).json({ error: `Error al subir archivo: ${err.message}` });
}

// ─── Voice Upload ────────────────────────────────────────────────────────────
router.post('/api/ideas/voice', blockConsultor, (req, res, next) => {
    upload.single('audio')(req, res, (err) => {
        if (err) return handleMulterError(err, req, res, next);
        next();
    });
}, async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No audio file provided' });
        const textToSave = (req.body.text || 'Nota de voz').trim();
        const createdBy = req.session.user ? req.session.user.username : null;

        const result = await run('INSERT INTO ideas (text, audio_url, code_stage, created_by) VALUES (?, ?, ?, ?)', [
            textToSave,
            `/voice-notes/${req.file.filename}`,
            'captured',
            createdBy
        ]);
        let newIdea = await get('SELECT id, text, audio_url as audioUrl, created_at as createdAt, status FROM ideas WHERE id = ?', [result.lastID]);

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

// ─── File Upload ─────────────────────────────────────────────────────────────
router.post('/api/upload', blockConsultor, (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) return handleMulterError(err, req, res, next);
        next();
    });
}, (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file provided' });
        const rawTags = req.body.tags || '';
        const tagList = rawTags.split(',').map(t => t.trim()).filter(t => t.length > 0);
        if (tagList.length > 0) {
            const tags = loadTags(TAGS_FILE);
            tags[req.file.filename] = tagList;
            saveTags(TAGS_FILE, tags);
        }
        const ext = path.extname(req.file.filename).toLowerCase();
        res.json({
            success: true,
            filename: req.file.filename,
            size: formatFileSize(req.file.size),
            tags: tagList
        });

        // Auto-generate interactive page from PDF (fire and forget)
        if (ext === '.pdf') {
            const filePath = path.join(ARCHIVOS_DIR, req.file.filename);
            const basename = path.basename(req.file.filename, ext);
            generateDynamicFromPdf(filePath, basename);
        }
    } catch (err) {
        log.error('Upload error', { error: err.message });
        res.status(500).json({ error: 'Upload failed' });
    }
});

// ─── Delete File ────────────────────────────────────────────────────────────
router.delete('/api/archivo/:filename', (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Authentication required' });
    if (!['admin', 'manager'].includes(user.role)) {
        return res.status(403).json({ error: 'Solo admin o manager pueden eliminar archivos' });
    }

    const filename = req.params.filename;
    const filePath = path.join(ARCHIVOS_DIR, filename);

    // Safety: prevent path traversal
    if (!filePath.startsWith(ARCHIVOS_DIR)) {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        // Delete the file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        } else {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }

        // Delete associated dynamic page folder
        const ext = path.extname(filename).toLowerCase();
        const basename = path.basename(filename, ext);
        const dynamicDir = path.join(DINAMICAS_DIR, basename);
        if (fs.existsSync(dynamicDir)) {
            fs.rmSync(dynamicDir, { recursive: true, force: true });
            log.info('Dynamic page deleted', { dir: basename });
        }

        // Remove tags
        const tags = loadTags(TAGS_FILE);
        if (tags[filename]) {
            delete tags[filename];
            saveTags(TAGS_FILE, tags);
        }

        log.info('File deleted', { filename, user: user.username });
        res.json({ success: true });
    } catch (err) {
        log.error('File delete error', { error: err.message });
        res.status(500).json({ error: 'Error al eliminar archivo' });
    }
});

module.exports = router;
