const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const ExcelJS = require('exceljs');
const { run, get, all } = require('../database');
const log = require('../helpers/logger');
const orchestratorBridge = require('../services/orchestratorBridge');
const { requireAdmin, denyRole } = require('../middleware/authorize');
const { avatarUpload, AVATARS_DIR } = require('./auth');
const { supabase, supabaseAdmin, isSupabaseConfigured } = require('../services/supabase');
const { auditLog, decryptPII } = require('../helpers/audit');
const blockConsultor = denyRole('consultor');

const router = express.Router();

// ─── Users ───────────────────────────────────────────────────────────────────

router.get('/users', requireAdmin, async (req, res) => {
    try {
        // ─── Supabase: get users from user_roles + getUserById ───
        if (isSupabaseConfigured() && supabaseAdmin) {
            // Get roles from user_roles table (use admin client to bypass RLS)
            const { data: roles, error: rolesErr } = await supabaseAdmin.from('user_roles').select('user_id, role');
            if (rolesErr) {
                log.error('Supabase user_roles error', { error: rolesErr.message });
            }

            if (roles && roles.length > 0) {
                // Map Supabase roles to dashboard roles (user → usuario)
                const ROLE_MAP = { admin: 'admin', ceo: 'ceo', manager: 'manager', analyst: 'analyst', consultor: 'consultor', usuario: 'usuario', cliente: 'cliente', user: 'usuario' };
                const normalizeRole = (r) => ROLE_MAP[r] || 'usuario';

                const roleMap = {};
                roles.forEach(r => { roleMap[r.user_id] = normalizeRole(r.role); });

                // Fetch each user's auth details individually (avoids listUsers() GoTrue bug)
                const sbUsers = [];
                for (const r of roles) {
                    const { data, error: userErr } = await supabaseAdmin.auth.admin.getUserById(r.user_id);
                    if (userErr) {
                        log.warn('Supabase getUserById error', { uid: r.user_id, error: userErr.message });
                        continue;
                    }
                    if (data?.user) sbUsers.push(data.user);
                }

                log.info('Supabase users fetched', { count: sbUsers.length });

                if (sbUsers.length > 0) {
                    // Local profiles (SQLite)
                    const localUsers = await all('SELECT * FROM users WHERE supabase_uid IS NOT NULL');
                    const localMap = {};
                    localUsers.forEach(u => { localMap[u.supabase_uid] = u; });

                    // Auto-create local profiles for Supabase users that don't have one yet
                    for (const sb of sbUsers) {
                        if (!localMap[sb.id]) {
                            const displayName = sb.user_metadata?.display_name || sb.email?.split('@')[0] || 'user';
                            const role = roleMap[sb.id] || 'analyst';
                            const result = await run(
                                'INSERT INTO users (supabase_uid, username, role, department, expertise) VALUES (?, ?, ?, ?, ?)',
                                [sb.id, displayName, role, '', '']
                            );
                            localMap[sb.id] = { id: result.lastID, supabase_uid: sb.id, username: displayName, role, department: '', expertise: '', avatar: null, created_at: new Date().toISOString() };
                        }
                    }

                    const users = sbUsers.map(sb => {
                        const local = localMap[sb.id];
                        return {
                            id: local.id,
                            supabase_uid: sb.id,
                            username: local.username,
                            email: sb.email,
                            role: roleMap[sb.id] || local.role || 'analyst',
                            department: local.department || '',
                            expertise: local.expertise || '',
                            avatar: local.avatar || null,
                            created_at: local.created_at
                        };
                    });
                    return res.json(users);
                }
            }

            // If no roles found, fall through to SQLite
        }

        // ─── PostgreSQL fallback ───
        const users = await all('SELECT id, username, role, department, expertise, avatar, supabase_uid, twofa_enabled, twofa_enforced, locked_until, created_at FROM users');
        res.json(users);
    } catch (_err) {
        log.error('List users error', { error: _err.message, stack: _err.stack });
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Create user (admin only)
router.post('/users', requireAdmin, async (req, res) => {
    const { username, email, password, role, department, expertise } = req.body;

    if (!password || password.length < 8) {
        return res.status(400).json({ error: 'Password (min 8 chars) required' });
    }

    const validRoles = ['admin', 'ceo', 'manager', 'analyst', 'consultor', 'usuario', 'cliente'];
    const safeRole = validRoles.includes(role) ? role : 'analyst';

    try {
        // ─── Supabase path ───
        if (isSupabaseConfigured() && supabaseAdmin && email) {
            // Create user in Supabase Auth
            const { data: sbUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
                email: email.trim(),
                password,
                email_confirm: true,
                user_metadata: { display_name: (username || email.split('@')[0]).trim() }
            });
            if (createErr) {
                log.error('Supabase create user error', { error: createErr.message });
                return res.status(400).json({ error: createErr.message });
            }

            const uid = sbUser.user.id;

            // Insert role in user_roles
            await supabaseAdmin.from('user_roles').insert({ user_id: uid, role: safeRole });

            // Create local profile
            const displayName = (username || email.split('@')[0]).trim();
            const result = await run(
                'INSERT INTO users (supabase_uid, username, role, department, expertise) VALUES (?, ?, ?, ?, ?)',
                [uid, displayName, safeRole, (department || '').trim(), (expertise || '').trim()]
            );
            const created = await get('SELECT id, username, role, department, expertise, avatar, supabase_uid, created_at FROM users WHERE id = ?', [result.lastID]);
            created.email = email.trim();
            log.info('User created via Supabase', { email: email.trim(), role: safeRole });
            auditLog('user_create', { actor: req.session.user.username, target: displayName, ip: req.ip, userAgent: req.headers['user-agent'], details: { method: 'supabase', role: safeRole } });
            return res.json(created);
        }

        // ─── SQLite fallback ───
        if (!username || !username.trim()) {
            return res.status(400).json({ error: 'username required' });
        }
        const existing = await get('SELECT id FROM users WHERE username = ?', [username.toLowerCase().trim()]);
        if (existing) return res.status(409).json({ error: 'Username already exists' });

        const hash = await bcrypt.hash(password, 10);
        const result = await run(
            'INSERT INTO users (username, password_hash, role, department, expertise) VALUES (?, ?, ?, ?, ?)',
            [username.toLowerCase().trim(), hash, safeRole, (department || '').trim(), (expertise || '').trim()]
        );
        const created = await get('SELECT id, username, role, department, expertise, avatar, created_at FROM users WHERE id = ?', [result.lastID]);
        auditLog('user_create', { actor: req.session.user.username, target: username.toLowerCase().trim(), ip: req.ip, userAgent: req.headers['user-agent'], details: { method: 'local', role: safeRole } });
        res.json(created);
    } catch (err) {
        log.error('Create user error', { error: err.message });
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Update user (admin only)
router.put('/users/:id', requireAdmin, async (req, res) => {
    const { role, department, expertise, newPassword } = req.body;
    const validRoles = ['admin', 'ceo', 'manager', 'analyst', 'consultor', 'usuario', 'cliente'];

    try {
        const user = await get('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const newRole = validRoles.includes(role) ? role : user.role;

        // Update local profile
        await run('UPDATE users SET role = ?, department = ?, expertise = ? WHERE id = ?', [
            newRole,
            (department !== undefined ? department : user.department || '').trim(),
            (expertise !== undefined ? expertise : user.expertise || '').trim(),
            req.params.id
        ]);

        // ─── Supabase sync ───
        if (user.supabase_uid && isSupabaseConfigured()) {
            // Sync role to user_roles in Supabase
            if (supabase && newRole !== user.role) {
                await supabaseAdmin.from('user_roles')
                    .update({ role: newRole })
                    .eq('user_id', user.supabase_uid);
            }
            // Password reset via Supabase Admin
            if (newPassword && newPassword.length >= 8 && supabaseAdmin) {
                const { error: pwErr } = await supabaseAdmin.auth.admin.updateUserById(
                    user.supabase_uid,
                    { password: newPassword }
                );
                if (pwErr) log.error('Supabase password reset error', { error: pwErr.message });
            }
        } else if (newPassword && newPassword.length >= 8) {
            // SQLite fallback password reset
            const hash = await bcrypt.hash(newPassword, 10);
            await run('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.params.id]);
        }

        const updated = await get('SELECT id, username, role, department, expertise, avatar, supabase_uid, created_at FROM users WHERE id = ?', [req.params.id]);
        if (newRole !== user.role) {
            auditLog('role_change', { actor: req.session.user.username, target: user.username, ip: req.ip, userAgent: req.headers['user-agent'], details: { oldRole: user.role, newRole } });
        }
        res.json(updated);
    } catch (err) {
        log.error('Update user error', { error: err.message });
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Upload avatar for any user (admin only)
router.put('/users/:id/avatar', requireAdmin, avatarUpload.single('avatar'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image provided' });

    try {
        const user = await get('SELECT avatar FROM users WHERE id = ?', [req.params.id]);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Delete old avatar
        if (user.avatar) {
            const oldPath = path.join(__dirname, '..', 'public', user.avatar);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        const avatarUrl = `/avatars/${req.file.filename}`;
        await run('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, req.params.id]);
        res.json({ success: true, avatar: avatarUrl });
    } catch (err) {
        log.error('Admin avatar upload error', { error: err.message });
        res.status(500).json({ error: 'Failed to upload avatar' });
    }
});

// Enforce/unenforce 2FA for a user (admin only)
router.put('/users/:id/enforce-2fa', requireAdmin, async (req, res) => {
    try {
        const { enforce } = req.body;
        const targetUser = await get('SELECT username FROM users WHERE id = ?', [req.params.id]);
        await run('UPDATE users SET twofa_enforced = ? WHERE id = ?', [!!enforce, req.params.id]);
        auditLog('enforce_2fa', { actor: req.session.user.username, target: targetUser?.username, ip: req.ip, userAgent: req.headers['user-agent'], details: { enforce: !!enforce } });
        res.json({ success: true });
    } catch (err) {
        log.error('Enforce 2FA error', { error: err.message });
        res.status(500).json({ error: 'Failed to update 2FA enforcement' });
    }
});

// Unlock user account (admin only)
router.put('/users/:id/unlock', requireAdmin, async (req, res) => {
    try {
        const user = await get('SELECT username, locked_until FROM users WHERE id = ?', [req.params.id]);
        if (!user) return res.status(404).json({ error: 'User not found' });

        await run('UPDATE users SET locked_until = NULL WHERE id = ?', [req.params.id]);
        auditLog('account_unlock', { actor: req.session.user.username, target: user.username, ip: req.ip, userAgent: req.headers['user-agent'] });
        log.info('Account unlocked by admin', { target: user.username, admin: req.session.user.username });
        res.json({ success: true });
    } catch (err) {
        log.error('Unlock user error', { error: err.message });
        res.status(500).json({ error: 'Failed to unlock user' });
    }
});

// Delete user (admin only, cannot delete self)
router.delete('/users/:id', requireAdmin, async (req, res) => {
    const currentUser = req.session?.user;

    try {
        const user = await get('SELECT id, username, supabase_uid, avatar FROM users WHERE id = ?', [req.params.id]);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.id === currentUser.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        // Delete from Supabase if applicable
        if (user.supabase_uid && isSupabaseConfigured() && supabaseAdmin) {
            // Delete from user_roles
            await supabaseAdmin.from('user_roles').delete().eq('user_id', user.supabase_uid);
            // Delete from Supabase Auth
            const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(user.supabase_uid);
            if (delErr) log.error('Supabase delete user error', { error: delErr.message });
        }

        // Delete avatar file
        if (user.avatar) {
            const avatarPath = path.join(__dirname, '..', 'public', user.avatar);
            if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
        }

        await run('DELETE FROM users WHERE id = ?', [req.params.id]);
        auditLog('user_delete', { actor: req.session.user.username, target: user.username, ip: req.ip, userAgent: req.headers['user-agent'] });
        res.json({ deleted: true });
    } catch (err) {
        log.error('Delete user error', { error: err.message });
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// ─── Projects ────────────────────────────────────────────────────────────────

// projects.json migration removed — projects live in SQLite only

router.get('/projects', async (req, res) => {
    try {
        const projects = await all(`
            SELECT p.*, a.name as area_name
            FROM projects p
            LEFT JOIN areas a ON p.related_area_id = CAST(a.id AS TEXT)
            WHERE p.deleted_at IS NULL
            ORDER BY p.created_at DESC`);
        const formatted = projects.map(p => ({
            ...p,
            tech: p.tech ? p.tech.split(',').filter(t => t) : []
        }));
        res.json(formatted);
    } catch (err) {
        log.error('Projects fetch error', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

router.post('/projects', blockConsultor, async (req, res) => {
    const { name, description, url, icon, status, tech,
            project_type, client_name, geography,
            related_area_id, horizon, deadline } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });

    const validTypes = ['interno', 'cliente'];
    const safeType = validTypes.includes(project_type) ? project_type : 'interno';

    try {
        const id = Date.now().toString();
        const techStr = Array.isArray(tech) ? tech.map(t => t.trim()).filter(t => t).join(',') : (tech || '');
        await run(`INSERT INTO projects (id, name, description, url, icon, status, tech,
                    project_type, client_name, geography, related_area_id, horizon, deadline)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, name, description || '', url || '', icon || '📦',
             status || 'active', techStr, safeType,
             client_name || null, geography || null,
             related_area_id || null, horizon || null, deadline || null]
        );
        const created = await get(`SELECT p.*, a.name as area_name FROM projects p
            LEFT JOIN areas a ON p.related_area_id = CAST(a.id AS TEXT) WHERE p.id = ?`, [id]);
        res.json({ ...created, tech: created.tech ? created.tech.split(',').filter(t => t) : [] });
    } catch (err) {
        log.error('Create project error', { error: err.message });
        res.status(500).json({ error: 'Failed to save project' });
    }
});

// ─── Update project ──────────────────────────────────────────────────────────
router.put('/projects/:id', blockConsultor, async (req, res) => {
    const { name, description, url, icon, status, tech,
            project_type, client_name, geography,
            related_area_id, horizon, deadline } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });

    const validTypes = ['interno', 'cliente'];
    const safeType = validTypes.includes(project_type) ? project_type : 'interno';

    try {
        const existing = await get('SELECT id FROM projects WHERE id = ?', [req.params.id]);
        if (!existing) return res.status(404).json({ error: 'Project not found' });

        const techStr = Array.isArray(tech) ? tech.map(t => t.trim()).filter(t => t).join(',') : (tech || '');
        await run(`UPDATE projects SET name=?, description=?, url=?, icon=?, status=?, tech=?,
                    project_type=?, client_name=?, geography=?,
                    related_area_id=?, horizon=?, deadline=? WHERE id=?`,
            [name, description || '', url || '', icon || '📦',
             status || 'active', techStr, safeType,
             client_name || null, geography || null,
             related_area_id || null, horizon || null, deadline || null,
             req.params.id]
        );
        const updated = await get(`SELECT p.*, a.name as area_name FROM projects p
            LEFT JOIN areas a ON p.related_area_id = CAST(a.id AS TEXT) WHERE p.id = ?`, [req.params.id]);
        res.json({ ...updated, tech: updated.tech ? updated.tech.split(',').filter(t => t) : [] });
    } catch (err) {
        log.error('Update project error', { error: err.message });
        res.status(500).json({ error: 'Failed to update project' });
    }
});

router.delete('/projects/:id', blockConsultor, requireAdmin, async (req, res) => {
    try {
        await run('UPDATE projects SET deleted_at = NOW() WHERE id = ?', [req.params.id]);
        res.json({ deleted: true });
    } catch (_err) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// ─── Orchestrator ────────────────────────────────────────────────────────────

router.post('/orchestrator/execute', blockConsultor, async (req, res) => {
    const { command, args } = req.body;
    const user = req.session.user;
    if (!user || (user.role !== 'admin' && user.role !== 'ceo')) return res.status(403).json({ error: 'Unauthorized' });

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
        const users = await all("SELECT id, username, role, department, expertise, avatar FROM users WHERE role NOT IN ('usuario', 'cliente')");
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

            const areas = await all("SELECT id, name, icon FROM areas WHERE status = 'active'");
            const byArea = {};
            for (const a of areas) {
                const areaItems = assigned.filter(i => String(i.related_area_id) === String(a.id));
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

        const summary = await all(`SELECT u.username, u.role, u.department, u.avatar,
            COALESCE(ia.total_assigned, 0) as total_assigned,
            COALESCE(ia.total_tasks, 0) as total_tasks,
            COALESCE(dc.completed_today, 0) as completed_today,
            COALESCE(dc.checklist_total, 0) as checklist_total,
            COALESCE(wf.pending_waiting, 0) as pending_waiting,
            CASE WHEN COALESCE(dc.checklist_total, 0) > 0
                THEN ROUND(CAST(COALESCE(dc.completed_today, 0) AS NUMERIC) / dc.checklist_total * 100)
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
            ) wf ON wf.delegated_to = u.username
            WHERE u.role NOT IN ('usuario', 'cliente')`, [today]);

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
            all(`SELECT id, name, description, status FROM projects WHERE deleted_at IS NULL AND (name LIKE ? OR description LIKE ?) LIMIT 10`,
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
            FROM ideas i LEFT JOIN areas a ON i.related_area_id = CAST(a.id AS TEXT)
            WHERE i.priority = 'alta' AND i.code_stage NOT IN ('expressed')
            ${username ? 'AND i.assigned_to = ?' : ''}
            ORDER BY i.created_at DESC LIMIT 10`,
            username ? [username] : [])).filter(t => !(dismissedMap.urgent_task && dismissedMap.urgent_task.has(t.id)));

        const overdueDelegations = (await all(`SELECT w.id, w.description, w.delegated_to, w.delegated_by, w.created_at, a.name as area_name
            FROM waiting_for w LEFT JOIN areas a ON w.related_area_id = a.id
            WHERE w.status = 'waiting' AND w.created_at <= NOW() - INTERVAL '3 days'
            ${username ? 'AND w.delegated_to = ?' : ''}
            ORDER BY w.created_at ASC LIMIT 10`,
            username ? [username] : [])).filter(d => !(dismissedMap.overdue_delegation && dismissedMap.overdue_delegation.has(d.id)));

        const staleCaptures = (await all(`SELECT id, text, created_at FROM ideas
            WHERE code_stage = 'captured' AND created_at <= NOW() - INTERVAL '1 day'
            ORDER BY created_at ASC LIMIT 5`)).filter(s => !(dismissedMap.stale_capture && dismissedMap.stale_capture.has(s.id)));

        const needsReview = (await all(`SELECT id, text, ai_summary, ai_confidence, ai_type FROM ideas
            WHERE needs_review = 1 ORDER BY created_at DESC LIMIT 5`)).filter(n => !(dismissedMap.needs_review && dismissedMap.needs_review.has(n.id)));

        // Meeting notifications for this user
        const meetingReady = (await all(
            `SELECT rn.id, rn.reunion_id, r.titulo, r.fecha, r.asistentes
             FROM reuniones_notifications rn
             JOIN reuniones r ON rn.reunion_id = r.id
             WHERE rn.username = ?
             ORDER BY rn.created_at DESC LIMIT 10`,
            [dismissUser]
        )).filter(m => !(dismissedMap.meeting_ready && dismissedMap.meeting_ready.has(m.id)));

        // User-directed notifications (feedback fixed, etc.)
        const userNotifs = dismissUser !== '_system' ? await all(
            `SELECT * FROM user_notifications WHERE username = ? AND read = 0 ORDER BY created_at DESC LIMIT 10`,
            [dismissUser]
        ) : [];

        const total = urgentTasks.length + overdueDelegations.length + staleCaptures.length + needsReview.length + meetingReady.length + userNotifs.length;

        res.json({
            total,
            urgent_tasks: urgentTasks,
            overdue_delegations: overdueDelegations,
            stale_captures: staleCaptures,
            needs_review: needsReview,
            meeting_ready: meetingReady,
            user_notifications: userNotifs
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
        const validTypes = ['urgent_task', 'overdue_delegation', 'stale_capture', 'needs_review', 'meeting_ready', 'user_notification'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ error: 'Invalid notification type' });
        }
        if (type === 'user_notification') {
            await run('UPDATE user_notifications SET read = 1 WHERE id = ? AND username = ?', [parseInt(id), username]);
        } else {
            await run(
                `INSERT INTO notification_dismissals (username, notification_type, notification_id) VALUES (?, ?, ?) ON CONFLICT (username, notification_type, notification_id) DO NOTHING`,
                [username, type, parseInt(id)]
            );
        }
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
                `INSERT INTO notification_dismissals (username, notification_type, notification_id) VALUES (?, ?, ?) ON CONFLICT (username, notification_type, notification_id) DO NOTHING`,
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

router.get('/export', requireAdmin, async (req, res) => {
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

// ─── Excel Export with KPIs and Charts ───────────────────────────────────────
router.get('/export-excel', requireAdmin, async (req, res) => {
    try {
        const [ideas, users, projects, areas, waitingFor, checklist] = await Promise.all([
            all('SELECT * FROM ideas ORDER BY created_at DESC'),
            all('SELECT id, username, role, department, expertise FROM users'),
            all('SELECT * FROM projects'),
            all('SELECT * FROM areas'),
            all('SELECT * FROM waiting_for'),
            all('SELECT * FROM daily_checklist ORDER BY date DESC LIMIT 90')
        ]);

        const wb = new ExcelJS.Workbook();
        wb.creator = 'SecondBrain Dashboard';
        wb.created = new Date();

        const accentFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6366F1' } };
        const headerFont = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        const titleFont = { bold: true, size: 14, color: { argb: 'FF6366F1' } };
        const kpiFont = { bold: true, size: 20, color: { argb: 'FF1F2937' } };
        const kpiLabelFont = { size: 10, color: { argb: 'FF6B7280' } };
        const borderThin = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };

        // ─── Sheet 1: Dashboard KPIs ─────────────────────────────────
        const ws1 = wb.addWorksheet('Dashboard KPIs', { properties: { tabColor: { argb: 'FF6366F1' } } });
        ws1.columns = [{ width: 3 }, { width: 25 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 18 }];

        // Title
        ws1.mergeCells('B2:G2');
        const titleCell = ws1.getCell('B2');
        titleCell.value = 'SecondBrain — Reporte Ejecutivo';
        titleCell.font = titleFont;
        ws1.getCell('B3').value = `Generado: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`;
        ws1.getCell('B3').font = kpiLabelFont;

        // KPI Cards Row 1
        const totalIdeas = ideas.length;
        const completadas = ideas.filter(i => i.completada).length;
        const enProgreso = ideas.filter(i => !i.completada && i.estado === 'doing').length;
        const pendientes = ideas.filter(i => !i.completada && (!i.estado || i.estado === 'capture')).length;
        const teamSize = users.filter(u => !['usuario', 'cliente'].includes(u.role)).length;
        const totalProjects = projects.length;

        const kpis = [
            { label: 'Total Ideas/Tareas', value: totalIdeas, col: 'B' },
            { label: 'Completadas', value: completadas, col: 'C' },
            { label: 'En Progreso', value: enProgreso, col: 'D' },
            { label: 'Pendientes', value: pendientes, col: 'E' },
            { label: 'Equipo Activo', value: teamSize, col: 'F' },
            { label: 'Proyectos', value: totalProjects, col: 'G' }
        ];

        kpis.forEach(kpi => {
            const valCell = ws1.getCell(`${kpi.col}5`);
            valCell.value = kpi.value;
            valCell.font = kpiFont;
            valCell.alignment = { horizontal: 'center' };
            valCell.border = borderThin;
            valCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };

            const lblCell = ws1.getCell(`${kpi.col}6`);
            lblCell.value = kpi.label;
            lblCell.font = kpiLabelFont;
            lblCell.alignment = { horizontal: 'center' };
        });

        // Completion rate
        const rate = totalIdeas > 0 ? ((completadas / totalIdeas) * 100).toFixed(1) : 0;
        ws1.getCell('B8').value = 'Tasa de Completitud:';
        ws1.getCell('B8').font = { bold: true, size: 11 };
        ws1.getCell('C8').value = `${rate}%`;
        ws1.getCell('C8').font = { bold: true, size: 14, color: { argb: completadas > totalIdeas * 0.5 ? 'FF10B981' : 'FFEF4444' } };

        // ─── Chart Data: Ideas por Estado ─────────────────────────────
        ws1.getCell('B10').value = 'Distribucion por Estado';
        ws1.getCell('B10').font = { bold: true, size: 12 };

        const statusCounts = {};
        ideas.forEach(i => {
            const st = i.completada ? 'Completada' : (i.estado || 'capture');
            statusCounts[st] = (statusCounts[st] || 0) + 1;
        });

        const statusLabels = { capture: 'Captura', clarify: 'Clarificar', organize: 'Organizar', doing: 'En Progreso', review: 'Revision', done: 'Hecho', Completada: 'Completada' };
        let chartRow = 11;
        ws1.getCell(`B${chartRow}`).value = 'Estado';
        ws1.getCell(`B${chartRow}`).font = headerFont;
        ws1.getCell(`B${chartRow}`).fill = accentFill;
        ws1.getCell(`C${chartRow}`).value = 'Cantidad';
        ws1.getCell(`C${chartRow}`).font = headerFont;
        ws1.getCell(`C${chartRow}`).fill = accentFill;
        ws1.getCell(`D${chartRow}`).value = '%';
        ws1.getCell(`D${chartRow}`).font = headerFont;
        ws1.getCell(`D${chartRow}`).fill = accentFill;

        const statusStartRow = chartRow + 1;
        Object.entries(statusCounts).forEach(([status, count]) => {
            chartRow++;
            ws1.getCell(`B${chartRow}`).value = statusLabels[status] || status;
            ws1.getCell(`B${chartRow}`).border = borderThin;
            ws1.getCell(`C${chartRow}`).value = count;
            ws1.getCell(`C${chartRow}`).border = borderThin;
            ws1.getCell(`D${chartRow}`).value = totalIdeas > 0 ? Math.round((count / totalIdeas) * 100) : 0;
            ws1.getCell(`D${chartRow}`).border = borderThin;
        });
        const statusEndRow = chartRow;

        // ─── Chart Data: Ideas por Prioridad ─────────────────────────
        chartRow += 2;
        ws1.getCell(`B${chartRow}`).value = 'Distribucion por Prioridad';
        ws1.getCell(`B${chartRow}`).font = { bold: true, size: 12 };
        chartRow++;

        const priCounts = {};
        ideas.forEach(i => { const p = i.prioridad || 'Sin prioridad'; priCounts[p] = (priCounts[p] || 0) + 1; });

        ws1.getCell(`B${chartRow}`).value = 'Prioridad';
        ws1.getCell(`B${chartRow}`).font = headerFont;
        ws1.getCell(`B${chartRow}`).fill = accentFill;
        ws1.getCell(`C${chartRow}`).value = 'Cantidad';
        ws1.getCell(`C${chartRow}`).font = headerFont;
        ws1.getCell(`C${chartRow}`).fill = accentFill;

        Object.entries(priCounts).forEach(([pri, count]) => {
            chartRow++;
            ws1.getCell(`B${chartRow}`).value = pri;
            ws1.getCell(`B${chartRow}`).border = borderThin;
            ws1.getCell(`C${chartRow}`).value = count;
            ws1.getCell(`C${chartRow}`).border = borderThin;
        });

        // ─── Chart Data: Ideas por Tipo ───────────────────────────────
        chartRow += 2;
        ws1.getCell(`B${chartRow}`).value = 'Distribucion por Tipo';
        ws1.getCell(`B${chartRow}`).font = { bold: true, size: 12 };
        chartRow++;

        const typeCounts = {};
        ideas.forEach(i => { const t = i.tipo || 'Sin tipo'; typeCounts[t] = (typeCounts[t] || 0) + 1; });

        ws1.getCell(`B${chartRow}`).value = 'Tipo';
        ws1.getCell(`B${chartRow}`).font = headerFont;
        ws1.getCell(`B${chartRow}`).fill = accentFill;
        ws1.getCell(`C${chartRow}`).value = 'Cantidad';
        ws1.getCell(`C${chartRow}`).font = headerFont;
        ws1.getCell(`C${chartRow}`).fill = accentFill;

        Object.entries(typeCounts).forEach(([tipo, count]) => {
            chartRow++;
            ws1.getCell(`B${chartRow}`).value = tipo;
            ws1.getCell(`B${chartRow}`).border = borderThin;
            ws1.getCell(`C${chartRow}`).value = count;
            ws1.getCell(`C${chartRow}`).border = borderThin;
        });

        // Add chart for status distribution
        try {
            const chart = ws1.addChart('chart1', {
                type: 'pie',
                title: { text: 'Ideas por Estado' },
                series: [{
                    categoryData: { ref: `'Dashboard KPIs'!B${statusStartRow}:B${statusEndRow}` },
                    values: { ref: `'Dashboard KPIs'!C${statusStartRow}:C${statusEndRow}` }
                }],
                legend: { position: 'right' }
            });
            chart.width = 450;
            chart.height = 280;
            ws1.addChartToCell('E10', chart);
        } catch (_chartErr) {
            // Charts may not be supported in all ExcelJS versions — data tables are the fallback
        }

        // ─── Sheet 2: Ideas & Tareas ─────────────────────────────────
        const ws2 = wb.addWorksheet('Ideas y Tareas', { properties: { tabColor: { argb: 'FF10B981' } } });

        const ideaCols = [
            { header: 'ID', key: 'id', width: 6 },
            { header: 'Titulo', key: 'titulo', width: 40 },
            { header: 'Tipo', key: 'tipo', width: 14 },
            { header: 'Prioridad', key: 'prioridad', width: 12 },
            { header: 'Estado', key: 'estado', width: 14 },
            { header: 'Completada', key: 'completada', width: 12 },
            { header: 'Asignado', key: 'assigned_to', width: 16 },
            { header: 'Proyecto', key: 'project_id', width: 10 },
            { header: 'Creada', key: 'created_at', width: 18 },
            { header: 'Finalizada', key: 'fecha_finalizacion', width: 18 }
        ];
        ws2.columns = ideaCols;

        // Style header row
        ws2.getRow(1).eachCell(cell => {
            cell.font = headerFont;
            cell.fill = accentFill;
            cell.border = borderThin;
            cell.alignment = { horizontal: 'center' };
        });

        ideas.forEach(idea => {
            const row = ws2.addRow({
                id: idea.id,
                titulo: idea.titulo || idea.contenido,
                tipo: idea.tipo || '',
                prioridad: idea.prioridad || '',
                estado: idea.estado || 'capture',
                completada: idea.completada ? 'Si' : 'No',
                assigned_to: idea.assigned_to || '',
                project_id: idea.project_id || '',
                created_at: idea.created_at || '',
                fecha_finalizacion: idea.fecha_finalizacion || ''
            });
            row.eachCell(cell => { cell.border = borderThin; });

            // Conditional coloring
            const statusCell = row.getCell(5);
            const statusColors = {
                capture: 'FFFBBF24', clarify: 'FF3B82F6', organize: 'FF8B5CF6',
                doing: 'FFF97316', review: 'FF6366F1', done: 'FF10B981'
            };
            if (statusColors[idea.estado]) {
                statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusColors[idea.estado] } };
                statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            }

            if (idea.completada) {
                row.getCell(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
                row.getCell(6).font = { color: { argb: 'FFFFFFFF' }, bold: true };
            }
        });

        // Auto-filter
        ws2.autoFilter = { from: 'A1', to: `J${ideas.length + 1}` };

        // ─── Sheet 3: Equipo ──────────────────────────────────────────
        const ws3 = wb.addWorksheet('Equipo', { properties: { tabColor: { argb: 'FF3B82F6' } } });
        ws3.columns = [
            { header: 'Usuario', key: 'username', width: 22 },
            { header: 'Rol', key: 'role', width: 14 },
            { header: 'Departamento', key: 'department', width: 20 },
            { header: 'Especialidad', key: 'expertise', width: 25 },
            { header: 'Tareas Asignadas', key: 'assigned', width: 16 },
            { header: 'Completadas', key: 'completed', width: 14 },
            { header: '% Completitud', key: 'rate', width: 14 }
        ];

        ws3.getRow(1).eachCell(cell => {
            cell.font = headerFont;
            cell.fill = accentFill;
            cell.border = borderThin;
            cell.alignment = { horizontal: 'center' };
        });

        const teamUsers = users.filter(u => !['usuario', 'cliente'].includes(u.role));
        teamUsers.forEach(u => {
            const userIdeas = ideas.filter(i => i.assigned_to === u.username);
            const userDone = userIdeas.filter(i => i.completada).length;
            const row = ws3.addRow({
                username: u.username,
                role: u.role,
                department: u.department || '',
                expertise: u.expertise || '',
                assigned: userIdeas.length,
                completed: userDone,
                rate: userIdeas.length > 0 ? Math.round((userDone / userIdeas.length) * 100) + '%' : 'N/A'
            });
            row.eachCell(cell => { cell.border = borderThin; });

            const roleColors = { admin: 'FFEF4444', ceo: 'FFD4AF37', manager: 'FF3B82F6', analyst: 'FF10B981', consultor: 'FFF59E0B' };
            if (roleColors[u.role]) {
                row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: roleColors[u.role] } };
                row.getCell(2).font = { color: { argb: 'FFFFFFFF' }, bold: true };
            }
        });

        // ─── Sheet 4: Proyectos ───────────────────────────────────────
        const ws4 = wb.addWorksheet('Proyectos', { properties: { tabColor: { argb: 'FFF59E0B' } } });
        ws4.columns = [
            { header: 'ID', key: 'id', width: 6 },
            { header: 'Nombre', key: 'name', width: 35 },
            { header: 'Descripcion', key: 'description', width: 40 },
            { header: 'Estado', key: 'status', width: 14 },
            { header: 'Ideas Asociadas', key: 'ideaCount', width: 16 }
        ];

        ws4.getRow(1).eachCell(cell => {
            cell.font = headerFont;
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } };
            cell.border = borderThin;
            cell.alignment = { horizontal: 'center' };
        });

        projects.forEach(p => {
            const pIdeas = ideas.filter(i => i.project_id === p.id).length;
            const row = ws4.addRow({
                id: p.id,
                name: p.name,
                description: p.description || '',
                status: p.status || 'active',
                ideaCount: pIdeas
            });
            row.eachCell(cell => { cell.border = borderThin; });
        });

        // ─── Sheet 5: Productividad (últimos 30 días) ────────────────
        const ws5 = wb.addWorksheet('Productividad', { properties: { tabColor: { argb: 'FF8B5CF6' } } });
        ws5.columns = [
            { header: 'Fecha', key: 'date', width: 14 },
            { header: 'Ideas Creadas', key: 'created', width: 16 },
            { header: 'Ideas Completadas', key: 'completed', width: 18 }
        ];

        ws5.getRow(1).eachCell(cell => {
            cell.font = headerFont;
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B5CF6' } };
            cell.border = borderThin;
            cell.alignment = { horizontal: 'center' };
        });

        // Build daily stats for last 30 days
        const now = new Date();
        for (let d = 29; d >= 0; d--) {
            const date = new Date(now);
            date.setDate(date.getDate() - d);
            const dateStr = date.toISOString().split('T')[0];

            const created = ideas.filter(i => i.created_at && i.created_at.startsWith(dateStr)).length;
            const completed = ideas.filter(i => i.fecha_finalizacion && i.fecha_finalizacion.startsWith(dateStr)).length;

            const row = ws5.addRow({ date: dateStr, created, completed });
            row.eachCell(cell => { cell.border = borderThin; });
        }

        // Send the workbook
        const filename = `SecondBrain_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        await wb.xlsx.write(res);
        res.end();
    } catch (err) {
        log.error('Excel export error', { error: err.message, stack: err.stack });
        res.status(500).json({ error: 'Excel export failed' });
    }
});

router.post('/import', blockConsultor, requireAdmin, async (req, res) => {
    try {
        const { data } = req.body;
        if (!data) return res.status(400).json({ error: 'No data provided' });

        const imported = { ideas: 0, context: 0, areas: 0, waitingFor: 0 };

        if (data.areas && Array.isArray(data.areas)) {
            for (const a of data.areas) {
                await run('INSERT INTO areas (name, description, icon, status) VALUES (?, ?, ?, ?) ON CONFLICT (name) DO NOTHING',
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

router.get('/agents', async (req, res) => {
    try {
        const businessAgents = Object.entries(AGENTS).map(([key, config]) => {
            const relativePath = path.relative(SKILLS_DIR, config.skillPath).replace(/\\/g, '/');
            return {
                key, name: config.name, role: config.role,
                skillFile: path.basename(config.skillPath),
                skillPath: relativePath,
                skillExists: fs.existsSync(config.skillPath),
                type: 'business'
            };
        });

        // Execution agent stats from ideas table
        const executionStats = await all(`
            SELECT executed_by as agent, COUNT(*) as total_processed,
                   MAX(executed_at) as last_active,
                   SUM(CASE WHEN execution_status = 'completed' THEN 1 ELSE 0 END) as completed,
                   SUM(CASE WHEN execution_status = 'failed' THEN 1 ELSE 0 END) as failed
            FROM ideas WHERE executed_by IS NOT NULL
            GROUP BY executed_by
        `);

        const executionMap = {};
        executionStats.forEach(s => { executionMap[s.agent] = s; });

        const OC_AGENTS = {
            PM: { name: 'Project Manager', role: 'Planifica y coordina la ejecucion de proyectos', icon: '📋', color: '#6366f1' },
            DEV: { name: 'Developer', role: 'Desarrolla soluciones tecnicas y codigo', icon: '💻', color: '#10b981' },
            BUILDER: { name: 'Builder', role: 'Construye y empaqueta los entregables', icon: '🔨', color: '#f59e0b' },
            QA: { name: 'Quality Assurance', role: 'Valida calidad y ejecuta pruebas', icon: '🔍', color: '#8b5cf6' },
            CONSULTING: { name: 'Consulting', role: 'Analiza datos y genera reportes de consultoria', icon: '📊', color: '#06b6d4' },
            REVIEWER: { name: 'Reviewer', role: 'Revisa y aprueba outputs de otros agentes', icon: '📝', color: '#ec4899' }
        };

        const executionAgents = Object.entries(OC_AGENTS).map(([key, config]) => {
            const stats = executionMap[key] || {};
            return {
                key, name: config.name, role: config.role, icon: config.icon, color: config.color,
                type: 'execution',
                total_processed: stats.total_processed || 0,
                completed: stats.completed || 0,
                failed: stats.failed || 0,
                last_active: stats.last_active || null
            };
        });

        res.json({ business: businessAgents, execution: executionAgents });
    } catch (err) {
        log.error('Agents fetch error', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch agents' });
    }
});

// ─── Seed Data (Admin Only) ─────────────────────────────────────────────────

router.post('/admin/seed', requireAdmin, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toISOString();
        const yesterday = new Date(Date.now() - 86400000).toISOString();
        const twoDaysAgo = new Date(Date.now() - 172800000).toISOString();
        const threeDaysAgo = new Date(Date.now() - 259200000).toISOString();

        // ── 1. Projects ──
        const projects = [
            // Internos (herramientas/software)
            { id: 'secondbrain', name: 'SecondBrain Dashboard', description: 'Hub interno de operaciones VSC con gestión CODE/PARA/GTD', url: 'https://github.com/TobbenTT/SecondBrain', icon: '🧠', status: 'active', tech: 'Node.js,Express,SQLite,EJS', project_type: 'interno', client_name: '', geography: '', related_area_id: null, horizon: 'largo', deadline: '' },
            // Clientes (proyectos de consultoría)
            { id: 'plan-dotacion', name: 'Plan de Dotación Q2', description: 'Planificación de personal y turnos para segundo trimestre', url: '', icon: '👥', status: 'active', tech: '', project_type: 'cliente', client_name: 'Minera Los Andes', geography: 'Chile', related_area_id: null, horizon: 'corto', deadline: today },
            { id: 'capacitacion-hse', name: 'Programa Capacitación HSE', description: 'Malla curricular de seguridad y medio ambiente', url: '', icon: '📚', status: 'active', tech: '', project_type: 'cliente', client_name: 'Energía Pacífico', geography: 'LATAM', related_area_id: null, horizon: 'medio', deadline: '' },
            { id: 'auditoria-q1', name: 'Auditoría Cumplimiento Q1', description: 'Auditoría de cumplimiento normativo primer trimestre', url: '', icon: '📋', status: 'completed', tech: '', project_type: 'cliente', client_name: 'Constructora Bío-Bío', geography: 'Chile', related_area_id: null, horizon: 'corto', deadline: '' },
            { id: 'presupuesto-2026', name: 'Presupuesto OPEX 2026', description: 'Modelado presupuestario operativo anual', url: '', icon: '💰', status: 'active', tech: '', project_type: 'cliente', client_name: 'Grupo Industrial Norte', geography: 'Worldwide', related_area_id: null, horizon: 'largo', deadline: '' }
        ];

        // Map area names to IDs for projects
        const areasPre = await all('SELECT id, name FROM areas');
        const areaMapPre = {};
        areasPre.forEach(a => { areaMapPre[a.name] = a.id; });
        // Assign areas to client projects
        projects.find(p => p.id === 'plan-dotacion').related_area_id = areaMapPre['Operaciones'] || null;
        projects.find(p => p.id === 'capacitacion-hse').related_area_id = areaMapPre['HSE'] || null;
        projects.find(p => p.id === 'auditoria-q1').related_area_id = areaMapPre['HSE'] || null;
        projects.find(p => p.id === 'presupuesto-2026').related_area_id = areaMapPre['Finanzas'] || null;

        for (const p of projects) {
            await run(`INSERT INTO projects (id, name, description, url, icon, status, tech, project_type, client_name, geography, related_area_id, horizon, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, url = EXCLUDED.url, icon = EXCLUDED.icon, status = EXCLUDED.status, tech = EXCLUDED.tech, project_type = EXCLUDED.project_type, client_name = EXCLUDED.client_name, geography = EXCLUDED.geography, related_area_id = EXCLUDED.related_area_id, horizon = EXCLUDED.horizon, deadline = EXCLUDED.deadline`,
                [p.id, p.name, p.description, p.url, p.icon, p.status, p.tech, p.project_type, p.client_name, p.geography, p.related_area_id, p.horizon, p.deadline]);
        }

        // ── 2. Get area IDs ──
        const areas = await all('SELECT id, name FROM areas');
        const areaMap = {};
        areas.forEach(a => { areaMap[a.name] = a.id; });

        // ── 3. Ideas (diverse data for all sections) ──
        const ideas = [
            // Tareas assigned to different users with execution data
            { text: 'Revisar plan de dotación para turno noche en Plataforma A', ai_type: 'Tarea', ai_category: 'Operaciones', ai_summary: 'Revisión de dotación turno noche', code_stage: 'organized', para_type: 'project', assigned_to: 'gonzalo', priority: 'alta', area: 'Operaciones', execution_status: 'completed', executed_by: 'PM', execution_output: 'Plan de dotación revisado. Se requieren 3 operadores adicionales para turno noche.' },
            { text: 'Crear malla curricular de seguridad para nuevos operadores', ai_type: 'Tarea', ai_category: 'HSE', ai_summary: 'Malla curricular HSE para operadores nuevos', code_stage: 'organized', para_type: 'project', assigned_to: 'gonzalo', priority: 'alta', area: 'HSE', execution_status: 'reviewing', executed_by: 'CONSULTING', execution_output: 'Malla curricular generada con 12 módulos: inducción, EPP, trabajo en alturas, espacios confinados...' },
            { text: 'Modelar presupuesto OPEX para mantenimiento preventivo Q2', ai_type: 'Tarea', ai_category: 'Finanzas', ai_summary: 'Presupuesto OPEX mantenimiento Q2', code_stage: 'distilled', para_type: 'project', assigned_to: 'jose', priority: 'alta', area: 'Finanzas', execution_status: 'completed', executed_by: 'DEV', execution_output: 'Modelo OPEX generado: $2.3M total, desglose por línea de servicio disponible.' },
            { text: 'Auditar cumplimiento de normativa ambiental ISO 14001', ai_type: 'Tarea', ai_category: 'HSE', ai_summary: 'Auditoría ISO 14001', code_stage: 'expressed', para_type: 'area', assigned_to: 'gonzalo', priority: 'media', area: 'HSE', execution_status: 'completed', executed_by: 'QA', execution_output: 'Auditoría completada: 94% cumplimiento. 3 observaciones menores, 0 no conformidades mayores.' },
            { text: 'Preparar reporte semanal de avance de proyectos activos', ai_type: 'Tarea', ai_category: 'Ejecucion', ai_summary: 'Reporte semanal de proyectos', code_stage: 'organized', para_type: 'project', assigned_to: 'david', priority: 'media', area: 'Ejecucion', execution_status: 'developed', executed_by: 'CONSULTING', execution_output: null },
            { text: 'Clasificar ideas pendientes de inbox para asignación', ai_type: 'Tarea', ai_category: 'GTD', ai_summary: 'Clasificación GTD de inbox', code_stage: 'organized', para_type: 'area', assigned_to: 'david', priority: 'media', area: 'Operaciones', execution_status: 'completed', executed_by: 'PM', execution_output: 'Se clasificaron 15 ideas: 8 tareas, 4 proyectos, 2 referencias, 1 delegación.' },
            { text: 'Verificar certificaciones vencidas del personal de campo', ai_type: 'Delegacion', ai_category: 'HSE', ai_summary: 'Verificación certificaciones personal', code_stage: 'organized', para_type: 'area', assigned_to: 'consultor', priority: 'alta', area: 'Capacitacion', execution_status: 'in_progress', executed_by: 'DEV', execution_output: null },
            { text: 'Actualizar matriz de riesgos operacionales', ai_type: 'Tarea', ai_category: 'Operaciones', ai_summary: 'Actualización matriz de riesgos', code_stage: 'captured', para_type: 'area', assigned_to: 'gonzalo', priority: 'media', area: 'Operaciones', execution_status: 'queued_consulting', executed_by: null, execution_output: null },
            { text: 'Diseñar dashboard de KPIs para área de contratos', ai_type: 'Proyecto', ai_category: 'Contratos', ai_summary: 'Dashboard KPIs contratos', code_stage: 'organized', para_type: 'project', assigned_to: 'jose', priority: 'media', area: 'Contratos', execution_status: 'built', executed_by: 'BUILDER', execution_output: 'Dashboard construido con 8 KPIs: cumplimiento contractual, SLA, penalidades...' },
            { text: 'Integrar webhook de OpenClaw con sistema de notificaciones', ai_type: 'Tarea', ai_category: 'Desarrollo', ai_summary: 'Integración webhook OpenClaw', code_stage: 'distilled', para_type: 'project', assigned_to: 'david', priority: 'baja', area: 'Ejecucion', execution_status: 'completed', executed_by: 'DEV', execution_output: 'Webhook integrado y probado. Notificaciones push funcionando correctamente.' },
            // Ideas without execution (for Captura section)
            { text: 'Evaluar herramienta de BI para reportes automatizados', ai_type: 'Idea', ai_category: 'Desarrollo', ai_summary: 'Evaluación herramienta BI', code_stage: 'captured', para_type: null, assigned_to: 'david', priority: 'baja', area: null, execution_status: null, executed_by: null, execution_output: null },
            { text: 'Propuesta de programa de mentoring entre consultores', ai_type: 'Idea', ai_category: 'Desarrollo Profesional', ai_summary: 'Programa de mentoring', code_stage: 'captured', para_type: null, assigned_to: null, priority: 'baja', area: 'Desarrollo Profesional', execution_status: null, executed_by: null, execution_output: null },
            { text: 'Investigar automatización de reportes de cumplimiento', ai_type: 'Referencia', ai_category: 'Investigacion', ai_summary: 'Automatización reportes', code_stage: 'organized', para_type: 'resource', assigned_to: 'jose', priority: 'baja', area: 'Finanzas', execution_status: null, executed_by: null, execution_output: null },
            // Failed/blocked for OpenClaw pipeline
            { text: 'Generar análisis de costos para renegociación de contrato Marco', ai_type: 'Tarea', ai_category: 'Contratos', ai_summary: 'Análisis costos contrato Marco', code_stage: 'organized', para_type: 'project', assigned_to: 'jose', priority: 'alta', area: 'Contratos', execution_status: 'failed', executed_by: 'DEV', execution_output: null },
            { text: 'Sincronizar base de datos de personal con sistema RRHH', ai_type: 'Tarea', ai_category: 'Operaciones', ai_summary: 'Sync BD personal con RRHH', code_stage: 'organized', para_type: 'area', assigned_to: 'consultor', priority: 'media', area: 'Operaciones', execution_status: 'blocked', executed_by: null, execution_output: null }
        ];

        let insertedIdeas = 0;
        for (const idea of ideas) {
            const areaId = idea.area ? (areaMap[idea.area] || null) : null;
            const executedAt = idea.execution_status ? (idea.execution_status === 'completed' ? yesterday :
                idea.execution_status === 'reviewing' ? now :
                idea.execution_status === 'in_progress' ? now :
                idea.execution_status === 'developed' ? yesterday :
                idea.execution_status === 'built' ? twoDaysAgo :
                idea.execution_status === 'failed' ? threeDaysAgo : null) : null;

            await run(`INSERT INTO ideas (text, ai_type, ai_category, ai_summary, code_stage, para_type,
                assigned_to, priority, related_area_id, execution_status, executed_by, executed_at, execution_output, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [idea.text, idea.ai_type, idea.ai_category, idea.ai_summary, idea.code_stage, idea.para_type,
                 idea.assigned_to, idea.priority, areaId, idea.execution_status, idea.executed_by, executedAt, idea.execution_output, 'seed']);
            insertedIdeas++;
        }

        // ── 4. Waiting For entries ──
        const waitingItems = [
            { description: 'Enviar cotización revisada al cliente Pemex', delegated_to: 'consultor', delegated_by: 'david', area: 'Contratos' },
            { description: 'Confirmar disponibilidad de sala para capacitación HSE', delegated_to: 'gonzalo', delegated_by: 'david', area: 'Capacitacion' },
            { description: 'Recopilar datos de accidentalidad del último trimestre', delegated_to: 'jose', delegated_by: 'gonzalo', area: 'HSE' }
        ];

        for (const w of waitingItems) {
            const areaId = w.area ? (areaMap[w.area] || null) : null;
            await run('INSERT INTO waiting_for (description, delegated_to, delegated_by, related_area_id, status) VALUES (?, ?, ?, ?, ?)',
                [w.description, w.delegated_to, w.delegated_by, areaId, 'waiting']);
        }

        log.info('Seed data inserted', { projects: projects.length, ideas: insertedIdeas, waiting: waitingItems.length });
        res.json({
            success: true,
            seeded: { projects: projects.length, ideas: insertedIdeas, waiting_for: waitingItems.length }
        });
    } catch (err) {
        log.error('Seed data error', { error: err.message });
        res.status(500).json({ error: 'Failed to seed data: ' + err.message });
    }
});

// ─── Gallery ─────────────────────────────────────────────────────────────────

const multer = require('multer');
const GALLERY_DIR = path.join(__dirname, '..', 'public', 'gallery');
if (!fs.existsSync(GALLERY_DIR)) fs.mkdirSync(GALLERY_DIR, { recursive: true });

const galleryUpload = multer({
    storage: multer.diskStorage({
        destination: GALLERY_DIR,
        filename: (_req, file, cb) => cb(null, `gallery_${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '')}`)
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        cb(null, /^image\/(jpeg|png|gif|webp)$/.test(file.mimetype));
    }
});

router.get('/gallery', async (_req, res) => {
    try {
        const photos = await all('SELECT * FROM gallery_photos ORDER BY created_at DESC LIMIT 50');
        res.json(photos);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch gallery' });
    }
});

router.post('/gallery', blockConsultor, galleryUpload.single('photo'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image provided' });
    const url = `/gallery/${req.file.filename}`;
    const caption = (req.body.caption || '').trim();
    const category = req.body.category || 'general';
    const uploadedBy = req.session?.user?.username || 'unknown';

    try {
        const result = await run(
            'INSERT INTO gallery_photos (url, caption, category, uploaded_by) VALUES (?, ?, ?, ?)',
            [url, caption, category, uploadedBy]
        );
        res.json({ success: true, id: result.lastID, url });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save photo' });
    }
});

router.delete('/gallery/:id', requireAdmin, async (req, res) => {
    try {
        const photo = await get('SELECT * FROM gallery_photos WHERE id = ?', [req.params.id]);
        if (!photo) return res.status(404).json({ error: 'Not found' });

        const filePath = path.join(__dirname, '..', 'public', photo.url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await run('DELETE FROM gallery_photos WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete photo' });
    }
});

// ─── My Dashboard — personalized home data ─────────────────────────────────────
router.get('/my-dashboard', async (req, res) => {
    const username = req.session?.user?.username;
    if (!username) return res.status(401).json({ error: 'Not authenticated' });

    try {
        const [myTasks, myDelegations, myReuniones, recentActivity] = await Promise.all([
            // Tasks assigned to me (active, not completed)
            all(`SELECT i.id, i.text, i.ai_summary, i.priority, i.code_stage, i.fecha_limite,
                        a.name as area_name, p.name as project_name
                 FROM ideas i
                 LEFT JOIN areas a ON i.related_area_id = CAST(a.id AS TEXT)
                 LEFT JOIN projects p ON i.project_id = p.id
                 WHERE i.assigned_to = ? AND (i.completada IS NULL OR i.completada = '0')
                 ORDER BY CASE i.priority WHEN 'alta' THEN 1 WHEN 'media' THEN 2 ELSE 3 END, i.created_at DESC
                 LIMIT 10`, [username]),

            // Delegations I'm waiting on
            all(`SELECT w.id, w.description, w.delegated_to, w.due_date, w.created_at,
                        a.name as area_name
                 FROM waiting_for w
                 LEFT JOIN areas a ON w.related_area_id = a.id
                 WHERE w.delegated_by = ? AND w.status = 'waiting'
                 ORDER BY w.created_at DESC LIMIT 5`, [username]),

            // Recent reuniones I attended
            all(`SELECT r.id, r.titulo, r.fecha, r.asistentes
                 FROM reuniones r
                 WHERE r.asistentes LIKE ?
                 ORDER BY r.fecha DESC LIMIT 5`, [`%${username}%`]),

            // Recent ideas created by anyone (activity feed)
            all(`SELECT i.id, i.text, i.ai_summary, i.assigned_to, i.created_at, i.code_stage,
                        a.name as area_name
                 FROM ideas i
                 LEFT JOIN areas a ON i.related_area_id = CAST(a.id AS TEXT)
                 ORDER BY i.created_at DESC LIMIT 8`)
        ]);

        // Count summary
        const tasksByPriority = { alta: 0, media: 0, baja: 0 };
        myTasks.forEach(t => { if (t.priority && tasksByPriority[t.priority] !== undefined) tasksByPriority[t.priority]++; });

        res.json({
            username,
            tasks: myTasks,
            tasks_summary: tasksByPriority,
            delegations: myDelegations,
            reuniones: myReuniones,
            activity: recentActivity
        });
    } catch (err) {
        log.error('My dashboard error', { error: err.message });
        res.status(500).json({ error: 'Failed to load dashboard' });
    }
});

// ─── Graph View — all nodes + edges ────────────────────────────────────────────
router.get('/graph', async (req, res) => {
    try {
        const nodes = [];
        const edges = [];

        // Optional time filter (?days=7|30|90)
        const days = parseInt(req.query.days) || 0;
        const dateFilter = days > 0 ? `AND created_at > NOW() - INTERVAL '${days} days'` : '';
        const fechaFilter = days > 0 ? `AND fecha > NOW() - INTERVAL '${days} days'` : '';

        const [projects, areas, ideas, reuniones, users, skills, okrs, okrLinks] = await Promise.all([
            all('SELECT id, name, status, related_area_id, tech FROM projects'),
            all('SELECT id, name, status FROM areas'),
            all(`SELECT id, text, ai_summary, project_id, related_area_id, assigned_to, parent_idea_id, code_stage FROM ideas WHERE (completada IS NULL OR completada = '0') ${dateFilter} LIMIT 200`),
            all(`SELECT id, titulo, fecha, asistentes, puntos_clave, acuerdos, compromisos, temas_detectados FROM reuniones WHERE deleted_at IS NULL ${fechaFilter} ORDER BY fecha DESC LIMIT 50`),
            all('SELECT id, username, role, department FROM users'),
            all("SELECT id, key, category, para_type, related_project_id, related_area_id, distilled_summary FROM context_items WHERE para_type = 'resource' OR category = 'core'"),
            all("SELECT id, title, type, parent_id, owner, status FROM okrs WHERE deleted_at IS NULL AND status = 'active'"),
            all('SELECT okr_id, link_type, link_id FROM okr_links')
        ]);

        // Filter out 'usuario' and 'cliente' roles — only ranked team members
        const rankedUsers = users.filter(u => !['usuario', 'cliente'].includes(u.role));

        // Build user lookup by name (case-insensitive)
        const userByName = {};
        rankedUsers.forEach(u => { userByName[u.username.toLowerCase()] = u; });

        // Build nodes
        projects.forEach(p => nodes.push({ id: `project-${p.id}`, label: p.name, type: 'project', data: p }));
        areas.forEach(a => nodes.push({ id: `area-${a.id}`, label: a.name, type: 'area', data: a }));
        ideas.forEach(i => nodes.push({ id: `idea-${i.id}`, label: (i.ai_summary || i.text || '').substring(0, 40), type: 'idea', data: i }));
        reuniones.forEach(r => nodes.push({ id: `reunion-${r.id}`, label: r.titulo || 'Sin título', type: 'reunion', data: r }));
        rankedUsers.forEach(u => nodes.push({ id: `user-${u.id}`, label: u.username, type: 'user', data: u }));
        skills.forEach(s => nodes.push({ id: `skill-${s.id}`, label: s.key || s.category, type: 'skill', data: s }));
        okrs.forEach(o => nodes.push({ id: `okr-${o.id}`, label: o.title, type: 'okr', data: o }));

        // ── Edges: skill → project/area ──
        skills.forEach(s => {
            if (s.related_project_id) edges.push({ source: `skill-${s.id}`, target: `project-${s.related_project_id}`, type: 'skill-project' });
            if (s.related_area_id) edges.push({ source: `skill-${s.id}`, target: `area-${s.related_area_id}`, type: 'skill-area' });
        });

        // ── Edges: okr → parent, okr_links → project/area ──
        okrs.filter(o => o.parent_id).forEach(o =>
            edges.push({ source: `okr-${o.id}`, target: `okr-${o.parent_id}`, type: 'okr-parent' }));
        okrs.filter(o => o.owner).forEach(o => {
            const u = userByName[o.owner.toLowerCase()];
            if (u) edges.push({ source: `okr-${o.id}`, target: `user-${u.id}`, type: 'okr-user' });
        });
        okrLinks.forEach(l =>
            edges.push({ source: `okr-${l.okr_id}`, target: `${l.link_type}-${l.link_id}`, type: `okr-${l.link_type}` }));

        // ── Edges: idea → project/area/user/parent ──
        ideas.filter(i => i.project_id).forEach(i =>
            edges.push({ source: `idea-${i.id}`, target: `project-${i.project_id}`, type: 'idea-project' }));
        ideas.filter(i => i.related_area_id).forEach(i =>
            edges.push({ source: `idea-${i.id}`, target: `area-${i.related_area_id}`, type: 'idea-area' }));
        ideas.filter(i => i.assigned_to).forEach(i => {
            const u = userByName[i.assigned_to.toLowerCase()];
            if (u) edges.push({ source: `idea-${i.id}`, target: `user-${u.id}`, type: 'idea-user' });
        });
        ideas.filter(i => i.parent_idea_id).forEach(i =>
            edges.push({ source: `idea-${i.id}`, target: `idea-${i.parent_idea_id}`, type: 'idea-parent' }));

        // ── Edges: reunion_links → project/area ──
        const links = await all('SELECT reunion_id, link_type, link_id FROM reunion_links');
        links.forEach(l =>
            edges.push({ source: `reunion-${l.reunion_id}`, target: `${l.link_type}-${l.link_id}`, type: `reunion-${l.link_type}` }));

        // ── Edges: reunion → users (from asistentes JSON) ──
        reuniones.forEach(r => {
            let asistentes = [];
            try { asistentes = typeof r.asistentes === 'string' ? JSON.parse(r.asistentes) : (r.asistentes || []); } catch (_) {}
            asistentes.forEach(name => {
                if (!name || name === 'Participantes no identificados') return;
                // Try to match by first name or full username (case-insensitive)
                const nameLower = name.toLowerCase().trim();
                // Try exact match first, then first-name match
                let matched = userByName[nameLower];
                if (!matched) {
                    const firstName = nameLower.split(/[@\s.,]/)[0];
                    matched = userByName[firstName];
                }
                if (matched) {
                    edges.push({ source: `reunion-${r.id}`, target: `user-${matched.id}`, type: 'reunion-user' });
                }
            });
        });

        // ── Edges: project → area ──
        projects.filter(p => p.related_area_id).forEach(p =>
            edges.push({ source: `project-${p.id}`, target: `area-${p.related_area_id}`, type: 'project-area' }));

        // ── Edges: reunion ↔ project/area by smart name matching ──
        // Build searchable text per reunion + extract mentioned people
        const reunionTexts = reuniones.map(r => {
            const parts = [r.titulo || ''];
            const mentionedPeople = [];
            ['puntos_clave', 'acuerdos', 'compromisos', 'temas_detectados'].forEach(field => {
                if (!r[field]) return;
                try {
                    const arr = JSON.parse(r[field]);
                    if (Array.isArray(arr)) {
                        arr.forEach(item => {
                            if (typeof item === 'string') parts.push(item);
                            else if (item && typeof item === 'object') {
                                // compromisos: {tarea, quien, cuando, prioridad}
                                if (item.tarea) parts.push(item.tarea);
                                if (item.quien) mentionedPeople.push(item.quien.toLowerCase().trim());
                            }
                        });
                    }
                } catch (_) { parts.push(String(r[field])); }
            });
            return { id: r.id, text: parts.join(' ').toLowerCase(), people: mentionedPeople };
        });

        // Helper: generate name variants for matching
        function nameVariants(name) {
            const lower = name.toLowerCase();
            const noSpaces = lower.replace(/\s+/g, '');
            const words = lower.split(/\s+/).filter(w => w.length >= 3);
            const variants = [lower];
            if (noSpaces !== lower) variants.push(noSpaces);
            // Add individual significant words (skip generic ones)
            const skipWords = new Set(['dashboard', 'sistema', 'multi-agent', 'programa', 'plan', 'portal', 'beta', 'de', 'del', 'los', 'las', 'the']);
            words.forEach(w => { if (!skipWords.has(w) && w.length >= 4 && !/^\d+$/.test(w)) variants.push(w); });
            return variants;
        }

        // Match project names in reunion text
        projects.forEach(p => {
            const variants = nameVariants(p.name);
            reunionTexts.forEach(rt => {
                if (variants.some(v => rt.text.includes(v))) {
                    edges.push({ source: `reunion-${rt.id}`, target: `project-${p.id}`, type: 'reunion-project' });
                }
            });
        });

        // Match area names in reunion text
        areas.forEach(a => {
            if (a.name.length < 3) return;
            const variants = nameVariants(a.name);
            reunionTexts.forEach(rt => {
                if (variants.some(v => rt.text.includes(v))) {
                    edges.push({ source: `reunion-${rt.id}`, target: `area-${a.id}`, type: 'reunion-area' });
                }
            });
        });

        // Connect reuniones to users mentioned in compromisos
        reunionTexts.forEach(rt => {
            rt.people.forEach(personName => {
                if (!personName || personName.length < 2) return;
                const firstName = personName.split(/[\s@.,]/)[0];
                const matched = userByName[personName] || userByName[firstName];
                if (matched) {
                    edges.push({ source: `reunion-${rt.id}`, target: `user-${matched.id}`, type: 'reunion-user' });
                }
            });
        });

        // Only keep edges with valid endpoints, deduplicate
        const nodeIds = new Set(nodes.map(n => n.id));
        const edgeSet = new Set();
        const validEdges = edges.filter(e => {
            if (!nodeIds.has(e.source) || !nodeIds.has(e.target)) return false;
            const key = `${e.source}|${e.target}`;
            if (edgeSet.has(key)) return false;
            edgeSet.add(key);
            return true;
        });

        // Count nodes by type
        const counts = {};
        nodes.forEach(n => { counts[n.type] = (counts[n.type] || 0) + 1; });

        res.json({ nodes, edges: validEdges, counts });
    } catch (err) {
        log.error('Graph data error', { error: err.message });
        res.status(500).json({ error: 'Failed to load graph data' });
    }
});

// ─── Herramientas Contratadas (Subscriptions / Tools) ────────────────────────

router.get('/herramientas', async (req, res) => {
    try {
        const herramientas = await all(
            'SELECT * FROM herramientas_contratadas ORDER BY estado ASC, categoria, nombre'
        );
        res.json({ herramientas });
    } catch (err) {
        log.error('Herramientas list error', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch herramientas' });
    }
});

router.get('/herramientas/resumen', async (req, res) => {
    try {
        const activas = await all("SELECT * FROM herramientas_contratadas WHERE estado = 'activo'");
        let totalMensual = 0;
        activas.forEach(h => {
            const costo = (h.costo_mensual || 0) * (h.num_licencias || 1);
            totalMensual += h.frecuencia === 'anual' ? costo / 12 : costo;
        });

        const categorias = {};
        activas.forEach(h => {
            categorias[h.categoria] = (categorias[h.categoria] || 0) + 1;
        });

        const proxRenovacion = await get(
            "SELECT nombre, fecha_renovacion FROM herramientas_contratadas WHERE estado = 'activo' AND fecha_renovacion IS NOT NULL AND fecha_renovacion != '' ORDER BY fecha_renovacion ASC LIMIT 1"
        );

        res.json({
            total_activas: activas.length,
            total_mensual: Math.round(totalMensual * 100) / 100,
            total_anual: Math.round(totalMensual * 12 * 100) / 100,
            por_categoria: categorias,
            proxima_renovacion: proxRenovacion || null
        });
    } catch (err) {
        log.error('Herramientas resumen error', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch resumen' });
    }
});

router.post('/herramientas', requireAdmin, async (req, res) => {
    const { nombre, proveedor, categoria, costo_mensual, moneda, frecuencia, fecha_inicio, fecha_renovacion, duracion_contrato, fecha_vencimiento, num_licencias, notas } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Nombre es requerido' });
    try {
        const result = await run(
            `INSERT INTO herramientas_contratadas (nombre, proveedor, categoria, costo_mensual, moneda, frecuencia, fecha_inicio, fecha_renovacion, duracion_contrato, fecha_vencimiento, num_licencias, notas, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [nombre, proveedor || null, categoria || 'General', costo_mensual || 0, moneda || 'USD', frecuencia || 'mensual', fecha_inicio || null, fecha_renovacion || null, duracion_contrato || null, fecha_vencimiento || null, num_licencias || 1, notas || null, req.session.user.username]
        );
        log.info('Herramienta added', { id: result.lastID, nombre, by: req.session.user.username });
        res.json({ success: true, id: result.lastID });
    } catch (err) {
        log.error('Herramienta create error', { error: err.message });
        res.status(500).json({ error: 'Failed to create herramienta' });
    }
});

router.put('/herramientas/:id', requireAdmin, async (req, res) => {
    const { nombre, proveedor, categoria, costo_mensual, moneda, frecuencia, fecha_inicio, fecha_renovacion, duracion_contrato, fecha_vencimiento, num_licencias, estado, notas } = req.body;
    try {
        await run(
            `UPDATE herramientas_contratadas SET nombre=?, proveedor=?, categoria=?, costo_mensual=?, moneda=?, frecuencia=?, fecha_inicio=?, fecha_renovacion=?, duracion_contrato=?, fecha_vencimiento=?, num_licencias=?, estado=?, notas=? WHERE id=?`,
            [nombre, proveedor, categoria, costo_mensual, moneda, frecuencia, fecha_inicio, fecha_renovacion, duracion_contrato, fecha_vencimiento, num_licencias, estado, notas, req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        log.error('Herramienta update error', { error: err.message });
        res.status(500).json({ error: 'Failed to update herramienta' });
    }
});

router.delete('/herramientas/:id', requireAdmin, async (req, res) => {
    try {
        await run('DELETE FROM herramientas_contratadas WHERE id = ?', [req.params.id]);
        log.info('Herramienta deleted', { id: req.params.id, by: req.session.user.username });
        res.json({ success: true });
    } catch (err) {
        log.error('Herramienta delete error', { error: err.message });
        res.status(500).json({ error: 'Failed to delete herramienta' });
    }
});

// ─── Trash / Soft-Delete Recovery (admin only) ──────────────────────────────

router.get('/trash', requireAdmin, async (req, res) => {
    try {
        const [ideas, projects, feedback, reuniones, okrs] = await Promise.all([
            all("SELECT id, text, created_by, deleted_at FROM ideas WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC LIMIT 50"),
            all("SELECT id, name, icon, status, deleted_at FROM projects WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC LIMIT 50"),
            all("SELECT id, title, username, category, deleted_at FROM feedback WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC LIMIT 50"),
            all("SELECT id, titulo, fecha, deleted_at FROM reuniones WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC LIMIT 50"),
            all("SELECT id, title, type, deleted_at FROM okrs WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC LIMIT 50")
        ]);
        res.json({ ideas, projects, feedback, reuniones, okrs });
    } catch (err) {
        log.error('Trash fetch error', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch trash' });
    }
});

router.put('/trash/restore', requireAdmin, async (req, res) => {
    const { table, id } = req.body;
    const allowed = ['ideas', 'projects', 'feedback', 'reuniones', 'okrs'];
    if (!allowed.includes(table) || !id) {
        return res.status(400).json({ error: 'Invalid table or id' });
    }
    try {
        await run(`UPDATE ${table} SET deleted_at = NULL WHERE id = ?`, [id]);
        // Also restore child ideas if restoring a parent
        if (table === 'ideas') {
            await run('UPDATE ideas SET deleted_at = NULL WHERE parent_idea_id = ?', [id]);
        }
        res.json({ restored: true });
    } catch (err) {
        log.error('Trash restore error', { error: err.message });
        res.status(500).json({ error: 'Failed to restore item' });
    }
});

router.delete('/trash/:table/:id', requireAdmin, async (req, res) => {
    const { table, id } = req.params;
    const allowed = ['ideas', 'projects', 'feedback', 'reuniones', 'okrs'];
    if (!allowed.includes(table)) {
        return res.status(400).json({ error: 'Invalid table' });
    }
    try {
        await run(`DELETE FROM ${table} WHERE id = ? AND deleted_at IS NOT NULL`, [id]);
        res.json({ purged: true });
    } catch (err) {
        log.error('Trash purge error', { error: err.message });
        res.status(500).json({ error: 'Failed to purge item' });
    }
});

// ─── Audit Log Viewer (admin only) ──────────────────────────────────────────

router.get('/audit-log', requireAdmin, async (req, res) => {
    try {
        const { event_type, actor, target, from, to, limit: lim } = req.query;
        const conditions = [];
        const params = [];

        if (event_type) { conditions.push('event_type = ?'); params.push(event_type); }
        if (actor) { conditions.push('actor = ?'); params.push(actor); }
        if (target) { conditions.push('target = ?'); params.push(target); }
        if (from) { conditions.push('created_at >= ?'); params.push(from); }
        if (to) { conditions.push('created_at <= ?'); params.push(to); }

        const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
        const rows = await all(
            `SELECT * FROM audit_log ${where} ORDER BY created_at DESC LIMIT ?`,
            [...params, parseInt(lim) || 100]
        );

        // Decrypt IPs, then mask for non-admin roles
        const userRole = req.session?.user?.role;
        const result = rows.map(r => {
            const realIp = decryptPII(r.ip_address);
            return {
                ...r,
                ip_address: userRole === 'admin' ? realIp : (realIp ? realIp.replace(/\d+\.\d+$/, '***.***') : null),
                user_agent: userRole === 'admin' ? r.user_agent : undefined
            };
        });

        res.json(result);
    } catch (err) {
        log.error('Audit log fetch error', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch audit log' });
    }
});

// Retention: auto-purge audit logs older than 90 days (GDPR compliance)
router.delete('/audit-log/purge', requireAdmin, async (req, res) => {
    try {
        const userRole = req.session?.user?.role;
        if (userRole !== 'admin') return res.status(403).json({ error: 'Solo admin puede purgar logs' });

        const result = await run(
            "DELETE FROM audit_log WHERE created_at < NOW() - INTERVAL '90 days'"
        );
        const deleted = result?.changes || 0;
        auditLog('audit_purge', { actor: req.session.user.username, ip: req.ip, details: { deleted_count: deleted, retention_days: 90 } });
        res.json({ success: true, deleted });
    } catch (err) {
        log.error('Audit purge error', { error: err.message });
        res.status(500).json({ error: 'Failed to purge audit logs' });
    }
});

module.exports = router;
