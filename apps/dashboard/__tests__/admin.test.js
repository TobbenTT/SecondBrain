/**
 * Tests for admin routes: apps/dashboard/routes/admin.js
 *
 * Covers: user CRUD, enforce-2FA, unlock, delete (self-delete guard),
 *         knowledge graph (days allowlist), audit log retrieval,
 *         projects CRUD, gallery CRUD, herramientas CRUD, orchestrator,
 *         search, notifications, export/import, reportability, openclaw,
 *         agents, admin seed, my-dashboard, trash/restore, audit-log purge.
 */

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../database', () => ({ get: jest.fn(), run: jest.fn(), all: jest.fn() }));
jest.mock('../helpers/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }));
jest.mock('../helpers/audit', () => ({ auditLog: jest.fn(), decryptPII: jest.fn(v => v) }));
jest.mock('../services/ai', () => ({ generateResponse: jest.fn(), distillContent: jest.fn() }));
jest.mock('isomorphic-dompurify', () => ({ sanitize: jest.fn(s => s) }));
jest.mock('marked', () => ({ marked: jest.fn(s => s) }));

// Supabase — always unconfigured so routes fall through to PG/local paths
jest.mock('../services/supabase', () => ({
    supabase: null,
    supabaseAdmin: null,
    isSupabaseConfigured: jest.fn(() => false),
}));

// Middleware stubs — just call next()
jest.mock('../middleware/authorize', () => ({
    requireAdmin: (_req, _res, next) => next(),
    denyRole: () => (_req, _res, next) => next(),
}));

// Auth helpers that admin.js requires inline
jest.mock('../helpers/validate', () => ({
    validatePassword: jest.fn(() => ({ valid: true })),
    checkBreachedPassword: jest.fn(async () => ({ breached: false })),
}));

// bcryptjs
jest.mock('bcryptjs', () => ({
    hash: jest.fn(async () => '$2a$10$hashedpassword'),
}));

// avatarUpload / AVATARS_DIR used by PUT /users/:id/avatar
jest.mock('../routes/auth', () => ({
    avatarUpload: { single: () => (_req, _res, next) => next() },
    AVATARS_DIR: '/tmp/avatars',
}));

// orchestratorBridge
jest.mock('../services/orchestratorBridge', () => ({
    executeCommand: jest.fn(),
}));

// ExcelJS — mock workbook with chainable API for Excel export test
jest.mock('exceljs', () => {
    const mockCell = {
        value: null,
        font: null,
        fill: null,
        alignment: null,
        border: null,
    };
    const mockRow = {
        eachCell: jest.fn(cb => { cb(mockCell, 1); }),
        getCell: jest.fn(() => mockCell),
    };
    const mockChart = { width: 0, height: 0 };
    const mockWorksheet = {
        columns: [],
        getCell: jest.fn(() => ({ ...mockCell })),
        getRow: jest.fn(() => mockRow),
        addRow: jest.fn(() => mockRow),
        mergeCells: jest.fn(),
        autoFilter: null,
        addChart: jest.fn(() => mockChart),
        addChartToCell: jest.fn(),
    };
    class Workbook {
        constructor() {
            this.creator = '';
            this.created = null;
            this.xlsx = { write: jest.fn(async () => {}) };
        }
        addWorksheet() { return { ...mockWorksheet }; }
    }
    return { Workbook };
});

// multer — required at module level for gallery
jest.mock('multer', () => {
    const m = () => ({ single: () => (_req, _res, next) => next() });
    m.diskStorage = () => ({});
    return m;
});

// fs — stub existsSync / mkdirSync so gallery init doesn't fail
jest.mock('fs', () => {
    const actual = jest.requireActual('fs');
    return {
        ...actual,
        existsSync: jest.fn(() => true),
        mkdirSync: jest.fn(),
        unlinkSync: jest.fn(),
    };
});

// ── Require after mocks ─────────────────────────────────────────────────────

const { get, run, all } = require('../database');
const { auditLog, decryptPII } = require('../helpers/audit');
const { validatePassword, checkBreachedPassword } = require('../helpers/validate');
const router = require('../routes/admin');

// ── Helpers ──────────────────────────────────────────────────────────────────

function getHandler(router, method, path) {
    const layer = router.stack.find(l =>
        l.route && l.route.path === path && l.route.methods[method]
    );
    if (!layer) return null;
    // Return the last handler (skip middleware like requireAdmin)
    const handlers = layer.route.stack;
    return handlers[handlers.length - 1].handle;
}

const mockReq = (overrides = {}) => ({
    session: { user: { id: 1, username: 'admin', role: 'admin' } },
    body: {},
    params: {},
    query: {},
    headers: {},
    ip: '127.0.0.1',
    ...overrides,
});

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
};

beforeEach(() => jest.clearAllMocks());

// ═════════════════════════════════════════════════════════════════════════════
// GET /users — list users
// ═════════════════════════════════════════════════════════════════════════════

describe('GET /users', () => {
    const handler = getHandler(router, 'get', '/users');

    it('returns list of users from database', async () => {
        const users = [
            { id: 1, username: 'admin', role: 'admin' },
            { id: 2, username: 'analyst1', role: 'analyst' },
        ];
        all.mockResolvedValue(users);

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(all).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(users);
    });

    it('returns 500 on database error', async () => {
        all.mockRejectedValue(new Error('DB down'));

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch users' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// POST /users — create user
// ═════════════════════════════════════════════════════════════════════════════

describe('POST /users', () => {
    const handler = getHandler(router, 'post', '/users');

    it('creates a new user with valid data', async () => {
        const created = { id: 5, username: 'newuser', role: 'analyst', department: '', expertise: '', avatar: null, created_at: '2026-01-01' };
        get.mockResolvedValueOnce(null)           // existing check — no dup
           .mockResolvedValueOnce(created);        // SELECT after INSERT
        run.mockResolvedValue({ lastID: 5 });

        const req = mockReq({
            body: { username: 'NewUser', password: 'StrongP@ss1!', role: 'analyst' },
        });
        const res = mockRes();
        await handler(req, res);

        expect(res.json).toHaveBeenCalledWith(created);
        expect(auditLog).toHaveBeenCalledWith('user_create', expect.objectContaining({ actor: 'admin' }));
    });

    it('rejects weak password', async () => {
        validatePassword.mockReturnValueOnce({ valid: false, error: 'Too short' });

        const req = mockReq({ body: { username: 'user', password: '123', role: 'analyst' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Contraseña') }));
    });

    it('rejects breached password', async () => {
        checkBreachedPassword.mockResolvedValueOnce({ breached: true, count: 5000 });

        const req = mockReq({ body: { username: 'user', password: 'Breached1!', role: 'analyst' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('filtraciones') }));
    });

    it('rejects duplicate username', async () => {
        get.mockResolvedValueOnce({ id: 2 }); // existing user found

        const req = mockReq({ body: { username: 'existing', password: 'GoodP@ss1!', role: 'analyst' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ error: 'Username already exists' });
    });

    it('falls back to analyst when invalid role is provided', async () => {
        get.mockResolvedValueOnce(null)
           .mockResolvedValueOnce({ id: 6, username: 'user', role: 'analyst' });
        run.mockResolvedValue({ lastID: 6 });

        const req = mockReq({ body: { username: 'user', password: 'GoodP@ss1!', role: 'hacker' } });
        const res = mockRes();
        await handler(req, res);

        // run is called for INSERT — role should be 'analyst' (the fallback)
        const insertCall = run.mock.calls[0];
        expect(insertCall[1]).toContain('analyst');
    });

    it('returns 400 when username is empty', async () => {
        const req = mockReq({ body: { username: '', password: 'GoodP@ss1!', role: 'analyst' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'username required' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// PUT /users/:id — update user
// ═════════════════════════════════════════════════════════════════════════════

describe('PUT /users/:id', () => {
    const handler = getHandler(router, 'put', '/users/:id');

    it('updates user role and returns updated record', async () => {
        const existing = { id: 2, username: 'analyst1', role: 'analyst', department: 'Ops', expertise: 'mining', supabase_uid: null };
        const updated = { ...existing, role: 'manager' };
        get.mockResolvedValueOnce(existing)   // lookup
           .mockResolvedValueOnce(updated);   // after update
        run.mockResolvedValue({});

        const req = mockReq({ params: { id: '2' }, body: { role: 'manager' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.json).toHaveBeenCalledWith(updated);
        expect(auditLog).toHaveBeenCalledWith('role_change', expect.objectContaining({
            details: expect.objectContaining({ oldRole: 'analyst', newRole: 'manager' }),
        }));
    });

    it('returns 404 for non-existent user', async () => {
        get.mockResolvedValue(null);

        const req = mockReq({ params: { id: '999' }, body: { role: 'manager' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('keeps current role when invalid role is supplied', async () => {
        const existing = { id: 3, username: 'user3', role: 'analyst', department: '', expertise: '', supabase_uid: null };
        get.mockResolvedValueOnce(existing)
           .mockResolvedValueOnce(existing);
        run.mockResolvedValue({});

        const req = mockReq({ params: { id: '3' }, body: { role: 'superuser' } });
        const res = mockRes();
        await handler(req, res);

        // First run call is the UPDATE — role should remain 'analyst'
        const updateCall = run.mock.calls[0];
        expect(updateCall[1][0]).toBe('analyst');
    });

    it('returns 500 on database error', async () => {
        get.mockRejectedValue(new Error('DB fail'));

        const req = mockReq({ params: { id: '2' }, body: { role: 'manager' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// DELETE /users/:id — delete user (self-delete guard)
// ═════════════════════════════════════════════════════════════════════════════

describe('DELETE /users/:id', () => {
    const handler = getHandler(router, 'delete', '/users/:id');

    it('deletes a user successfully', async () => {
        const user = { id: 2, username: 'analyst1', supabase_uid: null, avatar: null };
        get.mockResolvedValue(user);
        run.mockResolvedValue({});

        const req = mockReq({ params: { id: '2' } });
        const res = mockRes();
        await handler(req, res);

        expect(run).toHaveBeenCalledWith('DELETE FROM users WHERE id = ?', ['2']);
        expect(res.json).toHaveBeenCalledWith({ deleted: true });
        expect(auditLog).toHaveBeenCalledWith('user_delete', expect.objectContaining({ target: 'analyst1' }));
    });

    it('prevents deleting your own account', async () => {
        const user = { id: 1, username: 'admin', supabase_uid: null, avatar: null };
        get.mockResolvedValue(user);

        const req = mockReq({ params: { id: '1' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Cannot delete your own account' });
        expect(run).not.toHaveBeenCalled();
    });

    it('returns 404 when user does not exist', async () => {
        get.mockResolvedValue(null);

        const req = mockReq({ params: { id: '999' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 500 on database error', async () => {
        get.mockRejectedValue(new Error('DB fail'));

        const req = mockReq({ params: { id: '2' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// PUT /users/:id/enforce-2fa
// ═════════════════════════════════════════════════════════════════════════════

describe('PUT /users/:id/enforce-2fa', () => {
    const handler = getHandler(router, 'put', '/users/:id/enforce-2fa');

    it('enforces 2FA for a user', async () => {
        get.mockResolvedValue({ username: 'analyst1' });
        run.mockResolvedValue({});

        const req = mockReq({ params: { id: '3' }, body: { enforce: true } });
        const res = mockRes();
        await handler(req, res);

        expect(run).toHaveBeenCalledWith('UPDATE users SET twofa_enforced = ? WHERE id = ?', [true, '3']);
        expect(res.json).toHaveBeenCalledWith({ success: true });
        expect(auditLog).toHaveBeenCalledWith('enforce_2fa', expect.objectContaining({
            details: { enforce: true },
        }));
    });

    it('disables 2FA enforcement', async () => {
        get.mockResolvedValue({ username: 'analyst1' });
        run.mockResolvedValue({});

        const req = mockReq({ params: { id: '3' }, body: { enforce: false } });
        const res = mockRes();
        await handler(req, res);

        expect(run).toHaveBeenCalledWith('UPDATE users SET twofa_enforced = ? WHERE id = ?', [false, '3']);
        expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('returns 500 on database error', async () => {
        get.mockRejectedValue(new Error('DB fail'));

        const req = mockReq({ params: { id: '3' }, body: { enforce: true } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// PUT /users/:id/unlock
// ═════════════════════════════════════════════════════════════════════════════

describe('PUT /users/:id/unlock', () => {
    const handler = getHandler(router, 'put', '/users/:id/unlock');

    it('unlocks a locked user account', async () => {
        get.mockResolvedValue({ username: 'locked_user', locked_until: '2026-12-31' });
        run.mockResolvedValue({});

        const req = mockReq({ params: { id: '4' } });
        const res = mockRes();
        await handler(req, res);

        expect(run).toHaveBeenCalledWith('UPDATE users SET locked_until = NULL WHERE id = ?', ['4']);
        expect(res.json).toHaveBeenCalledWith({ success: true });
        expect(auditLog).toHaveBeenCalledWith('account_unlock', expect.objectContaining({ target: 'locked_user' }));
    });

    it('returns 404 for non-existent user', async () => {
        get.mockResolvedValue(null);

        const req = mockReq({ params: { id: '999' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// GET /graph — knowledge graph (days filter allowlist)
// ═════════════════════════════════════════════════════════════════════════════

describe('GET /graph', () => {
    const handler = getHandler(router, 'get', '/graph');

    // Helper: stub all 9 all() calls the graph handler makes, plus 1 more for reunion_links
    function stubGraphQueries() {
        // 8 calls inside Promise.all + 1 for reunion_links
        all.mockResolvedValue([]);
    }

    it('returns nodes and edges', async () => {
        stubGraphQueries();

        const req = mockReq({ query: {} });
        const res = mockRes();
        await handler(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            nodes: expect.any(Array),
            edges: expect.any(Array),
            counts: expect.any(Object),
        }));
    });

    it('accepts valid days filter (7)', async () => {
        stubGraphQueries();

        const req = mockReq({ query: { days: '7' } });
        const res = mockRes();
        await handler(req, res);

        // Should include dateFilter in the ideas query
        const ideasCall = all.mock.calls.find(c => c[0] && c[0].includes('FROM ideas'));
        expect(ideasCall).toBeDefined();
        expect(ideasCall[0]).toContain("7 days");
    });

    it('accepts valid days filter (30)', async () => {
        stubGraphQueries();

        const req = mockReq({ query: { days: '30' } });
        const res = mockRes();
        await handler(req, res);

        const ideasCall = all.mock.calls.find(c => c[0] && c[0].includes('FROM ideas'));
        expect(ideasCall[0]).toContain("30 days");
    });

    it('ignores invalid days value (not in allowlist)', async () => {
        stubGraphQueries();

        const req = mockReq({ query: { days: '15' } });
        const res = mockRes();
        await handler(req, res);

        // 15 is not in allowedDays [7, 30, 90, 365], so no date filter
        const ideasCall = all.mock.calls.find(c => c[0] && c[0].includes('FROM ideas'));
        expect(ideasCall[0]).not.toContain("15 days");
    });

    it('ignores SQL injection attempts in days parameter', async () => {
        stubGraphQueries();

        const req = mockReq({ query: { days: "1; DROP TABLE ideas" } });
        const res = mockRes();
        await handler(req, res);

        // parseInt will return NaN / 0, which is not in allowedDays
        const ideasCall = all.mock.calls.find(c => c[0] && c[0].includes('FROM ideas'));
        expect(ideasCall[0]).not.toContain("DROP");
    });

    it('builds edges for ideas linked to projects, areas, users, and parent ideas', async () => {
        // Promise.all calls in order: projects, areas, ideas, reuniones, users, skills, okrs, okrLinks
        all.mockResolvedValueOnce([{ id: 'p1', name: 'SecondBrain Dashboard', status: 'active', related_area_id: '1', tech: 'Node.js' }]) // projects
           .mockResolvedValueOnce([{ id: '1', name: 'Operaciones', status: 'active' }]) // areas
           .mockResolvedValueOnce([ // ideas
               { id: 10, text: 'Task1', ai_summary: 'Summary', project_id: 'p1', related_area_id: '1', assigned_to: 'admin', parent_idea_id: null, code_stage: 'organized' },
               { id: 11, text: 'Sub-task', ai_summary: 'Sub', project_id: null, related_area_id: null, assigned_to: null, parent_idea_id: 10, code_stage: 'captured' },
           ])
           .mockResolvedValueOnce([ // reuniones
               { id: 100, titulo: 'Reunion SecondBrain Dashboard', fecha: '2026-01-01', asistentes: '["admin"]', puntos_clave: null, acuerdos: null, compromisos: JSON.stringify([{ tarea: 'Do thing', quien: 'admin', cuando: '2026-02-01' }]), temas_detectados: null },
           ])
           .mockResolvedValueOnce([{ id: 1, username: 'admin', role: 'admin', department: 'Tech' }]) // users
           .mockResolvedValueOnce([{ id: 's1', key: 'skill1', category: 'core', para_type: 'resource', related_project_id: 'p1', related_area_id: '1', distilled_summary: null }]) // skills
           .mockResolvedValueOnce([{ id: 'o1', title: 'OKR1', type: 'objective', parent_id: null, owner: 'admin', status: 'active' }]) // okrs
           .mockResolvedValueOnce([{ okr_id: 'o1', link_type: 'project', link_id: 'p1' }]) // okrLinks
           .mockResolvedValueOnce([ // reunion_links
               { reunion_id: 100, link_type: 'project', link_id: 'p1' },
           ]);

        const req = mockReq({ query: {} });
        const res = mockRes();
        await handler(req, res);

        const result = res.json.mock.calls[0][0];
        expect(result.nodes.length).toBeGreaterThan(0);
        expect(result.edges.length).toBeGreaterThan(0);

        // Check that various edge types were created
        const edgeTypes = result.edges.map(e => e.type);
        expect(edgeTypes).toContain('idea-project');
        expect(edgeTypes).toContain('idea-area');
        expect(edgeTypes).toContain('idea-user');
        expect(edgeTypes).toContain('idea-parent');
        expect(edgeTypes).toContain('skill-project');
        expect(edgeTypes).toContain('skill-area');
        expect(edgeTypes).toContain('okr-user');
        expect(edgeTypes).toContain('okr-project');
        expect(edgeTypes).toContain('project-area');
        expect(edgeTypes).toContain('reunion-project');
        // reunion-user from asistentes and compromisos
        expect(edgeTypes).toContain('reunion-user');
    });

    it('handles reuniones with stringified JSON fields and area name matching', async () => {
        // Exercise the nameVariants and area/project matching logic
        all.mockResolvedValueOnce([{ id: 'p1', name: 'Dashboard KPIs', status: 'active', related_area_id: null, tech: '' }]) // projects
           .mockResolvedValueOnce([{ id: '1', name: 'Operaciones', status: 'active' }, { id: '2', name: 'HSE Seguridad', status: 'active' }]) // areas
           .mockResolvedValueOnce([]) // ideas
           .mockResolvedValueOnce([ // reuniones
               { id: 200, titulo: 'Meeting about HSE Seguridad review', fecha: '2026-01-15',
                 asistentes: '["Participantes no identificados"]',
                 puntos_clave: JSON.stringify(['Review operaciones procedures']),
                 acuerdos: JSON.stringify(['Agreed on HSE standards']),
                 compromisos: JSON.stringify([{ tarea: 'Follow up', quien: 'unknown_person' }]),
                 temas_detectados: 'not json content' },
           ])
           .mockResolvedValueOnce([{ id: 1, username: 'admin', role: 'admin', department: 'Tech' }]) // users
           .mockResolvedValueOnce([]) // skills
           .mockResolvedValueOnce([]) // okrs
           .mockResolvedValueOnce([]) // okrLinks
           .mockResolvedValueOnce([]); // reunion_links

        const req = mockReq({ query: {} });
        const res = mockRes();
        await handler(req, res);

        const result = res.json.mock.calls[0][0];
        expect(result.nodes.length).toBeGreaterThan(0);
        // Area matching: "HSE Seguridad" should match "hse seguridad" in reunion title
        const reunionAreaEdges = result.edges.filter(e => e.type === 'reunion-area');
        expect(reunionAreaEdges.length).toBeGreaterThan(0);
    });

    it('deduplicates edges and filters invalid endpoints', async () => {
        all.mockResolvedValueOnce([]) // projects
           .mockResolvedValueOnce([]) // areas
           .mockResolvedValueOnce([
               { id: 1, text: 'T', ai_summary: 's', project_id: 'nonexistent', related_area_id: null, assigned_to: null, parent_idea_id: null, code_stage: 'captured' },
           ]) // ideas — points to non-existent project
           .mockResolvedValueOnce([]) // reuniones
           .mockResolvedValueOnce([]) // users
           .mockResolvedValueOnce([]) // skills
           .mockResolvedValueOnce([]) // okrs
           .mockResolvedValueOnce([]) // okrLinks
           .mockResolvedValueOnce([]); // reunion_links

        const req = mockReq({ query: {} });
        const res = mockRes();
        await handler(req, res);

        const result = res.json.mock.calls[0][0];
        // Edge from idea to nonexistent project should be filtered out
        expect(result.edges.length).toBe(0);
    });

    it('returns 500 on database error', async () => {
        all.mockRejectedValue(new Error('DB fail'));

        const req = mockReq({ query: {} });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to load graph data' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// GET /audit-log — audit log retrieval
// ═════════════════════════════════════════════════════════════════════════════

describe('GET /audit-log', () => {
    const handler = getHandler(router, 'get', '/audit-log');

    it('returns audit log entries', async () => {
        const rows = [
            { id: 1, event_type: 'login', actor: 'admin', target: null, ip_address: '10.0.0.1', user_agent: 'Mozilla', created_at: '2026-01-01' },
        ];
        all.mockResolvedValue(rows);

        const req = mockReq({ query: {} });
        const res = mockRes();
        await handler(req, res);

        expect(res.json).toHaveBeenCalled();
        const result = res.json.mock.calls[0][0];
        expect(result).toHaveLength(1);
        // Admin sees full IP
        expect(result[0].ip_address).toBe('10.0.0.1');
    });

    it('filters by event_type query param', async () => {
        all.mockResolvedValue([]);

        const req = mockReq({ query: { event_type: 'login' } });
        const res = mockRes();
        await handler(req, res);

        const queryStr = all.mock.calls[0][0];
        expect(queryStr).toContain('event_type = ?');
        expect(all.mock.calls[0][1]).toContain('login');
    });

    it('filters by actor and target', async () => {
        all.mockResolvedValue([]);

        const req = mockReq({ query: { actor: 'admin', target: 'analyst1' } });
        const res = mockRes();
        await handler(req, res);

        const queryStr = all.mock.calls[0][0];
        expect(queryStr).toContain('actor = ?');
        expect(queryStr).toContain('target = ?');
    });

    it('masks IP for non-admin roles', async () => {
        const rows = [{ id: 1, event_type: 'login', ip_address: '192.168.1.100', user_agent: 'Chrome' }];
        all.mockResolvedValue(rows);
        decryptPII.mockReturnValue('192.168.1.100');

        const req = mockReq({
            query: {},
            session: { user: { id: 2, username: 'manager1', role: 'manager' } },
        });
        const res = mockRes();
        await handler(req, res);

        const result = res.json.mock.calls[0][0];
        expect(result[0].ip_address).toBe('192.168.***.***');
        expect(result[0].user_agent).toBeUndefined();
    });

    it('respects custom limit parameter', async () => {
        all.mockResolvedValue([]);

        const req = mockReq({ query: { limit: '50' } });
        const res = mockRes();
        await handler(req, res);

        const params = all.mock.calls[0][1];
        expect(params[params.length - 1]).toBe(50);
    });

    it('defaults limit to 100 when not specified', async () => {
        all.mockResolvedValue([]);

        const req = mockReq({ query: {} });
        const res = mockRes();
        await handler(req, res);

        const params = all.mock.calls[0][1];
        expect(params[params.length - 1]).toBe(100);
    });

    it('returns 500 on database error', async () => {
        all.mockRejectedValue(new Error('DB fail'));

        const req = mockReq({ query: {} });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// PUT /users/:id/avatar — upload avatar
// ═════════════════════════════════════════════════════════════════════════════

describe('PUT /users/:id/avatar', () => {
    const handler = getHandler(router, 'put', '/users/:id/avatar');

    it('uploads avatar and returns url', async () => {
        get.mockResolvedValue({ avatar: null });
        run.mockResolvedValue({});

        const req = mockReq({ params: { id: '2' }, file: { filename: 'test.jpg' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.json).toHaveBeenCalledWith({ success: true, avatar: '/avatars/test.jpg' });
    });

    it('returns 400 when no file provided', async () => {
        const req = mockReq({ params: { id: '2' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'No image provided' });
    });

    it('returns 404 for non-existent user', async () => {
        get.mockResolvedValue(null);

        const req = mockReq({ params: { id: '999' }, file: { filename: 'test.jpg' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('deletes old avatar before uploading new one', async () => {
        const fs = require('fs');
        get.mockResolvedValue({ avatar: '/avatars/old.jpg' });
        run.mockResolvedValue({});

        const req = mockReq({ params: { id: '2' }, file: { filename: 'new.jpg' } });
        const res = mockRes();
        await handler(req, res);

        expect(fs.existsSync).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ success: true, avatar: '/avatars/new.jpg' });
    });

    it('returns 500 on database error', async () => {
        get.mockRejectedValue(new Error('DB fail'));

        const req = mockReq({ params: { id: '2' }, file: { filename: 'test.jpg' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// PUT /users/:id — password reset via newPassword
// ═════════════════════════════════════════════════════════════════════════════

describe('PUT /users/:id — password reset', () => {
    const handler = getHandler(router, 'put', '/users/:id');

    it('resets password with valid newPassword (local user)', async () => {
        const existing = { id: 2, username: 'analyst1', role: 'analyst', department: '', expertise: '', supabase_uid: null };
        get.mockResolvedValueOnce(existing)
           .mockResolvedValueOnce(existing);
        run.mockResolvedValue({});

        const req = mockReq({ params: { id: '2' }, body: { role: 'analyst', newPassword: 'NewP@ss123!' } });
        const res = mockRes();
        await handler(req, res);

        // Should hash and update password
        const bcrypt = require('bcryptjs');
        expect(bcrypt.hash).toHaveBeenCalledWith('NewP@ss123!', 12);
        expect(res.json).toHaveBeenCalledWith(existing);
    });

    it('rejects weak newPassword', async () => {
        const existing = { id: 2, username: 'analyst1', role: 'analyst', department: '', expertise: '', supabase_uid: null };
        get.mockResolvedValueOnce(existing);
        run.mockResolvedValue({});
        // The PUT handler calls validatePassword(newPassword) inside the if(newPassword) block
        validatePassword.mockReturnValueOnce({ valid: false, error: 'Too short' });

        const req = mockReq({ params: { id: '2' }, body: { role: 'analyst', newPassword: '123' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects breached newPassword', async () => {
        const existing = { id: 2, username: 'analyst1', role: 'analyst', department: '', expertise: '', supabase_uid: null };
        get.mockResolvedValueOnce(existing);
        run.mockResolvedValue({});
        checkBreachedPassword.mockResolvedValueOnce({ breached: true, count: 5000 });

        const req = mockReq({ params: { id: '2' }, body: { role: 'analyst', newPassword: 'Breached!' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// GET /projects — list projects
// ═════════════════════════════════════════════════════════════════════════════

describe('GET /projects', () => {
    const handler = getHandler(router, 'get', '/projects');

    it('returns formatted projects list', async () => {
        const projects = [
            { id: '1', name: 'Proj1', tech: 'Node.js,React', area_name: 'Dev' },
            { id: '2', name: 'Proj2', tech: '', area_name: null },
        ];
        all.mockResolvedValue(projects);

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(res.json).toHaveBeenCalled();
        const result = res.json.mock.calls[0][0];
        expect(result[0].tech).toEqual(['Node.js', 'React']);
        expect(result[1].tech).toEqual([]);
    });

    it('returns 500 on database error', async () => {
        all.mockRejectedValue(new Error('DB fail'));

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch projects' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// POST /projects — create project
// ═════════════════════════════════════════════════════════════════════════════

describe('POST /projects', () => {
    const handler = getHandler(router, 'post', '/projects');

    it('creates project with valid data', async () => {
        run.mockResolvedValue({});
        const created = { id: '123', name: 'New Project', tech: 'Node.js,Python' };
        get.mockResolvedValue(created);

        const req = mockReq({
            body: { name: 'New Project', description: 'Desc', tech: ['Node.js', 'Python'], project_type: 'interno' }
        });
        const res = mockRes();
        await handler(req, res);

        expect(run).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalled();
    });

    it('returns 400 when name is missing', async () => {
        const req = mockReq({ body: {} });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Name required' });
    });

    it('defaults project_type to interno for invalid type', async () => {
        run.mockResolvedValue({});
        get.mockResolvedValue({ id: '123', name: 'Test', tech: '' });

        const req = mockReq({ body: { name: 'Test', project_type: 'invalid' } });
        const res = mockRes();
        await handler(req, res);

        const insertCall = run.mock.calls[0];
        expect(insertCall[1]).toContain('interno');
    });

    it('handles tech as string', async () => {
        run.mockResolvedValue({});
        get.mockResolvedValue({ id: '123', name: 'Test', tech: 'React' });

        const req = mockReq({ body: { name: 'Test', tech: 'React' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.json).toHaveBeenCalled();
    });

    it('returns 500 on database error', async () => {
        run.mockRejectedValue(new Error('DB fail'));

        const req = mockReq({ body: { name: 'Test' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to save project' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// PUT /projects/:id — update project
// ═════════════════════════════════════════════════════════════════════════════

describe('PUT /projects/:id', () => {
    const handler = getHandler(router, 'put', '/projects/:id');

    it('updates project successfully', async () => {
        get.mockResolvedValueOnce({ id: '1' }) // existing check
           .mockResolvedValueOnce({ id: '1', name: 'Updated', tech: 'Go' }); // after update
        run.mockResolvedValue({});

        const req = mockReq({
            params: { id: '1' },
            body: { name: 'Updated', tech: ['Go'], project_type: 'cliente' }
        });
        const res = mockRes();
        await handler(req, res);

        expect(res.json).toHaveBeenCalled();
        const result = res.json.mock.calls[0][0];
        expect(result.name).toBe('Updated');
    });

    it('returns 400 when name is missing', async () => {
        const req = mockReq({ params: { id: '1' }, body: {} });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Name required' });
    });

    it('returns 404 for non-existent project', async () => {
        get.mockResolvedValue(null);

        const req = mockReq({ params: { id: '999' }, body: { name: 'Test' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Project not found' });
    });

    it('returns 500 on database error', async () => {
        get.mockRejectedValue(new Error('DB fail'));

        const req = mockReq({ params: { id: '1' }, body: { name: 'Test' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update project' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// DELETE /projects/:id — soft delete project
// ═════════════════════════════════════════════════════════════════════════════

describe('DELETE /projects/:id', () => {
    const handler = getHandler(router, 'delete', '/projects/:id');

    it('soft deletes project', async () => {
        run.mockResolvedValue({});

        const req = mockReq({ params: { id: '1' } });
        const res = mockRes();
        await handler(req, res);

        expect(run).toHaveBeenCalledWith(expect.stringContaining('deleted_at'), ['1']);
        expect(res.json).toHaveBeenCalledWith({ deleted: true });
    });

    it('returns 500 on database error', async () => {
        run.mockRejectedValue(new Error('DB fail'));

        const req = mockReq({ params: { id: '1' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to delete project' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// POST /orchestrator/execute
// ═════════════════════════════════════════════════════════════════════════════

describe('POST /orchestrator/execute', () => {
    const handler = getHandler(router, 'post', '/orchestrator/execute');
    const orchestratorBridge = require('../services/orchestratorBridge');

    it('executes command for admin user', async () => {
        orchestratorBridge.executeCommand.mockResolvedValue({ output: 'done' });

        const req = mockReq({ body: { command: 'test', args: ['arg1'] } });
        const res = mockRes();
        await handler(req, res);

        expect(orchestratorBridge.executeCommand).toHaveBeenCalledWith('test', ['arg1']);
        expect(res.json).toHaveBeenCalledWith({ output: 'done' });
    });

    it('executes with empty args when not provided', async () => {
        orchestratorBridge.executeCommand.mockResolvedValue({ ok: true });

        const req = mockReq({ body: { command: 'test' } });
        const res = mockRes();
        await handler(req, res);

        expect(orchestratorBridge.executeCommand).toHaveBeenCalledWith('test', []);
    });

    it('returns 403 for non-admin/ceo user', async () => {
        const req = mockReq({
            body: { command: 'test' },
            session: { user: { id: 2, username: 'analyst1', role: 'analyst' } }
        });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    it('returns 500 on execution error', async () => {
        orchestratorBridge.executeCommand.mockRejectedValue('Execution failed');

        const req = mockReq({ body: { command: 'bad' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// GET /reportability — team reportability
// ═════════════════════════════════════════════════════════════════════════════

describe('GET /reportability', () => {
    const handler = getHandler(router, 'get', '/reportability');

    it('returns report for all team users', async () => {
        // 1st call: users
        all.mockResolvedValueOnce([{ id: 1, username: 'admin', role: 'admin', department: 'Tech', expertise: 'Dev', avatar: null }])
           // 2nd call: assigned ideas for user
           .mockResolvedValueOnce([{ id: 1, text: 'Task1', ai_type: 'Tarea', code_stage: 'organized' }])
           // 3rd call: waiting_for for user
           .mockResolvedValueOnce([])
           // 4th call: daily_checklist for user
           .mockResolvedValueOnce([])
           // 5th call: areas
           .mockResolvedValueOnce([]);

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(res.json).toHaveBeenCalled();
        const result = res.json.mock.calls[0][0];
        expect(Array.isArray(result)).toBe(true);
        expect(result[0].user.username).toBe('admin');
    });

    it('returns 500 on database error', async () => {
        all.mockRejectedValue(new Error('DB fail'));

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to generate report' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// GET /reportability/team-summary
// ═════════════════════════════════════════════════════════════════════════════

describe('GET /reportability/team-summary', () => {
    const handler = getHandler(router, 'get', '/reportability/team-summary');

    it('returns team summary', async () => {
        const summary = [{ username: 'admin', role: 'admin', total_assigned: 5 }];
        all.mockResolvedValue(summary);

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(res.json).toHaveBeenCalledWith(summary);
    });

    it('returns 500 on database error', async () => {
        all.mockRejectedValue(new Error('DB fail'));

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to generate team summary' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// GET /search — global search
// ═════════════════════════════════════════════════════════════════════════════

describe('GET /search', () => {
    const handler = getHandler(router, 'get', '/search');

    it('returns search results across all types', async () => {
        all.mockResolvedValue([]);

        const req = mockReq({ query: { q: 'test query' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            query: 'test query',
            results: expect.any(Object),
            counts: expect.any(Object),
            total: expect.any(Number),
        }));
    });

    it('returns 400 when query is too short', async () => {
        const req = mockReq({ query: { q: 'a' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Query must be at least 2 characters' });
    });

    it('returns 400 when query is missing', async () => {
        const req = mockReq({ query: {} });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 500 on database error', async () => {
        all.mockRejectedValue(new Error('DB fail'));

        const req = mockReq({ query: { q: 'test' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Search failed' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// GET /notifications/check — check notifications
// ═════════════════════════════════════════════════════════════════════════════

describe('GET /notifications/check', () => {
    const handler = getHandler(router, 'get', '/notifications/check');

    it('returns all notification types', async () => {
        // dismissed, urgentTasks, overdueDelegations, staleCaptures, needsReview, meetingReady, userNotifs
        all.mockResolvedValue([]);

        const req = mockReq({ query: {} });
        const res = mockRes();
        await handler(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            total: expect.any(Number),
            urgent_tasks: expect.any(Array),
            overdue_delegations: expect.any(Array),
            stale_captures: expect.any(Array),
            needs_review: expect.any(Array),
            meeting_ready: expect.any(Array),
            user_notifications: expect.any(Array),
        }));
    });

    it('uses username from query param when provided', async () => {
        all.mockResolvedValue([]);

        const req = mockReq({ query: { username: 'analyst1' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.json).toHaveBeenCalled();
    });

    it('returns 500 on database error', async () => {
        all.mockRejectedValue(new Error('DB fail'));

        const req = mockReq({ query: {} });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Notifications check failed' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// POST /notifications/:id/dismiss
// ═════════════════════════════════════════════════════════════════════════════

describe('POST /notifications/:id/dismiss', () => {
    const handler = getHandler(router, 'post', '/notifications/:id/dismiss');

    it('dismisses a valid notification', async () => {
        run.mockResolvedValue({});

        const req = mockReq({ params: { id: '5' }, body: { type: 'urgent_task' } });
        const res = mockRes();
        await handler(req, res);

        expect(run).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('marks user_notification as read', async () => {
        run.mockResolvedValue({});

        const req = mockReq({ params: { id: '5' }, body: { type: 'user_notification' } });
        const res = mockRes();
        await handler(req, res);

        expect(run).toHaveBeenCalledWith(expect.stringContaining('user_notifications'), expect.any(Array));
        expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('returns 400 for invalid notification type', async () => {
        const req = mockReq({ params: { id: '5' }, body: { type: 'invalid_type' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid notification type' });
    });

    it('returns 500 on database error', async () => {
        run.mockRejectedValue(new Error('DB fail'));

        const req = mockReq({ params: { id: '5' }, body: { type: 'urgent_task' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// POST /notifications/clear-all
// ═════════════════════════════════════════════════════════════════════════════

describe('POST /notifications/clear-all', () => {
    const handler = getHandler(router, 'post', '/notifications/clear-all');

    it('clears all provided notifications', async () => {
        run.mockResolvedValue({});

        const req = mockReq({
            body: { notifications: [{ type: 'urgent_task', id: '1' }, { type: 'stale_capture', id: '2' }] }
        });
        const res = mockRes();
        await handler(req, res);

        expect(run).toHaveBeenCalledTimes(2);
        expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('returns 400 when notifications is not an array', async () => {
        const req = mockReq({ body: { notifications: 'not-array' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'notifications array required' });
    });

    it('returns 500 on database error', async () => {
        run.mockRejectedValue(new Error('DB fail'));

        const req = mockReq({ body: { notifications: [{ type: 'urgent_task', id: '1' }] } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// GET /export — JSON data export
// ═════════════════════════════════════════════════════════════════════════════

describe('GET /export', () => {
    const handler = getHandler(router, 'get', '/export');

    it('returns export data with all sections', async () => {
        all.mockResolvedValue([]);

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(auditLog).toHaveBeenCalledWith('data_export', expect.any(Object));
        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
        expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', expect.stringContaining('secondbrain_export_'));
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            version: '1.0',
            data: expect.any(Object),
        }));
    });

    it('returns 500 on database error', async () => {
        all.mockRejectedValue(new Error('DB fail'));

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Export failed' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// GET /export-excel — Excel export with KPIs
// ═════════════════════════════════════════════════════════════════════════════

describe('GET /export-excel', () => {
    const handler = getHandler(router, 'get', '/export-excel');

    it('generates Excel workbook and writes to response', async () => {
        const ideas = [
            { id: 1, text: 'Idea1', titulo: 'Title1', tipo: 'Tarea', prioridad: 'alta', estado: 'doing', completada: false, assigned_to: 'admin', project_id: 'p1', created_at: '2026-01-15', fecha_finalizacion: null },
            { id: 2, text: 'Idea2', titulo: 'Title2', tipo: 'Proyecto', prioridad: 'media', estado: 'done', completada: true, assigned_to: 'admin', project_id: null, created_at: '2026-01-20', fecha_finalizacion: '2026-01-25' },
        ];
        const users = [
            { id: 1, username: 'admin', role: 'admin', department: 'Tech', expertise: 'Dev' },
            { id: 2, username: 'user2', role: 'usuario', department: '', expertise: '' },
        ];
        const projects = [{ id: 'p1', name: 'P1', description: 'Desc', status: 'active' }];
        const areas = [{ id: '1', name: 'Area1' }];
        const waitingFor = [{ id: 1, description: 'Wait' }];
        const checklist = [{ id: 1, username: 'admin', date: '2026-01-15', completed: true }];

        // Promise.all: ideas, users, projects, areas, waitingFor, checklist
        all.mockResolvedValueOnce(ideas)
           .mockResolvedValueOnce(users)
           .mockResolvedValueOnce(projects)
           .mockResolvedValueOnce(areas)
           .mockResolvedValueOnce(waitingFor)
           .mockResolvedValueOnce(checklist);

        const req = mockReq();
        const res = mockRes();
        res.end = jest.fn();
        await handler(req, res);

        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', expect.stringContaining('SecondBrain_Report_'));
        expect(res.end).toHaveBeenCalled();
    });

    it('handles empty data', async () => {
        all.mockResolvedValue([]);

        const req = mockReq();
        const res = mockRes();
        res.end = jest.fn();
        await handler(req, res);

        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        expect(res.end).toHaveBeenCalled();
    });

    it('returns 500 on error', async () => {
        all.mockRejectedValue(new Error('DB fail'));

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Excel export failed' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// POST /import — data import
// ═════════════════════════════════════════════════════════════════════════════

describe('POST /import', () => {
    const handler = getHandler(router, 'post', '/import');

    it('imports data with all sections', async () => {
        run.mockResolvedValue({});

        const req = mockReq({
            body: {
                data: {
                    areas: [{ name: 'TestArea', description: 'Desc', icon: '📂', status: 'active' }],
                    ideas: [{ text: 'TestIdea', ai_type: 'Idea', ai_category: 'Test' }],
                    context: [{ key: 'Key1', content: 'Content1', category: 'Cat1' }],
                    waitingFor: [{ description: 'WaitItem', delegated_to: 'user1', delegated_by: 'admin' }],
                }
            }
        });
        const res = mockRes();
        await handler(req, res);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            imported: { ideas: 1, context: 1, areas: 1, waitingFor: 1 }
        });
    });

    it('returns 400 when no data provided', async () => {
        const req = mockReq({ body: {} });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'No data provided' });
    });

    it('handles empty data sections', async () => {
        const req = mockReq({ body: { data: {} } });
        const res = mockRes();
        await handler(req, res);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            imported: { ideas: 0, context: 0, areas: 0, waitingFor: 0 }
        });
    });

    it('returns 500 on database error', async () => {
        run.mockRejectedValue(new Error('DB fail'));

        const req = mockReq({
            body: { data: { areas: [{ name: 'A' }] } }
        });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Import failed' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// GET /openclaw/status — pipeline monitor
// ═════════════════════════════════════════════════════════════════════════════

describe('GET /openclaw/status', () => {
    const handler = getHandler(router, 'get', '/openclaw/status');

    it('returns pipeline status', async () => {
        get.mockResolvedValueOnce({ pending: 1, queued: 2, in_progress: 0, completed: 5 })
           .mockResolvedValueOnce({ count: 3 });
        all.mockResolvedValueOnce([]) // activity
           .mockResolvedValueOnce([]); // agents

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            pipeline: expect.any(Object),
            activity: expect.any(Array),
            agents: expect.any(Array),
        }));
    });

    it('returns 500 on database error', async () => {
        get.mockRejectedValue(new Error('DB fail'));

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch OpenClaw status' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// GET /agents — agents list
// ═════════════════════════════════════════════════════════════════════════════

describe('GET /agents', () => {
    const handler = getHandler(router, 'get', '/agents');

    it('returns business and execution agents', async () => {
        all.mockResolvedValue([]);

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            business: expect.any(Array),
            execution: expect.any(Array),
        }));
    });

    it('returns 500 on database error', async () => {
        all.mockRejectedValue(new Error('DB fail'));

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch agents' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// POST /admin/seed — seed data
// ═════════════════════════════════════════════════════════════════════════════

describe('POST /admin/seed', () => {
    const handler = getHandler(router, 'post', '/admin/seed');

    it('seeds data and returns counts', async () => {
        all.mockResolvedValue([{ id: '1', name: 'Operaciones' }, { id: '2', name: 'HSE' }]);
        run.mockResolvedValue({});

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            seeded: expect.objectContaining({
                projects: expect.any(Number),
                ideas: expect.any(Number),
                waiting_for: expect.any(Number),
            })
        }));
    });

    it('returns 500 on database error', async () => {
        all.mockRejectedValue(new Error('DB fail'));

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// GET /gallery — list gallery photos
// ═════════════════════════════════════════════════════════════════════════════

describe('GET /gallery', () => {
    const handler = getHandler(router, 'get', '/gallery');

    it('returns gallery photos', async () => {
        const photos = [{ id: 1, url: '/gallery/img.jpg', caption: 'Test' }];
        all.mockResolvedValue(photos);

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(res.json).toHaveBeenCalledWith(photos);
    });

    it('returns 500 on database error', async () => {
        all.mockRejectedValue(new Error('DB fail'));

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch gallery' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// POST /gallery — upload photo
// ═════════════════════════════════════════════════════════════════════════════

describe('POST /gallery', () => {
    const handler = getHandler(router, 'post', '/gallery');

    it('uploads photo and returns success', async () => {
        run.mockResolvedValue({ lastID: 10 });

        const req = mockReq({
            file: { filename: 'gallery_123_photo.jpg' },
            body: { caption: 'My photo', category: 'office' }
        });
        const res = mockRes();
        await handler(req, res);

        expect(run).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO gallery_photos'),
            expect.arrayContaining(['/gallery/gallery_123_photo.jpg', 'My photo', 'office', 'admin'])
        );
        expect(res.json).toHaveBeenCalledWith({ success: true, id: 10, url: '/gallery/gallery_123_photo.jpg' });
    });

    it('returns 400 when no file provided', async () => {
        const req = mockReq({ body: { caption: 'Test' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'No image provided' });
    });

    it('returns 500 on database error', async () => {
        run.mockRejectedValue(new Error('DB fail'));

        const req = mockReq({ file: { filename: 'test.jpg' }, body: {} });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to save photo' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// DELETE /gallery/:id — delete photo
// ═════════════════════════════════════════════════════════════════════════════

describe('DELETE /gallery/:id', () => {
    const handler = getHandler(router, 'delete', '/gallery/:id');

    it('deletes photo and removes file', async () => {
        get.mockResolvedValue({ id: 1, url: '/gallery/test.jpg' });
        run.mockResolvedValue({});

        const req = mockReq({ params: { id: '1' } });
        const res = mockRes();
        await handler(req, res);

        expect(run).toHaveBeenCalledWith('UPDATE gallery_photos SET deleted_at = NOW() WHERE id = ?', ['1']);
        expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('returns 404 when photo not found', async () => {
        get.mockResolvedValue(null);

        const req = mockReq({ params: { id: '999' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Not found' });
    });

    it('returns 500 on database error', async () => {
        get.mockRejectedValue(new Error('DB fail'));

        const req = mockReq({ params: { id: '1' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to delete photo' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// GET /my-dashboard — personalized dashboard
// ═════════════════════════════════════════════════════════════════════════════

describe('GET /my-dashboard', () => {
    const handler = getHandler(router, 'get', '/my-dashboard');

    it('returns personalized dashboard data', async () => {
        all.mockResolvedValue([]);

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            username: 'admin',
            tasks: expect.any(Array),
            tasks_summary: expect.any(Object),
            delegations: expect.any(Array),
            reuniones: expect.any(Array),
            activity: expect.any(Array),
        }));
    });

    it('returns 401 when not authenticated', async () => {
        const req = mockReq({ session: {} });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
    });

    it('returns 500 on database error', async () => {
        all.mockRejectedValue(new Error('DB fail'));

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to load dashboard' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// GET /herramientas — list tools
// ═════════════════════════════════════════════════════════════════════════════

describe('GET /herramientas', () => {
    const handler = getHandler(router, 'get', '/herramientas');

    it('returns herramientas list', async () => {
        const tools = [{ id: 1, nombre: 'Slack', estado: 'activo' }];
        all.mockResolvedValue(tools);

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(res.json).toHaveBeenCalledWith({ herramientas: tools });
    });

    it('returns 500 on database error', async () => {
        all.mockRejectedValue(new Error('DB fail'));

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch herramientas' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// GET /herramientas/resumen — tools summary
// ═════════════════════════════════════════════════════════════════════════════

describe('GET /herramientas/resumen', () => {
    const handler = getHandler(router, 'get', '/herramientas/resumen');

    it('returns resumen with cost calculations', async () => {
        all.mockResolvedValue([
            { costo_mensual: 100, num_licencias: 2, frecuencia: 'mensual', categoria: 'SaaS' },
            { costo_mensual: 1200, num_licencias: 1, frecuencia: 'anual', categoria: 'SaaS' },
        ]);
        get.mockResolvedValue({ nombre: 'Slack', fecha_renovacion: '2026-06-01' });

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            total_activas: 2,
            total_mensual: expect.any(Number),
            total_anual: expect.any(Number),
            por_categoria: expect.any(Object),
            proxima_renovacion: expect.any(Object),
        }));
    });

    it('returns 500 on database error', async () => {
        all.mockRejectedValue(new Error('DB fail'));

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch resumen' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// POST /herramientas — create tool
// ═════════════════════════════════════════════════════════════════════════════

describe('POST /herramientas', () => {
    const handler = getHandler(router, 'post', '/herramientas');

    it('creates herramienta with valid data', async () => {
        run.mockResolvedValue({ lastID: 10 });

        const req = mockReq({
            body: { nombre: 'New Tool', proveedor: 'Vendor', categoria: 'SaaS', costo_mensual: 50, moneda: 'USD', frecuencia: 'mensual' }
        });
        const res = mockRes();
        await handler(req, res);

        expect(run).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO herramientas_contratadas'), expect.any(Array));
        expect(res.json).toHaveBeenCalledWith({ success: true, id: 10 });
    });

    it('returns 400 when nombre is missing', async () => {
        const req = mockReq({ body: {} });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Nombre es requerido' });
    });

    it('returns 500 on database error', async () => {
        run.mockRejectedValue(new Error('DB fail'));

        const req = mockReq({ body: { nombre: 'Tool' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to create herramienta' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// PUT /herramientas/:id — update tool
// ═════════════════════════════════════════════════════════════════════════════

describe('PUT /herramientas/:id', () => {
    const handler = getHandler(router, 'put', '/herramientas/:id');

    it('updates herramienta', async () => {
        run.mockResolvedValue({});

        const req = mockReq({
            params: { id: '5' },
            body: { nombre: 'Updated', proveedor: 'V', categoria: 'SaaS', costo_mensual: 100, moneda: 'USD', frecuencia: 'mensual', estado: 'activo' }
        });
        const res = mockRes();
        await handler(req, res);

        expect(run).toHaveBeenCalledWith(expect.stringContaining('UPDATE herramientas_contratadas'), expect.any(Array));
        expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('returns 500 on database error', async () => {
        run.mockRejectedValue(new Error('DB fail'));

        const req = mockReq({ params: { id: '5' }, body: { nombre: 'Updated' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update herramienta' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// DELETE /herramientas/:id — delete tool
// ═════════════════════════════════════════════════════════════════════════════

describe('DELETE /herramientas/:id', () => {
    const handler = getHandler(router, 'delete', '/herramientas/:id');

    it('deletes herramienta', async () => {
        run.mockResolvedValue({});

        const req = mockReq({ params: { id: '5' } });
        const res = mockRes();
        await handler(req, res);

        expect(run).toHaveBeenCalledWith('UPDATE herramientas_contratadas SET deleted_at = NOW() WHERE id = ?', ['5']);
        expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('returns 500 on database error', async () => {
        run.mockRejectedValue(new Error('DB fail'));

        const req = mockReq({ params: { id: '5' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to delete herramienta' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// GET /trash — list soft-deleted items
// ═════════════════════════════════════════════════════════════════════════════

describe('GET /trash', () => {
    const handler = getHandler(router, 'get', '/trash');

    it('returns trashed items from all tables', async () => {
        all.mockResolvedValue([]);

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            ideas: expect.any(Array),
            projects: expect.any(Array),
            feedback: expect.any(Array),
            reuniones: expect.any(Array),
            okrs: expect.any(Array),
        }));
    });

    it('returns 500 on database error', async () => {
        all.mockRejectedValue(new Error('DB fail'));

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch trash' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// PUT /trash/restore — restore soft-deleted item
// ═════════════════════════════════════════════════════════════════════════════

describe('PUT /trash/restore', () => {
    const handler = getHandler(router, 'put', '/trash/restore');

    it('restores an item from trash', async () => {
        run.mockResolvedValue({});

        const req = mockReq({ body: { table: 'projects', id: '1' } });
        const res = mockRes();
        await handler(req, res);

        expect(run).toHaveBeenCalledWith(expect.stringContaining('deleted_at = NULL'), ['1']);
        expect(res.json).toHaveBeenCalledWith({ restored: true });
    });

    it('also restores child ideas when restoring parent idea', async () => {
        run.mockResolvedValue({});

        const req = mockReq({ body: { table: 'ideas', id: '5' } });
        const res = mockRes();
        await handler(req, res);

        expect(run).toHaveBeenCalledTimes(2);
        expect(run).toHaveBeenCalledWith(expect.stringContaining('parent_idea_id'), ['5']);
        expect(res.json).toHaveBeenCalledWith({ restored: true });
    });

    it('returns 400 for invalid table', async () => {
        const req = mockReq({ body: { table: 'users', id: '1' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid table or id' });
    });

    it('returns 400 when id is missing', async () => {
        const req = mockReq({ body: { table: 'ideas' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 500 on database error', async () => {
        run.mockRejectedValue(new Error('DB fail'));

        const req = mockReq({ body: { table: 'ideas', id: '1' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to restore item' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// DELETE /trash/:table/:id — permanently purge item
// ═════════════════════════════════════════════════════════════════════════════

describe('DELETE /trash/:table/:id', () => {
    const handler = getHandler(router, 'delete', '/trash/:table/:id');

    it('purges item permanently', async () => {
        run.mockResolvedValue({});

        const req = mockReq({ params: { table: 'ideas', id: '5' } });
        const res = mockRes();
        await handler(req, res);

        expect(run).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM ideas'), ['5']);
        expect(res.json).toHaveBeenCalledWith({ purged: true });
    });

    it('returns 400 for invalid table', async () => {
        const req = mockReq({ params: { table: 'users', id: '1' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid table' });
    });

    it('returns 500 on database error', async () => {
        run.mockRejectedValue(new Error('DB fail'));

        const req = mockReq({ params: { table: 'ideas', id: '1' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to purge item' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// DELETE /audit-log/purge — purge old audit logs
// ═════════════════════════════════════════════════════════════════════════════

describe('DELETE /audit-log/purge', () => {
    const handler = getHandler(router, 'delete', '/audit-log/purge');

    it('purges old audit log entries for admin', async () => {
        run.mockResolvedValue({ changes: 42 });

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(run).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM audit_log'));
        expect(auditLog).toHaveBeenCalledWith('audit_purge', expect.objectContaining({
            details: expect.objectContaining({ deleted_count: 42, retention_days: 90 })
        }));
        expect(res.json).toHaveBeenCalledWith({ success: true, deleted: 42 });
    });

    it('returns 403 for non-admin user', async () => {
        const req = mockReq({
            session: { user: { id: 2, username: 'manager1', role: 'manager' } }
        });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    it('returns 500 on database error', async () => {
        run.mockRejectedValue(new Error('DB fail'));

        const req = mockReq();
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to purge audit logs' });
    });
});
