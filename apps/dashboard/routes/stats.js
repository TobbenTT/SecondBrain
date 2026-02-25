const express = require('express');
const { get, all } = require('../database');
const log = require('../helpers/logger');

const router = express.Router();

// ─── In-memory cache (TTL-based) ────────────────────────────────────────────

const _cache = {};

function cached(key, ttlMs, queryFn) {
    return async (_req, res) => {
        const now = Date.now();
        if (_cache[key] && now - _cache[key].ts < ttlMs) {
            return res.json(_cache[key].data);
        }
        try {
            const data = await queryFn();
            _cache[key] = { data, ts: now };
            res.json(data);
        } catch (err) {
            log.error(`Stats ${key} error`, { error: err.message });
            res.status(500).json({ error: `${key} failed` });
        }
    };
}

// ─── Home Counts (lightweight — replaces 4 full-array fetches) ──────────────

router.get('/home-counts', cached('home-counts', 30000, async () => {
    const row = await get(`
        SELECT
            (SELECT count(*) FROM projects WHERE status != 'cancelled') as projects,
            (SELECT count(*) FROM ideas) as ideas,
            (SELECT count(*) FROM archivos) as archivos,
            (SELECT count(*) FROM areas WHERE status = 'active') as areas
    `);
    return {
        projects: row.projects || 0,
        ideas: row.ideas || 0,
        archivos: row.archivos || 0,
        areas: row.areas || 0
    };
}));

// ─── CODE Stats ──────────────────────────────────────────────────────────────

router.get('/code', cached('code', 30000, async () => {
    const stages = await all(`SELECT code_stage, count(*) as count FROM ideas GROUP BY code_stage`);
    const result = { captured: 0, organized: 0, distilled: 0, expressed: 0 };
    stages.forEach(s => { if (s.code_stage && result.hasOwnProperty(s.code_stage)) result[s.code_stage] = s.count; });
    const nullCount = await get(`SELECT count(*) as c FROM ideas WHERE code_stage IS NULL`);
    result.captured += nullCount ? nullCount.c : 0;
    return result;
}));

// ─── PARA Stats ──────────────────────────────────────────────────────────────

router.get('/para', cached('para', 30000, async () => {
    const types = await all(`SELECT para_type, count(*) as count FROM ideas WHERE para_type IS NOT NULL GROUP BY para_type`);
    const result = { project: 0, area: 0, resource: 0, archive: 0 };
    types.forEach(t => { if (t.para_type && result.hasOwnProperty(t.para_type)) result[t.para_type] = t.count; });
    return result;
}));

// ─── Overview ────────────────────────────────────────────────────────────────

router.get('/overview', cached('overview', 30000, async () => {
    const row = await get(`
        SELECT
            (SELECT count(*) FROM ideas) as ideas,
            (SELECT count(*) FROM projects) as projects,
            (SELECT count(*) FROM areas WHERE status = 'active') as areas,
            (SELECT count(*) FROM context_items) as context,
            (SELECT count(*) FROM waiting_for WHERE status = 'waiting') as waiting
    `);
    return {
        ideas: row.ideas || 0,
        projects: row.projects || 0,
        areas: row.areas || 0,
        context: row.context || 0,
        waiting: row.waiting || 0
    };
}));

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
            FROM areas a LEFT JOIN ideas i ON i.related_area_id = CAST(a.id AS TEXT)
            WHERE a.status = 'active' GROUP BY a.id, a.name, a.icon ORDER BY idea_count DESC`);

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

// ─── Executive Summary (Dashboard General) ──────────────────────────────────
// Optimized: 20 queries → 7

router.get('/executive', cached('executive', 30000, async () => {
    const [
        projByStatus,
        ideasByStage,
        ideasWeekly,
        compromisosAgg,
        miscCounts,
        projectsOverdue,
        topProjects
    ] = await Promise.all([
        // 1. Projects grouped by status (replaces 4 individual counts)
        all(`SELECT status, count(*) as c FROM projects GROUP BY status`),

        // 2. Ideas grouped by code_stage (replaces 5 individual counts)
        all(`SELECT COALESCE(code_stage, 'captured') as stage, count(*) as c FROM ideas GROUP BY COALESCE(code_stage, 'captured')`),

        // 3. Ideas this week vs last week (replaces 2 queries)
        get(`SELECT
            count(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as this_week,
            count(*) FILTER (WHERE created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days') as last_week
        FROM ideas WHERE created_at >= NOW() - INTERVAL '14 days'`),

        // 4. Compromisos aggregated in SQL (replaces 2 queries that fetched full arrays)
        get(`SELECT
            COALESCE(SUM(jsonb_array_length(compromisos::jsonb)), 0) as total,
            COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '7 days'
                THEN jsonb_array_length(compromisos::jsonb) ELSE 0 END), 0) as semana
        FROM reuniones WHERE compromisos IS NOT NULL AND compromisos != '[]' AND compromisos != ''`),

        // 5. Misc counts (replaces 5 individual queries)
        get(`SELECT
            (SELECT count(*) FROM waiting_for WHERE status = 'waiting') as waiting_open,
            (SELECT count(*) FROM waiting_for) as waiting_total,
            (SELECT count(*) FROM reuniones WHERE created_at >= NOW() - INTERVAL '7 days') as reun_week,
            (SELECT count(*) FROM reuniones) as reun_total,
            (SELECT count(*) FROM areas WHERE status = 'active') as areas_active
        `),

        // 6. Overdue projects
        get(`SELECT count(*) as c FROM projects WHERE deadline IS NOT NULL AND deadline < CURRENT_DATE::text AND status NOT IN ('completed','cancelled')`),

        // 7. Top 5 active projects
        all(`SELECT name, icon, status, deadline FROM projects WHERE status IN ('active','development','beta') ORDER BY CASE WHEN deadline IS NOT NULL THEN 0 ELSE 1 END, deadline ASC LIMIT 5`)
    ]);

    // Parse projects by status
    const projMap = {};
    (projByStatus || []).forEach(r => { projMap[r.status] = parseInt(r.c) || 0; });
    const pActive = (projMap.active || 0) + (projMap.development || 0) + (projMap.beta || 0);
    const pCompleted = projMap.completed || 0;
    const pPaused = projMap.paused || 0;
    const pTotal = Object.values(projMap).reduce((a, b) => a + b, 0);

    // Parse ideas by stage
    const ideaMap = {};
    (ideasByStage || []).forEach(r => { ideaMap[r.stage] = parseInt(r.c) || 0; });
    const iTotal = Object.values(ideaMap).reduce((a, b) => a + b, 0);
    const iPending = ideaMap.captured || 0;

    // Ideas trend
    const thisW = parseInt(ideasWeekly?.this_week) || 0;
    const lastW = parseInt(ideasWeekly?.last_week) || 0;
    const ideasTrend = lastW > 0 ? Math.round(((thisW - lastW) / lastW) * 100) : (thisW > 0 ? 100 : 0);

    return {
        projectsActive: pActive,
        projectsCompleted: pCompleted,
        projectsPaused: pPaused,
        projectsTotal: pTotal,
        projectsOverdue: parseInt(projectsOverdue?.c) || 0,
        projectCompletionRate: pTotal > 0 ? Math.round((pCompleted / pTotal) * 100) : 0,
        ideasTotal: iTotal,
        ideasPending: iPending,
        expressed: ideaMap.expressed || 0,
        organized: ideaMap.organized || 0,
        distilled: ideaMap.distilled || 0,
        ideasProgressRate: iTotal > 0 ? Math.round(((iTotal - iPending) / iTotal) * 100) : 0,
        ideasWeek: thisW,
        ideasTrend,
        compromisos: parseInt(compromisosAgg?.total) || 0,
        compromisosSemana: parseInt(compromisosAgg?.semana) || 0,
        waitingOpen: parseInt(miscCounts?.waiting_open) || 0,
        waitingTotal: parseInt(miscCounts?.waiting_total) || 0,
        reunionesWeek: parseInt(miscCounts?.reun_week) || 0,
        reunionesTotal: parseInt(miscCounts?.reun_total) || 0,
        areasActive: parseInt(miscCounts?.areas_active) || 0,
        topProjects: topProjects || []
    };
}));

module.exports = router;
