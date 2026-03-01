const express = require('express');
const path = require('path');
const fs = require('fs');
const { get, all } = require('../database');
const log = require('../helpers/logger');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorize');

const router = express.Router();

// All stats endpoints require authentication
router.use(requireAuth);
const KNOWLEDGE_DIR = path.join(__dirname, '..', '..', '..', 'knowledge');

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
            (SELECT count(*) FROM projects WHERE status != 'cancelled' AND deleted_at IS NULL) as projects,
            (SELECT count(*) FROM ideas WHERE deleted_at IS NULL) as ideas,
            (SELECT count(*) FROM areas WHERE status = 'active') as areas
    `);
    // Archivos are filesystem-based, not in DB
    let archivos = 0;
    try {
        if (fs.existsSync(KNOWLEDGE_DIR)) {
            archivos = fs.readdirSync(KNOWLEDGE_DIR, { withFileTypes: true }).filter(f => f.isFile()).length;
        }
    } catch { /* ignore */ }
    return {
        projects: row.projects || 0,
        ideas: row.ideas || 0,
        archivos,
        areas: row.areas || 0
    };
}));

// ─── CODE Stats ──────────────────────────────────────────────────────────────

router.get('/code', cached('code', 30000, async () => {
    const stages = await all(`SELECT code_stage, count(*) as count FROM ideas WHERE deleted_at IS NULL GROUP BY code_stage`);
    const result = { captured: 0, organized: 0, distilled: 0, expressed: 0 };
    stages.forEach(s => { if (s.code_stage && result.hasOwnProperty(s.code_stage)) result[s.code_stage] = s.count; });
    const nullCount = await get(`SELECT count(*) as c FROM ideas WHERE code_stage IS NULL AND deleted_at IS NULL`);
    result.captured += nullCount ? nullCount.c : 0;
    return result;
}));

// ─── PARA Stats ──────────────────────────────────────────────────────────────

router.get('/para', cached('para', 30000, async () => {
    const types = await all(`SELECT para_type, count(*) as count FROM ideas WHERE para_type IS NOT NULL AND deleted_at IS NULL GROUP BY para_type`);
    const result = { project: 0, area: 0, resource: 0, archive: 0 };
    types.forEach(t => { if (t.para_type && result.hasOwnProperty(t.para_type)) result[t.para_type] = t.count; });
    return result;
}));

// ─── Overview ────────────────────────────────────────────────────────────────

router.get('/overview', cached('overview', 30000, async () => {
    const row = await get(`
        SELECT
            (SELECT count(*) FROM ideas WHERE deleted_at IS NULL) as ideas,
            (SELECT count(*) FROM projects WHERE deleted_at IS NULL) as projects,
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
    const safe = async (fn) => { try { return await fn(); } catch (e) { log.error('Analytics sub-query failed', { error: e.message }); return null; } };

    try {
        const [ideasPerDay, ideasPerWeek, completionPerDay, activeAreas, codeFlow, byType, byPriority, userProductivity] = await Promise.all([
            safe(() => all(`SELECT DATE(created_at) as date, count(*) as count
                FROM ideas WHERE created_at >= NOW() - INTERVAL '30 days' AND deleted_at IS NULL
                GROUP BY DATE(created_at) ORDER BY date`)),
            safe(() => all(`SELECT TO_CHAR(created_at, 'IYYY-"W"IW') as week, count(*) as count
                FROM ideas WHERE created_at >= NOW() - INTERVAL '84 days' AND deleted_at IS NULL
                GROUP BY TO_CHAR(created_at, 'IYYY-"W"IW') ORDER BY week`)),
            safe(() => all(`SELECT date,
                count(*) as total, sum(completed) as completed,
                ROUND(CAST(sum(completed) AS NUMERIC) / count(*) * 100, 1) as rate
                FROM daily_checklist WHERE date >= (CURRENT_DATE - INTERVAL '30 days')::text
                GROUP BY date ORDER BY date`)),
            safe(() => all(`SELECT a.name, a.icon, count(i.id) as idea_count
                FROM areas a LEFT JOIN ideas i ON i.related_area_id = CAST(a.id AS TEXT) AND i.deleted_at IS NULL
                WHERE a.status = 'active' GROUP BY a.id, a.name, a.icon ORDER BY idea_count DESC`)),
            safe(() => all(`SELECT code_stage, count(*) as count FROM ideas WHERE deleted_at IS NULL GROUP BY code_stage`)),
            safe(() => all(`SELECT ai_type, count(*) as count FROM ideas WHERE ai_type IS NOT NULL AND deleted_at IS NULL GROUP BY ai_type ORDER BY count DESC`)),
            safe(() => all(`SELECT priority, count(*) as count FROM ideas WHERE priority IS NOT NULL AND deleted_at IS NULL GROUP BY priority`)),
            safe(() => all(`SELECT assigned_to as username, count(*) as ideas_created,
                sum(CASE WHEN code_stage = 'expressed' THEN 1 ELSE 0 END) as expressed,
                sum(CASE WHEN code_stage = 'distilled' THEN 1 ELSE 0 END) as distilled
                FROM ideas WHERE assigned_to IS NOT NULL AND created_at >= NOW() - INTERVAL '30 days' AND deleted_at IS NULL
                GROUP BY assigned_to`))
        ]);

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
        all(`SELECT status, count(*) as c FROM projects WHERE deleted_at IS NULL GROUP BY status`),

        // 2. Ideas grouped by code_stage (replaces 5 individual counts)
        all(`SELECT COALESCE(code_stage, 'captured') as stage, count(*) as c FROM ideas WHERE deleted_at IS NULL GROUP BY COALESCE(code_stage, 'captured')`),

        // 3. Ideas this week vs last week (replaces 2 queries)
        get(`SELECT
            count(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as this_week,
            count(*) FILTER (WHERE created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days') as last_week
        FROM ideas WHERE created_at >= NOW() - INTERVAL '14 days' AND deleted_at IS NULL`),

        // 4. Compromisos aggregated in SQL (replaces 2 queries that fetched full arrays)
        get(`SELECT
            COALESCE(SUM(jsonb_array_length(compromisos::jsonb)), 0) as total,
            COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '7 days'
                THEN jsonb_array_length(compromisos::jsonb) ELSE 0 END), 0) as semana
        FROM reuniones WHERE compromisos IS NOT NULL AND compromisos != '[]' AND compromisos != '' AND deleted_at IS NULL`),

        // 5. Misc counts (replaces 5 individual queries)
        get(`SELECT
            (SELECT count(*) FROM waiting_for WHERE status = 'waiting') as waiting_open,
            (SELECT count(*) FROM waiting_for) as waiting_total,
            (SELECT count(*) FROM reuniones WHERE created_at >= NOW() - INTERVAL '7 days' AND deleted_at IS NULL) as reun_week,
            (SELECT count(*) FROM reuniones WHERE deleted_at IS NULL) as reun_total,
            (SELECT count(*) FROM areas WHERE status = 'active') as areas_active
        `),

        // 6. Overdue projects
        get(`SELECT count(*) as c FROM projects WHERE deadline IS NOT NULL AND deadline < CURRENT_DATE::text AND status NOT IN ('completed','cancelled') AND deleted_at IS NULL`),

        // 7. Top 5 active projects
        all(`SELECT name, icon, status, deadline FROM projects WHERE status IN ('active','development','beta') AND deleted_at IS NULL ORDER BY CASE WHEN deadline IS NOT NULL THEN 0 ELSE 1 END, deadline ASC LIMIT 5`)
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

// ─── Home Bundle (1 request replaces 4: home-counts + gallery + my-dashboard + notifications) ─
router.get('/home-bundle', async (req, res) => {
    const username = req.session?.user?.username;
    if (!username) return res.status(401).json({ error: 'Not authenticated' });

    try {
        const now = Date.now();
        // Reuse home-counts cache if fresh
        let counts;
        if (_cache['home-counts'] && now - _cache['home-counts'].ts < 30000) {
            counts = _cache['home-counts'].data;
        } else {
            const row = await get(`
                SELECT
                    (SELECT count(*) FROM projects WHERE status != 'cancelled' AND deleted_at IS NULL) as projects,
                    (SELECT count(*) FROM ideas WHERE deleted_at IS NULL) as ideas,
                    (SELECT count(*) FROM areas WHERE status = 'active') as areas
            `);
            let archivos = 0;
            try {
                if (fs.existsSync(KNOWLEDGE_DIR)) {
                    archivos = fs.readdirSync(KNOWLEDGE_DIR, { withFileTypes: true }).filter(f => f.isFile()).length;
                }
            } catch { /* ignore */ }
            counts = { projects: row.projects || 0, ideas: row.ideas || 0, archivos, areas: row.areas || 0 };
            _cache['home-counts'] = { data: counts, ts: now };
        }

        // Run gallery, my-dashboard queries, and notifications in parallel
        const [gallery, myTasks, myDelegations, myReuniones, recentActivity, notifData] = await Promise.all([
            all('SELECT * FROM gallery_photos ORDER BY created_at DESC LIMIT 50'),
            all(`SELECT i.id, i.text, i.ai_summary, i.priority, i.code_stage, i.fecha_limite,
                        a.name as area_name, p.name as project_name
                 FROM ideas i
                 LEFT JOIN areas a ON i.related_area_id = CAST(a.id AS TEXT)
                 LEFT JOIN projects p ON i.project_id = p.id
                 WHERE i.assigned_to = ? AND (i.completada IS NULL OR i.completada = '0')
                 ORDER BY CASE i.priority WHEN 'alta' THEN 1 WHEN 'media' THEN 2 ELSE 3 END, i.created_at DESC
                 LIMIT 10`, [username]),
            all(`SELECT w.id, w.description, w.delegated_to, w.due_date, w.created_at,
                        a.name as area_name
                 FROM waiting_for w
                 LEFT JOIN areas a ON w.related_area_id = a.id
                 WHERE w.delegated_by = ? AND w.status = 'waiting'
                 ORDER BY w.created_at DESC LIMIT 5`, [username]),
            all(`SELECT r.id, r.titulo, r.fecha, r.asistentes
                 FROM reuniones r
                 WHERE r.asistentes LIKE ? AND r.deleted_at IS NULL
                 ORDER BY r.fecha DESC LIMIT 5`, [`%${username}%`]),
            all(`SELECT i.id, i.text, i.ai_summary, i.assigned_to, i.created_at, i.code_stage,
                        a.name as area_name
                 FROM ideas i
                 LEFT JOIN areas a ON i.related_area_id = CAST(a.id AS TEXT)
                 WHERE i.deleted_at IS NULL
                 ORDER BY i.created_at DESC LIMIT 8`),
            // Notifications inline
            (async () => {
                const urgent = await all(`SELECT id, text, ai_summary, priority, fecha_limite
                    FROM ideas WHERE assigned_to = ? AND priority = 'alta'
                    AND (completada IS NULL OR completada = '0') AND deleted_at IS NULL
                    ORDER BY created_at DESC LIMIT 5`, [username]);
                const overdue = await all(`SELECT id, description, delegated_to, due_date
                    FROM waiting_for WHERE delegated_by = ? AND status = 'waiting'
                    AND due_date IS NOT NULL AND due_date < CURRENT_DATE::text
                    LIMIT 5`, [username]);
                let pending_reviews = [];
                try {
                    pending_reviews = await all(`SELECT sr.id, s.name as skill_name
                        FROM skill_reviews sr JOIN skills s ON sr.skill_id = s.id
                        WHERE sr.reviewer = ? AND sr.status = 'pending'
                        LIMIT 5`, [username]);
                } catch (_) { /* skill_reviews table may not exist yet */ }
                return {
                    urgent_tasks: urgent || [],
                    overdue_delegations: overdue || [],
                    pending_reviews: pending_reviews || [],
                    total: (urgent?.length || 0) + (overdue?.length || 0) + (pending_reviews?.length || 0)
                };
            })()
        ]);

        const tasksByPriority = { alta: 0, media: 0, baja: 0 };
        myTasks.forEach(t => { if (t.priority && tasksByPriority[t.priority] !== undefined) tasksByPriority[t.priority]++; });

        res.json({
            counts,
            gallery: gallery || [],
            dashboard: {
                username,
                tasks: myTasks,
                tasks_summary: tasksByPriority,
                delegations: myDelegations,
                reuniones: myReuniones,
                activity: recentActivity
            },
            notifications: notifData
        });
    } catch (err) {
        log.error('Home bundle error', { error: err.message });
        res.status(500).json({ error: 'Home bundle failed' });
    }
});

module.exports = router;
