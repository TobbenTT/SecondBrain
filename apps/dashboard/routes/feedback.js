const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { run, get, all } = require('../database');
const log = require('../helpers/logger');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// All feedback endpoints require authentication
router.use(requireAuth);

// ─── Upload directory ───────────────────────────────────────────────────────
const FEEDBACK_UPLOADS = path.join(__dirname, '..', '..', '..', 'knowledge', 'feedback-uploads');
if (!fs.existsSync(FEEDBACK_UPLOADS)) fs.mkdirSync(FEEDBACK_UPLOADS, { recursive: true });

// ─── Multer config ──────────────────────────────────────────────────────────
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, FEEDBACK_UPLOADS),
        filename: (req, file, cb) => {
            const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
            const ext = path.extname(originalName);
            const base = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_\-]/g, '_');
            cb(null, `fb_${Date.now()}_${base}${ext}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.txt', '.docx', '.xlsx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido'), false);
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 }
});

// ─── List all feedback (with attachment count) ──────────────────────────────
router.get('/', async (req, res) => {
    try {
        const feedback = await all(
            `SELECT f.*, u.role,
                    (SELECT COUNT(*) FROM feedback_attachments fa WHERE fa.feedback_id = f.id) as attachment_count
             FROM feedback f
             LEFT JOIN users u ON f.username = u.username
             WHERE f.deleted_at IS NULL
             ORDER BY f.created_at DESC`
        );
        res.json(feedback);
    } catch (err) {
        log.error('Feedback fetch error', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch feedback' });
    }
});

// ─── Export all feedback as JSON download ────────────────────────────────────
router.get('/export', async (req, res) => {
    try {
        const feedback = await all(
            `SELECT f.*,
                    (SELECT COUNT(*) FROM feedback_attachments fa WHERE fa.feedback_id = f.id) as attachment_count
             FROM feedback f
             WHERE f.deleted_at IS NULL
             ORDER BY f.created_at DESC`
        );
        const date = new Date().toISOString().slice(0, 10);
        res.setHeader('Content-Disposition', `attachment; filename="feedback_export_${date}.json"`);
        res.setHeader('Content-Type', 'application/json');
        res.json({
            exported_at: new Date().toISOString(),
            total: feedback.length,
            feedback
        });
    } catch (err) {
        log.error('Feedback export error', { error: err.message });
        res.status(500).json({ error: 'Failed to export feedback' });
    }
});

// ─── Import feedback from JSON export ────────────────────────────────────────
router.post('/import', async (req, res) => {
    const user = req.session?.user;
    if (!user || !['admin', 'ceo'].includes(user.role)) {
        return res.status(403).json({ error: 'Admin only' });
    }

    try {
        const data = req.body;
        const items = data.feedback || data;
        if (!Array.isArray(items)) {
            return res.status(400).json({ error: 'Expected {"feedback":[...]} or [...]' });
        }

        let imported = 0;
        for (const item of items) {
            if (!item.title || !item.content || !item.username) continue;
            // Skip duplicates by title + username
            const exists = await get(
                'SELECT id FROM feedback WHERE title = ? AND username = ?',
                [item.title, item.username]
            );
            if (exists) continue;

            await run(
                `INSERT INTO feedback (username, title, content, category, priority, status, admin_response, responded_by, created_at, resolved_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    item.username,
                    item.title,
                    item.content,
                    item.category || 'mejora',
                    item.priority || 'media',
                    item.status || 'abierto',
                    item.admin_response || null,
                    item.responded_by || null,
                    item.created_at || new Date().toISOString(),
                    item.resolved_at || null
                ]
            );
            imported++;
        }

        const total = await get('SELECT count(*) as c FROM feedback');
        res.json({ imported, skipped: items.length - imported, total: total.c });
    } catch (err) {
        log.error('Feedback import error', { error: err.message });
        res.status(500).json({ error: 'Import failed: ' + err.message });
    }
});

// ─── Bulk create feedback (multiple items, no attachments) ───────────────────
router.post('/bulk', async (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Authentication required' });

    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'items array required' });
    }
    if (items.length > 20) {
        return res.status(400).json({ error: 'Máximo 20 feedbacks a la vez' });
    }

    const validCategories = ['mejora', 'bug', 'feature', 'otro'];
    const validPriorities = ['baja', 'media', 'alta'];
    const created = [];
    const errors = [];

    for (let i = 0; i < items.length; i++) {
        const { title, content, category, priority } = items[i];
        if (!title || !title.trim() || !content || !content.trim()) {
            errors.push(`Item ${i + 1}: titulo y descripcion requeridos`);
            continue;
        }
        if (title.length > 200) { errors.push(`Item ${i + 1}: titulo muy largo (max 200)`); continue; }
        if (content.length > 5000) { errors.push(`Item ${i + 1}: descripcion muy larga (max 5000)`); continue; }

        try {
            const result = await run(
                `INSERT INTO feedback (username, title, content, category, priority) VALUES (?, ?, ?, ?, ?)`,
                [
                    user.username,
                    title.trim(),
                    content.trim(),
                    validCategories.includes(category) ? category : 'mejora',
                    validPriorities.includes(priority) ? priority : 'media'
                ]
            );
            const row = await get('SELECT * FROM feedback WHERE id = ?', [result.lastID]);
            created.push(row);
        } catch (err) {
            log.error('Bulk feedback insert error', { error: err.message, index: i });
            errors.push(`Item ${i + 1}: error interno`);
        }
    }

    res.json({ created: created.length, errors, items: created });
});

// ─── Create feedback (with optional attachments) ────────────────────────────
router.post('/', upload.array('attachments', 5), async (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Authentication required' });

    const { title, content, category, priority } = req.body;

    if (!title || !title.trim() || !content || !content.trim()) {
        return res.status(400).json({ error: 'title and content are required' });
    }

    const validCategories = ['mejora', 'bug', 'feature', 'otro'];
    const validPriorities = ['baja', 'media', 'alta'];

    try {
        const result = await run(
            `INSERT INTO feedback (username, title, content, category, priority)
             VALUES (?, ?, ?, ?, ?)`,
            [
                user.username,
                title.trim(),
                content.trim(),
                validCategories.includes(category) ? category : 'mejora',
                validPriorities.includes(priority) ? priority : 'media'
            ]
        );

        // Save attachments
        const feedbackId = result.lastID;
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
                await run(
                    `INSERT INTO feedback_attachments (feedback_id, filename, original_name, mimetype, size, uploaded_by)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [feedbackId, file.filename, originalName, file.mimetype, file.size, user.username]
                );
            }
        }

        const created = await get('SELECT * FROM feedback WHERE id = ?', [feedbackId]);
        created.attachment_count = req.files ? req.files.length : 0;
        res.json(created);
    } catch (err) {
        log.error('Feedback create error', { error: err.message });
        res.status(500).json({ error: 'Failed to create feedback' });
    }
});

// ─── Get attachments for a feedback ─────────────────────────────────────────
router.get('/:id/attachments', async (req, res) => {
    try {
        const attachments = await all(
            'SELECT id, filename, original_name, mimetype, size, uploaded_by, created_at FROM feedback_attachments WHERE feedback_id = ?',
            [req.params.id]
        );
        res.json(attachments);
    } catch (err) {
        log.error('Attachment list error', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch attachments' });
    }
});

// ─── Serve attachment file ──────────────────────────────────────────────────
router.get('/attachment/:id', async (req, res) => {
    try {
        const att = await get('SELECT * FROM feedback_attachments WHERE id = ?', [req.params.id]);
        if (!att) return res.status(404).json({ error: 'Attachment not found' });

        const filePath = path.join(FEEDBACK_UPLOADS, att.filename);
        if (!filePath.startsWith(path.resolve(FEEDBACK_UPLOADS))) {
            return res.status(403).json({ error: 'Access denied' });
        }
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found on disk' });

        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(att.original_name)}"`);
        res.sendFile(filePath);
    } catch (err) {
        log.error('Attachment serve error', { error: err.message });
        res.status(500).json({ error: 'Failed to serve attachment' });
    }
});

// ─── Delete attachment (admin or feedback author) ───────────────────────────
router.delete('/attachment/:id', async (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Authentication required' });

    try {
        const att = await get(
            `SELECT fa.*, f.username as fb_author
             FROM feedback_attachments fa
             JOIN feedback f ON f.id = fa.feedback_id
             WHERE fa.id = ?`,
            [req.params.id]
        );
        if (!att) return res.status(404).json({ error: 'Attachment not found' });

        if (att.fb_author !== user.username && user.role !== 'admin' && user.role !== 'ceo') {
            return res.status(403).json({ error: 'Only author or admin can delete attachments' });
        }

        const filePath = path.join(FEEDBACK_UPLOADS, att.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await run('DELETE FROM feedback_attachments WHERE id = ?', [req.params.id]);
        res.json({ deleted: true });
    } catch (err) {
        log.error('Attachment delete error', { error: err.message });
        res.status(500).json({ error: 'Failed to delete attachment' });
    }
});

// ─── Update status (admin/manager only) ─────────────────────────────────────
router.put('/:id/status', async (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Authentication required' });
    if (!['admin', 'manager'].includes(user.role)) {
        return res.status(403).json({ error: 'Only admin/manager can update status' });
    }

    const { status } = req.body;
    const validStatuses = ['abierto', 'en_progreso', 'resuelto', 'descartado', 'corregido'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const resolvedAt = ['resuelto', 'descartado', 'corregido'].includes(status)
            ? new Date().toISOString()
            : null;
        await run(
            'UPDATE feedback SET status = ?, resolved_at = ? WHERE id = ?',
            [status, resolvedAt, req.params.id]
        );

        // When marked as "corregido", notify the original reporter
        if (status === 'corregido') {
            const fb = await get('SELECT username, title FROM feedback WHERE id = ?', [req.params.id]);
            if (fb && fb.username) {
                await run(
                    `INSERT INTO user_notifications (username, type, title, message, link_section, link_id)
                     VALUES (?, 'feedback_fixed', ?, ?, 'feedback', ?)`,
                    [fb.username, 'Feedback corregido', `Tu feedback "${fb.title}" fue marcado como corregido. Por favor verifica que funcione correctamente.`, req.params.id]
                );
            }
        }

        res.json({ success: true });
    } catch (err) {
        log.error('Feedback status update error', { error: err.message });
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// ─── Reporter rejects fix (only the original reporter can do this) ──────────
router.put('/:id/reject-fix', async (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Authentication required' });

    try {
        const fb = await get('SELECT * FROM feedback WHERE id = ?', [req.params.id]);
        if (!fb) return res.status(404).json({ error: 'Feedback not found' });
        if (fb.username !== user.username) {
            return res.status(403).json({ error: 'Solo el autor del feedback puede rechazar la corrección' });
        }
        if (fb.status !== 'corregido') {
            return res.status(400).json({ error: 'Solo se puede rechazar feedback en estado "corregido"' });
        }

        await run(
            'UPDATE feedback SET status = ?, resolved_at = NULL WHERE id = ?',
            ['abierto', req.params.id]
        );

        // Save rejection comment if provided
        const { comment } = req.body;
        if (comment && comment.trim()) {
            await run(
                'INSERT INTO comments (target_type, target_id, username, content) VALUES (?, ?, ?, ?)',
                ['feedback', req.params.id.toString(), user.username, comment.trim()]
            );
        }

        // Notify admins that the fix was rejected
        const rejectMsg = comment && comment.trim()
            ? `${user.username} reporta que "${fb.title}" NO está resuelto: "${comment.trim().substring(0, 200)}"`
            : `${user.username} reporta que "${fb.title}" NO está resuelto y necesita más trabajo.`;
        const admins = await all("SELECT username FROM users WHERE role IN ('admin', 'ceo', 'manager')");
        for (const admin of admins) {
            await run(
                `INSERT INTO user_notifications (username, type, title, message, link_section, link_id)
                 VALUES (?, 'feedback_rejected', ?, ?, 'feedback', ?)`,
                [admin.username, 'Corrección rechazada', rejectMsg, req.params.id]
            );
        }

        res.json({ success: true });
    } catch (err) {
        log.error('Feedback reject-fix error', { error: err.message });
        res.status(500).json({ error: 'Failed to reject fix' });
    }
});

// ─── Respond to feedback (admin/manager only) ──────────────────────────────
router.put('/:id/respond', async (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Authentication required' });
    if (!['admin', 'manager'].includes(user.role)) {
        return res.status(403).json({ error: 'Only admin/manager can respond' });
    }

    const { response } = req.body;
    if (!response || !response.trim()) {
        return res.status(400).json({ error: 'response is required' });
    }

    try {
        await run(
            'UPDATE feedback SET admin_response = ?, responded_by = ? WHERE id = ?',
            [response.trim(), user.username, req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        log.error('Feedback respond error', { error: err.message });
        res.status(500).json({ error: 'Failed to respond' });
    }
});

// ─── Delete feedback (admin or own author) ──────────────────────────────────
router.delete('/:id', async (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Authentication required' });

    try {
        const fb = await get('SELECT * FROM feedback WHERE id = ?', [req.params.id]);
        if (!fb) return res.status(404).json({ error: 'Feedback not found' });

        if (fb.username !== user.username && user.role !== 'admin' && user.role !== 'ceo') {
            return res.status(403).json({ error: 'Can only delete your own feedback' });
        }

        await run('UPDATE feedback SET deleted_at = NOW() WHERE id = ?', [req.params.id]);
        res.json({ deleted: true });
    } catch (err) {
        log.error('Feedback delete error', { error: err.message });
        res.status(500).json({ error: 'Failed to delete feedback' });
    }
});

module.exports = router;
