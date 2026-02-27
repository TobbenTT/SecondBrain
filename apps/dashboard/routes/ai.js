const express = require('express');
const path = require('path');
const fs = require('fs');
const { run, get, all } = require('../database');
const log = require('../helpers/logger');
const { validateBody } = require('../helpers/validate');
const aiService = require('../services/ai');
const researchAgent = require('../services/researchAgent');
const reviewAgent = require('../services/reviewAgent');
const { processAndSaveIdea } = require('../helpers/ideaProcessor');

const router = express.Router();

const SKILLS_DIR = path.join(__dirname, '..', '..', '..', 'core', 'skills');

const AGENTS = {
    'staffing': { name: 'Staffing Agent', role: 'Experto en Planificación de Dotación y Turnos', skillPath: path.join(SKILLS_DIR, 'customizable', 'create-staffing-plan.md') },
    'training': { name: 'Training Agent', role: 'Experto en Capacitación y Mallas Curriculares', skillPath: path.join(SKILLS_DIR, 'customizable', 'create-training-plan.md') },
    'finance': { name: 'Finance Agent', role: 'Analista Financiero de Presupuestos (OPEX)', skillPath: path.join(SKILLS_DIR, 'core', 'model-opex-budget.md') },
    'compliance': { name: 'Compliance Agent', role: 'Auditor de Cumplimiento Normativo', skillPath: path.join(SKILLS_DIR, 'core', 'audit-compliance-readiness.md') },
    'gtd': { name: 'GTD Agent', role: 'Experto en Getting Things Done', skillPath: path.join(SKILLS_DIR, 'core', 'classify-idea.md') }
};

// ─── Chat ────────────────────────────────────────────────────────────────────

router.post('/chat', validateBody({
    message: { required: true, type: 'string', maxLen: 5000 },
    agent: { type: 'string', maxLen: 50 },
}), async (req, res) => {
    const { message, agent } = req.body;

    try {
        const chatUser = req.session.user ? req.session.user.username : 'anonymous';
        await run('INSERT INTO chat_history (role, message, session_id) VALUES (?, ?, ?)', ['user', message, chatUser]);

        const history = await all('SELECT role, message FROM chat_history WHERE session_id = ? ORDER BY id DESC LIMIT 10', [chatUser]);
        const contextItems = await all('SELECT key, content, para_type, code_stage FROM context_items');

        let dynamicSystemPrompt = null;
        let contextPrefix = "";

        if (agent && AGENTS[agent]) {
            const agentConfig = AGENTS[agent];
            let skillContent = "No se encontró el archivo de skill.";

            if (fs.existsSync(agentConfig.skillPath)) {
                skillContent = fs.readFileSync(agentConfig.skillPath, 'utf-8');
            }

            dynamicSystemPrompt = `
            ERES EL AGENTE: ${agentConfig.name}
            ROL: ${agentConfig.role}

            TU CONOCIMIENTO PRINCIPAL (SOP):
            === INICIO SKILL ===
            ${skillContent}
            === FIN SKILL ===

            INSTRUCCIONES:
            1. Actúa ESTRICTAMENTE basándote en la Skill proporcionada.
            2. Si te preguntan algo fuera de tu skill, indica amablemente que solo eres experto en ese tema.
            3. Usa formato Markdown para tablas y listas.
            `;
        }

        const areasData = await all("SELECT name, description FROM areas WHERE status = 'active'");
        const msgWords = message.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const scoredItems = contextItems.map(item => {
            const text = `${item.key} ${item.content}`.toLowerCase();
            let score = 0;
            msgWords.forEach(word => { if (text.includes(word)) score++; });
            if (item.code_stage === 'distilled') score += 1;
            return { ...item, relevance: score };
        }).sort((a, b) => b.relevance - a.relevance);

        const topItems = scoredItems.filter(i => i.relevance > 0).slice(0, 15);
        const baseItems = scoredItems.filter(i => i.relevance === 0).slice(0, 5);
        const selectedItems = [...topItems, ...baseItems];

        contextPrefix = "MEMORIA A LARGO PLAZO (Contexto relevante, ordenado por relevancia):\n";
        selectedItems.forEach(item => {
            const paraLabel = item.para_type ? ` [${item.para_type.toUpperCase()}]` : '';
            contextPrefix += `- ${item.key}${paraLabel}: ${item.content}\n`;
        });
        contextPrefix += "\nAREAS DE RESPONSABILIDAD ACTIVAS:\n";
        areasData.forEach(a => { contextPrefix += `- ${a.name}: ${a.description}\n`; });

        const userPrompt = `${contextPrefix}\n\nPREGUNTA USUARIO: ${message}`;
        const aiResponse = await aiService.generateResponse(userPrompt, history.reverse(), dynamicSystemPrompt);

        await run('INSERT INTO chat_history (role, message, session_id) VALUES (?, ?, ?)', ['model', aiResponse, chatUser]);
        res.json({ response: aiResponse });
    } catch (err) {
        log.error('AI chat error', { error: err.message });
        res.status(500).json({ error: 'AI Service Error' });
    }
});

// ─── Process / Preview ───────────────────────────────────────────────────────

router.post('/process', validateBody({
    text: { required: true, type: 'string', maxLen: 10000 },
}), async (req, res) => {
    const { ideaId, text } = req.body;

    try {
        const createdBy = req.session.user ? req.session.user.username : null;
        const analysis = await processAndSaveIdea(ideaId, text, createdBy);
        if (!analysis) return res.status(500).json({ error: 'Processing failed' });
        res.json(analysis);
    } catch (err) {
        log.error('AI process error', { error: err.message });
        res.status(500).json({ error: 'Processing failed' });
    }
});

router.post('/preview', validateBody({
    text: { required: true, type: 'string', maxLen: 10000 },
}), async (req, res) => {
    const { text } = req.body;

    try {
        const createdBy = req.session.user ? req.session.user.username : null;
        const contextItems = await all('SELECT key, content FROM context_items');
        const contextString = contextItems.map(c => `${c.key}: ${c.content}`).join('\n');
        const users = await all('SELECT username, role, department, expertise FROM users');
        const areas = await all("SELECT name FROM areas WHERE status = 'active'");

        let speakerContext = null;
        if (createdBy) {
            const speaker = users.find(u => u.username === createdBy);
            if (speaker) speakerContext = { username: speaker.username, role: speaker.role, department: speaker.department, expertise: speaker.expertise };
        }

        const analysis = await aiService.processIdea(text, contextString, users, areas, speakerContext);
        const items = Array.isArray(analysis) ? analysis : [analysis];
        res.json({ preview: true, items, split: items.length > 1, speaker: createdBy });
    } catch (err) {
        log.error('Preview error', { error: err.message });
        res.status(500).json({ error: 'Preview failed' });
    }
});

// ─── Research / Review / Digest ──────────────────────────────────────────────

router.post('/research', validateBody({
    query: { required: true, type: 'string', maxLen: 2000 },
}), async (req, res) => {
    const { query } = req.body;

    try {
        const contextItems = await all('SELECT key, content FROM context_items');
        const contextString = contextItems.map(c => `${c.key}: ${c.content}`).join('\n');

        const result = await researchAgent.researchTopic(query, contextString);

        const contextKey = `research_${Date.now()}`;
        await run(`INSERT INTO context_items (key, content, category, para_type, code_stage, source)
            VALUES (?, ?, ?, 'resource', 'organized', 'research')`,
            [contextKey, result, 'research']);
        const savedItem = await get('SELECT id FROM context_items WHERE key = ?', [contextKey]);

        res.json({ response: result, saved_as_resource: true, context_id: savedItem?.id });
    } catch (_err) {
        res.status(500).json({ error: 'Research failed' });
    }
});

router.post('/review', async (req, res) => {
    try {
        const ideas = await all("SELECT * FROM ideas WHERE created_at >= NOW() - INTERVAL '7 days'");

        let ideasToReview = ideas;
        if (ideas.length < 5) {
            ideasToReview = await all("SELECT * FROM ideas ORDER BY created_at DESC LIMIT 20");
        }

        const review = await reviewAgent.generateWeeklyReview(ideasToReview);

        const reviewedIds = ideasToReview.map(i => i.id);
        if (reviewedIds.length > 0) {
            await run(`UPDATE ideas SET last_reviewed = CURRENT_TIMESTAMP WHERE id IN (${reviewedIds.map(() => '?').join(',')})`, reviewedIds);
        }

        const staleIdeas = await all(`SELECT id, text, ai_summary, code_stage, para_type, created_at
            FROM ideas WHERE code_stage IN ('captured', 'organized')
            AND created_at <= NOW() - INTERVAL '14 days'
            ORDER BY created_at ASC LIMIT 20`);

        res.json({ response: review, stale_ideas: staleIdeas, reviewed_count: reviewedIds.length });
    } catch (err) {
        log.error('Review error', { error: err.message });
        res.status(500).json({ error: 'Review failed' });
    }
});

router.post('/digest', async (req, res) => {
    try {
        const ideas = await all("SELECT * FROM ideas WHERE created_at >= NOW() - INTERVAL '7 days' ORDER BY created_at DESC");
        const waitingFor = await all("SELECT * FROM waiting_for WHERE status = 'waiting'");
        const contextItems = await all('SELECT key, content FROM context_items');
        const contextString = contextItems.map(c => `${c.key}: ${c.content}`).join('\n');
        const areas = await all("SELECT a.*, (SELECT count(*) FROM ideas WHERE related_area_id = CAST(a.id AS TEXT)) as ideas_count, (SELECT count(*) FROM context_items WHERE related_area_id = CAST(a.id AS TEXT)) as context_count FROM areas a WHERE a.status = 'active'");

        const digest = await aiService.generateDigest(ideas, waitingFor, contextString, areas);
        res.json({ response: digest });
    } catch (err) {
        log.error('Digest error', { error: err.message });
        res.status(500).json({ error: 'Digest failed' });
    }
});

// ─── Context (PARA) ──────────────────────────────────────────────────────────

router.get('/context', async (req, res) => {
    try {
        const { para_type, code_stage } = req.query;
        let sql = 'SELECT * FROM context_items';
        const conditions = ['deleted_at IS NULL'];
        const params = [];

        if (para_type) { conditions.push('para_type = ?'); params.push(para_type); }
        if (code_stage) { conditions.push('code_stage = ?'); params.push(code_stage); }

        sql += ' WHERE ' + conditions.join(' AND ');
        sql += ' ORDER BY para_type, category, key';

        const items = await all(sql, params);
        res.json(items);
    } catch (_err) {
        res.status(500).json({ error: 'Failed to fetch context' });
    }
});

router.post('/context', validateBody({
    key: { required: true, type: 'string', maxLen: 200 },
    content: { required: true, type: 'string', maxLen: 50000 },
    para_type: { type: 'string', oneOf: ['project', 'area', 'resource', 'archive'] },
}), async (req, res) => {
    const { key, content, category, para_type, code_stage, source, related_project_id, related_area_id } = req.body;
    try {
        await run(`INSERT INTO context_items (key, content, category, para_type, code_stage, source, related_project_id, related_area_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [key, content, category, para_type || 'resource', code_stage || 'organized', source || 'manual', related_project_id, related_area_id]);
        res.json({ success: true });
    } catch (_err) {
        res.status(500).json({ error: 'Failed to save context' });
    }
});

router.put('/context/:id', async (req, res) => {
    const { key, content, category, para_type, code_stage, related_project_id, related_area_id } = req.body;
    const { id } = req.params;
    try {
        await run(`UPDATE context_items SET key = ?, content = ?, category = ?, para_type = ?, code_stage = ?,
            related_project_id = ?, related_area_id = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?`,
            [key, content, category, para_type, code_stage, related_project_id, related_area_id, id]);
        res.json({ success: true });
    } catch (_err) {
        res.status(500).json({ error: 'Failed to update context' });
    }
});

router.delete('/context/:id', async (req, res) => {
    try {
        await run('UPDATE context_items SET deleted_at = NOW() WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (_err) {
        res.status(500).json({ error: 'Failed to delete context' });
    }
});

router.post('/context/:id/distill', async (req, res) => {
    try {
        const item = await get('SELECT * FROM context_items WHERE id = ?', [req.params.id]);
        if (!item) return res.status(404).json({ error: 'Context item not found' });

        const distilled = await aiService.distillContent(item.content);
        await run(`UPDATE context_items SET code_stage = 'distilled', distilled_summary = ? WHERE id = ?`,
            [distilled.resumen_destilado, req.params.id]);
        res.json(distilled);
    } catch (_err) {
        res.status(500).json({ error: 'Distill failed' });
    }
});

router.post('/context/:id/archive', async (req, res) => {
    try {
        await run(`UPDATE context_items SET para_type = 'archive', code_stage = 'expressed' WHERE id = ?`, [req.params.id]);
        res.json({ success: true });
    } catch (_err) {
        res.status(500).json({ error: 'Archive failed' });
    }
});

// Export AGENTS for the agents endpoint
router.AGENTS = AGENTS;

module.exports = router;
