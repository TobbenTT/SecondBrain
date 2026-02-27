const express = require('express');
const { run, get, all } = require('../database');
const log = require('../helpers/logger');
const aiService = require('../services/ai');
const { requireSelfOrAdmin } = require('../middleware/authorize');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// All GTD endpoints require authentication
router.use(requireAuth);

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

        const ideas = await all("SELECT * FROM ideas WHERE created_at::date = ? AND deleted_at IS NULL ORDER BY created_at DESC", [today]);
        const projects = await all(`
            SELECT i.id, i.text as name, i.ai_summary, i.assigned_to,
                (SELECT count(*) FROM ideas sub WHERE sub.parent_idea_id = i.id AND sub.deleted_at IS NULL) as sub_count,
                (SELECT sub2.text FROM ideas sub2 WHERE sub2.parent_idea_id = i.id AND sub2.proxima_accion = '1' AND sub2.deleted_at IS NULL LIMIT 1) as next_action
            FROM ideas i WHERE i.is_project = '1' AND (i.completada IS NULL OR i.completada = '0') AND i.deleted_at IS NULL
        `);
        const waitingFor = await all("SELECT * FROM waiting_for WHERE status = 'waiting' AND deleted_at IS NULL");
        const completedToday = await all("SELECT * FROM ideas WHERE fecha_finalizacion::date = ? AND deleted_at IS NULL", [today]);

        const users = await all('SELECT username FROM users');
        const userStats = [];
        for (const u of users) {
            const pending = await get("SELECT count(*) as cnt FROM ideas WHERE assigned_to = ? AND (completada IS NULL OR completada = '0') AND deleted_at IS NULL", [u.username]);
            const done = await get("SELECT count(*) as cnt FROM ideas WHERE assigned_to = ? AND fecha_finalizacion::date = ? AND deleted_at IS NULL", [u.username, today]);
            userStats.push({ username: u.username, pending: pending.cnt, completed_today: done.cnt });
        }

        const areas = await all("SELECT * FROM areas WHERE status = 'active'");

        let report;
        try {
            report = await aiService.generateDailyReport({
                ideas, projects, waitingFor, completedToday, userStats, areas
            });
        } catch (_aiErr) {
            report = null;
        }

        // Fallback: generate a plain stats report when AI is unavailable
        if (!report || report.includes('Error al generar')) {
            const date = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const lines = [`## Reporte del ${date}\n`];
            lines.push(`### Resumen\n- **${ideas.length}** ideas capturadas hoy\n- **${completedToday.length}** tareas completadas\n- **${projects.length}** proyectos activos\n- **${waitingFor.length}** delegaciones pendientes\n`);
            if (userStats.filter(u => u.pending > 0 || u.completed_today > 0).length > 0) {
                lines.push('### Por Consultor');
                userStats.filter(u => u.pending > 0 || u.completed_today > 0).forEach(u => {
                    lines.push(`- **${u.username}**: ${u.pending} pendientes, ${u.completed_today} completadas hoy`);
                });
                lines.push('');
            }
            if (waitingFor.length > 0) {
                lines.push('### Delegaciones Pendientes');
                waitingFor.forEach(w => lines.push(`- Esperando de **${w.delegated_to}**: ${w.description}`));
                lines.push('');
            }
            lines.push('\n> *Reporte generado sin IA — instale Ollama para reportes inteligentes.*');
            report = lines.join('\n');
        }

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
            WHERE (completada IS NULL OR completada = '0') AND contexto IS NOT NULL AND deleted_at IS NULL
            GROUP BY contexto ORDER BY count DESC`);
        const byEnergy = await all(`SELECT energia, count(*) as count FROM ideas
            WHERE (completada IS NULL OR completada = '0') AND energia IS NOT NULL AND deleted_at IS NULL
            GROUP BY energia`);
        const byCompromiso = await all(`SELECT tipo_compromiso, count(*) as count FROM ideas
            WHERE (completada IS NULL OR completada = '0') AND tipo_compromiso IS NOT NULL AND deleted_at IS NULL
            GROUP BY tipo_compromiso`);
        const byAssignee = await all(`SELECT assigned_to, count(*) as count FROM ideas
            WHERE (completada IS NULL OR completada = '0') AND assigned_to IS NOT NULL AND deleted_at IS NULL
            GROUP BY assigned_to ORDER BY count DESC`);
        const projectsActive = await get(`SELECT count(*) as count FROM ideas WHERE is_project = '1' AND (completada IS NULL OR completada = '0') AND deleted_at IS NULL`);
        const nextActions = await all(`SELECT id, text, assigned_to, contexto, energia, estimated_time
            FROM ideas WHERE proxima_accion = '1' AND (completada IS NULL OR completada = '0') AND deleted_at IS NULL
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
    if (!description || typeof description !== 'string' || description.trim().length === 0) return res.status(400).json({ error: 'Description required' });
    if (description.length > 2000) return res.status(400).json({ error: 'Description too long (max 2000)' });
    if (delegated_to && (typeof delegated_to !== 'string' || delegated_to.length > 100)) return res.status(400).json({ error: 'Invalid delegated_to' });
    if (delegated_by && (typeof delegated_by !== 'string' || delegated_by.length > 100)) return res.status(400).json({ error: 'Invalid delegated_by' });
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
        await run('UPDATE waiting_for SET deleted_at = NOW() WHERE id = ?', [req.params.id]);
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
            all('SELECT * FROM inbox_log ORDER BY created_at DESC LIMIT ? OFFSET ?', [limitNum, offset]),
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
                `INSERT INTO daily_checklist (username, idea_id, date) VALUES (?, ?, ?) ON CONFLICT (username, idea_id, date) DO NOTHING`,
                [username, idea.id, today]
            );
        }

        const checklist = await all(
            `SELECT dc.id, dc.idea_id, dc.completed, dc.completed_at, dc.notes,
                    i.text, i.ai_type, i.ai_category, i.para_type, i.priority, i.related_area_id,
                    a.name as area_name, a.icon as area_icon
             FROM daily_checklist dc
             LEFT JOIN ideas i ON dc.idea_id = i.id
             LEFT JOIN areas a ON i.related_area_id = CAST(a.id AS TEXT)
             WHERE dc.username = ? AND dc.date = ?
             ORDER BY dc.completed ASC,
                      CASE i.priority WHEN 'alta' THEN 1 WHEN 'media' THEN 2 WHEN 'baja' THEN 3 ELSE 4 END`,
            [username, today]
        );

        const waiting = await all(
            `SELECT w.*, a.name as area_name FROM waiting_for w
             LEFT JOIN areas a ON w.related_area_id = a.id
             WHERE w.delegated_to = ? AND w.status = 'waiting' AND w.deleted_at IS NULL`,
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

// ─── Inbox Triage (/api/inbox/pending) ──────────────────────────────────────

router.get('/inbox/pending', async (req, res) => {
    try {
        const items = await all(
            `SELECT i.id, i.text, i.ai_type, i.ai_category, i.ai_summary, i.ai_confidence,
                    i.code_stage, i.assigned_to, i.priority, i.is_project,
                    i.needs_review, i.created_at, i.created_by,
                    il.id as log_id, il.source, il.ai_classification, il.routed_to, il.reviewed
             FROM ideas i
             LEFT JOIN inbox_log il ON il.original_idea_id = i.id
             WHERE i.code_stage = 'captured' AND i.deleted_at IS NULL AND (i.completada IS NULL OR i.completada = '0')
             ORDER BY i.needs_review DESC, i.ai_confidence ASC, i.created_at DESC`
        );
        const needsReview = items.filter(i => i.needs_review == 1 || (i.ai_confidence !== null && i.ai_confidence < 0.6));
        const autoRouted = items.filter(i => !i.needs_review && (i.ai_confidence === null || i.ai_confidence >= 0.6));
        res.json({ needs_review: needsReview, auto_routed: autoRouted, total: items.length });
    } catch (err) {
        log.error('Inbox pending error', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch inbox' });
    }
});

// Approve inbox item → move to organized
router.put('/inbox/:id/approve', async (req, res) => {
    const { ai_type, assigned_to, priority, is_project } = req.body;
    try {
        const updates = ["code_stage = 'organized'", "needs_review = 0"];
        const params = [];
        if (ai_type) { updates.push('ai_type = ?'); params.push(ai_type); }
        if (assigned_to) { updates.push('assigned_to = ?'); params.push(assigned_to); }
        if (priority) { updates.push('priority = ?'); params.push(priority); }
        if (is_project !== undefined) { updates.push('is_project = ?'); params.push(is_project ? '1' : '0'); }
        params.push(req.params.id);
        await run(`UPDATE ideas SET ${updates.join(', ')} WHERE id = ?`, params);
        // Mark inbox_log reviewed
        await run('UPDATE inbox_log SET reviewed = 1 WHERE original_idea_id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        log.error('Inbox approve error', { error: err.message });
        res.status(500).json({ error: 'Failed to approve' });
    }
});

// Dismiss inbox item → soft-delete
router.delete('/inbox/:id', async (req, res) => {
    try {
        await run(`UPDATE ideas SET deleted_at = ? WHERE id = ?`, [new Date().toISOString(), req.params.id]);
        await run('UPDATE inbox_log SET reviewed = 1 WHERE original_idea_id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        log.error('Inbox dismiss error', { error: err.message });
        res.status(500).json({ error: 'Failed to dismiss' });
    }
});

// ─── Next Actions (cross-project) ──────────────────────────────────────────

router.get('/next-actions', async (req, res) => {
    try {
        const actions = await all(
            `SELECT i.id, i.text, i.ai_type, i.ai_category, i.assigned_to, i.priority,
                    i.contexto, i.energia, i.tipo_compromiso, i.fecha_limite,
                    i.code_stage, i.parent_idea_id, i.is_project,
                    p.text as project_name, a.name as area_name
             FROM ideas i
             LEFT JOIN ideas p ON i.parent_idea_id = p.id
             LEFT JOIN areas a ON i.related_area_id = CAST(a.id AS TEXT)
             WHERE i.proxima_accion = '1'
               AND (i.completada IS NULL OR i.completada = '0')
             ORDER BY CASE i.priority WHEN 'alta' THEN 1 WHEN 'media' THEN 2 WHEN 'baja' THEN 3 ELSE 4 END,
                      i.created_at DESC`
        );
        res.json(actions);
    } catch (err) {
        log.error('Next actions error', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch next actions' });
    }
});

// Complete a next action → auto-promote next sibling
router.put('/next-actions/:id/complete', async (req, res) => {
    try {
        const idea = await get('SELECT * FROM ideas WHERE id = ?', [req.params.id]);
        if (!idea) return res.status(404).json({ error: 'Not found' });

        // Mark completed
        await run(
            `UPDATE ideas SET completada = '1', proxima_accion = '0', fecha_finalizacion = ? WHERE id = ?`,
            [new Date().toISOString(), req.params.id]
        );

        // Auto-promote: find next sibling in same project
        if (idea.parent_idea_id) {
            const nextSibling = await get(
                `SELECT id FROM ideas
                 WHERE parent_idea_id = ? AND id != ? AND (completada IS NULL OR completada = '0')
                 ORDER BY id ASC LIMIT 1`,
                [idea.parent_idea_id, req.params.id]
            );
            if (nextSibling) {
                await run(`UPDATE ideas SET proxima_accion = '1' WHERE id = ?`, [nextSibling.id]);
            }
            // Check if all subtasks complete → complete parent
            const remaining = await get(
                `SELECT count(*) as c FROM ideas WHERE parent_idea_id = ? AND (completada IS NULL OR completada = '0')`,
                [idea.parent_idea_id]
            );
            if (remaining.c === 0) {
                await run(
                    `UPDATE ideas SET completada = '1', fecha_finalizacion = ? WHERE id = ?`,
                    [new Date().toISOString(), idea.parent_idea_id]
                );
            }
        }

        res.json({ success: true, promoted: true });
    } catch (err) {
        log.error('Complete next action error', { error: err.message });
        res.status(500).json({ error: 'Failed to complete' });
    }
});

// ─── OKRs CRUD (/api/okrs/*) ───────────────────────────────────────────────

router.get('/okrs', async (req, res) => {
    try {
        const objectives = await all(
            `SELECT o.*, u.role as owner_role,
                    (SELECT count(*) FROM okr_links WHERE okr_id = o.id) as link_count
             FROM okrs o
             LEFT JOIN users u ON o.owner = u.username
             WHERE o.type = 'objective' AND o.status != 'archived' AND o.deleted_at IS NULL
             ORDER BY o.created_at DESC`
        );
        for (const obj of objectives) {
            obj.key_results = await all(
                `SELECT kr.*,
                        (SELECT count(*) FROM okr_links WHERE okr_id = kr.id) as link_count
                 FROM okrs kr WHERE kr.parent_id = ? AND kr.deleted_at IS NULL ORDER BY kr.id`,
                [obj.id]
            );
        }
        res.json(objectives);
    } catch (err) {
        log.error('OKR fetch error', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch OKRs' });
    }
});

router.post('/okrs', async (req, res) => {
    const { title, description, type, parent_id, owner, target_value, unit, period } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });
    try {
        const result = await run(
            `INSERT INTO okrs (title, description, type, parent_id, owner, target_value, unit, period)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description || '', type || 'objective', parent_id || null, owner || null,
             target_value || null, unit || '', period || '']
        );
        const okr = await get('SELECT * FROM okrs WHERE id = ?', [result.lastID]);
        res.json(okr);
    } catch (err) {
        log.error('OKR create error', { error: err.message });
        res.status(500).json({ error: 'Failed to create OKR' });
    }
});

router.put('/okrs/:id', async (req, res) => {
    const { title, description, current_value, status, owner, target_value, unit, period } = req.body;
    try {
        const updates = []; const params = [];
        if (title !== undefined) { updates.push('title = ?'); params.push(title); }
        if (description !== undefined) { updates.push('description = ?'); params.push(description); }
        if (current_value !== undefined) { updates.push('current_value = ?'); params.push(current_value); }
        if (status !== undefined) { updates.push('status = ?'); params.push(status); }
        if (owner !== undefined) { updates.push('owner = ?'); params.push(owner); }
        if (target_value !== undefined) { updates.push('target_value = ?'); params.push(target_value); }
        if (unit !== undefined) { updates.push('unit = ?'); params.push(unit); }
        if (period !== undefined) { updates.push('period = ?'); params.push(period); }
        if (!updates.length) return res.status(400).json({ error: 'Nothing to update' });
        params.push(req.params.id);
        await run(`UPDATE okrs SET ${updates.join(', ')} WHERE id = ?`, params);
        res.json({ success: true });
    } catch (err) {
        log.error('OKR update error', { error: err.message });
        res.status(500).json({ error: 'Failed to update OKR' });
    }
});

router.delete('/okrs/:id', async (req, res) => {
    try {
        await run('UPDATE okrs SET deleted_at = NOW() WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        log.error('OKR delete error', { error: err.message });
        res.status(500).json({ error: 'Failed to delete OKR' });
    }
});

// OKR Links
router.get('/okrs/:id/links', async (req, res) => {
    try {
        const links = await all(
            `SELECT ol.*,
                    CASE ol.link_type
                        WHEN 'project' THEN (SELECT name FROM projects WHERE id = ol.link_id)
                        WHEN 'idea' THEN (SELECT text FROM ideas WHERE CAST(id AS TEXT) = ol.link_id)
                        WHEN 'area' THEN (SELECT name FROM areas WHERE CAST(id AS TEXT) = ol.link_id)
                    END as link_name
             FROM okr_links ol WHERE ol.okr_id = ? ORDER BY ol.link_type`,
            [req.params.id]
        );
        res.json(links);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch links' });
    }
});

router.post('/okrs/:id/links', async (req, res) => {
    const { link_type, link_id } = req.body;
    if (!link_type || !link_id) return res.status(400).json({ error: 'link_type and link_id required' });
    try {
        await run('INSERT INTO okr_links (okr_id, link_type, link_id) VALUES (?, ?, ?) ON CONFLICT (okr_id, link_type, link_id) DO NOTHING',
            [req.params.id, link_type, link_id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create link' });
    }
});

router.delete('/okrs/links/:linkId', async (req, res) => {
    try {
        await run('DELETE FROM okr_links WHERE id = ?', [req.params.linkId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete link' });
    }
});

// ─── Daily Briefing per user (/api/gtd/briefing/:username) ──────────────────

router.get('/gtd/briefing/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const tasks = await all(
            `SELECT i.id, i.text, i.priority, i.contexto, i.proxima_accion, i.code_stage,
                    i.fecha_limite, i.parent_idea_id, p.text as project_name
             FROM ideas i
             LEFT JOIN ideas p ON i.parent_idea_id = p.id
             WHERE i.assigned_to = ? AND (i.completada IS NULL OR i.completada = '0')
             ORDER BY CASE i.priority WHEN 'alta' THEN 1 WHEN 'media' THEN 2 ELSE 3 END`,
            [username]
        );
        const waiting = await all(
            `SELECT description, due_date FROM waiting_for
             WHERE delegated_to = ? AND status = 'waiting'`,
            [username]
        );
        const nextActions = tasks.filter(t => t.proxima_accion == 1);
        const overdue = tasks.filter(t => t.fecha_limite && new Date(t.fecha_limite) < new Date());

        // Build briefing text
        let briefing = `📋 **Briefing de ${username}** — ${new Date().toLocaleDateString('es-ES')}\n\n`;
        briefing += `**${tasks.length}** tareas activas | **${nextActions.length}** próximas acciones | **${overdue.length}** vencidas\n\n`;

        if (nextActions.length) {
            briefing += `### 🎯 Próximas Acciones\n`;
            nextActions.forEach(t => {
                const proj = t.project_name ? ` ← _${t.project_name}_` : '';
                const pri = t.priority === 'alta' ? '🔴' : t.priority === 'media' ? '🟡' : '🟢';
                briefing += `- ${pri} ${t.text}${proj}\n`;
            });
            briefing += '\n';
        }
        if (overdue.length) {
            briefing += `### ⚠️ Vencidas\n`;
            overdue.forEach(t => briefing += `- ${t.text} (límite: ${t.fecha_limite})\n`);
            briefing += '\n';
        }
        if (waiting.length) {
            briefing += `### ⏳ Esperando de ti\n`;
            waiting.forEach(w => briefing += `- ${w.description}${w.due_date ? ` (${w.due_date})` : ''}\n`);
        }

        res.json({ username, briefing, stats: { total: tasks.length, next_actions: nextActions.length, overdue: overdue.length, waiting: waiting.length } });
    } catch (err) {
        log.error('Briefing error', { error: err.message });
        res.status(500).json({ error: 'Failed to generate briefing' });
    }
});

// ─── Daily Digest (/api/digest/*) ─────────────────────────────────────────────

// GET /api/digest/latest — Last digest for current user
router.get('/digest/latest', async (req, res) => {
    try {
        const userId = req.session.user.id;
        const digest = await get(
            'SELECT id, content, summary, delivered_via, created_at FROM daily_digests WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
            [userId]
        );
        res.json({ digest: digest || null });
    } catch (err) {
        log.error('Digest latest error', { error: err.message });
        res.status(500).json({ error: 'Error al obtener digest' });
    }
});

// GET /api/digest/history — Last 30 digests
router.get('/digest/history', async (req, res) => {
    try {
        const userId = req.session.user.id;
        const digests = await all(
            'SELECT id, summary, delivered_via, created_at FROM daily_digests WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
            [userId]
        );
        res.json({ digests });
    } catch (err) {
        log.error('Digest history error', { error: err.message });
        res.status(500).json({ error: 'Error al obtener historial' });
    }
});

// POST /api/digest/trigger — Manual trigger (admin only)
router.post('/digest/trigger', async (req, res) => {
    if (req.session.user.role !== 'admin') return res.status(403).json({ error: 'Solo admin' });
    try {
        const { runDailyDigest } = require('../services/digest');
        runDailyDigest().catch(err => log.error('Manual digest error', { error: err.message }));
        res.json({ success: true, message: 'Digest en proceso — revisa en unos minutos' });
    } catch (err) {
        res.status(500).json({ error: 'Error al disparar digest' });
    }
});

module.exports = router;
