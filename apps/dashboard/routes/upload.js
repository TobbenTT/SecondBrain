const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const log = require('../helpers/logger');
const { run, get, all } = require('../database');
const { formatFileSize, loadTags, saveTags } = require('../helpers/utils');
const { processAndSaveIdea } = require('../helpers/ideaProcessor');
const { denyRole } = require('../middleware/authorize');
const ai = require('../services/ai');

const blockConsultor = denyRole('consultor');
const router = express.Router();

// ─── Magic Number Validation ────────────────────────────────────────────────
// Validates file content matches expected type (prevents extension spoofing)
const FILE_SIGNATURES = {
    '.pdf':  [Buffer.from([0x25, 0x50, 0x44, 0x46])],           // %PDF
    '.docx': [Buffer.from([0x50, 0x4B, 0x03, 0x04])],           // PK.. (ZIP)
    '.xlsx': [Buffer.from([0x50, 0x4B, 0x03, 0x04])],           // PK.. (ZIP)
    '.png':  [Buffer.from([0x89, 0x50, 0x4E, 0x47])],           // .PNG
    '.jpg':  [Buffer.from([0xFF, 0xD8, 0xFF])],                  // JFIF/Exif
    '.jpeg': [Buffer.from([0xFF, 0xD8, 0xFF])],
    '.gif':  [Buffer.from('GIF87a'), Buffer.from('GIF89a')],
    '.webp': [Buffer.from('RIFF')],                               // RIFF (check WEBP at offset 8)
};

function validateMagicNumber(filePath, ext) {
    const signatures = FILE_SIGNATURES[ext];
    if (!signatures) return true;  // No signature check for .md, .txt (text files)
    try {
        const fd = fs.openSync(filePath, 'r');
        const buf = Buffer.alloc(12);
        fs.readSync(fd, buf, 0, 12, 0);
        fs.closeSync(fd);
        return signatures.some(sig => buf.subarray(0, sig.length).equals(sig));
    } catch {
        return false;
    }
}

// ─── Directories ─────────────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, '..', '..', '..', 'knowledge');
const VOICE_DIR = path.join(__dirname, '..', 'public', 'voice-notes');
const ARCHIVOS_DIR = UPLOADS_DIR;
const DINAMICAS_DIR = path.join(UPLOADS_DIR, 'dinamicas');
const TRASH_DIR = path.join(UPLOADS_DIR, '.trash');
const DATA_DIR = path.join(__dirname, '..', 'data');
const TAGS_FILE = path.join(DATA_DIR, 'tags.json');

// Ensure trash directory exists
if (!fs.existsSync(TRASH_DIR)) fs.mkdirSync(TRASH_DIR, { recursive: true });

// ─── File hash for dedup detection ──────────────────────────────────────────
function computeFileHash(filePath) {
    const buffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

// ─── Register file in DB ────────────────────────────────────────────────────
async function registerFileInDb(file, originalName, uploadedBy, hasDynamic) {
    try {
        const filePath = path.join(ARCHIVOS_DIR, file.filename);
        const hash = computeFileHash(filePath);
        await run(
            'INSERT INTO archivos (filename, original_name, size, mime_type, hash, has_dynamic, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [file.filename, originalName, file.size, file.mimetype, hash, hasDynamic, uploadedBy]
        );
        log.info('File registered in DB', { filename: file.filename, hash: hash.substring(0, 12), user: uploadedBy });
    } catch (err) {
        log.error('Failed to register file in DB', { filename: file.filename, error: err.message });
    }
}

// ─── Auto-generate dynamic page from PDF ────────────────────────────────────
async function generateDynamicFromPdf(filePath, basename) {
    try {
        const pdfParse = require('pdf-parse');
        const buffer = fs.readFileSync(filePath);
        const { text } = await pdfParse(buffer);

        if (!text || text.trim().length < 100) {
            log.info('PDF too short for dynamic page', { pdf: basename });
            return false;
        }

        return await saveDynamicPage(text, basename, 'PDF');
    } catch (err) {
        log.error('Dynamic page generation failed', { pdf: basename, error: err.message });
        return false;
    }
}

// ─── Auto-generate dynamic page from Markdown ──────────────────────────────
async function generateDynamicFromMd(filePath, basename) {
    try {
        const text = fs.readFileSync(filePath, 'utf-8');

        if (!text || text.trim().length < 100) {
            log.info('MD too short for dynamic page', { md: basename });
            return false;
        }

        return await saveDynamicPage(text, basename, 'MD');
    } catch (err) {
        log.error('Dynamic page generation from MD failed', { md: basename, error: err.message });
        return false;
    }
}

// ─── Auto-generate dynamic page from DOCX ──────────────────────────────────
async function generateDynamicFromDocx(filePath, basename) {
    try {
        const mammoth = require('mammoth');
        const { value: text } = await mammoth.extractRawText({ path: filePath });

        if (!text || text.trim().length < 100) {
            log.info('DOCX too short for dynamic page', { docx: basename });
            return false;
        }

        return await saveDynamicPage(text, basename, 'DOCX');
    } catch (err) {
        log.error('Dynamic page generation from DOCX failed', { docx: basename, error: err.message });
        return false;
    }
}

// ─── Shared: generate and save dynamic HTML ─────────────────────────────────
async function saveDynamicPage(text, basename, source) {
    const html = await ai.generateDynamicPage(text, basename);
    if (!html) {
        log.warn('AI returned no HTML for dynamic page', { source, file: basename });
        return false;
    }

    const dirPath = path.join(DINAMICAS_DIR, basename);
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

    const htmlName = basename.toLowerCase().replace(/\s+/g, '') + '.html';
    fs.writeFileSync(path.join(dirPath, htmlName), html, 'utf-8');
    log.info('Dynamic page generated', { source, dir: basename, html: htmlName });
    return true;
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
}, async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file provided' });

        // Validate magic number matches extension
        const uploadExt = path.extname(req.file.filename).toLowerCase();
        if (!validateMagicNumber(req.file.path, uploadExt)) {
            fs.unlinkSync(req.file.path);  // Delete spoofed file
            log.warn('File magic number mismatch', { filename: req.file.filename, ext: uploadExt });
            return res.status(400).json({ error: 'Contenido del archivo no coincide con la extension. Archivo rechazado.' });
        }

        const rawTags = req.body.tags || '';
        const tagList = rawTags.split(',').map(t => t.trim()).filter(t => t.length > 0);
        if (tagList.length > 0) {
            const tags = loadTags(TAGS_FILE);
            tags[req.file.filename] = tagList;
            saveTags(TAGS_FILE, tags);
        }

        const ext = path.extname(req.file.filename).toLowerCase();
        const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
        const uploadedBy = req.session?.user?.username || null;

        res.json({
            success: true,
            filename: req.file.filename,
            size: formatFileSize(req.file.size),
            tags: tagList
        });

        // Auto-generate dynamic page + register in DB (fire and forget)
        const filePath = path.join(ARCHIVOS_DIR, req.file.filename);
        const basename = path.basename(req.file.filename, ext);
        let hasDynamic = false;

        if (ext === '.pdf') {
            hasDynamic = await generateDynamicFromPdf(filePath, basename);
        } else if (ext === '.md') {
            hasDynamic = await generateDynamicFromMd(filePath, basename);
        } else if (ext === '.docx') {
            hasDynamic = await generateDynamicFromDocx(filePath, basename);
        }

        await registerFileInDb(req.file, originalName, uploadedBy, hasDynamic);
    } catch (err) {
        log.error('Upload error', { error: err.message });
        if (!res.headersSent) res.status(500).json({ error: 'Upload failed' });
    }
});

// ─── Delete File ────────────────────────────────────────────────────────────
router.delete('/api/archivo/:filename', async (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Authentication required' });
    if (!['admin', 'manager'].includes(user.role)) {
        return res.status(403).json({ error: 'Solo admin o manager pueden eliminar archivos' });
    }

    const filename = req.params.filename;
    const filePath = path.resolve(ARCHIVOS_DIR, filename);

    // Safety: prevent path traversal
    if (!filePath.startsWith(path.resolve(ARCHIVOS_DIR))) {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }

        // Move file to trash instead of deleting
        const trashName = `${Date.now()}_${filename}`;
        fs.renameSync(filePath, path.join(TRASH_DIR, trashName));

        // Move associated dynamic page folder to trash
        const ext = path.extname(filename).toLowerCase();
        const basename = path.basename(filename, ext);
        const dynamicDir = path.join(DINAMICAS_DIR, basename);
        if (fs.existsSync(dynamicDir)) {
            fs.renameSync(dynamicDir, path.join(TRASH_DIR, `${Date.now()}_dyn_${basename}`));
            log.info('Dynamic page moved to trash', { dir: basename });
        }

        // Remove tags from active list
        const tags = loadTags(TAGS_FILE);
        if (tags[filename]) {
            delete tags[filename];
            saveTags(TAGS_FILE, tags);
        }

        // Soft-delete in DB with who deleted it
        await run('UPDATE archivos SET deleted_at = NOW(), deleted_by = ? WHERE filename = ? AND deleted_at IS NULL', [user.username, filename]);

        log.info('File moved to trash', { filename, trashName, deletedBy: user.username });
        res.json({ success: true });
    } catch (err) {
        log.error('File delete error', { error: err.message });
        res.status(500).json({ error: 'Error al eliminar archivo' });
    }
});

module.exports = router;
