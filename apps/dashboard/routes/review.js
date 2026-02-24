const express = require('express');
const { run, get, all } = require('../database');
const log = require('../helpers/logger');

const router = express.Router();

// ─── Review queue ───────────────────────────────────────────────────────────
router.get('/queue', async (req, res) => {
    try {
        // Outputs pending review (execution_status = 'reviewing' or completed with review info)
        const outputs = await all(`
            SELECT i.id, i.text, i.ai_summary, i.ai_type, i.ai_category,
                   i.execution_status, i.execution_output, i.executed_by, i.executed_at,
                   i.review_status, i.reviewed_by, i.reviewed_at,
                   i.suggested_agent, i.code_stage
            FROM ideas i
            WHERE i.execution_status IN ('reviewing', 'completed', 'failed')
               AND i.execution_output IS NOT NULL
               AND i.execution_output != ''
            ORDER BY
                CASE WHEN i.review_status IS NULL THEN 0
                     WHEN i.review_status = 'needs_changes' THEN 1
                     WHEN i.review_status = 'approved' THEN 2
                     ELSE 3 END,
                i.executed_at DESC
            LIMIT 50
        `);

        // Comment counts per skill (target_type = 'skill')
        const skillComments = await all(`
            SELECT target_id, COUNT(*) as comment_count
            FROM comments
            WHERE target_type = 'skill'
            GROUP BY target_id
        `);

        // Comment counts per output (target_type = 'output')
        const outputComments = await all(`
            SELECT target_id, COUNT(*) as comment_count
            FROM comments
            WHERE target_type = 'output'
            GROUP BY target_id
        `);

        // Stats
        const stats = {
            total_outputs: outputs.length,
            pending_review: outputs.filter(o => !o.review_status).length,
            approved: outputs.filter(o => o.review_status === 'approved').length,
            needs_changes: outputs.filter(o => o.review_status === 'needs_changes').length,
            skills_with_comments: skillComments.length
        };

        res.json({
            outputs,
            skill_comments: skillComments,
            output_comments: outputComments,
            stats
        });
    } catch (err) {
        log.error('Review queue error', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch review queue' });
    }
});

// ─── Approve output ─────────────────────────────────────────────────────────
router.post('/:ideaId/approve', async (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Authentication required' });

    try {
        const idea = await get('SELECT id, execution_status FROM ideas WHERE id = ?', [req.params.ideaId]);
        if (!idea) return res.status(404).json({ error: 'Idea not found' });

        await run(
            `UPDATE ideas SET review_status = 'approved', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [user.username, req.params.ideaId]
        );

        res.json({ success: true, review_status: 'approved' });
    } catch (err) {
        log.error('Review approve error', { error: err.message });
        res.status(500).json({ error: 'Failed to approve' });
    }
});

// ─── Mark as needs changes ──────────────────────────────────────────────────
router.post('/:ideaId/needs-changes', async (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Authentication required' });

    const { feedback } = req.body;

    try {
        const idea = await get('SELECT id, execution_status FROM ideas WHERE id = ?', [req.params.ideaId]);
        if (!idea) return res.status(404).json({ error: 'Idea not found' });

        await run(
            `UPDATE ideas SET review_status = 'needs_changes', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [user.username, req.params.ideaId]
        );

        // If feedback provided, save as a comment
        if (feedback && feedback.trim()) {
            await run(
                'INSERT INTO comments (target_type, target_id, username, content) VALUES (?, ?, ?, ?)',
                ['output', String(req.params.ideaId), user.username, feedback.trim()]
            );
        }

        res.json({ success: true, review_status: 'needs_changes' });
    } catch (err) {
        log.error('Review needs-changes error', { error: err.message });
        res.status(500).json({ error: 'Failed to update review' });
    }
});

// ─── Audit trail ─────────────────────────────────────────────────────────────
router.get('/audit', async (req, res) => {
    try {
        // Review actions (approvals, rejections)
        const reviewActions = await all(`
            SELECT i.id, i.text, i.ai_summary, i.ai_type,
                   i.review_status, i.reviewed_by, i.reviewed_at,
                   i.executed_by, i.suggested_agent
            FROM ideas i
            WHERE i.reviewed_at IS NOT NULL
            ORDER BY i.reviewed_at DESC
            LIMIT 100
        `);

        // All comments with section info
        const recentComments = await all(`
            SELECT c.id, c.target_type, c.target_id, c.username, c.content, c.section, c.created_at,
                   u.role
            FROM comments c
            LEFT JOIN users u ON c.username = u.username
            ORDER BY c.created_at DESC
            LIMIT 100
        `);

        res.json({ review_actions: reviewActions, comments: recentComments });
    } catch (err) {
        log.error('Audit trail error', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch audit trail' });
    }
});

module.exports = router;
