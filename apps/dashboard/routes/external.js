const express = require('express');
const crypto = require('crypto');
const { run, get, all } = require('../database');
const log = require('../helpers/logger');
const { validateBody } = require('../helpers/validate');
const aiService = require('../services/ai');
const { processAndSaveIdea } = require('../helpers/ideaProcessor');
const { requireAdmin } = require('../middleware/authorize');

const router = express.Router();

// ─── External Capture (/api/external/capture) ────────────────────────────────

router.post('/external/capture', validateBody({
    text: { required: true, type: 'string', maxLen: 10000 },
    speaker: { type: 'string', maxLen: 50 },
    source: { type: 'string', maxLen: 50 },
}), async (req, res) => {
    if (!req.isApiRequest) return res.status(401).json({ error: 'API key required' });

    const { text, speaker, source } = req.body;

    try {
        const speakerUsername = speaker || req.apiKey.username;
        const result = await run('INSERT INTO ideas (text, code_stage, created_by) VALUES (?, ?, ?)',
            [text.trim(), 'captured', speakerUsername]);
        const newIdea = await get('SELECT id, text FROM ideas WHERE id = ?', [result.lastID]);

        const analysis = await processAndSaveIdea(newIdea.id, newIdea.text, speakerUsername);

        await run(`UPDATE inbox_log SET source = ? WHERE original_idea_id = ?`,
            [source || 'openclaw', newIdea.id]);

        if (analysis && analysis.split && analysis.savedIds) {
            const allIdeas = await all(
                `SELECT id, text, ai_type, ai_category, ai_action, ai_summary,
                code_stage, para_type, assigned_to, estimated_time, priority, created_by
                FROM ideas WHERE id IN (${analysis.savedIds.map(() => '?').join(',')})`,
                analysis.savedIds
            );
            res.json({
                success: true, split: true, count: analysis.count,
                ideas: allIdeas,
                message: `Capturado y separado en ${analysis.count} ideas.`
            });
        } else {
            const idea = await get(
                `SELECT id, text, ai_type, ai_category, ai_action, ai_summary,
                code_stage, para_type, assigned_to, estimated_time, priority, created_by
                FROM ideas WHERE id = ?`, [newIdea.id]
            );
            res.json({
                success: true, split: false, idea,
                message: `Capturado: ${idea.ai_summary || idea.text}`
            });
        }
    } catch (err) {
        log.error('External capture error', { error: err.message });
        res.status(500).json({ error: 'Capture failed' });
    }
});

// ─── External Summary (/api/external/summary) ───────────────────────────────

router.get('/external/summary', async (req, res) => {
    if (!req.isApiRequest) return res.status(401).json({ error: 'API key required' });

    try {
        const { username } = req.query;
        const target = username || req.apiKey.username;

        const [stats, recentIdeas, pendingWaiting, todayChecklist] = await Promise.all([
            get('SELECT count(*) as c FROM ideas'),
            all(`SELECT id, text, ai_type, ai_category, ai_summary, para_type, priority, assigned_to, created_at
                 FROM ideas ORDER BY created_at DESC LIMIT 10`),
            all(`SELECT w.*, a.name as area_name FROM waiting_for w
                 LEFT JOIN areas a ON w.related_area_id = a.id
                 WHERE w.status = 'waiting' ORDER BY w.created_at DESC`),
            all(`SELECT dc.*, i.text as idea_text, i.priority
                 FROM daily_checklist dc LEFT JOIN ideas i ON dc.idea_id = i.id
                 WHERE dc.username = ? AND dc.date = ?`,
                [target, new Date().toISOString().split('T')[0]])
        ]);

        const completedToday = todayChecklist.filter(c => c.completed).length;

        res.json({
            total_ideas: stats.c,
            recent_ideas: recentIdeas,
            pending_delegations: pendingWaiting,
            today_checklist: {
                total: todayChecklist.length,
                completed: completedToday,
                pending: todayChecklist.length - completedToday,
                items: todayChecklist
            }
        });
    } catch (err) {
        log.error('External summary error', { error: err.message });
        res.status(500).json({ error: 'Summary failed' });
    }
});

// ─── External Digest (/api/external/digest) ──────────────────────────────────

router.get('/external/digest', async (req, res) => {
    if (!req.isApiRequest) return res.status(401).json({ error: 'API key required' });

    try {
        const ideas = await all("SELECT * FROM ideas WHERE created_at >= NOW() - INTERVAL '7 days' ORDER BY created_at DESC");
        const waitingFor = await all("SELECT * FROM waiting_for WHERE status = 'waiting'");
        const contextItems = await all('SELECT key, content FROM context_items');
        const contextString = contextItems.map(c => `${c.key}: ${c.content}`).join('\n');
        const areas = await all(`SELECT a.*,
            (SELECT count(*) FROM ideas WHERE related_area_id = CAST(a.id AS TEXT)) as ideas_count,
            (SELECT count(*) FROM context_items WHERE related_area_id = CAST(a.id AS TEXT)) as context_count
            FROM areas a WHERE a.status = 'active'`);

        const digest = await aiService.generateDigest(ideas, waitingFor, contextString, areas);
        res.json({ success: true, digest });
    } catch (err) {
        log.error('External digest error', { error: err.message });
        res.status(500).json({ error: 'Digest failed' });
    }
});

// ─── Webhook: OpenClaw (/api/webhook/openclaw) ──────────────────────────────

router.post('/webhook/openclaw', validateBody({
    event: { required: true, type: 'string', maxLen: 100 },
}), async (req, res) => {
    if (!req.isApiRequest) return res.status(401).json({ error: 'API key required' });

    const { event, payload } = req.body;

    try {
        switch (event) {
            case 'task_completed': {
                const { username, idea_id } = payload || {};
                if (username && idea_id) {
                    const today = new Date().toISOString().split('T')[0];
                    await run('INSERT INTO daily_checklist (username, idea_id, date) VALUES (?, ?, ?) ON CONFLICT (username, idea_id, date) DO NOTHING',
                        [username, idea_id, today]);
                    await run(`UPDATE daily_checklist SET completed = 1, completed_at = CURRENT_TIMESTAMP
                        WHERE username = ? AND idea_id = ? AND date = ?`, [username, idea_id, today]);
                }
                res.json({ success: true, message: 'Task marked complete' });
                break;
            }
            case 'delegation_completed': {
                const { waiting_id } = payload || {};
                if (waiting_id) {
                    await run(`UPDATE waiting_for SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
                        [waiting_id]);
                }
                res.json({ success: true, message: 'Delegation resolved' });
                break;
            }
            case 'context_add': {
                const { key, content, category, para_type } = payload || {};
                if (key && content) {
                    await run(`INSERT INTO context_items (key, content, category, para_type, code_stage, source)
                        VALUES (?, ?, ?, ?, 'organized', 'openclaw')
                        ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content, category = EXCLUDED.category, para_type = EXCLUDED.para_type, code_stage = EXCLUDED.code_stage, source = EXCLUDED.source`,
                        [key, content, category || 'business', para_type || 'resource']);
                }
                res.json({ success: true, message: 'Context saved' });
                break;
            }
            default:
                res.json({ success: true, message: `Event '${event}' acknowledged (no handler)` });
        }
    } catch (err) {
        log.error('Webhook error', { error: err.message });
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// ─── API Key Management (/api/keys/*) ────────────────────────────────────────

router.get('/keys', async (req, res) => {
    try {
        const keys = await all('SELECT id, name, username, permissions, active, last_used, created_at FROM api_keys');
        res.json(keys);
    } catch (_err) {
        res.status(500).json({ error: 'Failed to fetch API keys' });
    }
});

router.post('/keys', validateBody({
    name: { required: true, type: 'string', maxLen: 100 },
    username: { type: 'string', maxLen: 50 },
}), async (req, res) => {
    const { name, username } = req.body;

    try {
        const key = 'sb_' + crypto.randomBytes(24).toString('hex');
        await run('INSERT INTO api_keys (key, name, username, permissions) VALUES (?, ?, ?, ?)',
            [key, name, username || 'david', 'read,write']);
        res.json({ success: true, key, name });
    } catch (_err) {
        res.status(500).json({ error: 'Failed to create API key' });
    }
});

router.delete('/keys/:id', requireAdmin, async (req, res) => {
    try {
        await run('DELETE FROM api_keys WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (_err) {
        res.status(500).json({ error: 'Failed to delete API key' });
    }
});

module.exports = router;
