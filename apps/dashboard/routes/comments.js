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
            `SELECT c.id, c.target_type, c.target_id, c.username, c.content, c.section, c.highlighted_text, c.created_at,
                    u.role, u.department, u.avatar
             FROM comments c
             LEFT JOIN users u ON c.username = u.username
             WHERE c.target_type = ? AND c.target_id = ? AND c.deleted_at IS NULL
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
    const { target_type, target_id, content, section, highlighted_text } = req.body;
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
            'INSERT INTO comments (target_type, target_id, username, content, section, highlighted_text) VALUES (?, ?, ?, ?, ?, ?)',
            [target_type, target_id, user.username, content.trim(), section || null, highlighted_text || null]
        );
        const comment = await get('SELECT * FROM comments WHERE id = ?', [result.lastID]);

        // ─── Notify relevant users about the new comment ─────────────────
        try {
            const recipients = new Set();

            if (target_type === 'skill') {
                // Notify all previous commenters on this skill (except author)
                const prev = await all(
                    `SELECT DISTINCT username FROM comments WHERE target_type = 'skill' AND target_id = ? AND username != ?`,
                    [target_id, user.username]
                );
                prev.forEach(r => recipients.add(r.username));

                const skillName = target_id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                for (const recipient of recipients) {
                    await run(
                        `INSERT INTO user_notifications (username, type, title, message, link_section) VALUES (?, ?, ?, ?, ?)`,
                        [recipient, 'comment_on_skill', 'Nuevo comentario en skill',
                         `${user.username} comentó en "${skillName}"`, 'skills']
                    );
                }
            } else if (target_type === 'output') {
                // Notify the idea executor/assignee
                const idea = await get(
                    `SELECT assigned_to, executed_by FROM ideas WHERE id = ?`,
                    [target_id]
                );
                if (idea?.executed_by && idea.executed_by !== user.username) recipients.add(idea.executed_by);
                if (idea?.assigned_to && idea.assigned_to !== user.username) recipients.add(idea.assigned_to);

                // Also notify previous commenters
                const prev = await all(
                    `SELECT DISTINCT username FROM comments WHERE target_type = 'output' AND target_id = ? AND username != ?`,
                    [target_id, user.username]
                );
                prev.forEach(r => recipients.add(r.username));

                for (const recipient of recipients) {
                    await run(
                        `INSERT INTO user_notifications (username, type, title, message, link_section, link_id) VALUES (?, ?, ?, ?, ?, ?)`,
                        [recipient, 'comment_on_output', 'Nuevo comentario en entregable',
                         `${user.username} comentó en un entregable`, 'revision', parseInt(target_id) || null]
                    );
                }
            }
        } catch (notifErr) {
            log.warn('Comment notification error (non-fatal)', { error: notifErr.message });
        }

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

        if (comment.username !== user.username && user.role !== 'admin' && user.role !== 'ceo') {
            return res.status(403).json({ error: 'Can only delete your own comments' });
        }

        await run('UPDATE comments SET deleted_at = NOW() WHERE id = ?', [req.params.id]);
        res.json({ deleted: true });
    } catch (err) {
        log.error('Comment delete error', { error: err.message });
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

module.exports = router;
