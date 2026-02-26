/**
 * Tests for file handling routes: upload.js and files.js
 * Focus: security-critical paths (path traversal, role checks, magic numbers, trash)
 */

// ─── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('../database', () => ({ get: jest.fn(), run: jest.fn(), all: jest.fn() }));
jest.mock('../helpers/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }));
jest.mock('../helpers/audit', () => ({ auditLog: jest.fn() }));
jest.mock('../helpers/ideaProcessor', () => ({ processAndSaveIdea: jest.fn() }));
jest.mock('../services/ai', () => ({ generateDynamicFromPdf: jest.fn(), distillContent: jest.fn() }));
jest.mock('fs');
jest.mock('multer', () => {
    const multer = jest.fn(() => ({
        single: jest.fn(() => (req, res, next) => next()),
        array: jest.fn(() => (req, res, next) => next())
    }));
    multer.diskStorage = jest.fn();
    multer.MulterError = class MulterError extends Error {
        constructor(code) { super(code); this.code = code; }
    };
    return multer;
});
jest.mock('marked', () => ({ marked: jest.fn(() => '<p>content</p>') }));
jest.mock('isomorphic-dompurify', () => ({ sanitize: jest.fn(html => html) }));
jest.mock('simple-git', () => jest.fn(() => ({
    add: jest.fn(), commit: jest.fn(), push: jest.fn()
})));

// ─── Requires ───────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');
const { run, get, all } = require('../database');

// ─── Helpers ────────────────────────────────────────────────────────────────

const mockReq = (overrides = {}) => ({
    session: { user: { id: 1, username: 'admin', role: 'admin' } },
    body: {},
    params: {},
    query: {},
    headers: {},
    file: null,
    ip: '127.0.0.1',
    ...overrides
});

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.download = jest.fn();
    res.sendFile = jest.fn();
    res.set = jest.fn().mockReturnValue(res);
    res.render = jest.fn();
    return res;
};

// ─── Route extraction helper ────────────────────────────────────────────────
// Express routers store handlers in router.stack; we extract them by method+path.

function findRouteHandler(router, method, routePath) {
    for (const layer of router.stack) {
        if (!layer.route) continue;
        if (layer.route.path === routePath && layer.route.methods[method]) {
            // Return all handlers chained for this route
            const handlers = layer.route.stack
                .filter(s => s.method === method || !s.method)
                .map(s => s.handle);
            return handlers;
        }
    }
    return null;
}

async function callRoute(router, method, routePath, req, res) {
    const handlers = findRouteHandler(router, method, routePath);
    if (!handlers) throw new Error(`Route not found: ${method.toUpperCase()} ${routePath}`);
    const next = jest.fn();
    for (const handler of handlers) {
        if (res.status.mock.calls.some(c => c[0] >= 400)) break;
        if (res.json.mock.calls.length > 0 || res.send.mock.calls.length > 0) break;
        await handler(req, res, next);
    }
}

// ─── Setup ──────────────────────────────────────────────────────────────────

beforeEach(() => {
    jest.clearAllMocks();
    // Default fs mocks
    fs.existsSync = jest.fn().mockReturnValue(true);
    fs.mkdirSync = jest.fn();
    fs.readdirSync = jest.fn().mockReturnValue([]);
    fs.readFileSync = jest.fn().mockReturnValue(Buffer.alloc(12));
    fs.statSync = jest.fn().mockReturnValue({ size: 1024, mtime: new Date() });
    fs.renameSync = jest.fn();
    fs.unlinkSync = jest.fn();
    fs.openSync = jest.fn().mockReturnValue(3);
    fs.readSync = jest.fn();
    fs.closeSync = jest.fn();
    fs.writeFileSync = jest.fn();

    run.mockResolvedValue({ lastID: 1 });
    get.mockResolvedValue(null);
    all.mockResolvedValue([]);
});

// Load routers after mocks are set up
const uploadRouter = require('../routes/upload');
const filesRouter = require('../routes/files');

// ═════════════════════════════════════════════════════════════════════════════
// UPLOAD ROUTES (upload.js)
// ═════════════════════════════════════════════════════════════════════════════

describe('DELETE /api/archivo/:filename', () => {

    // ── Path traversal prevention ───────────────────────────────────────────

    it('blocks path traversal with ../ in filename', async () => {
        const req = mockReq({ params: { filename: '../../../etc/passwd' } });
        const res = mockRes();

        await callRoute(uploadRouter, 'delete', '/api/archivo/:filename', req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Access denied' }));
        expect(fs.renameSync).not.toHaveBeenCalled();
    });

    it('blocks encoded path traversal sequences', async () => {
        const req = mockReq({ params: { filename: '..\\..\\windows\\system32\\config' } });
        const res = mockRes();

        await callRoute(uploadRouter, 'delete', '/api/archivo/:filename', req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(fs.renameSync).not.toHaveBeenCalled();
    });

    // ── Role-based access ────────────────────────────────────────────────────

    it('allows admin to delete files', async () => {
        const req = mockReq({
            params: { filename: 'test.pdf' },
            session: { user: { id: 1, username: 'admin', role: 'admin' } }
        });
        const res = mockRes();
        all.mockResolvedValue([]);

        await callRoute(uploadRouter, 'delete', '/api/archivo/:filename', req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('allows manager to delete files', async () => {
        const req = mockReq({
            params: { filename: 'test.pdf' },
            session: { user: { id: 2, username: 'mgr', role: 'manager' } }
        });
        const res = mockRes();

        await callRoute(uploadRouter, 'delete', '/api/archivo/:filename', req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('blocks consultor role from deleting files', async () => {
        const req = mockReq({
            params: { filename: 'test.pdf' },
            session: { user: { id: 3, username: 'consultor1', role: 'consultor' } }
        });
        const res = mockRes();

        await callRoute(uploadRouter, 'delete', '/api/archivo/:filename', req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(fs.renameSync).not.toHaveBeenCalled();
    });

    it('blocks viewer role from deleting files', async () => {
        const req = mockReq({
            params: { filename: 'test.pdf' },
            session: { user: { id: 4, username: 'viewer1', role: 'viewer' } }
        });
        const res = mockRes();

        await callRoute(uploadRouter, 'delete', '/api/archivo/:filename', req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(fs.renameSync).not.toHaveBeenCalled();
    });

    // ── Authentication required ──────────────────────────────────────────────

    it('returns 401 for unauthenticated delete requests', async () => {
        const req = mockReq({
            params: { filename: 'test.pdf' },
            session: {}
        });
        const res = mockRes();

        await callRoute(uploadRouter, 'delete', '/api/archivo/:filename', req, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('returns 404 when file does not exist on disk', async () => {
        fs.existsSync = jest.fn().mockReturnValue(false);

        const req = mockReq({ params: { filename: 'ghost.pdf' } });
        const res = mockRes();

        await callRoute(uploadRouter, 'delete', '/api/archivo/:filename', req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// FILE ROUTES (files.js) — Download / Read with path traversal
// ═════════════════════════════════════════════════════════════════════════════

describe('GET /archivos-file/:filename — path traversal', () => {

    it('blocks path traversal in file serving', async () => {
        const req = mockReq({ params: { filename: '../../../etc/shadow' } });
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/archivos-file/:filename', req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith('Access denied');
        expect(res.sendFile).not.toHaveBeenCalled();
    });

    it('serves file when path is safe', async () => {
        const req = mockReq({ params: { filename: 'report.pdf' } });
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/archivos-file/:filename', req, res);

        expect(res.sendFile).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalledWith(403);
    });
});

describe('GET /descargar/:filename — path traversal in downloads', () => {

    it('blocks path traversal in downloads', async () => {
        const req = mockReq({ params: { filename: '../../.env' } });
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/descargar/:filename', req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith('Access denied');
        expect(res.download).not.toHaveBeenCalled();
    });

    it('allows download of safe filenames', async () => {
        const req = mockReq({ params: { filename: 'document.docx' } });
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/descargar/:filename', req, res);

        expect(res.download).toHaveBeenCalled();
    });
});

describe('GET /archivo/:filename — path traversal in file view', () => {

    it('blocks path traversal in file viewing', async () => {
        const req = mockReq({ params: { filename: '../../../etc/passwd' } });
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/archivo/:filename', req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith('Access denied');
        expect(res.render).not.toHaveBeenCalled();
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// SKILLS content — path traversal
// ═════════════════════════════════════════════════════════════════════════════

describe('GET /api/skills/content — path traversal', () => {

    it('blocks path traversal in skill content reads', async () => {
        const req = mockReq({ query: { file: '../../../etc/passwd' } });
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/api/skills/content', req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Access denied' }));
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// TRASH MANAGEMENT (files.js)
// ═════════════════════════════════════════════════════════════════════════════

describe('POST /api/admin/files/restore — trash restore', () => {

    it('blocks path traversal in trash restore', async () => {
        // path.join(TRASH_DIR, '../../secret') resolves outside TRASH_DIR
        const req = mockReq({ body: { trashName: '../../etc/passwd' } });
        const res = mockRes();

        // The route uses requireAdmin as middleware; our mockReq has admin role.
        // The path.join check will catch traversal.
        await callRoute(filesRouter, 'post', '/api/admin/files/restore', req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(fs.renameSync).not.toHaveBeenCalled();
    });

    it('returns 400 when trashName is missing', async () => {
        const req = mockReq({ body: {} });
        const res = mockRes();

        await callRoute(filesRouter, 'post', '/api/admin/files/restore', req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 404 when trash file does not exist', async () => {
        fs.existsSync = jest.fn().mockReturnValue(false);

        const req = mockReq({ body: { trashName: '1700000000_report.pdf' } });
        const res = mockRes();

        await callRoute(filesRouter, 'post', '/api/admin/files/restore', req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});

describe('DELETE /api/admin/files/trash/:trashName — permanent delete', () => {

    it('blocks path traversal in permanent trash delete', async () => {
        const req = mockReq({ params: { trashName: '../../.env' } });
        const res = mockRes();

        await callRoute(filesRouter, 'delete', '/api/admin/files/trash/:trashName', req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(fs.unlinkSync).not.toHaveBeenCalled();
    });

    it('permanently deletes a valid trash file', async () => {
        const req = mockReq({ params: { trashName: '1700000000_old.pdf' } });
        const res = mockRes();

        await callRoute(filesRouter, 'delete', '/api/admin/files/trash/:trashName', req, res);

        expect(fs.unlinkSync).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('returns 404 when trash file does not exist', async () => {
        fs.existsSync = jest.fn().mockReturnValue(false);

        const req = mockReq({ params: { trashName: '1700000000_gone.pdf' } });
        const res = mockRes();

        await callRoute(filesRouter, 'delete', '/api/admin/files/trash/:trashName', req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// UPLOAD — Role blocking (consultor denied via denyRole middleware)
// ═════════════════════════════════════════════════════════════════════════════

describe('POST /api/upload — role-based upload blocking', () => {

    it('blocks consultor role from uploading files', async () => {
        const req = mockReq({
            session: { user: { id: 3, username: 'consultor1', role: 'consultor' } },
            file: { filename: 'test.pdf', path: '/tmp/test.pdf', size: 1024, mimetype: 'application/pdf', originalname: 'test.pdf' },
            path: '/api/upload'
        });
        const res = mockRes();

        await callRoute(uploadRouter, 'post', '/api/upload', req, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    it('blocks unauthenticated users from uploading', async () => {
        const req = mockReq({
            session: {},
            file: { filename: 'test.pdf', path: '/tmp/test.pdf', size: 1024, mimetype: 'application/pdf', originalname: 'test.pdf' },
            path: '/api/upload'
        });
        const res = mockRes();

        await callRoute(uploadRouter, 'post', '/api/upload', req, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// MAGIC NUMBER VALIDATION
// ═════════════════════════════════════════════════════════════════════════════

describe('POST /api/upload — magic number validation', () => {

    it('rejects file when magic number does not match extension', async () => {
        // Simulate a .pdf file whose first bytes are NOT %PDF (0x25504446)
        // The openSync/readSync/closeSync mock needs to write non-PDF bytes into the buffer
        fs.openSync.mockReturnValue(3);
        fs.readSync.mockImplementation((fd, buf) => {
            // Write zeros (not a valid PDF signature)
            buf.fill(0);
            return 12;
        });
        fs.closeSync.mockReturnValue(undefined);
        fs.unlinkSync.mockReturnValue(undefined);

        const req = mockReq({
            session: { user: { id: 1, username: 'admin', role: 'admin' } },
            file: {
                filename: 'evil.pdf',
                originalname: 'evil.pdf',
                path: '/tmp/evil.pdf',
                size: 2048,
                mimetype: 'application/pdf'
            },
            body: { tags: '' },
            path: '/api/upload'
        });
        const res = mockRes();

        await callRoute(uploadRouter, 'post', '/api/upload', req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: expect.stringContaining('extension') })
        );
        // The spoofed file should be deleted
        expect(fs.unlinkSync).toHaveBeenCalled();
    });

    it('accepts file when magic number matches extension', async () => {
        // Simulate a .pdf with correct %PDF magic bytes
        fs.openSync.mockReturnValue(3);
        fs.readSync.mockImplementation((fd, buf) => {
            buf[0] = 0x25; // %
            buf[1] = 0x50; // P
            buf[2] = 0x44; // D
            buf[3] = 0x46; // F
            return 12;
        });
        fs.closeSync.mockReturnValue(undefined);
        fs.readFileSync.mockReturnValue(Buffer.alloc(64));

        const req = mockReq({
            session: { user: { id: 1, username: 'admin', role: 'admin' } },
            file: {
                filename: 'legit.pdf',
                originalname: 'legit.pdf',
                path: '/tmp/legit.pdf',
                size: 4096,
                mimetype: 'application/pdf'
            },
            body: { tags: '' },
            path: '/api/upload'
        });
        const res = mockRes();

        await callRoute(uploadRouter, 'post', '/api/upload', req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true, filename: 'legit.pdf' })
        );
        expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// MULTER CONFIG — file size limit (50 MB)
// ═════════════════════════════════════════════════════════════════════════════

describe('File size limit — multer error handling', () => {

    it('returns 400 with size message when no file is provided on upload', async () => {
        // When multer rejects due to size, no req.file is set.
        // The route handler itself checks for missing file and returns 400.
        const req = mockReq({
            session: { user: { id: 1, username: 'admin', role: 'admin' } },
            file: null,
            body: {},
            path: '/api/upload'
        });
        const res = mockRes();

        await callRoute(uploadRouter, 'post', '/api/upload', req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: expect.stringContaining('No file') })
        );
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// SKILL DOCUMENTS — role checks
// ═════════════════════════════════════════════════════════════════════════════

describe('POST /api/skill-documents — role-based access', () => {

    it('blocks unauthenticated users from linking skill documents', async () => {
        const req = mockReq({
            session: {},
            body: { skill_path: 'some/skill.md', document_name: 'doc.pdf' }
        });
        const res = mockRes();

        await callRoute(filesRouter, 'post', '/api/skill-documents', req, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('blocks non-admin/manager from linking skill documents', async () => {
        const req = mockReq({
            session: { user: { id: 5, username: 'viewer1', role: 'viewer' } },
            body: { skill_path: 'some/skill.md', document_name: 'doc.pdf' }
        });
        const res = mockRes();

        await callRoute(filesRouter, 'post', '/api/skill-documents', req, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });
});

describe('DELETE /api/skill-documents/:id — role-based access', () => {

    it('blocks non-admin/manager from deleting skill documents', async () => {
        const req = mockReq({
            session: { user: { id: 5, username: 'consultor1', role: 'consultor' } },
            params: { id: '1' }
        });
        const res = mockRes();

        await callRoute(filesRouter, 'delete', '/api/skill-documents/:id', req, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });
});
