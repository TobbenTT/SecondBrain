/**
 * Tests for middleware: auth.js and authorize.js
 */

// Mock database module
jest.mock('../database', () => ({
    get: jest.fn(),
    run: jest.fn(),
}));

// Mock logger
jest.mock('../helpers/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
}));

const { get, run } = require('../database');
const { apiKeyAuth, requireAuth } = require('../middleware/auth');
const { requireOwnerOrAdmin, requireAdmin, requireSelfOrAdmin, requireRole, denyRole } = require('../middleware/authorize');

// ═══════════════════════════════════════════════════════════════════════════════
// apiKeyAuth
// ═══════════════════════════════════════════════════════════════════════════════

describe('apiKeyAuth', () => {
    const mockRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    beforeEach(() => jest.clearAllMocks());

    it('calls next without setting user when no API key provided', async () => {
        const req = { headers: {}, query: {} };
        const res = mockRes();
        const next = jest.fn();

        await apiKeyAuth(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(req.isApiRequest).toBeUndefined();
    });

    it('authenticates with valid X-API-Key header', async () => {
        const keyRecord = { id: 1, key: 'test-key', username: 'admin', active: 1 };
        const userRecord = { id: 1, username: 'admin', role: 'admin', department: 'IT', expertise: 'dev' };

        get.mockResolvedValueOnce(keyRecord).mockResolvedValueOnce(userRecord);
        run.mockResolvedValue({});

        const req = { headers: { 'x-api-key': 'test-key' }, query: {}, session: {} };
        const res = mockRes();
        const next = jest.fn();

        await apiKeyAuth(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(req.isApiRequest).toBe(true);
        expect(req.session.user).toEqual(userRecord);
        expect(req.session.authenticated).toBe(true);
    });

    it('calls next without auth when no x-api-key header is present', async () => {
        const req = { headers: {}, query: { api_key: 'query-key' }, session: {} };
        const res = mockRes();
        const next = jest.fn();

        await apiKeyAuth(req, res, next);
        expect(next).toHaveBeenCalled();
        // auth.js only checks x-api-key header, not query params
        expect(req.isApiRequest).toBeUndefined();
    });

    it('does not authenticate with invalid key', async () => {
        get.mockResolvedValueOnce(null); // No key found

        const req = { headers: { 'x-api-key': 'invalid' }, query: {}, session: {} };
        const res = mockRes();
        const next = jest.fn();

        await apiKeyAuth(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(req.isApiRequest).toBeUndefined();
    });

    it('handles database errors gracefully', async () => {
        get.mockRejectedValue(new Error('DB error'));

        const req = { headers: { 'x-api-key': 'test-key' }, query: {}, session: {} };
        const res = mockRes();
        const next = jest.fn();

        await apiKeyAuth(req, res, next);
        expect(next).toHaveBeenCalled(); // Still calls next
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// requireAuth
// ═══════════════════════════════════════════════════════════════════════════════

describe('requireAuth', () => {
    const mockRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        res.redirect = jest.fn();
        return res;
    };

    it('passes for API requests', () => {
        const req = { isApiRequest: true, session: {}, path: '/api/test' };
        const res = mockRes();
        const next = jest.fn();

        requireAuth(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('passes for authenticated sessions', () => {
        const req = { session: { user: { id: 1 } }, path: '/' };
        const res = mockRes();
        const next = jest.fn();

        requireAuth(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('returns 401 for unauthenticated API requests', () => {
        const req = { session: {}, path: '/api/ideas' };
        const res = mockRes();
        const next = jest.fn();

        requireAuth(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('redirects to login for unauthenticated page requests', () => {
        const req = { session: {}, path: '/' };
        const res = mockRes();
        const next = jest.fn();

        requireAuth(req, res, next);
        expect(res.redirect).toHaveBeenCalledWith('/login');
        expect(next).not.toHaveBeenCalled();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// requireOwnerOrAdmin
// ═══════════════════════════════════════════════════════════════════════════════

describe('requireOwnerOrAdmin', () => {
    const mockRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    beforeEach(() => jest.clearAllMocks());

    it('passes for admin users', async () => {
        const middleware = requireOwnerOrAdmin('ideas', 'created_by');
        const req = { session: { user: { username: 'admin', role: 'admin' } }, params: { id: '1' } };
        const res = mockRes();
        const next = jest.fn();

        await middleware(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('passes for resource owner', async () => {
        get.mockResolvedValue({ created_by: 'john' });

        const middleware = requireOwnerOrAdmin('ideas', 'created_by');
        const req = { session: { user: { username: 'john', role: 'user' } }, params: { id: '1' } };
        const res = mockRes();
        const next = jest.fn();

        await middleware(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('returns 403 for non-owner', async () => {
        get.mockResolvedValue({ created_by: 'john' });

        const middleware = requireOwnerOrAdmin('ideas', 'created_by');
        const req = { session: { user: { username: 'jane', role: 'user' } }, params: { id: '1' } };
        const res = mockRes();
        const next = jest.fn();

        await middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
    });

    it('returns 404 for non-existent resource', async () => {
        get.mockResolvedValue(undefined);

        const middleware = requireOwnerOrAdmin('ideas', 'created_by');
        const req = { session: { user: { username: 'john', role: 'user' } }, params: { id: '999' } };
        const res = mockRes();
        const next = jest.fn();

        await middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 401 for unauthenticated requests', async () => {
        const middleware = requireOwnerOrAdmin('ideas', 'created_by');
        const req = { session: {}, params: { id: '1' } };
        const res = mockRes();
        const next = jest.fn();

        await middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('returns 400 when resource ID missing', async () => {
        const middleware = requireOwnerOrAdmin('ideas', 'created_by');
        const req = { session: { user: { username: 'john', role: 'user' } }, params: {} };
        const res = mockRes();
        const next = jest.fn();

        await middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('handles database errors', async () => {
        get.mockRejectedValue(new Error('DB error'));

        const middleware = requireOwnerOrAdmin('ideas', 'created_by');
        const req = { session: { user: { username: 'john', role: 'user' } }, params: { id: '1' } };
        const res = mockRes();
        const next = jest.fn();

        await middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// requireAdmin
// ═══════════════════════════════════════════════════════════════════════════════

describe('requireAdmin', () => {
    const mockRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    it('passes for admin users', () => {
        const req = { session: { user: { role: 'admin' } } };
        const res = mockRes();
        const next = jest.fn();

        requireAdmin(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('returns 403 for non-admin users', () => {
        const req = { session: { user: { role: 'viewer' } } };
        const res = mockRes();
        const next = jest.fn();

        requireAdmin(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
    });

    it('returns 401 for unauthenticated requests', () => {
        const req = { session: {} };
        const res = mockRes();
        const next = jest.fn();

        requireAdmin(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// requireSelfOrAdmin
// ═══════════════════════════════════════════════════════════════════════════════

describe('requireSelfOrAdmin', () => {
    const mockRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    it('passes for admin users accessing any data', () => {
        const req = { session: { user: { username: 'admin', role: 'admin' } }, params: { username: 'other' } };
        const res = mockRes();
        const next = jest.fn();

        requireSelfOrAdmin(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('passes for user accessing own data', () => {
        const req = { session: { user: { username: 'john', role: 'user' } }, params: { username: 'john' } };
        const res = mockRes();
        const next = jest.fn();

        requireSelfOrAdmin(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('returns 403 for user accessing others data', () => {
        const req = { session: { user: { username: 'john', role: 'user' } }, params: { username: 'jane' } };
        const res = mockRes();
        const next = jest.fn();

        requireSelfOrAdmin(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
    });

    it('passes when no username param (general access)', () => {
        const req = { session: { user: { username: 'john', role: 'user' } }, params: {} };
        const res = mockRes();
        const next = jest.fn();

        requireSelfOrAdmin(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('returns 401 for unauthenticated requests', () => {
        const req = { session: {} };
        const res = mockRes();
        const next = jest.fn();

        requireSelfOrAdmin(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('passes for CEO users accessing any data', () => {
        const req = { session: { user: { username: 'boss', role: 'ceo' } }, params: { username: 'other' } };
        const res = mockRes();
        const next = jest.fn();

        requireSelfOrAdmin(req, res, next);
        expect(next).toHaveBeenCalled();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// requireRole
// ═══════════════════════════════════════════════════════════════════════════════

describe('requireRole', () => {
    const mockRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    it('passes when user has an allowed role', () => {
        const middleware = requireRole('admin', 'editor');
        const req = { session: { user: { role: 'editor' } } };
        const res = mockRes();
        const next = jest.fn();

        middleware(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('returns 403 when user role is not in allowed list', () => {
        const middleware = requireRole('admin', 'editor');
        const req = { session: { user: { role: 'viewer' } } };
        const res = mockRes();
        const next = jest.fn();

        middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
        expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 for unauthenticated requests', () => {
        const middleware = requireRole('admin');
        const req = { session: {} };
        const res = mockRes();
        const next = jest.fn();

        middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('works with a single allowed role', () => {
        const middleware = requireRole('ceo');
        const req = { session: { user: { role: 'ceo' } } };
        const res = mockRes();
        const next = jest.fn();

        middleware(req, res, next);
        expect(next).toHaveBeenCalled();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// denyRole
// ═══════════════════════════════════════════════════════════════════════════════

describe('denyRole', () => {
    const mockRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    it('blocks user with a denied role', () => {
        const middleware = denyRole('viewer', 'intern');
        const req = { session: { user: { role: 'viewer' } } };
        const res = mockRes();
        const next = jest.fn();

        middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'This action is not available for your role' });
        expect(next).not.toHaveBeenCalled();
    });

    it('allows user whose role is not in the blocked list', () => {
        const middleware = denyRole('viewer', 'intern');
        const req = { session: { user: { role: 'admin' } } };
        const res = mockRes();
        const next = jest.fn();

        middleware(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('returns 401 for unauthenticated requests', () => {
        const middleware = denyRole('viewer');
        const req = { session: {} };
        const res = mockRes();
        const next = jest.fn();

        middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('blocks second role in the list', () => {
        const middleware = denyRole('viewer', 'intern');
        const req = { session: { user: { role: 'intern' } } };
        const res = mockRes();
        const next = jest.fn();

        middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// requireOwnerOrAdmin — CEO role path
// ═══════════════════════════════════════════════════════════════════════════════

describe('requireOwnerOrAdmin — CEO role', () => {
    const mockRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    beforeEach(() => jest.clearAllMocks());

    it('passes for CEO users without DB lookup', async () => {
        const middleware = requireOwnerOrAdmin('ideas', 'created_by');
        const req = { session: { user: { username: 'boss', role: 'ceo' } }, params: { id: '1' } };
        const res = mockRes();
        const next = jest.fn();

        await middleware(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(get).not.toHaveBeenCalled();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// requireAdmin — CEO role path
// ═══════════════════════════════════════════════════════════════════════════════

describe('requireAdmin — CEO role', () => {
    const mockRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    it('passes for CEO users', () => {
        const req = { session: { user: { role: 'ceo' } } };
        const res = mockRes();
        const next = jest.fn();

        requireAdmin(req, res, next);
        expect(next).toHaveBeenCalled();
    });
});
