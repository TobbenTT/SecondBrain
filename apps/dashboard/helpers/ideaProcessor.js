const { run, get, all } = require('../database');
const aiService = require('../services/ai');
const log = require('./logger');

async function processAndSaveIdea(ideaId, text, speakerUsername = null, preComputedAnalysis = null) {
    try {
        const users = await all('SELECT username, role, department, expertise FROM users');
        const areas = await all('SELECT name FROM areas WHERE status = "active"');

        let analysis;
        let contextString = '';
        if (preComputedAnalysis) {
            analysis = preComputedAnalysis;
        } else {
            const contextItems = await all('SELECT key, content FROM context_items');
            contextString = contextItems.map(c => `${c.key}: ${c.content}`).join('\n');

            let speakerContext = null;
            if (speakerUsername) {
                const speaker = users.find(u => u.username === speakerUsername);
                if (speaker) {
                    speakerContext = {
                        username: speaker.username,
                        role: speaker.role,
                        department: speaker.department,
                        expertise: speaker.expertise
                    };
                }
            }

            analysis = await aiService.processIdea(text, contextString, users, areas, speakerContext);
        }

        const ideas = Array.isArray(analysis) ? analysis : [analysis];
        const savedIds = [ideaId];

        for (let idx = 0; idx < ideas.length; idx++) {
            const item = ideas[idx];
            if (!item || item.tipo === 'Error') continue;

            let currentIdeaId = ideaId;

            if (idx > 0) {
                const cleanText = item.texto_limpio || item.resumen || text;
                const result = await run(
                    'INSERT INTO ideas (text, code_stage, created_by) VALUES (?, ?, ?)',
                    [cleanText, 'captured', speakerUsername]
                );
                currentIdeaId = result.lastID;
                savedIds.push(currentIdeaId);
            } else if (item.texto_limpio && item.texto_limpio !== text) {
                await run('UPDATE ideas SET text = ? WHERE id = ?', [item.texto_limpio, currentIdeaId]);
            }

            let areaId = null;
            if (item.suggested_area) {
                const area = await get('SELECT id FROM areas WHERE name = ?', [item.suggested_area]);
                if (area) areaId = area.id;
            }

            const confidence = typeof item.confidence === 'number' ? item.confidence : 0.5;
            const needsReview = (item.needs_review || confidence < 0.6) ? 1 : 0;
            const isProject = item.is_project ? 1 : 0;

            await run(`UPDATE ideas SET
                ai_type = ?, ai_category = ?, ai_action = ?, ai_summary = ?,
                status = 'processed', code_stage = 'organized',
                para_type = ?, related_area_id = ?,
                assigned_to = ?, estimated_time = ?, priority = ?,
                ai_confidence = ?, needs_review = ?,
                suggested_agent = ?, suggested_skills = ?,
                contexto = ?, energia = ?, tipo_compromiso = ?,
                proxima_accion = ?, objetivo = ?, notas = ?,
                is_project = ?
                WHERE id = ?`,
                [
                    item.tipo, item.categoria, item.accion_inmediata, item.resumen,
                    item.para_type || 'resource', areaId,
                    item.assigned_to, item.estimated_time, item.priority || 'media',
                    confidence, needsReview,
                    item.suggested_agent || null,
                    JSON.stringify(item.suggested_skills || []),
                    item.contexto || null, item.energia || null,
                    item.tipo_compromiso || 'esta_semana',
                    item.proxima_accion ? 1 : 0,
                    item.objetivo || null, item.notas || null,
                    isProject,
                    currentIdeaId
                ]
            );

            if (isProject && item.sub_tasks && item.sub_tasks.length > 0) {
                for (const sub of item.sub_tasks) {
                    const subResult = await run(
                        `INSERT INTO ideas (text, code_stage, created_by, parent_idea_id, is_project,
                         assigned_to, contexto, energia, estimated_time, priority,
                         proxima_accion, ai_type, ai_category, ai_summary, para_type,
                         related_area_id, tipo_compromiso, status)
                         VALUES (?, 'organized', ?, ?, 0, ?, ?, ?, ?, ?, ?, 'Tarea', ?, ?, 'project', ?, 'esta_semana', 'processed')`,
                        [
                            sub.texto, speakerUsername, currentIdeaId,
                            sub.assigned_to || item.assigned_to,
                            sub.contexto || item.contexto,
                            sub.energia || 'media',
                            sub.estimated_time || null,
                            sub.priority || item.priority || 'media',
                            sub.es_proxima_accion ? 1 : 0,
                            item.categoria, sub.texto,
                            areaId,
                        ]
                    );
                    savedIds.push(subResult.lastID);
                }
            } else if (isProject) {
                try {
                    const decomp = await aiService.decomposeProject(
                        item.texto_limpio || text,
                        contextString, users, areas
                    );
                    if (decomp && decomp.sub_tasks) {
                        for (const sub of decomp.sub_tasks) {
                            const subResult = await run(
                                `INSERT INTO ideas (text, code_stage, created_by, parent_idea_id, is_project,
                                 assigned_to, contexto, energia, estimated_time, priority,
                                 proxima_accion, ai_type, ai_category, ai_summary, para_type,
                                 related_area_id, tipo_compromiso, status)
                                 VALUES (?, 'organized', ?, ?, 0, ?, ?, ?, ?, ?, ?, 'Tarea', ?, ?, 'project', ?, 'esta_semana', 'processed')`,
                                [
                                    sub.texto, speakerUsername, currentIdeaId,
                                    sub.assigned_to || item.assigned_to,
                                    sub.contexto || '@computador',
                                    sub.energia || 'media',
                                    sub.estimated_time || null,
                                    sub.priority || 'media',
                                    sub.es_proxima_accion ? 1 : 0,
                                    item.categoria, sub.texto,
                                    areaId
                                ]
                            );
                            savedIds.push(subResult.lastID);
                        }
                    }
                } catch (decompErr) {
                    log.error('Project decomposition failed', { error: decompErr.message });
                }
            }

            const logText = item.texto_limpio || item.resumen || text;
            await run(`INSERT INTO inbox_log (source, input_text, ai_confidence, ai_classification, routed_to, needs_review, original_idea_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    ideas.length > 1 ? 'voice-split' : 'idea',
                    logText.substring(0, 200),
                    confidence,
                    JSON.stringify({ tipo: item.tipo, categoria: item.categoria, para_type: item.para_type }),
                    item.suggested_area || 'inbox',
                    needsReview, currentIdeaId
                ]
            );

            if (item.waiting_for && item.waiting_for.delegated_to) {
                await run(`INSERT INTO waiting_for (description, delegated_to, delegated_by, related_idea_id, related_area_id)
                    VALUES (?, ?, ?, ?, ?)`,
                    [
                        item.waiting_for.description || item.accion_inmediata,
                        item.waiting_for.delegated_to,
                        speakerUsername || 'system', currentIdeaId, areaId
                    ]
                );
            }
        }

        return Array.isArray(analysis)
            ? { items: analysis, split: true, count: ideas.length, savedIds }
            : analysis;
    } catch (err) {
        log.error('AI helper error', { error: err.message, ideaId });
        return null;
    }
}

module.exports = { processAndSaveIdea };
