const express = require('express');
const { run, get, all } = require('../database');
const log = require('../helpers/logger');

const router = express.Router();

// ─── List comments for a target ─────────────────────────────────────────────
router.get('/', async (req, res) => {
    const { target_type, target_id } = req.query;
    if (!target_type || !target_id) {
        return res.status(400).json({ error: 'target_type and target_id required' });
    }

    try {
        const comments = await all(
            `SELECT c.id, c.target_type, c.target_id, c.username, c.content, c.section, c.created_at,
                    u.role, u.department, u.avatar
             FROM comments c
             LEFT JOIN users u ON c.username = u.username
             WHERE c.target_type = ? AND c.target_id = ?
             ORDER BY c.created_at ASC`,
            [target_type, target_id]
        );
        res.json(comments);
    } catch (err) {
        log.error('Comments fetch error', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// ─── Create comment ─────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
    const { target_type, target_id, content, section } = req.body;
    const user = req.session?.user;

    if (!user) return res.status(401).json({ error: 'Authentication required' });
    if (!target_type || !target_id || !content || !content.trim()) {
        return res.status(400).json({ error: 'target_type, target_id, and content required' });
    }

    const validTypes = ['skill', 'output', 'idea'];
    if (!validTypes.includes(target_type)) {
        return res.status(400).json({ error: 'Invalid target_type' });
    }

    try {
        const result = await run(
            'INSERT INTO comments (target_type, target_id, username, content, section) VALUES (?, ?, ?, ?, ?)',
            [target_type, target_id, user.username, content.trim(), section || null]
        );
        const comment = await get('SELECT * FROM comments WHERE id = ?', [result.lastID]);
        res.json(comment);
    } catch (err) {
        log.error('Comment create error', { error: err.message });
        res.status(500).json({ error: 'Failed to create comment' });
    }
});

// ─── Delete comment (own or admin) ──────────────────────────────────────────
router.delete('/:id', async (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Authentication required' });

    try {
        const comment = await get('SELECT * FROM comments WHERE id = ?', [req.params.id]);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        if (comment.username !== user.username && user.role !== 'admin') {
            return res.status(403).json({ error: 'Can only delete your own comments' });
        }

        await run('DELETE FROM comments WHERE id = ?', [req.params.id]);
        res.json({ deleted: true });
    } catch (err) {
        log.error('Comment delete error', { error: err.message });
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

module.exports = router;
