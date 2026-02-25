const express = require('express');
const { run, get, all } = require('../database');
const log = require('../helpers/logger');

const router = express.Router();

// ─── Helper ──────────────────────────────────────────────────────────────────

function safeJsonParse(str, fallback) {
    try { return JSON.parse(str); } catch { return fallback; }
}

function parseReunion(r) {
    return {
        ...r,
        asistentes: safeJsonParse(r.asistentes, []),
        acuerdos: safeJsonParse(r.acuerdos, []),
        puntos_clave: safeJsonParse(r.puntos_clave, []),
        compromisos: safeJsonParse(r.compromisos, []),
        entregables: safeJsonParse(r.entregables, []),
        temas_detectados: safeJsonParse(r.temas_detectados, [])
    };
}

// ─── Webhook: Receive meeting from Inteligencia-de-correos ───────────────────

router.post('/webhook/reuniones', async (req, res) => {
    if (!req.isApiRequest) return res.status(401).json({ error: 'API key required' });

    const {
        external_id, titulo, fecha, transcripcion_raw,
        asistentes, acuerdos, puntos_clave,
        compromisos, entregables, proxima_reunion, nivel_analisis
    } = req.body;

    if (!titulo || !fecha) {
        return res.status(400).json({ error: 'titulo and fecha are required' });
    }

    try {
        // Dedup by external_id
        if (external_id) {
            const existing = await get('SELECT id FROM reuniones WHERE external_id = ?', [external_id]);
            if (existing) {
                return res.json({ success: true, message: 'Already exists', id: existing.id });
            }
        }

        const result = await run(
            `INSERT INTO reuniones (external_id, titulo, fecha, transcripcion_raw,
             asistentes, acuerdos, puntos_clave, compromisos, entregables,
             proxima_reunion, nivel_analisis)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                external_id || null,
                titulo,
                fecha,
                transcripcion_raw || null,
                JSON.stringify(asistentes || []),
                JSON.stringify(acuerdos || []),
                JSON.stringify(puntos_clave || []),
                JSON.stringify(compromisos || []),
                JSON.stringify(entregables || []),
                proxima_reunion || null,
                nivel_analisis || null
            ]
        );

        const reunionId = result.lastID;

        // Notify matching participants
        await notifyParticipants(reunionId, titulo, asistentes || []);

        // Auto-link to projects/areas by keyword matching
        await autoLinkReunion(reunionId, { titulo, puntos_clave, acuerdos, compromisos });

        log.info('Meeting saved via webhook', { id: reunionId, titulo });
        res.json({ success: true, id: reunionId, message: 'Meeting saved and notifications sent' });
    } catch (err) {
        log.error('Webhook reuniones error', { error: err.message });
        res.status(500).json({ error: 'Failed to process meeting' });
    }
});

// ─── Participant notification matching ───────────────────────────────────────

async function notifyParticipants(reunionId, titulo, asistentes) {
    try {
        const users = await all('SELECT username FROM users');
        const usernames = users.map(u => u.username.toLowerCase());
        const matchedUsers = new Set();

        for (const asistente of asistentes) {
            const nameLower = (asistente || '').toLowerCase().trim();
            if (!nameLower || nameLower === 'participantes no identificados') continue;

            for (const username of usernames) {
                if (nameLower === username ||
                    nameLower.startsWith(username) ||
                    username.startsWith(nameLower)) {
                    matchedUsers.add(username);
                }
            }
        }

        for (const username of matchedUsers) {
            await run(
                `INSERT OR IGNORE INTO reuniones_notifications (username, reunion_id) VALUES (?, ?)`,
                [username, reunionId]
            );
        }

        if (matchedUsers.size > 0) {
            log.info('Meeting notifications created', { reunionId, titulo: titulo.substring(0, 50), matched: [...matchedUsers] });
        }
    } catch (err) {
        log.error('Notify participants error', { error: err.message });
    }
}

// ─── Auto-link reuniones to projects/areas ──────────────────────────────────

async function autoLinkReunion(reunionId, data) {
    try {
        const projects = await all('SELECT id, name FROM projects');
        const areas = await all('SELECT id, name FROM areas');

        const textParts = [data.titulo || ''];
        (data.puntos_clave || []).forEach(p => textParts.push(typeof p === 'string' ? p : ''));
        (data.acuerdos || []).forEach(a => textParts.push(typeof a === 'string' ? a : ''));
        (data.compromisos || []).forEach(c => textParts.push(typeof c === 'string' ? c : (c.descripcion || c.que || '')));
        const searchText = textParts.join(' ').toLowerCase();

        for (const p of projects) {
            if (p.name && searchText.includes(p.name.toLowerCase())) {
                await run('INSERT OR IGNORE INTO reunion_links (reunion_id, link_type, link_id, auto_detected) VALUES (?, ?, ?, 1)',
                    [reunionId, 'project', p.id]);
            }
        }
        for (const a of areas) {
            if (a.name && searchText.includes(a.name.toLowerCase())) {
                await run('INSERT OR IGNORE INTO reunion_links (reunion_id, link_type, link_id, auto_detected) VALUES (?, ?, ?, 1)',
                    [reunionId, 'area', String(a.id)]);
            }
        }
    } catch (err) {
        log.error('Auto-link reunion error', { error: err.message });
    }
}

// ─── Reunion Links (get/add/remove) ────────────────────────────────────────

router.get('/reuniones/:id/links', async (req, res) => {
    try {
        const links = await all('SELECT * FROM reunion_links WHERE reunion_id = ? ORDER BY link_type, created_at', [req.params.id]);

        const projectIds = links.filter(l => l.link_type === 'project').map(l => l.link_id);
        const areaIds = links.filter(l => l.link_type === 'area').map(l => l.link_id);

        let projects = [];
        if (projectIds.length > 0) {
            projects = await all(`SELECT id, name, icon FROM projects WHERE id IN (${projectIds.map(() => '?').join(',')})`, projectIds);
        }
        let areas = [];
        if (areaIds.length > 0) {
            areas = await all(`SELECT id, name, icon FROM areas WHERE id IN (${areaIds.map(() => '?').join(',')})`, areaIds);
        }

        res.json({
            links,
            projects: projects.map(p => ({ ...p, linkId: links.find(l => l.link_type === 'project' && l.link_id === p.id)?.id })),
            areas: areas.map(a => ({ ...a, linkId: links.find(l => l.link_type === 'area' && String(l.link_id) === String(a.id))?.id }))
        });
    } catch (err) {
        log.error('Get reunion links error', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch links' });
    }
});

router.post('/reuniones/:id/links', async (req, res) => {
    if (!req.session?.user || (req.session.user.role !== 'admin' && req.session.user.role !== 'ceo')) {
        return res.status(403).json({ error: 'Admin only' });
    }
    const { link_type, link_id } = req.body;
    if (!link_type || !link_id || !['project', 'area'].includes(link_type)) {
        return res.status(400).json({ error: 'link_type (project|area) and link_id required' });
    }
    try {
        await run('INSERT OR IGNORE INTO reunion_links (reunion_id, link_type, link_id) VALUES (?, ?, ?)',
            [req.params.id, link_type, link_id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add link' });
    }
});

router.delete('/reuniones/:id/links/:linkId', async (req, res) => {
    if (!req.session?.user || (req.session.user.role !== 'admin' && req.session.user.role !== 'ceo')) {
        return res.status(403).json({ error: 'Admin only' });
    }
    try {
        await run('DELETE FROM reunion_links WHERE id = ? AND reunion_id = ?', [req.params.linkId, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to remove link' });
    }
});

// ─── Reuniones by project/area ──────────────────────────────────────────────

router.get('/projects/:projectId/reuniones', async (req, res) => {
    try {
        const reuniones = await all(`
            SELECT r.id, r.titulo, r.fecha, r.nivel_analisis, r.asistentes
            FROM reuniones r
            JOIN reunion_links rl ON rl.reunion_id = r.id
            WHERE rl.link_type = 'project' AND rl.link_id = ?
            ORDER BY r.fecha DESC`, [req.params.projectId]);
        res.json(reuniones.map(r => ({ ...r, asistentes: JSON.parse(r.asistentes || '[]') })));
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

router.get('/areas/:areaId/reuniones', async (req, res) => {
    try {
        const reuniones = await all(`
            SELECT r.id, r.titulo, r.fecha, r.nivel_analisis, r.asistentes
            FROM reuniones r
            JOIN reunion_links rl ON rl.reunion_id = r.id
            WHERE rl.link_type = 'area' AND rl.link_id = ?
            ORDER BY r.fecha DESC`, [req.params.areaId]);
        res.json(reuniones.map(r => ({ ...r, asistentes: JSON.parse(r.asistentes || '[]') })));
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

// ─── Email Recipients: Public GET (API key or session) ───────────────────────
// IMPORTANT: These must be defined BEFORE /reuniones/:id to avoid route collision

router.get('/reuniones/email-recipients', async (req, res) => {
    if (!req.session?.user) return res.status(401).json({ error: 'Not authenticated' });
    try {
        const recipients = await all(
            'SELECT id, email, nombre, activo FROM reuniones_email_recipients WHERE activo = 1 ORDER BY nombre'
        );
        res.json({ recipients });
    } catch (err) {
        log.error('Email recipients fetch error', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch recipients' });
    }
});

router.get('/reuniones/email-recipients/all', async (req, res) => {
    if (!req.session?.user || (req.session.user.role !== 'admin' && req.session.user.role !== 'ceo')) {
        return res.status(403).json({ error: 'Admin only' });
    }
    try {
        const recipients = await all(
            'SELECT * FROM reuniones_email_recipients ORDER BY created_at DESC'
        );
        res.json({ recipients });
    } catch (err) {
        log.error('Email recipients list error', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch recipients' });
    }
});

router.post('/reuniones/email-recipients', async (req, res) => {
    if (!req.session?.user || (req.session.user.role !== 'admin' && req.session.user.role !== 'ceo')) {
        return res.status(403).json({ error: 'Admin only' });
    }
    const { email, nombre } = req.body;
    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Email valido requerido' });
    }
    try {
        const result = await run(
            'INSERT INTO reuniones_email_recipients (email, nombre, created_by) VALUES (?, ?, ?)',
            [email.trim().toLowerCase(), nombre || null, req.session.user.username]
        );
        log.info('Email recipient added', { email, by: req.session.user.username });
        res.json({ success: true, id: result.lastID });
    } catch (err) {
        if (err.message.includes('UNIQUE')) {
            return res.status(409).json({ error: 'Este email ya esta registrado' });
        }
        log.error('Email recipient add error', { error: err.message });
        res.status(500).json({ error: 'Failed to add recipient' });
    }
});

router.put('/reuniones/email-recipients/:id', async (req, res) => {
    if (!req.session?.user || (req.session.user.role !== 'admin' && req.session.user.role !== 'ceo')) {
        return res.status(403).json({ error: 'Admin only' });
    }
    const { email, nombre, activo } = req.body;
    try {
        const sets = [];
        const params = [];
        if (email !== undefined) { sets.push('email = ?'); params.push(email.trim().toLowerCase()); }
        if (nombre !== undefined) { sets.push('nombre = ?'); params.push(nombre); }
        if (activo !== undefined) { sets.push('activo = ?'); params.push(activo ? 1 : 0); }
        if (sets.length === 0) return res.status(400).json({ error: 'Nothing to update' });
        params.push(req.params.id);
        await run(`UPDATE reuniones_email_recipients SET ${sets.join(', ')} WHERE id = ?`, params);
        res.json({ success: true });
    } catch (err) {
        log.error('Email recipient update error', { error: err.message });
        res.status(500).json({ error: 'Failed to update recipient' });
    }
});

router.delete('/reuniones/email-recipients/:id', async (req, res) => {
    if (!req.session?.user || (req.session.user.role !== 'admin' && req.session.user.role !== 'ceo')) {
        return res.status(403).json({ error: 'Admin only' });
    }
    try {
        await run('DELETE FROM reuniones_email_recipients WHERE id = ?', [req.params.id]);
        log.info('Email recipient deleted', { id: req.params.id, by: req.session.user.username });
        res.json({ success: true });
    } catch (err) {
        log.error('Email recipient delete error', { error: err.message });
        res.status(500).json({ error: 'Failed to delete recipient' });
    }
});

// ─── Stats summary ──────────────────────────────────────────────────────────

router.get('/reuniones/stats/summary', async (req, res) => {
    try {
        const [total, thisWeek, withCompromisos, allCompromisos] = await Promise.all([
            get('SELECT COUNT(*) as count FROM reuniones'),
            get("SELECT COUNT(*) as count FROM reuniones WHERE fecha >= date('now', '-7 days')"),
            get("SELECT COUNT(*) as count FROM reuniones WHERE compromisos != '[]'"),
            all("SELECT compromisos FROM reuniones WHERE compromisos != '[]'")
        ]);

        let compromisosCount = 0;
        allCompromisos.forEach(r => {
            compromisosCount += safeJsonParse(r.compromisos, []).length;
        });

        res.json({
            total_reuniones: total.count,
            this_week: thisWeek.count,
            total_with_compromisos: withCompromisos.count,
            total_compromisos: compromisosCount
        });
    } catch (err) {
        log.error('Reuniones stats error', { error: err.message });
        res.status(500).json({ error: 'Stats failed' });
    }
});

// ─── List meetings (paginated, filterable) ──────────────────────────────────

router.get('/reuniones', async (req, res) => {
    try {
        const { page = 1, limit = 20, search, participant, from, to } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const where = [];
        const params = [];

        if (search) {
            where.push("(titulo LIKE ? OR acuerdos LIKE ? OR compromisos LIKE ?)");
            const term = `%${search}%`;
            params.push(term, term, term);
        }
        if (participant) {
            where.push("asistentes LIKE ?");
            params.push(`%${participant}%`);
        }
        if (from) {
            where.push("fecha >= ?");
            params.push(from);
        }
        if (to) {
            where.push("fecha <= ?");
            params.push(to);
        }

        const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

        const total = await get(`SELECT COUNT(*) as count FROM reuniones ${whereClause}`, params);
        const reuniones = await all(
            `SELECT id, external_id, titulo, fecha, asistentes, acuerdos,
             puntos_clave, compromisos, entregables, proxima_reunion,
             nivel_analisis, created_at
             FROM reuniones ${whereClause}
             ORDER BY fecha DESC, created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        res.json({
            reuniones: reuniones.map(parseReunion),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: total.count,
                totalPages: Math.ceil(total.count / parseInt(limit))
            }
        });
    } catch (err) {
        log.error('Reuniones list error', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch meetings' });
    }
});

// ─── Single meeting detail ──────────────────────────────────────────────────
// NOTE: This :id route MUST come AFTER all /reuniones/xxx literal routes

router.get('/reuniones/:id', async (req, res) => {
    try {
        const reunion = await get('SELECT * FROM reuniones WHERE id = ?', [req.params.id]);
        if (!reunion) return res.status(404).json({ error: 'Meeting not found' });
        res.json(parseReunion(reunion));
    } catch (err) {
        log.error('Reunion detail error', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch meeting' });
    }
});

// ─── Delete meeting (admin only) ────────────────────────────────────────────

router.delete('/reuniones/:id', async (req, res) => {
    if (!req.session?.user || (req.session.user.role !== 'admin' && req.session.user.role !== 'ceo')) {
        return res.status(403).json({ error: 'Admin only' });
    }
    try {
        const reunion = await get('SELECT id, titulo FROM reuniones WHERE id = ?', [req.params.id]);
        if (!reunion) return res.status(404).json({ error: 'Meeting not found' });

        await run('DELETE FROM reuniones_notifications WHERE reunion_id = ?', [req.params.id]);
        await run('DELETE FROM reuniones WHERE id = ?', [req.params.id]);

        log.info('Meeting deleted', { id: req.params.id, titulo: reunion.titulo, by: req.session.user.username });
        res.json({ success: true });
    } catch (err) {
        log.error('Meeting delete error', { error: err.message });
        res.status(500).json({ error: 'Failed to delete meeting' });
    }
});

// ─── Generate Tasks from Meeting Commitments ────────────────────────────────
router.post('/reuniones/:id/generate-tasks', async (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Authentication required' });

    try {
        const reunion = await get('SELECT * FROM reuniones WHERE id = ?', [req.params.id]);
        if (!reunion) return res.status(404).json({ error: 'Meeting not found' });

        // Check if tasks were already generated from this meeting
        const existing = await get(
            "SELECT COUNT(*) as count FROM ideas WHERE ai_category LIKE '%Reunión' AND source_reunion_id = ?",
            [req.params.id]
        );
        if (existing && existing.count > 0) {
            return res.status(409).json({
                error: `Ya se generaron ${existing.count} tareas de esta reunion. Revisa el Inbox.`,
                already_created: existing.count
            });
        }

        const compromisos = safeJsonParse(reunion.compromisos, []);
        const acuerdos = safeJsonParse(reunion.acuerdos, []);
        const entregables = safeJsonParse(reunion.entregables, []);

        const items = [];

        // Create ideas from compromisos
        for (const c of compromisos) {
            const text = typeof c === 'string' ? c : (c.texto || c.description || c.compromiso || JSON.stringify(c));
            const responsible = typeof c === 'object' ? (c.responsable || c.assigned_to || null) : null;
            if (!text || text.length < 3) continue;

            const result = await run(
                `INSERT INTO ideas (text, code_stage, ai_type, ai_category, assigned_to, priority, created_by, needs_review, source_reunion_id)
                 VALUES (?, 'captured', 'Tarea', 'Compromiso de Reunión', ?, 'media', ?, 1, ?)`,
                [text.trim(), responsible, user.username, req.params.id]
            );
            await run(
                `INSERT INTO inbox_log (source, input_text, ai_classification, routed_to, needs_review, original_idea_id)
                 VALUES ('reunion', ?, 'Tarea', ?, 1, ?)`,
                [text.trim(), responsible, result.lastID]
            );
            items.push({ id: result.lastID, text: text.trim(), type: 'compromiso' });
        }

        // Create ideas from acuerdos
        for (const a of acuerdos) {
            const text = typeof a === 'string' ? a : (a.texto || a.description || a.acuerdo || JSON.stringify(a));
            if (!text || text.length < 3) continue;

            const result = await run(
                `INSERT INTO ideas (text, code_stage, ai_type, ai_category, created_by, needs_review, source_reunion_id)
                 VALUES (?, 'captured', 'Tarea', 'Acuerdo de Reunión', ?, 1, ?)`,
                [text.trim(), user.username, req.params.id]
            );
            await run(
                `INSERT INTO inbox_log (source, input_text, ai_classification, needs_review, original_idea_id)
                 VALUES ('reunion', ?, 'Tarea', 1, ?)`,
                [text.trim(), result.lastID]
            );
            items.push({ id: result.lastID, text: text.trim(), type: 'acuerdo' });
        }

        // Create ideas from entregables
        for (const e of entregables) {
            const text = typeof e === 'string' ? e : (e.texto || e.description || e.entregable || JSON.stringify(e));
            if (!text || text.length < 3) continue;

            const result = await run(
                `INSERT INTO ideas (text, code_stage, ai_type, ai_category, created_by, needs_review, source_reunion_id)
                 VALUES (?, 'captured', 'Tarea', 'Entregable de Reunión', ?, 1, ?)`,
                [text.trim(), user.username, req.params.id]
            );
            await run(
                `INSERT INTO inbox_log (source, input_text, ai_classification, needs_review, original_idea_id)
                 VALUES ('reunion', ?, 'Tarea', 1, ?)`,
                [text.trim(), result.lastID]
            );
            items.push({ id: result.lastID, text: text.trim(), type: 'entregable' });
        }

        log.info('Tasks generated from meeting', { reunion_id: req.params.id, count: items.length });
        res.json({ success: true, created: items.length, items });
    } catch (err) {
        log.error('Generate tasks error', { error: err.message });
        res.status(500).json({ error: 'Failed to generate tasks' });
    }
});

module.exports = router;
