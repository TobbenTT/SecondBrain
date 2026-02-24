const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const log = require('../helpers/logger');
const { run, get, all } = require('../database');
const { formatFileSize, loadTags, saveTags } = require('../helpers/utils');
const { processAndSaveIdea } = require('../helpers/ideaProcessor');
const { denyRole } = require('../middleware/authorize');

const blockConsultor = denyRole('consultor');
const router = express.Router();

// ─── Directories ─────────────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, '..', '..', '..', 'knowledge');
const VOICE_DIR = path.join(__dirname, '..', 'public', 'voice-notes');
const ARCHIVOS_DIR = UPLOADS_DIR;
const DATA_DIR = path.join(__dirname, '..', 'data');
const TAGS_FILE = path.join(DATA_DIR, 'tags.json');

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

// ─── Voice Upload ────────────────────────────────────────────────────────────
router.post('/api/ideas/voice', blockConsultor, upload.single('audio'), async (req, res) => {
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
router.post('/api/upload', blockConsultor, upload.single('file'), (req, res) => {
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

module.exports = router;
