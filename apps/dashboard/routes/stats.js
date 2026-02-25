const express = require('express');
const { get, all } = require('../database');
const log = require('../helpers/logger');

const router = express.Router();

// ─── CODE Stats ──────────────────────────────────────────────────────────────

router.get('/code', async (req, res) => {
    try {
        const stages = await all(`SELECT code_stage, count(*) as count FROM ideas GROUP BY code_stage`);
        const result = { captured: 0, organized: 0, distilled: 0, expressed: 0 };
        stages.forEach(s => { if (s.code_stage && result.hasOwnProperty(s.code_stage)) result[s.code_stage] = s.count; });
        const nullCount = await get(`SELECT count(*) as c FROM ideas WHERE code_stage IS NULL`);
        result.captured += nullCount ? nullCount.c : 0;
        res.json(result);
    } catch (_err) {
        res.status(500).json({ error: 'Failed to fetch CODE stats' });
    }
});

// ─── PARA Stats ──────────────────────────────────────────────────────────────

router.get('/para', async (req, res) => {
    try {
        const types = await all(`SELECT para_type, count(*) as count FROM ideas WHERE para_type IS NOT NULL GROUP BY para_type`);
        const result = { project: 0, area: 0, resource: 0, archive: 0 };
        types.forEach(t => { if (t.para_type && result.hasOwnProperty(t.para_type)) result[t.para_type] = t.count; });
        res.json(result);
    } catch (_err) {
        res.status(500).json({ error: 'Failed to fetch PARA stats' });
    }
});

// ─── Overview ────────────────────────────────────────────────────────────────

router.get('/overview', async (req, res) => {
    try {
        const [ideas, projects, areas, context, waiting] = await Promise.all([
            get('SELECT count(*) as c FROM ideas'),
            get('SELECT count(*) as c FROM projects'),
            get("SELECT count(*) as c FROM areas WHERE status = 'active'"),
            get('SELECT count(*) as c FROM context_items'),
            get("SELECT count(*) as c FROM waiting_for WHERE status = 'waiting'")
        ]);
        res.json({
            ideas: ideas.c, projects: projects.c, areas: areas.c,
            context: context.c, waiting: waiting.c
        });
    } catch (_err) {
        res.status(500).json({ error: 'Failed to fetch overview stats' });
    }
});

// ─── Analytics ───────────────────────────────────────────────────────────────

router.get('/analytics', async (req, res) => {
    try {
        const ideasPerDay = await all(`SELECT DATE(created_at) as date, count(*) as count
            FROM ideas WHERE created_at >= NOW() - INTERVAL '30 days'
            GROUP BY DATE(created_at) ORDER BY date`);

        const ideasPerWeek = await all(`SELECT TO_CHAR(created_at, 'IYYY-"W"IW') as week, count(*) as count
            FROM ideas WHERE created_at >= NOW() - INTERVAL '84 days'
            GROUP BY TO_CHAR(created_at, 'IYYY-"W"IW') ORDER BY week`);

        const completionPerDay = await all(`SELECT date,
            count(*) as total, sum(completed) as completed,
            ROUND(CAST(sum(completed) AS NUMERIC) / count(*) * 100, 1) as rate
            FROM daily_checklist WHERE date >= (CURRENT_DATE - INTERVAL '30 days')::text
            GROUP BY date ORDER BY date`);

        const activeAreas = await all(`SELECT a.name, a.icon, count(i.id) as idea_count
            FROM areas a LEFT JOIN ideas i ON i.related_area_id = a.id
            WHERE a.status = 'active' GROUP BY a.id ORDER BY idea_count DESC`);

        const codeFlow = await all(`SELECT code_stage, count(*) as count FROM ideas GROUP BY code_stage`);
        const byType = await all(`SELECT ai_type, count(*) as count FROM ideas WHERE ai_type IS NOT NULL GROUP BY ai_type ORDER BY count DESC`);
        const byPriority = await all(`SELECT priority, count(*) as count FROM ideas WHERE priority IS NOT NULL GROUP BY priority`);

        const userProductivity = await all(`SELECT assigned_to as username, count(*) as ideas_created,
            sum(CASE WHEN code_stage = 'expressed' THEN 1 ELSE 0 END) as expressed,
            sum(CASE WHEN code_stage = 'distilled' THEN 1 ELSE 0 END) as distilled
            FROM ideas WHERE assigned_to IS NOT NULL AND created_at >= NOW() - INTERVAL '30 days'
            GROUP BY assigned_to`);

        res.json({ ideasPerDay, ideasPerWeek, completionPerDay, activeAreas, codeFlow, byType, byPriority, userProductivity });
    } catch (err) {
        log.error('Analytics error', { error: err.message });
        res.status(500).json({ error: 'Analytics failed' });
    }
});

// ─── Executive Summary (Home) ───────────────────────────────────────────────

router.get('/executive', async (req, res) => {
    try {
        const [
            projectsActive, projectsCompleted, projectsPaused,
            ideasPending, expressed,
            compromisos, compromisosSemana
        ] = await Promise.all([
            get("SELECT count(*) as c FROM projects WHERE status IN ('active','development','beta')"),
            get("SELECT count(*) as c FROM projects WHERE status = 'completed'"),
            get("SELECT count(*) as c FROM projects WHERE status = 'paused'"),
            get("SELECT count(*) as c FROM ideas WHERE code_stage = 'captured' OR code_stage IS NULL"),
            get("SELECT count(*) as c FROM ideas WHERE code_stage = 'expressed'"),
            get("SELECT count(*) as c FROM reuniones_compromisos WHERE estado != 'cumplido'"),
            get("SELECT count(*) as c FROM reuniones_compromisos WHERE estado != 'cumplido' AND created_at >= NOW() - INTERVAL '7 days'")
        ]);

        res.json({
            projectsActive: projectsActive?.c || 0,
            projectsCompleted: projectsCompleted?.c || 0,
            projectsPaused: projectsPaused?.c || 0,
            ideasPending: ideasPending?.c || 0,
            expressed: expressed?.c || 0,
            compromisos: compromisos?.c || 0,
            compromisosSemana: compromisosSemana?.c || 0
        });
    } catch (err) {
        log.error('Executive summary error', { error: err.message });
        res.status(500).json({ error: 'Executive summary failed' });
    }
});

module.exports = router;
