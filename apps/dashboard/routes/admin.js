const express = require('express');
const path = require('path');
const fs = require('fs');
const { run, get, all } = require('../database');
const log = require('../helpers/logger');
const orchestratorBridge = require('../services/orchestratorBridge');
const { requireAdmin, denyRole } = require('../middleware/authorize');
const blockConsultor = denyRole('consultor');

const router = express.Router();

// ─── Users ───────────────────────────────────────────────────────────────────

router.get('/users', async (req, res) => {
    try {
        const users = await all('SELECT id, username, role, department, expertise FROM users');
        res.json(users);
    } catch (_err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// ─── Projects ────────────────────────────────────────────────────────────────

const PROJECTS_FILE = path.join(__dirname, '..', 'data', 'projects.json');

router.get('/projects', async (req, res) => {
    try {
        const count = await get('SELECT count(*) as c FROM projects');

        if (count.c === 0 && fs.existsSync(PROJECTS_FILE)) {
            log.info('Migrating projects.json to SQLite');
            const jsonData = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));

            for (const p of jsonData) {
                await run(`INSERT OR IGNORE INTO projects (id, name, description, url, icon, status, tech, created_at)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [p.id, p.name, p.description, p.url, p.icon, p.status, (p.tech || []).join(','), p.createdAt]
                );
            }
            log.info('Projects migration completed');
        }

        const projects = await all('SELECT * FROM projects ORDER BY created_at DESC');
        const formatted = projects.map(p => ({
            ...p,
            tech: p.tech ? p.tech.split(',') : []
        }));
        res.json(formatted);
    } catch (err) {
        log.error('Projects fetch error', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

router.post('/projects', blockConsultor, async (req, res) => {
    const { name, description, url, icon, status, tech } = req.body;
    if (!name || !url) return res.status(400).json({ error: 'Name and URL required' });

    try {
        const id = Date.now().toString();
        const techStr = (tech || []).map(t => t.trim()).join(',');
        await run(`INSERT INTO projects (id, name, description, url, icon, status, tech)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, name, description, url, icon, status || 'active', techStr]
        );
        res.json({ id, name, status });
    } catch (_err) {
        res.status(500).json({ error: 'Failed to save project' });
    }
});

router.delete('/projects/:id', blockConsultor, requireAdmin, async (req, res) => {
    try {
        await run('DELETE FROM projects WHERE id = ?', [req.params.id]);
        res.json({ deleted: true });
    } catch (_err) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// ─── Orchestrator ────────────────────────────────────────────────────────────

router.post('/orchestrator/execute', blockConsultor, async (req, res) => {
    const { command, args } = req.body;
    const user = req.session.user;
    if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

    try {
        const result = await orchestratorBridge.executeCommand(command, args || []);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: typeof err === 'string' ? err : 'Execution failed' });
    }
});

// ─── Reportability ───────────────────────────────────────────────────────────

router.get('/reportability', async (req, res) => {
    try {
        const users = await all('SELECT id, username, role, department, expertise FROM users');
        const today = new Date().toISOString().split('T')[0];
        const report = [];

        for (const user of users) {
            const assigned = await all(
                `SELECT id, text, ai_type, ai_category, para_type, code_stage, priority, related_area_id, created_at
                 FROM ideas WHERE assigned_to = ? ORDER BY priority DESC, created_at DESC`,
                [user.username]
            );

            const waiting = await all(
                `SELECT w.*, a.name as area_name FROM waiting_for w
                 LEFT JOIN areas a ON w.related_area_id = a.id
                 WHERE w.delegated_to = ? AND w.status = 'waiting'
                 ORDER BY w.due_date ASC`,
                [user.username]
            );

            const checklist = await all(
                `SELECT dc.*, i.text as idea_text, i.ai_type, i.ai_category, i.priority, i.para_type
                 FROM daily_checklist dc
                 LEFT JOIN ideas i ON dc.idea_id = i.id
                 WHERE dc.username = ? AND dc.date = ?`,
                [user.username, today]
            );

            const completedToday = checklist.filter(c => c.completed).length;
            const totalTasks = assigned.filter(i => ['Tarea', 'Proyecto', 'Delegacion'].includes(i.ai_type)).length;
            const byStage = { captured: 0, organized: 0, distilled: 0, expressed: 0 };
            assigned.forEach(i => { const s = i.code_stage || 'captured'; if (byStage.hasOwnProperty(s)) byStage[s]++; });

            const areas = await all('SELECT id, name, icon FROM areas WHERE status = "active"');
            const byArea = {};
            for (const a of areas) {
                const areaItems = assigned.filter(i => i.related_area_id === a.id);
                if (areaItems.length > 0) {
                    byArea[a.name] = { icon: a.icon, count: areaItems.length, items: areaItems };
                }
            }

            report.push({
                user: { id: user.id, username: user.username, role: user.role, department: user.department },
                stats: {
                    total_assigned: assigned.length,
                    total_tasks: totalTasks,
                    completed_today: completedToday,
                    checklist_total: checklist.length,
                    pending_waiting: waiting.length,
                    by_stage: byStage
                },
                assigned: assigned.slice(0, 20),
                waiting,
                checklist,
                by_area: byArea
            });
        }

        res.json(report);
    } catch (err) {
        log.error('Reportability error', { error: err.message });
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

router.get('/reportability/team-summary', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const summary = await all(`SELECT u.username, u.role, u.department,
            COALESCE(ia.total_assigned, 0) as total_assigned,
            COALESCE(ia.total_tasks, 0) as total_tasks,
            COALESCE(dc.completed_today, 0) as completed_today,
            COALESCE(dc.checklist_total, 0) as checklist_total,
            COALESCE(wf.pending_waiting, 0) as pending_waiting,
            CASE WHEN COALESCE(dc.checklist_total, 0) > 0
                THEN ROUND(CAST(COALESCE(dc.completed_today, 0) AS FLOAT) / dc.checklist_total * 100)
                ELSE 0 END as completion_pct
            FROM users u
            LEFT JOIN (
                SELECT assigned_to,
                    count(*) as total_assigned,
                    sum(CASE WHEN ai_type IN ('Tarea','Proyecto','Delegacion') THEN 1 ELSE 0 END) as total_tasks
                FROM ideas GROUP BY assigned_to
            ) ia ON ia.assigned_to = u.username
            LEFT JOIN (
                SELECT username,
                    count(*) as checklist_total,
                    sum(completed) as completed_today
                FROM daily_checklist WHERE date = ?
                GROUP BY username
            ) dc ON dc.username = u.username
            LEFT JOIN (
                SELECT delegated_to, count(*) as pending_waiting
                FROM waiting_for WHERE status = 'waiting'
                GROUP BY delegated_to
            ) wf ON wf.delegated_to = u.username`, [today]);

        res.json(summary);
    } catch (err) {
        log.error('Team summary error', { error: err.message });
        res.status(500).json({ error: 'Failed to generate team summary' });
    }
});

// ─── Search ──────────────────────────────────────────────────────────────────

router.get('/search', async (req, res) => {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return res.status(400).json({ error: 'Query must be at least 2 characters' });

    try {
        const term = `%${q.trim()}%`;
        const [ideas, context, areas, waiting, projects] = await Promise.all([
            all(`SELECT id, text, ai_summary, ai_type, ai_category, para_type, code_stage, assigned_to, created_at as createdAt
                 FROM ideas WHERE text LIKE ? OR ai_summary LIKE ? OR ai_category LIKE ? ORDER BY created_at DESC LIMIT 20`,
                [term, term, term]),
            all(`SELECT id, key, content, category, para_type, code_stage
                 FROM context_items WHERE key LIKE ? OR content LIKE ? ORDER BY last_updated DESC LIMIT 20`,
                [term, term]),
            all(`SELECT id, name, description, icon, status FROM areas WHERE name LIKE ? OR description LIKE ? LIMIT 10`,
                [term, term]),
            all(`SELECT w.id, w.description, w.delegated_to, w.delegated_by, w.status, a.name as area_name
                 FROM waiting_for w LEFT JOIN areas a ON w.related_area_id = a.id
                 WHERE w.description LIKE ? LIMIT 10`, [term]),
            all(`SELECT id, name, description, status FROM projects WHERE name LIKE ? OR description LIKE ? LIMIT 10`,
                [term, term])
        ]);

        res.json({
            query: q.trim(),
            results: { ideas, context, areas, waiting, projects },
            counts: { ideas: ideas.length, context: context.length, areas: areas.length, waiting: waiting.length, projects: projects.length },
            total: ideas.length + context.length + areas.length + waiting.length + projects.length
        });
    } catch (err) {
        log.error('Search error', { error: err.message });
        res.status(500).json({ error: 'Search failed' });
    }
});

// ─── Notifications ───────────────────────────────────────────────────────────

router.get('/notifications/check', async (req, res) => {
    try {
        const username = req.query.username || (req.session.user ? req.session.user.username : null);
        const dismissUser = username || '_system';

        // Get dismissed notification IDs per type
        const dismissed = await all(
            `SELECT notification_type, notification_id FROM notification_dismissals WHERE username = ?`,
            [dismissUser]
        );
        const dismissedMap = {};
        dismissed.forEach(d => {
            if (!dismissedMap[d.notification_type]) dismissedMap[d.notification_type] = new Set();
            dismissedMap[d.notification_type].add(d.notification_id);
        });

        const urgentTasks = (await all(`SELECT i.id, i.text, i.ai_summary, i.priority, i.assigned_to, a.name as area_name
            FROM ideas i LEFT JOIN areas a ON i.related_area_id = a.id
            WHERE i.priority = 'alta' AND i.code_stage NOT IN ('expressed')
            ${username ? 'AND i.assigned_to = ?' : ''}
            ORDER BY i.created_at DESC LIMIT 10`,
            username ? [username] : [])).filter(t => !(dismissedMap.urgent_task && dismissedMap.urgent_task.has(t.id)));

        const overdueDelegations = (await all(`SELECT w.id, w.description, w.delegated_to, w.delegated_by, w.created_at, a.name as area_name
            FROM waiting_for w LEFT JOIN areas a ON w.related_area_id = a.id
            WHERE w.status = 'waiting' AND w.created_at <= datetime('now', '-3 days')
            ${username ? 'AND w.delegated_to = ?' : ''}
            ORDER BY w.created_at ASC LIMIT 10`,
            username ? [username] : [])).filter(d => !(dismissedMap.overdue_delegation && dismissedMap.overdue_delegation.has(d.id)));

        const staleCaptures = (await all(`SELECT id, text, created_at FROM ideas
            WHERE code_stage = 'captured' AND created_at <= datetime('now', '-1 day')
            ORDER BY created_at ASC LIMIT 5`)).filter(s => !(dismissedMap.stale_capture && dismissedMap.stale_capture.has(s.id)));

        const needsReview = (await all(`SELECT id, text, ai_summary, ai_confidence, ai_type FROM ideas
            WHERE needs_review = 1 ORDER BY created_at DESC LIMIT 5`)).filter(n => !(dismissedMap.needs_review && dismissedMap.needs_review.has(n.id)));

        const total = urgentTasks.length + overdueDelegations.length + staleCaptures.length + needsReview.length;

        res.json({
            total,
            urgent_tasks: urgentTasks,
            overdue_delegations: overdueDelegations,
            stale_captures: staleCaptures,
            needs_review: needsReview
        });
    } catch (err) {
        log.error('Notifications error', { error: err.message });
        res.status(500).json({ error: 'Notifications check failed' });
    }
});

// Dismiss a single notification
router.post('/notifications/:id/dismiss', async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.body;
        const username = req.session.user ? req.session.user.username : '_system';
        const validTypes = ['urgent_task', 'overdue_delegation', 'stale_capture', 'needs_review'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ error: 'Invalid notification type' });
        }
        await run(
            `INSERT OR IGNORE INTO notification_dismissals (username, notification_type, notification_id) VALUES (?, ?, ?)`,
            [username, type, parseInt(id)]
        );
        res.json({ success: true });
    } catch (err) {
        log.error('Dismiss notification error', { error: err.message });
        res.status(500).json({ error: 'Failed to dismiss notification' });
    }
});

// Clear all notifications for current user
router.post('/notifications/clear-all', async (req, res) => {
    try {
        const username = req.session.user ? req.session.user.username : '_system';
        const { notifications } = req.body;
        if (!Array.isArray(notifications)) {
            return res.status(400).json({ error: 'notifications array required' });
        }
        for (const n of notifications) {
            await run(
                `INSERT OR IGNORE INTO notification_dismissals (username, notification_type, notification_id) VALUES (?, ?, ?)`,
                [username, n.type, parseInt(n.id)]
            );
        }
        res.json({ success: true });
    } catch (err) {
        log.error('Clear notifications error', { error: err.message });
        res.status(500).json({ error: 'Failed to clear notifications' });
    }
});

// ─── Export / Import ─────────────────────────────────────────────────────────

router.get('/export', async (req, res) => {
    try {
        const [ideas, context, areas, waitingFor, projects, users] = await Promise.all([
            all('SELECT * FROM ideas ORDER BY created_at DESC'),
            all('SELECT * FROM context_items ORDER BY para_type, category'),
            all('SELECT * FROM areas'),
            all('SELECT * FROM waiting_for'),
            all('SELECT * FROM projects'),
            all('SELECT id, username, role, department, expertise FROM users')
        ]);

        const exportData = {
            version: '1.0',
            exported_at: new Date().toISOString(),
            source: 'SecondBrain Dashboard',
            data: { ideas, context, areas, waitingFor, projects, users }
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=secondbrain_export_${new Date().toISOString().split('T')[0]}.json`);
        res.json(exportData);
    } catch (err) {
        log.error('Export error', { error: err.message });
        res.status(500).json({ error: 'Export failed' });
    }
});

router.post('/import', blockConsultor, requireAdmin, async (req, res) => {
    try {
        const { data } = req.body;
        if (!data) return res.status(400).json({ error: 'No data provided' });

        const imported = { ideas: 0, context: 0, areas: 0, waitingFor: 0 };

        if (data.areas && Array.isArray(data.areas)) {
            for (const a of data.areas) {
                await run('INSERT OR IGNORE INTO areas (name, description, icon, status) VALUES (?, ?, ?, ?)',
                    [a.name, a.description, a.icon || '📂', a.status || 'active']);
                imported.areas++;
            }
        }

        if (data.ideas && Array.isArray(data.ideas)) {
            for (const i of data.ideas) {
                await run(`INSERT INTO ideas (text, ai_type, ai_category, ai_action, ai_summary,
                    code_stage, para_type, related_area_id, assigned_to, priority, created_by)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [i.text, i.ai_type, i.ai_category, i.ai_action, i.ai_summary,
                     i.code_stage || 'captured', i.para_type, i.related_area_id,
                     i.assigned_to, i.priority, i.created_by]);
                imported.ideas++;
            }
        }

        if (data.context && Array.isArray(data.context)) {
            for (const c of data.context) {
                await run(`INSERT INTO context_items (key, content, category, para_type, code_stage, source)
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [c.key, c.content, c.category, c.para_type || 'resource', c.code_stage || 'organized', c.source || 'import']);
                imported.context++;
            }
        }

        if (data.waitingFor && Array.isArray(data.waitingFor)) {
            for (const w of data.waitingFor) {
                await run(`INSERT INTO waiting_for (description, delegated_to, delegated_by, status)
                    VALUES (?, ?, ?, ?)`,
                    [w.description, w.delegated_to, w.delegated_by, w.status || 'waiting']);
                imported.waitingFor++;
            }
        }

        res.json({ success: true, imported });
    } catch (err) {
        log.error('Import error', { error: err.message });
        res.status(500).json({ error: 'Import failed' });
    }
});

// ─── OpenClaw Pipeline Monitor ──────────────────────────────────────────────

router.get('/openclaw/status', async (req, res) => {
    try {
        // Pipeline counts
        const pipeline = await get(`
            SELECT
                COALESCE(SUM(CASE WHEN execution_status IS NULL AND code_stage = 'organized' THEN 1 ELSE 0 END), 0) as pending,
                COALESCE(SUM(CASE WHEN execution_status LIKE 'queued_%' THEN 1 ELSE 0 END), 0) as queued,
                COALESCE(SUM(CASE WHEN execution_status = 'in_progress' THEN 1 ELSE 0 END), 0) as in_progress,
                COALESCE(SUM(CASE WHEN execution_status = 'developed' THEN 1 ELSE 0 END), 0) as developed,
                COALESCE(SUM(CASE WHEN execution_status = 'built' THEN 1 ELSE 0 END), 0) as built,
                COALESCE(SUM(CASE WHEN execution_status = 'reviewing' THEN 1 ELSE 0 END), 0) as reviewing,
                COALESCE(SUM(CASE WHEN execution_status = 'completed' THEN 1 ELSE 0 END), 0) as completed,
                COALESCE(SUM(CASE WHEN execution_status = 'failed' THEN 1 ELSE 0 END), 0) as failed,
                COALESCE(SUM(CASE WHEN execution_status = 'blocked' THEN 1 ELSE 0 END), 0) as blocked
            FROM ideas
        `);

        // Recent activity (last 20 processed ideas)
        const activity = await all(`
            SELECT id, text, ai_type, ai_category, execution_status, executed_by, executed_at,
                   ai_summary, code_stage
            FROM ideas
            WHERE execution_status IS NOT NULL AND execution_status != ''
            ORDER BY executed_at DESC
            LIMIT 20
        `);

        // Agent last-seen (most recent action per agent)
        const agents = await all(`
            SELECT executed_by as agent,
                   MAX(executed_at) as last_active,
                   COUNT(*) as total_processed
            FROM ideas
            WHERE executed_by IS NOT NULL
            GROUP BY executed_by
            ORDER BY last_active DESC
        `);

        // Built projects count
        const projectsBuilt = await get(`
            SELECT COUNT(*) as count FROM projects WHERE icon = '🤖'
        `);

        res.json({
            pipeline,
            activity,
            agents,
            projects_built: projectsBuilt ? projectsBuilt.count : 0
        });
    } catch (err) {
        log.error('OpenClaw status error', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch OpenClaw status' });
    }
});

// ─── Agents list ─────────────────────────────────────────────────────────────

const SKILLS_DIR = path.join(__dirname, '..', '..', '..', 'core', 'skills');

const AGENTS = {
    'staffing': { name: 'Staffing Agent', role: 'Experto en Planificación de Dotación y Turnos', skillPath: path.join(SKILLS_DIR, 'customizable', 'create-staffing-plan.md') },
    'training': { name: 'Training Agent', role: 'Experto en Capacitación y Mallas Curriculares', skillPath: path.join(SKILLS_DIR, 'customizable', 'create-training-plan.md') },
    'finance': { name: 'Finance Agent', role: 'Analista Financiero de Presupuestos (OPEX)', skillPath: path.join(SKILLS_DIR, 'core', 'model-opex-budget.md') },
    'compliance': { name: 'Compliance Agent', role: 'Auditor de Cumplimiento Normativo', skillPath: path.join(SKILLS_DIR, 'core', 'audit-compliance-readiness.md') },
    'gtd': { name: 'GTD Agent', role: 'Experto en Getting Things Done', skillPath: path.join(SKILLS_DIR, 'core', 'classify-idea.md') }
};

router.get('/agents', (req, res) => {
    const agentList = Object.entries(AGENTS).map(([key, config]) => ({
        key, name: config.name, role: config.role,
        skillFile: path.basename(config.skillPath)
    }));
    res.json(agentList);
});

module.exports = router;
