const express = require('express');
const path = require('path');
const fs = require('fs');
const { run, get, all } = require('../database');
const log = require('../helpers/logger');
const { validateBody } = require('../helpers/validate');
const aiService = require('../services/ai');
const { processAndSaveIdea } = require('../helpers/ideaProcessor');
const { requireAuth } = require('../middleware/auth');
const { requireOwnerOrAdmin, denyRole } = require('../middleware/authorize');
const blockConsultor = denyRole('consultor');

const router = express.Router();

// IDOR middleware for idea routes — checks created_by or assigned_to
const ideaOwnerOrAdmin = requireOwnerOrAdmin('ideas', 'created_by');

// ─── Agent Configuration ───────────────────────────────────────────────────
const SKILLS_DIR = path.join(__dirname, '..', '..', '..', 'core', 'skills');

const AGENTS = {
    'staffing': {
        name: 'Staffing Agent',
        role: 'Experto en Planificación de Dotación y Turnos',
        skillPath: path.join(SKILLS_DIR, 'customizable', 'create-staffing-plan.md')
    },
    'training': {
        name: 'Training Agent',
        role: 'Experto en Capacitación y Mallas Curriculares',
        skillPath: path.join(SKILLS_DIR, 'customizable', 'create-training-plan.md')
    },
    'finance': {
        name: 'Finance Agent',
        role: 'Analista Financiero de Presupuestos (OPEX)',
        skillPath: path.join(SKILLS_DIR, 'core', 'model-opex-budget.md')
    },
    'compliance': {
        name: 'Compliance Agent',
        role: 'Auditor de Cumplimiento Normativo',
        skillPath: path.join(SKILLS_DIR, 'core', 'audit-compliance-readiness.md')
    },
    'gtd': {
        name: 'GTD Agent',
        role: 'Experto en Getting Things Done — Clasificacion, Descomposicion y Revision',
        skillPath: path.join(SKILLS_DIR, 'core', 'classify-idea.md')
    }
};

// ─── Ideas CRUD ──────────────────────────────────────────────────────────────

router.get('/', async (req, res) => {
    try {
        const { code_stage, para_type, area_id, assigned_to, page, limit: lim,
                contexto, energia, tipo_compromiso, is_project, parent_id, completada } = req.query;
        let sql = `SELECT id, text, audio_url as audioUrl, created_at as createdAt, status,
            ai_type, ai_category, ai_action, ai_summary,
            code_stage, para_type, related_area_id, distilled_summary, expressed_output,
            assigned_to, estimated_time, priority, project_id, created_by,
            ai_confidence, needs_review, last_reviewed,
            suggested_agent, suggested_skills, execution_status, execution_output,
            execution_error, executed_at, executed_by,
            contexto, energia, fecha_inicio, fecha_objetivo, fecha_limite,
            es_fecha_limite, tipo_compromiso, proxima_accion, subproyecto,
            objetivo, notas, completada, fecha_finalizacion,
            parent_idea_id, is_project
            FROM ideas`;
        const conditions = [];
        const params = [];

        if (code_stage) { conditions.push('code_stage = ?'); params.push(code_stage); }
        if (para_type) { conditions.push('para_type = ?'); params.push(para_type); }
        if (area_id) { conditions.push('related_area_id = ?'); params.push(area_id); }
        if (assigned_to) { conditions.push('assigned_to = ?'); params.push(assigned_to); }
        if (contexto) { conditions.push('contexto = ?'); params.push(contexto); }
        if (energia) { conditions.push('energia = ?'); params.push(energia); }
        if (tipo_compromiso) { conditions.push('tipo_compromiso = ?'); params.push(tipo_compromiso); }
        if (is_project === '1') { conditions.push("is_project = '1'"); }
        if (is_project === '0') { conditions.push("(is_project IS NULL OR is_project = '0')"); }
        if (parent_id) { conditions.push('parent_idea_id = ?'); params.push(parent_id); }
        if (completada === '1') { conditions.push("completada = '1'"); }
        if (completada === '0') { conditions.push("(completada IS NULL OR completada = '0')"); }

        let countSql = 'SELECT count(*) as total FROM ideas';
        if (conditions.length > 0) {
            const where = ' WHERE ' + conditions.join(' AND ');
            sql += where;
            countSql += where;
        }
        sql += ' ORDER BY created_at DESC';

        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(lim) || 50));
        const offset = (pageNum - 1) * limitNum;
        sql += ` LIMIT ${limitNum} OFFSET ${offset}`;

        const [ideas, countResult] = await Promise.all([
            all(sql, params),
            all(countSql, params)
        ]);
        const total = countResult[0]?.total || 0;

        res.json({ ideas, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
    } catch (err) {
        log.error('Ideas DB error', { error: err.message, path: req.path });
        res.status(500).json({ error: 'Failed to fetch ideas' });
    }
});

router.post('/', blockConsultor, validateBody({ text: { required: true, type: 'string', maxLen: 10000 } }), async (req, res) => {
    try {
        const { text, previewData } = req.body;

        const createdBy = req.session.user ? req.session.user.username : null;

        const result = await run('INSERT INTO ideas (text, code_stage, created_by) VALUES (?, ?, ?)', [text.trim(), 'captured', createdBy]);
        let newIdea = await get('SELECT id, text FROM ideas WHERE id = ?', [result.lastID]);

        let analysis;
        if (previewData && previewData.items && previewData.items.length > 0) {
            const items = previewData.items;
            analysis = items.length === 1 ? items[0] : items;
            analysis = await processAndSaveIdea(newIdea.id, newIdea.text, createdBy, analysis);
        } else {
            analysis = await processAndSaveIdea(newIdea.id, newIdea.text, createdBy);
        }

        const ideaSelectCols = `id, text, audio_url as audioUrl, created_at as createdAt, status,
                ai_type, ai_category, ai_action, ai_summary,
                code_stage, para_type, related_area_id, assigned_to, estimated_time, priority, created_by,
                suggested_agent, suggested_skills, execution_status`;
        if (analysis && analysis.split && analysis.savedIds) {
            const allIdeas = await all(
                `SELECT ${ideaSelectCols} FROM ideas WHERE id IN (${analysis.savedIds.map(() => '?').join(',')})`,
                analysis.savedIds
            );
            res.json({ split: true, count: analysis.count, ideas: allIdeas });
        } else {
            newIdea = await get(`SELECT ${ideaSelectCols} FROM ideas WHERE id = ?`, [newIdea.id]);
            res.json(newIdea);
        }
    } catch (err) {
        log.error('Ideas DB error', { error: err.message, path: req.path });
        res.status(500).json({ error: 'Failed to save idea' });
    }
});

router.post('/voice', (req, res, next) => { req._uploadType = 'voice'; next(); });

router.delete('/', blockConsultor, async (req, res) => {
    const user = req.session.user;
    if (!user || (user.role !== 'admin' && user.role !== 'ceo')) return res.status(403).json({ error: 'Solo admin puede eliminar todo' });
    try {
        await run('DELETE FROM daily_checklist');
        await run('DELETE FROM waiting_for');
        await run('DELETE FROM ideas');
        await run("ALTER SEQUENCE ideas_id_seq RESTART WITH 1");
        res.json({ message: 'Todas las ideas han sido eliminadas' });
    } catch (err) {
        log.error('Ideas DB error', { error: err.message, path: req.path });
        res.status(500).json({ error: 'Failed to delete all ideas' });
    }
});

router.delete('/:id', blockConsultor, ideaOwnerOrAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        await run('DELETE FROM daily_checklist WHERE idea_id = ?', [id]);
        await run('DELETE FROM ideas WHERE parent_idea_id = ?', [id]);
        await run('DELETE FROM ideas WHERE id = ?', [id]);
        res.json({ deleted: true });
    } catch (err) {
        log.error('Ideas DB error', { error: err.message, path: req.path });
        res.status(500).json({ error: 'Failed to delete idea' });
    }
});

// ─── CODE Actions ────────────────────────────────────────────────────────────

router.post('/:id/organize', blockConsultor, validateBody({
    para_type: { type: 'string', oneOf: ['project', 'area', 'resource', 'archive'] },
}), async (req, res) => {
    const { para_type, area_id, project_id } = req.body;
    try {
        await run(`UPDATE ideas SET code_stage = 'organized', para_type = ?, related_area_id = ?, project_id = ? WHERE id = ?`,
            [para_type, area_id, project_id, req.params.id]);
        res.json({ success: true });
    } catch (_err) {
        res.status(500).json({ error: 'Failed to organize idea' });
    }
});

router.post('/:id/distill', blockConsultor, async (req, res) => {
    try {
        const idea = await get('SELECT * FROM ideas WHERE id = ?', [req.params.id]);
        if (!idea) return res.status(404).json({ error: 'Idea not found' });

        const contextItems = await all('SELECT key, content FROM context_items');
        const contextString = contextItems.map(c => `${c.key}: ${c.content}`).join('\n');
        const distilled = await aiService.distillContent(idea.text, contextString);

        await run(`UPDATE ideas SET code_stage = 'distilled', distilled_summary = ? WHERE id = ?`,
            [distilled.resumen_destilado, req.params.id]);
        res.json(distilled);
    } catch (_err) {
        res.status(500).json({ error: 'Distill failed' });
    }
});

router.post('/:id/express', blockConsultor, async (req, res) => {
    const { output } = req.body;
    try {
        await run(`UPDATE ideas SET code_stage = 'expressed', expressed_output = ? WHERE id = ?`,
            [output || 'Expresado', req.params.id]);
        res.json({ success: true });
    } catch (_err) {
        res.status(500).json({ error: 'Express failed' });
    }
});

// ─── Execution Pipeline ──────────────────────────────────────────────────────

router.post('/:id/execute', blockConsultor, requireAuth, async (req, res) => {
    const ideaId = req.params.id;
    const { agent, skills } = req.body;
    const executedBy = req.session.user ? req.session.user.username : 'system';

    try {
        const idea = await get('SELECT * FROM ideas WHERE id = ?', [ideaId]);
        if (!idea) return res.status(404).json({ error: 'Idea not found' });

        const agentKey = agent || idea.suggested_agent;
        if (!agentKey || !AGENTS[agentKey]) {
            return res.status(400).json({ error: 'Invalid or missing agent' });
        }

        let skillPaths = skills;
        if (!skillPaths || skillPaths.length === 0) {
            try { skillPaths = JSON.parse(idea.suggested_skills || '[]'); } catch (_e) { skillPaths = []; }
        }
        if (skillPaths.length === 0) {
            skillPaths = [path.relative(SKILLS_DIR, AGENTS[agentKey].skillPath).replace(/\\/g, '/')];
        }

        await run(`UPDATE ideas SET execution_status = 'running', suggested_agent = ?, suggested_skills = ?, executed_by = ? WHERE id = ?`,
            [agentKey, JSON.stringify(skillPaths), executedBy, ideaId]);

        const skillContents = aiService.loadSkillsCached(skillPaths, SKILLS_DIR);

        if (skillContents.length === 0) {
            await run(`UPDATE ideas SET execution_status = 'failed', execution_error = ? WHERE id = ?`, ['No skill files found', ideaId]);
            return res.status(400).json({ error: 'No skill files found for execution' });
        }

        const contextItems = await all('SELECT key, content FROM context_items');
        let contextString = contextItems.map(c => `${c.key}: ${c.content}`).join('\n');

        // Inject contracted tools data for Finance agent
        if (agentKey === 'finance') {
            const herramientas = await all("SELECT * FROM herramientas_contratadas WHERE estado = 'activo' ORDER BY categoria, nombre");
            if (herramientas.length > 0) {
                contextString += '\n\nHERRAMIENTAS Y SUSCRIPCIONES CONTRATADAS (datos reales):\n';
                contextString += '| Herramienta | Proveedor | Categoría | Costo | Frecuencia | Licencias | Duración Contrato | Vencimiento | Renovación |\n';
                contextString += '|---|---|---|---|---|---|---|---|---|\n';
                let totalMensual = 0;
                herramientas.forEach(h => {
                    const costo = (h.costo_mensual || 0) * (h.num_licencias || 1);
                    totalMensual += h.frecuencia === 'anual' ? costo / 12 : costo;
                    contextString += `| ${h.nombre} | ${h.proveedor || '-'} | ${h.categoria} | ${h.costo_mensual} ${h.moneda}/${h.frecuencia} | ${h.frecuencia} | ${h.num_licencias} | ${h.duracion_contrato || '-'} | ${h.fecha_vencimiento || '-'} | ${h.fecha_renovacion || '-'} |\n`;
                });
                contextString += `\nTOTAL MENSUAL ESTIMADO: $${totalMensual.toFixed(2)}\nTOTAL ANUAL ESTIMADO: $${(totalMensual * 12).toFixed(2)}\n`;
            }
        }

        const result = await aiService.executeWithAgent(idea.text, agentKey, skillContents, contextString);

        if (result.success) {
            await run(`UPDATE ideas SET execution_status = 'completed', execution_output = ?, executed_at = CURRENT_TIMESTAMP, code_stage = 'expressed', expressed_output = ? WHERE id = ?`,
                [result.output, `Auto-ejecutado por ${AGENTS[agentKey].name}`, ideaId]);

            await run(`INSERT INTO context_items (key, content, category, para_type, code_stage, source) VALUES (?, ?, ?, 'resource', 'expressed', ?)`,
                [`execution_${ideaId}_${agentKey}`, result.output.substring(0, 5000), idea.ai_category || 'General', `agent:${agentKey}`]);

            res.json({ success: true, output: result.output, agent: agentKey, executedBy });
        } else {
            await run(`UPDATE ideas SET execution_status = 'failed', execution_error = ? WHERE id = ?`, [result.error, ideaId]);
            res.status(500).json({ error: 'Execution failed', details: result.error });
        }
    } catch (err) {
        log.error('Execute error', { error: err.message, ideaId });
        await run(`UPDATE ideas SET execution_status = 'failed', execution_error = ? WHERE id = ?`, [err.message, ideaId]).catch(() => {});
        res.status(500).json({ error: 'Execution failed' });
    }
});

router.get('/:id/execution-output', requireAuth, async (req, res) => {
    try {
        const idea = await get('SELECT execution_output, execution_status, execution_error, executed_at, executed_by, suggested_agent FROM ideas WHERE id = ?', [req.params.id]);
        if (!idea) return res.status(404).json({ error: 'Idea not found' });
        res.json(idea);
    } catch (_err) {
        res.status(500).json({ error: 'Failed to fetch execution output' });
    }
});

// ─── Fix (one-click reclassification) ────────────────────────────────────────

router.post('/:id/fix', ideaOwnerOrAdmin, async (req, res) => {
    const { ai_type, ai_category, para_type, assigned_to, priority, area_id } = req.body;
    try {
        const updates = [];
        const params = [];

        if (ai_type) { updates.push('ai_type = ?'); params.push(ai_type); }
        if (ai_category) { updates.push('ai_category = ?'); params.push(ai_category); }
        if (para_type) { updates.push('para_type = ?'); params.push(para_type); }
        if (assigned_to) { updates.push('assigned_to = ?'); params.push(assigned_to); }
        if (priority) { updates.push('priority = ?'); params.push(priority); }
        if (area_id !== undefined) { updates.push('related_area_id = ?'); params.push(area_id); }
        updates.push('needs_review = 0');

        if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

        params.push(req.params.id);
        await run(`UPDATE ideas SET ${updates.join(', ')} WHERE id = ?`, params);
        await run(`UPDATE inbox_log SET reviewed = 1 WHERE original_idea_id = ?`, [req.params.id]);

        res.json({ success: true });
    } catch (_err) {
        res.status(500).json({ error: 'Failed to fix idea' });
    }
});

// ─── Edit idea (text, assigned_to, priority, tipo_compromiso) ────────────────

router.put('/:id', blockConsultor, async (req, res) => {
    const { text, assigned_to, priority, tipo_compromiso, contexto, energia, notas, objetivo, code_stage, completada } = req.body;
    try {
        const idea = await get('SELECT * FROM ideas WHERE id = ?', [req.params.id]);
        if (!idea) return res.status(404).json({ error: 'Idea not found' });

        const updates = [];
        const params = [];

        if (text !== undefined) { updates.push('text = ?'); params.push(text.trim()); }
        if (assigned_to !== undefined) { updates.push('assigned_to = ?'); params.push(assigned_to || null); }
        if (priority !== undefined) { updates.push('priority = ?'); params.push(priority || null); }
        if (tipo_compromiso !== undefined) { updates.push('tipo_compromiso = ?'); params.push(tipo_compromiso || null); }
        if (contexto !== undefined) { updates.push('contexto = ?'); params.push(contexto || null); }
        if (energia !== undefined) { updates.push('energia = ?'); params.push(energia || null); }
        if (notas !== undefined) { updates.push('notas = ?'); params.push(notas || null); }
        if (objetivo !== undefined) { updates.push('objetivo = ?'); params.push(objetivo || null); }
        if (code_stage !== undefined) {
            const validStages = ['captured', 'organized', 'distilled', 'expressed', 'executed'];
            if (validStages.includes(code_stage)) { updates.push('code_stage = ?'); params.push(code_stage); }
        }
        if (completada !== undefined) {
            updates.push('completada = ?'); params.push(completada ? 1 : 0);
            if (completada) { updates.push('fecha_finalizacion = ?'); params.push(new Date().toISOString()); }
            else { updates.push('fecha_finalizacion = ?'); params.push(null); }
        }

        if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

        params.push(req.params.id);
        await run(`UPDATE ideas SET ${updates.join(', ')} WHERE id = ?`, params);
        const updated = await get('SELECT * FROM ideas WHERE id = ?', [req.params.id]);
        res.json(updated);
    } catch (err) {
        log.error('Edit idea error', { error: err.message });
        res.status(500).json({ error: 'Failed to edit idea' });
    }
});

// ─── Project link ────────────────────────────────────────────────────────────

router.put('/:id/project', async (req, res) => {
    const { projectId } = req.body;
    try {
        await run('UPDATE ideas SET project_id = ? WHERE id = ?', [projectId, req.params.id]);
        res.json({ success: true });
    } catch (_err) {
        res.status(500).json({ error: 'Failed to link project' });
    }
});

// ─── GTD Fields ──────────────────────────────────────────────────────────────

router.put('/:id/gtd', validateBody({
    energia: { type: 'string', oneOf: ['baja', 'media', 'alta'] },
    tipo_compromiso: { type: 'string', oneOf: ['comprometida', 'esta_semana', 'algun_dia', 'tal_vez'] },
    fecha_inicio: { date: true },
    fecha_objetivo: { date: true },
    fecha_limite: { date: true },
}), async (req, res) => {
    const { contexto, energia, tipo_compromiso, proxima_accion, fecha_inicio,
            fecha_objetivo, fecha_limite, es_fecha_limite, notas, objetivo, subproyecto } = req.body;
    try {
        await run(`UPDATE ideas SET
            contexto = COALESCE(?, contexto),
            energia = COALESCE(?, energia),
            tipo_compromiso = COALESCE(?, tipo_compromiso),
            proxima_accion = COALESCE(?, proxima_accion),
            fecha_inicio = COALESCE(?, fecha_inicio),
            fecha_objetivo = COALESCE(?, fecha_objetivo),
            fecha_limite = COALESCE(?, fecha_limite),
            es_fecha_limite = COALESCE(?, es_fecha_limite),
            notas = COALESCE(?, notas),
            objetivo = COALESCE(?, objetivo),
            subproyecto = COALESCE(?, subproyecto)
            WHERE id = ?`,
            [contexto, energia, tipo_compromiso, proxima_accion,
             fecha_inicio, fecha_objetivo, fecha_limite, es_fecha_limite,
             notas, objetivo, subproyecto, req.params.id]);
        res.json({ success: true });
    } catch (_err) {
        res.status(500).json({ error: 'Failed to update GTD fields' });
    }
});

router.post('/:id/complete', blockConsultor, async (req, res) => {
    try {
        const idea = await get('SELECT * FROM ideas WHERE id = ?', [req.params.id]);
        if (!idea) return res.status(404).json({ error: 'Idea not found' });

        await run(`UPDATE ideas SET completada = '1', fecha_finalizacion = CURRENT_TIMESTAMP,
            code_stage = 'expressed' WHERE id = ?`, [req.params.id]);

        if (idea.parent_idea_id) {
            const remaining = await get(
                'SELECT count(*) as cnt FROM ideas WHERE parent_idea_id = ? AND (completada IS NULL OR completada = '0')',
                [idea.parent_idea_id]
            );
            if (remaining.cnt === 0) {
                await run(`UPDATE ideas SET completada = '1', fecha_finalizacion = CURRENT_TIMESTAMP,
                    code_stage = 'expressed' WHERE id = ?`, [idea.parent_idea_id]);
            } else {
                const nextTask = await get(
                    'SELECT id FROM ideas WHERE parent_idea_id = ? AND (completada IS NULL OR completada = '0') ORDER BY id ASC LIMIT 1',
                    [idea.parent_idea_id]
                );
                if (nextTask) {
                    await run('UPDATE ideas SET proxima_accion = '0' WHERE parent_idea_id = ?', [idea.parent_idea_id]);
                    await run('UPDATE ideas SET proxima_accion = '1' WHERE id = ?', [nextTask.id]);
                }
            }
        }

        res.json({ success: true });
    } catch (_err) {
        res.status(500).json({ error: 'Failed to complete task' });
    }
});

router.post('/:id/reopen', blockConsultor, async (req, res) => {
    try {
        const idea = await get('SELECT * FROM ideas WHERE id = ?', [req.params.id]);
        if (!idea) return res.status(404).json({ error: 'Idea not found' });

        await run('UPDATE ideas SET completada = '0', fecha_finalizacion = NULL WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (_err) {
        res.status(500).json({ error: 'Failed to reopen task' });
    }
});

router.get('/:id/subtasks', async (req, res) => {
    try {
        const subtasks = await all(
            `SELECT id, text, ai_summary, assigned_to, contexto, energia, estimated_time,
             priority, proxima_accion, completada, fecha_finalizacion, tipo_compromiso, code_stage
             FROM ideas WHERE parent_idea_id = ? ORDER BY proxima_accion DESC, id ASC`,
            [req.params.id]
        );
        res.json(subtasks);
    } catch (_err) {
        res.status(500).json({ error: 'Failed to fetch subtasks' });
    }
});

router.post('/:id/decompose', blockConsultor, async (req, res) => {
    try {
        const idea = await get('SELECT * FROM ideas WHERE id = ?', [req.params.id]);
        if (!idea) return res.status(404).json({ error: 'Idea not found' });

        const contextItems = await all('SELECT key, content FROM context_items');
        const contextString = contextItems.map(c => `${c.key}: ${c.content}`).join('\n');
        const users = await all('SELECT username, role, department, expertise FROM users');
        const areas = await all("SELECT name FROM areas WHERE status = 'active'");

        const decomp = await aiService.decomposeProject(idea.text, contextString, users, areas);
        if (!decomp || !decomp.sub_tasks) {
            return res.status(500).json({ error: 'Decomposition failed' });
        }

        await run(`UPDATE ideas SET is_project = '1' WHERE id = ?`, [idea.id]);

        const createdIds = [];
        for (const sub of decomp.sub_tasks) {
            const result = await run(
                `INSERT INTO ideas (text, code_stage, created_by, parent_idea_id, is_project,
                 assigned_to, contexto, energia, estimated_time, priority,
                 proxima_accion, ai_type, ai_category, ai_summary, para_type,
                 related_area_id, tipo_compromiso, status)
                 VALUES (?, 'organized', ?, ?, 0, ?, ?, ?, ?, ?, ?, 'Tarea', ?, ?, 'project', ?, 'esta_semana', 'processed')`,
                [sub.texto, idea.created_by, idea.id,
                 sub.assigned_to, sub.contexto || '@computador',
                 sub.energia || 'media', sub.estimated_time || null,
                 sub.priority || 'media', sub.es_proxima_accion ? 1 : 0,
                 idea.ai_category, sub.texto, idea.related_area_id]
            );
            createdIds.push(result.lastID);
        }

        const subtasks = await all(
            `SELECT id, text, assigned_to, contexto, energia, estimated_time, priority, proxima_accion
             FROM ideas WHERE parent_idea_id = ? ORDER BY proxima_accion DESC, id ASC`,
            [idea.id]
        );

        res.json({ success: true, project_name: decomp.project_name, subtasks, count: createdIds.length });
    } catch (err) {
        log.error('Decompose error', { error: err.message, ideaId: req.params.id });
        res.status(500).json({ error: 'Decomposition failed' });
    }
});

// ─── Get single idea by ID (MUST be after all /:id/sub-routes) ──────────────
router.get('/:id', async (req, res) => {
    try {
        const idea = await get('SELECT * FROM ideas WHERE id = ?', [req.params.id]);
        if (!idea) return res.status(404).json({ error: 'Idea not found' });
        res.json(idea);
    } catch (err) {
        log.error('Idea fetch error', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch idea' });
    }
});

// Export AGENTS for other routes that need it
router.AGENTS = AGENTS;
router.SKILLS_DIR = SKILLS_DIR;

module.exports = router;
