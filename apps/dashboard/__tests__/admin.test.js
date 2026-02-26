/**
 * Tests for admin routes: apps/dashboard/routes/admin.js
 *
 * Covers: user CRUD, enforce-2FA, unlock, delete (self-delete guard),
 *         knowledge graph (days allowlist), audit log retrieval.
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

// ExcelJS — not exercised in these tests but required at module level
jest.mock('exceljs', () => ({}));

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
