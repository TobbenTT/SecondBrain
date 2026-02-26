const log = require('../helpers/logger');
const { run, get, all } = require('../database');
const { generateDailyReport } = require('./ai');
const { isConfigured: smtpConfigured, sendDigestEmail } = require('./mailer');
const telegram = require('./telegram');

// ─── Generate personalized digest for one user ──────────────────────────────

async function generateUserDigest(user) {
    const username = user.username;

    const [ideas, projects, waitingFor, waitingFrom, reuniones, checklist, herramientas, okrs] = await Promise.all([
        all("SELECT id, text, ai_summary, ai_type, priority, contexto FROM ideas WHERE assigned_to = ? AND (completada IS NULL OR completada = '0') AND deleted_at IS NULL ORDER BY priority DESC LIMIT 15", [username]),
        all("SELECT id, name, status, deadline FROM projects WHERE status IN ('active', 'development') AND deleted_at IS NULL"),
        all("SELECT description, delegated_to, due_date FROM waiting_for WHERE delegated_by = ? AND status = 'pending'", [username]),
        all("SELECT description, delegated_by, due_date FROM waiting_for WHERE delegated_to = ? AND status = 'pending'", [username]),
        all("SELECT titulo, fecha, compromisos FROM reuniones WHERE deleted_at IS NULL AND fecha > NOW() - INTERVAL '3 days' ORDER BY fecha DESC LIMIT 5"),
        all("SELECT task, completed FROM daily_checklist WHERE username = ? AND date = CURRENT_DATE", [username]),
        all("SELECT nombre, fecha_renovacion FROM herramientas_contratadas WHERE estado = 'activo' AND fecha_renovacion IS NOT NULL AND fecha_renovacion::date <= (CURRENT_DATE + INTERVAL '15 days') AND fecha_renovacion::date >= CURRENT_DATE"),
        all("SELECT title, type, current_value, target_value, unit FROM okrs WHERE (owner = ? OR owner IS NULL) AND status = 'active' AND deleted_at IS NULL", [username])
    ]);

    // Extract recent compromisos mentioning this user
    const myCompromisos = [];
    for (const r of reuniones) {
        try {
            const comps = typeof r.compromisos === 'string' ? JSON.parse(r.compromisos) : (r.compromisos || []);
            for (const c of comps) {
                if (c.quien && c.quien.toLowerCase().includes(username.toLowerCase())) {
                    myCompromisos.push({ tarea: c.tarea, cuando: c.cuando, reunion: r.titulo });
                }
            }
        } catch (_) {}
    }

    // Build AI data
    const completedToday = checklist.filter(c => c.completed);
    const userStats = [{ username, pending: ideas.length, completed_today: completedToday.length }];

    const aiData = {
        ideas,
        projects,
        waitingFor: [...waitingFor, ...waitingFrom.map(w => ({ ...w, delegated_to: w.delegated_by, description: `[Para ti] ${w.description}` }))],
        completedToday: completedToday.map(c => ({ text: c.task, assigned_to: username })),
        userStats,
        areas: []
    };

    let content;
    try {
        content = await generateDailyReport(aiData);
    } catch (err) {
        log.error('Digest AI generation failed', { username, error: err.message });
        content = buildPlainDigest(username, ideas, waitingFor, myCompromisos, herramientas, okrs);
    }

    // Append extra sections not in the AI report
    if (myCompromisos.length > 0) {
        content += '\n\n## Compromisos de Reuniones\n' +
            myCompromisos.map(c => `- **${c.tarea}** (${c.cuando || 'sin fecha'}) — de ${c.reunion}`).join('\n');
    }
    if (herramientas.length > 0) {
        content += '\n\n## Renovaciones Proximas\n' +
            herramientas.map(h => `- **${h.nombre}** — renueva ${new Date(h.fecha_renovacion).toLocaleDateString('es-CL')}`).join('\n');
    }
    if (okrs.length > 0) {
        content += '\n\n## OKRs Activos\n' +
            okrs.map(o => `- ${o.title}: ${o.current_value || 0}/${o.target_value || '?'} ${o.unit || ''}`).join('\n');
    }

    return content;
}

function buildPlainDigest(username, ideas, waitingFor, compromisos, herramientas, okrs) {
    const date = new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    let md = `# Digest Diario — ${date}\n\nHola **${username}**!\n\n`;
    md += `## Tareas Pendientes (${ideas.length})\n`;
    md += ideas.slice(0, 10).map(i => `- [${i.priority || '-'}] ${i.ai_summary || i.text}`).join('\n') || 'Sin tareas pendientes';
    md += `\n\n## Delegaciones Pendientes (${waitingFor.length})\n`;
    md += waitingFor.map(w => `- Esperando de ${w.delegated_to}: ${w.description}`).join('\n') || 'Sin delegaciones';
    return md;
}

// ─── Run digest for all enabled users ────────────────────────────────────────

async function runDailyDigest() {
    log.info('Daily digest job started');
    try {
        const users = await all("SELECT id, username, digest_email FROM users WHERE digest_enabled = TRUE AND role NOT IN ('usuario', 'cliente')");
        if (!users.length) { log.info('No users with digest enabled'); return; }

        for (const user of users) {
            try {
                const content = await generateUserDigest(user);
                const summary = content.substring(0, 200);

                // Save to DB
                let deliveredVia = 'in_app';
                await run('INSERT INTO daily_digests (user_id, content, summary, delivered_via) VALUES (?, ?, ?, ?)',
                    [user.id, content, summary, deliveredVia]);

                // Send email if configured
                if (smtpConfigured() && user.digest_email) {
                    const date = new Date().toLocaleDateString('es-CL');
                    const htmlContent = `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                        <div style="background:#0052cc;color:#fff;padding:20px;border-radius:8px 8px 0 0;">
                            <h1 style="margin:0;font-size:1.3rem;">VSC Hub — Digest Diario</h1>
                            <p style="margin:4px 0 0;opacity:0.8;font-size:0.9rem;">${date} | ${user.username}</p>
                        </div>
                        <div style="background:#f8fafc;padding:20px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;">
                            <pre style="white-space:pre-wrap;font-family:Inter,sans-serif;font-size:0.9rem;line-height:1.6;color:#334155;">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                        </div>
                        <p style="text-align:center;font-size:0.75rem;color:#94a3b8;margin-top:12px;">Generado automaticamente por VSC Hub</p>
                    </div>`;

                    const sent = await sendDigestEmail(user.digest_email, `VSC Digest — ${date}`, htmlContent);
                    if (sent) {
                        await run("UPDATE daily_digests SET delivered_via = 'email' WHERE user_id = ? ORDER BY created_at DESC LIMIT 1", [user.id]);
                    }
                }

                telegram.notifyDigest(user.username).catch(() => {});
                log.info('Digest generated', { username: user.username });
            } catch (err) {
                log.error('Digest error for user', { username: user.username, error: err.message });
            }
        }
        log.info('Daily digest job completed', { users: users.length });
    } catch (err) {
        log.error('Daily digest job failed', { error: err.message });
    }
}

// ─── Scheduler ────────────────────────────────────────────────────────────────

function startDigestScheduler() {
    try {
        const cron = require('node-cron');
        const cronExpr = process.env.DIGEST_CRON || '0 8 * * 1-5'; // 8 AM weekdays
        const tz = process.env.DIGEST_TIMEZONE || 'America/Santiago';

        cron.schedule(cronExpr, () => {
            runDailyDigest().catch(err => log.error('Digest cron error', { error: err.message }));
        }, { timezone: tz });

        log.info('Digest scheduler started', { cron: cronExpr, timezone: tz });
    } catch (err) {
        log.warn('Digest scheduler not started (node-cron not installed)', { error: err.message });
    }
}

module.exports = { runDailyDigest, startDigestScheduler };
