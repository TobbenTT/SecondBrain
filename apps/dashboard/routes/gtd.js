const express = require('express');
const { run, get, all } = require('../database');
const log = require('../helpers/logger');
const aiService = require('../services/ai');
const { requireSelfOrAdmin } = require('../middleware/authorize');

const router = express.Router();

// ─── GTD Contexts (/api/gtd/contexts) ────────────────────────────────────────

router.get('/gtd/contexts', async (req, res) => {
    try {
        const contexts = await all('SELECT * FROM gtd_contexts WHERE active = 1 ORDER BY name');
        res.json(contexts);
    } catch (_err) {
        res.status(500).json({ error: 'Failed to fetch GTD contexts' });
    }
});

// ─── Daily Report (/api/gtd/daily-report) ────────────────────────────────────

router.get('/gtd/daily-report', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const ideas = await all("SELECT * FROM ideas WHERE date(created_at) = ? ORDER BY created_at DESC", [today]);
        const projects = await all(`
            SELECT i.id, i.text as name, i.ai_summary, i.assigned_to,
                (SELECT count(*) FROM ideas sub WHERE sub.parent_idea_id = i.id) as sub_count,
                (SELECT sub2.text FROM ideas sub2 WHERE sub2.parent_idea_id = i.id AND sub2.proxima_accion = 1 LIMIT 1) as next_action
            FROM ideas i WHERE i.is_project = 1 AND (i.completada IS NULL OR i.completada = 0)
        `);
        const waitingFor = await all("SELECT * FROM waiting_for WHERE status = 'waiting'");
        const completedToday = await all("SELECT * FROM ideas WHERE date(fecha_finalizacion) = ?", [today]);

        const users = await all('SELECT username FROM users');
        const userStats = [];
        for (const u of users) {
            const pending = await get("SELECT count(*) as cnt FROM ideas WHERE assigned_to = ? AND (completada IS NULL OR completada = 0)", [u.username]);
            const done = await get("SELECT count(*) as cnt FROM ideas WHERE assigned_to = ? AND date(fecha_finalizacion) = ?", [u.username, today]);
            userStats.push({ username: u.username, pending: pending.cnt, completed_today: done.cnt });
        }

        const areas = await all('SELECT * FROM areas WHERE status = "active"');

        const report = await aiService.generateDailyReport({
            ideas, projects, waitingFor, completedToday, userStats, areas
        });

        res.json({ report, stats: { ideas_today: ideas.length, completed_today: completedToday.length, active_projects: projects.length, pending_delegations: waitingFor.length, userStats } });
    } catch (err) {
        log.error('Daily report error', { error: err.message });
        res.status(500).json({ error: 'Failed to generate daily report' });
    }
});

// ─── Effectiveness (/api/gtd/effectiveness) ──────────────────────────────────

router.get('/gtd/effectiveness', async (req, res) => {
    try {
        const byContext = await all(`SELECT contexto, count(*) as count FROM ideas
            WHERE (completada IS NULL OR completada = 0) AND contexto IS NOT NULL
            GROUP BY contexto ORDER BY count DESC`);
        const byEnergy = await all(`SELECT energia, count(*) as count FROM ideas
            WHERE (completada IS NULL OR completada = 0) AND energia IS NOT NULL
            GROUP BY energia`);
        const byCompromiso = await all(`SELECT tipo_compromiso, count(*) as count FROM ideas
            WHERE (completada IS NULL OR completada = 0) AND tipo_compromiso IS NOT NULL
            GROUP BY tipo_compromiso`);
        const byAssignee = await all(`SELECT assigned_to, count(*) as count FROM ideas
            WHERE (completada IS NULL OR completada = 0) AND assigned_to IS NOT NULL
            GROUP BY assigned_to ORDER BY count DESC`);
        const projectsActive = await get(`SELECT count(*) as count FROM ideas WHERE is_project = 1 AND (completada IS NULL OR completada = 0)`);
        const nextActions = await all(`SELECT id, text, assigned_to, contexto, energia, estimated_time
            FROM ideas WHERE proxima_accion = 1 AND (completada IS NULL OR completada = 0)
            ORDER BY priority DESC LIMIT 20`);

        res.json({ byContext, byEnergy, byCompromiso, byAssignee, activeProjects: projectsActive.count, nextActions });
    } catch (_err) {
        res.status(500).json({ error: 'Failed to fetch effectiveness data' });
    }
});

// ─── Waiting For (/api/waiting-for/*) ────────────────────────────────────────

router.get('/waiting-for', async (req, res) => {
    try {
        const items = await all(`SELECT w.*, i.text as idea_text, a.name as area_name
            FROM waiting_for w
            LEFT JOIN ideas i ON w.related_idea_id = i.id
            LEFT JOIN areas a ON w.related_area_id = a.id
            ORDER BY w.status, w.created_at DESC`);
        res.json(items);
    } catch (_err) {
        res.status(500).json({ error: 'Failed to fetch waiting-for items' });
    }
});

router.post('/waiting-for', async (req, res) => {
    const { description, delegated_to, delegated_by, related_idea_id, related_project_id, related_area_id, due_date } = req.body;
    if (!description) return res.status(400).json({ error: 'Description required' });
    try {
        await run(`INSERT INTO waiting_for (description, delegated_to, delegated_by, related_idea_id, related_project_id, related_area_id, due_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [description, delegated_to, delegated_by, related_idea_id, related_project_id, related_area_id, due_date]);
        res.json({ success: true });
    } catch (_err) {
        res.status(500).json({ error: 'Failed to create waiting-for item' });
    }
});

router.put('/waiting-for/:id/complete', async (req, res) => {
    try {
        await run(`UPDATE waiting_for SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?`, [req.params.id]);
        res.json({ success: true });
    } catch (_err) {
        res.status(500).json({ error: 'Failed to complete' });
    }
});

router.delete('/waiting-for/:id', async (req, res) => {
    try {
        await run('DELETE FROM waiting_for WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (_err) {
        res.status(500).json({ error: 'Failed to delete' });
    }
});

// ─── Inbox Log (/api/inbox-log/*) ────────────────────────────────────────────

router.get('/inbox-log', async (req, res) => {
    try {
        const { page, limit: lim } = req.query;
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(lim) || 30));
        const offset = (pageNum - 1) * limitNum;

        const [items, countResult] = await Promise.all([
            all(`SELECT * FROM inbox_log ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offset}`),
            get('SELECT count(*) as total FROM inbox_log')
        ]);
        const total = countResult?.total || 0;

        res.json({ items, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
    } catch (_err) {
        res.status(500).json({ error: 'Failed to fetch inbox log' });
    }
});

router.put('/inbox-log/:id/review', async (req, res) => {
    try {
        await run(`UPDATE inbox_log SET reviewed = 1 WHERE id = ?`, [req.params.id]);
        res.json({ success: true });
    } catch (_err) {
        res.status(500).json({ error: 'Failed to mark reviewed' });
    }
});

// ─── Checklist (/api/checklist/*) ────────────────────────────────────────────

router.get('/checklist/:username', async (req, res) => {
    const { username } = req.params;
    const today = new Date().toISOString().split('T')[0];

    try {
        const assigned = await all(
            `SELECT id, text, ai_type, ai_category, para_type, code_stage, priority, related_area_id
             FROM ideas WHERE assigned_to = ? AND ai_type IN ('Tarea', 'Proyecto', 'Delegacion')
             ORDER BY CASE priority WHEN 'alta' THEN 1 WHEN 'media' THEN 2 WHEN 'baja' THEN 3 ELSE 4 END, created_at DESC`,
            [username]
        );

        for (const idea of assigned) {
            await run(
                `INSERT OR IGNORE INTO daily_checklist (username, idea_id, date) VALUES (?, ?, ?)`,
                [username, idea.id, today]
            );
        }

        const checklist = await all(
            `SELECT dc.id, dc.idea_id, dc.completed, dc.completed_at, dc.notes,
                    i.text, i.ai_type, i.ai_category, i.para_type, i.priority, i.related_area_id,
                    a.name as area_name, a.icon as area_icon
             FROM daily_checklist dc
             LEFT JOIN ideas i ON dc.idea_id = i.id
             LEFT JOIN areas a ON i.related_area_id = a.id
             WHERE dc.username = ? AND dc.date = ?
             ORDER BY dc.completed ASC,
                      CASE i.priority WHEN 'alta' THEN 1 WHEN 'media' THEN 2 WHEN 'baja' THEN 3 ELSE 4 END`,
            [username, today]
        );

        const waiting = await all(
            `SELECT w.*, a.name as area_name FROM waiting_for w
             LEFT JOIN areas a ON w.related_area_id = a.id
             WHERE w.delegated_to = ? AND w.status = 'waiting'`,
            [username]
        );

        res.json({ date: today, username, checklist, waiting });
    } catch (err) {
        log.error('Checklist error', { error: err.message, username: req.params.username });
        res.status(500).json({ error: 'Failed to generate checklist' });
    }
});

router.put('/checklist/:username/:ideaId/toggle', requireSelfOrAdmin, async (req, res) => {
    const { username, ideaId } = req.params;
    const today = new Date().toISOString().split('T')[0];

    try {
        const item = await get(
            'SELECT * FROM daily_checklist WHERE username = ? AND idea_id = ? AND date = ?',
            [username, ideaId, today]
        );

        if (!item) {
            await run(
                'INSERT INTO daily_checklist (username, idea_id, date, completed, completed_at) VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)',
                [username, ideaId, today]
            );
        } else {
            const newState = item.completed ? 0 : 1;
            await run(
                'UPDATE daily_checklist SET completed = ?, completed_at = ? WHERE id = ?',
                [newState, newState ? new Date().toISOString() : null, item.id]
            );
        }

        res.json({ success: true });
    } catch (_err) {
        res.status(500).json({ error: 'Failed to toggle checklist item' });
    }
});

module.exports = router;
