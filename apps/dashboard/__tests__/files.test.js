/**
 * Tests for file handling routes: upload.js and files.js
 * Focus: security-critical paths (path traversal, role checks, magic numbers, trash)
 *        + coverage expansion for file listing, skills, tags, dynamic pages, uploads
 */

// ─── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('../database', () => ({ get: jest.fn(), run: jest.fn(), all: jest.fn() }));
jest.mock('../helpers/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }));
jest.mock('../helpers/audit', () => ({ auditLog: jest.fn() }));
jest.mock('../helpers/ideaProcessor', () => ({ processAndSaveIdea: jest.fn() }));
jest.mock('../services/ai', () => ({ generateDynamicFromPdf: jest.fn(), generateDynamicPage: jest.fn(), distillContent: jest.fn() }));
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
jest.mock('pdf-parse', () => jest.fn().mockResolvedValue({ text: '' }));
jest.mock('mammoth', () => ({ extractRawText: jest.fn().mockResolvedValue({ value: '' }) }));

// Mock the utils module so getFilesRecursively, findDynamicPage, loadTags, saveTags are controllable
jest.mock('../helpers/utils', () => {
    const original = jest.requireActual('../helpers/utils');
    return {
        safePath: original.safePath,
        formatFileSize: original.formatFileSize,
        getFilesRecursively: jest.fn(() => []),
        findDynamicPage: jest.fn(() => null),
        loadTags: jest.fn(() => ({})),
        saveTags: jest.fn(),
    };
});

// ─── Requires ───────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');
const { run, get, all } = require('../database');
const { processAndSaveIdea } = require('../helpers/ideaProcessor');
const { getFilesRecursively, findDynamicPage, loadTags, saveTags } = require('../helpers/utils');

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
    res.headersSent = false;
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
        if (res.render.mock.calls.length > 0) break;
        if (res.sendFile.mock.calls.length > 0) break;
        if (res.download.mock.calls.length > 0) break;
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
    fs.statSync = jest.fn().mockReturnValue({ size: 1024, mtime: new Date(), isFile: () => true, isDirectory: () => false });
    fs.renameSync = jest.fn();
    fs.unlinkSync = jest.fn();
    fs.openSync = jest.fn().mockReturnValue(3);
    fs.readSync = jest.fn();
    fs.closeSync = jest.fn();
    fs.writeFileSync = jest.fn();

    run.mockResolvedValue({ lastID: 1 });
    get.mockResolvedValue(null);
    all.mockResolvedValue([]);
    loadTags.mockReturnValue({});
    saveTags.mockImplementation(() => {});
    getFilesRecursively.mockReturnValue([]);
    findDynamicPage.mockReturnValue(null);
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

    it('moves dynamic page folder to trash when it exists', async () => {
        // existsSync: first call for file itself (true), second for dynamic dir (true)
        fs.existsSync = jest.fn().mockReturnValue(true);

        const req = mockReq({
            params: { filename: 'report.pdf' },
            session: { user: { id: 1, username: 'admin', role: 'admin' } }
        });
        const res = mockRes();

        await callRoute(uploadRouter, 'delete', '/api/archivo/:filename', req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        // renameSync called for file -> trash, and for dynamic dir -> trash
        expect(fs.renameSync).toHaveBeenCalled();
    });

    it('removes tags when deleting a file that has tags', async () => {
        loadTags.mockReturnValue({ 'tagged.pdf': ['important', 'review'] });

        const req = mockReq({
            params: { filename: 'tagged.pdf' },
            session: { user: { id: 1, username: 'admin', role: 'admin' } }
        });
        const res = mockRes();

        await callRoute(uploadRouter, 'delete', '/api/archivo/:filename', req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        expect(saveTags).toHaveBeenCalled();
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

    it('returns 404 when file does not exist', async () => {
        fs.existsSync = jest.fn().mockReturnValue(false);

        const req = mockReq({ params: { filename: 'missing.pdf' } });
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/archivos-file/:filename', req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('File not found');
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

    it('returns 404 when file does not exist for download', async () => {
        fs.existsSync = jest.fn().mockReturnValue(false);

        const req = mockReq({ params: { filename: 'missing.docx' } });
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/descargar/:filename', req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('File not found');
    });
});

describe('GET /archivo/:filename — file view', () => {

    it('blocks path traversal in file viewing', async () => {
        const req = mockReq({ params: { filename: '../../../etc/passwd' } });
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/archivo/:filename', req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith('Access denied');
        expect(res.render).not.toHaveBeenCalled();
    });

    it('returns 404 when file does not exist', async () => {
        fs.existsSync = jest.fn().mockReturnValue(false);

        const req = mockReq({ params: { filename: 'missing.pdf' } });
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/archivo/:filename', req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.render).toHaveBeenCalledWith('index');
    });

    it('renders markdown file with parsed content', async () => {
        fs.existsSync = jest.fn().mockReturnValue(true);
        fs.readFileSync.mockReturnValue('# Hello');
        fs.statSync.mockReturnValue({ size: 256, mtime: new Date('2024-01-01') });

        const req = mockReq({ params: { filename: 'notes.md' } });
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/archivo/:filename', req, res);

        expect(res.render).toHaveBeenCalledWith('archivo', expect.objectContaining({
            filename: 'notes.md',
            type: 'markdown',
            content: expect.any(String),
        }));
    });

    it('renders PDF file view', async () => {
        fs.existsSync = jest.fn().mockReturnValue(true);
        fs.statSync.mockReturnValue({ size: 4096, mtime: new Date('2024-06-01') });

        const req = mockReq({ params: { filename: 'report.pdf' } });
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/archivo/:filename', req, res);

        expect(res.render).toHaveBeenCalledWith('archivo', expect.objectContaining({
            filename: 'report.pdf',
            type: 'pdf',
            content: null,
        }));
    });

    it('renders other file type view', async () => {
        fs.existsSync = jest.fn().mockReturnValue(true);
        fs.statSync.mockReturnValue({ size: 2048, mtime: new Date('2024-03-15') });

        const req = mockReq({ params: { filename: 'data.txt' } });
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/archivo/:filename', req, res);

        expect(res.render).toHaveBeenCalledWith('archivo', expect.objectContaining({
            filename: 'data.txt',
            type: 'other',
            content: null,
        }));
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// FILE LISTING (files.js) — GET /api/archivos
// ═════════════════════════════════════════════════════════════════════════════

describe('GET /api/archivos — file listing', () => {

    it('returns empty list when no files exist', async () => {
        fs.existsSync = jest.fn().mockReturnValue(false);

        const req = mockReq();
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/api/archivos', req, res);

        expect(res.json).toHaveBeenCalledWith([]);
    });

    it('returns file list with metadata', async () => {
        const fakeFiles = [
            { name: 'report.pdf', isFile: () => true, isDirectory: () => false },
            { name: 'notes.md', isFile: () => true, isDirectory: () => false },
        ];
        fs.existsSync = jest.fn().mockReturnValue(true);
        fs.readdirSync = jest.fn()
            .mockReturnValueOnce(fakeFiles)    // ARCHIVOS_DIR read
            .mockReturnValueOnce([]);          // DINAMICAS_DIR read
        fs.statSync.mockReturnValue({ size: 2048, mtime: new Date('2024-05-01') });

        all.mockResolvedValue([{ filename: 'report.pdf', uploaded_by: 'admin' }]);
        loadTags.mockReturnValue({ 'report.pdf': ['finance'] });

        const req = mockReq();
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/api/archivos', req, res);

        expect(res.json).toHaveBeenCalled();
        const result = res.json.mock.calls[0][0];
        expect(result.length).toBe(2);
        expect(result[0].name).toBe('report.pdf');
        expect(result[0].type).toBe('pdf');
        expect(result[0].tags).toEqual(['finance']);
        expect(result[0].uploadedBy).toBe('admin');
        expect(result[1].name).toBe('notes.md');
        expect(result[1].type).toBe('markdown');
    });

    it('includes unlinked dynamic page folders', async () => {
        const fakeFiles = [];
        const fakeDynDirs = [
            { name: 'InteractiveGuide', isFile: () => false, isDirectory: () => true },
        ];
        fs.existsSync = jest.fn().mockReturnValue(true);
        fs.readdirSync = jest.fn()
            .mockReturnValueOnce(fakeFiles)         // ARCHIVOS_DIR (empty)
            .mockReturnValueOnce(fakeDynDirs)        // DINAMICAS_DIR dirs
            .mockReturnValueOnce(['guide.html']);     // HTML files in guide dir

        const req = mockReq();
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/api/archivos', req, res);

        expect(res.json).toHaveBeenCalled();
        const result = res.json.mock.calls[0][0];
        expect(result.length).toBe(1);
        expect(result[0].name).toBe('InteractiveGuide');
        expect(result[0].type).toBe('app');
        expect(result[0].hasDynamic).toBe(true);
    });

    it('handles DB errors gracefully and continues', async () => {
        all.mockRejectedValue(new Error('DB down'));
        fs.existsSync = jest.fn().mockReturnValue(false);

        const req = mockReq();
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/api/archivos', req, res);

        // Should still return successfully (empty list)
        expect(res.json).toHaveBeenCalledWith([]);
    });

    it('returns 500 when fs throws an unexpected error', async () => {
        fs.existsSync = jest.fn().mockImplementation(() => { throw new Error('disk failure'); });

        const req = mockReq();
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/api/archivos', req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Failed') }));
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// TAGS API (files.js) — POST /api/tags
// ═════════════════════════════════════════════════════════════════════════════

describe('POST /api/tags', () => {

    it('saves tags for a file', async () => {
        loadTags.mockReturnValue({});

        const req = mockReq({ body: { filename: 'report.pdf', tags: ['finance', 'Q1'] } });
        const res = mockRes();

        await callRoute(filesRouter, 'post', '/api/tags', req, res);

        expect(saveTags).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            tags: ['finance', 'Q1']
        }));
    });

    it('returns 400 when filename is missing', async () => {
        const req = mockReq({ body: { tags: ['test'] } });
        const res = mockRes();

        await callRoute(filesRouter, 'post', '/api/tags', req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Filename required' }));
    });

    it('handles empty tags array', async () => {
        loadTags.mockReturnValue({});

        const req = mockReq({ body: { filename: 'report.pdf', tags: [] } });
        const res = mockRes();

        await callRoute(filesRouter, 'post', '/api/tags', req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            tags: []
        }));
    });

    it('strips whitespace and empty tags', async () => {
        loadTags.mockReturnValue({});

        const req = mockReq({ body: { filename: 'report.pdf', tags: ['  finance  ', '', '  '] } });
        const res = mockRes();

        await callRoute(filesRouter, 'post', '/api/tags', req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            tags: ['finance']
        }));
    });

    it('returns 500 when saveTags throws', async () => {
        loadTags.mockImplementation(() => { throw new Error('disk error'); });

        const req = mockReq({ body: { filename: 'report.pdf', tags: ['test'] } });
        const res = mockRes();

        await callRoute(filesRouter, 'post', '/api/tags', req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// SKILLS API (files.js)
// ═════════════════════════════════════════════════════════════════════════════

describe('GET /api/skills — list skills', () => {

    it('returns skills from getFilesRecursively', async () => {
        const fakeSkills = [
            { name: 'create-asset-register.md', path: 'core/create-asset-register.md', size: 500, category: 'core', functionalGroup: 'engineering' },
            { name: 'classify-idea.md', path: 'core/classify-idea.md', size: 300, category: 'core', functionalGroup: 'gtd' }
        ];
        getFilesRecursively.mockReturnValue(fakeSkills);

        const req = mockReq();
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/api/skills', req, res);

        expect(res.json).toHaveBeenCalledWith(fakeSkills);
    });

    it('returns 500 when getFilesRecursively throws', async () => {
        getFilesRecursively.mockImplementation(() => { throw new Error('Permission denied'); });

        const req = mockReq();
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/api/skills', req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Failed to fetch skills' }));
    });
});

describe('GET /api/skills/content — read skill content', () => {

    it('blocks path traversal in skill content reads', async () => {
        const req = mockReq({ query: { file: '../../../etc/passwd' } });
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/api/skills/content', req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Access denied' }));
    });

    it('returns 400 when file query param is missing', async () => {
        const req = mockReq({ query: {} });
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/api/skills/content', req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'File path required' }));
    });

    it('returns 404 when skill file does not exist', async () => {
        fs.existsSync = jest.fn().mockReturnValue(false);

        const req = mockReq({ query: { file: 'core/nonexistent.md' } });
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/api/skills/content', req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'File not found' }));
    });

    it('returns skill content when file exists', async () => {
        fs.existsSync = jest.fn().mockReturnValue(true);
        fs.readFileSync.mockReturnValue('# Skill Title\n\nSome content here');

        const req = mockReq({ query: { file: 'core/classify-idea.md' } });
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/api/skills/content', req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            content: '# Skill Title\n\nSome content here'
        }));
    });

    it('returns 500 on unexpected read error', async () => {
        fs.existsSync = jest.fn().mockReturnValue(true);
        fs.readFileSync.mockImplementation(() => { throw new Error('EACCES'); });

        const req = mockReq({ query: { file: 'core/broken.md' } });
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/api/skills/content', req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

describe('PUT /api/skills/content — update skill (admin only)', () => {

    it('blocks non-admin users', async () => {
        const req = mockReq({
            session: { user: { id: 3, username: 'viewer1', role: 'viewer' } },
            body: { file: 'core/test.md', content: '# Updated' }
        });
        const res = mockRes();

        await callRoute(filesRouter, 'put', '/api/skills/content', req, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    it('returns 400 when file or content is missing', async () => {
        const req = mockReq({ body: { file: 'test.md' } });
        const res = mockRes();

        await callRoute(filesRouter, 'put', '/api/skills/content', req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 404 when skill file does not exist', async () => {
        fs.existsSync = jest.fn().mockReturnValue(false);

        const req = mockReq({ body: { file: 'core/missing.md', content: '# Hello' } });
        const res = mockRes();

        await callRoute(filesRouter, 'put', '/api/skills/content', req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('saves content and pushes to git on success', async () => {
        fs.existsSync = jest.fn().mockReturnValue(true);

        const req = mockReq({ body: { file: 'core/test-skill.md', content: '# Updated Skill' } });
        const res = mockRes();

        await callRoute(filesRouter, 'put', '/api/skills/content', req, res);

        expect(fs.writeFileSync).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('blocks path traversal in skill update', async () => {
        const req = mockReq({ body: { file: '../../../etc/passwd', content: 'hacked' } });
        const res = mockRes();

        await callRoute(filesRouter, 'put', '/api/skills/content', req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// SKILL DOCUMENTS (files.js)
// ═════════════════════════════════════════════════════════════════════════════

describe('GET /api/skill-documents', () => {

    it('returns 400 when skill query param is missing', async () => {
        const req = mockReq({ query: {} });
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/api/skill-documents', req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns documents for a skill', async () => {
        all.mockResolvedValue([{ id: 1, skill_path: 'core/test.md', document_name: 'doc.pdf' }]);

        const req = mockReq({ query: { skill: 'core/test.md' } });
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/api/skill-documents', req, res);

        expect(res.json).toHaveBeenCalledWith([{ id: 1, skill_path: 'core/test.md', document_name: 'doc.pdf' }]);
    });

    it('returns 500 on DB error', async () => {
        all.mockRejectedValue(new Error('DB down'));

        const req = mockReq({ query: { skill: 'core/test.md' } });
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/api/skill-documents', req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

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

    it('returns 400 when required fields are missing', async () => {
        const req = mockReq({ body: { skill_path: 'test.md' } });
        const res = mockRes();

        await callRoute(filesRouter, 'post', '/api/skill-documents', req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('creates a skill document link successfully', async () => {
        run.mockResolvedValue({ lastID: 42 });

        const req = mockReq({
            body: { skill_path: 'core/test.md', document_name: 'reference.pdf', document_url: '/archivos/ref.pdf', description: 'A reference doc' }
        });
        const res = mockRes();

        await callRoute(filesRouter, 'post', '/api/skill-documents', req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 42, skill_path: 'core/test.md', document_name: 'reference.pdf' }));
    });

    it('returns 500 on DB insert error', async () => {
        run.mockRejectedValue(new Error('unique constraint'));

        const req = mockReq({
            body: { skill_path: 'core/test.md', document_name: 'dup.pdf' }
        });
        const res = mockRes();

        await callRoute(filesRouter, 'post', '/api/skill-documents', req, res);

        expect(res.status).toHaveBeenCalledWith(500);
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

    it('returns 404 when document does not exist', async () => {
        get.mockResolvedValue(null);

        const req = mockReq({ params: { id: '999' } });
        const res = mockRes();

        await callRoute(filesRouter, 'delete', '/api/skill-documents/:id', req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('soft-deletes document record', async () => {
        get.mockResolvedValue({ id: 1, skill_path: 'core/test.md', document_name: 'doc.pdf', file_path: '1700000000_doc.pdf' });

        const req = mockReq({ params: { id: '1' } });
        const res = mockRes();

        await callRoute(filesRouter, 'delete', '/api/skill-documents/:id', req, res);

        expect(run).toHaveBeenCalledWith('UPDATE skill_documents SET deleted_at = NOW() WHERE id = ?', ['1']);
        expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('deletes document record even when no file_path exists', async () => {
        get.mockResolvedValue({ id: 2, skill_path: 'core/test.md', document_name: 'link.pdf', file_path: null });

        const req = mockReq({ params: { id: '2' } });
        const res = mockRes();

        await callRoute(filesRouter, 'delete', '/api/skill-documents/:id', req, res);

        expect(fs.unlinkSync).not.toHaveBeenCalled();
        expect(run).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('returns 500 on DB error during delete', async () => {
        get.mockRejectedValue(new Error('DB error'));

        const req = mockReq({ params: { id: '1' } });
        const res = mockRes();

        await callRoute(filesRouter, 'delete', '/api/skill-documents/:id', req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

describe('GET /api/skill-documents/download/:id', () => {

    it('returns 404 when document not found', async () => {
        get.mockResolvedValue(null);

        const req = mockReq({ params: { id: '999' } });
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/api/skill-documents/download/:id', req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 404 when no file_path associated', async () => {
        get.mockResolvedValue({ id: 1, document_name: 'doc.pdf', file_path: null });

        const req = mockReq({ params: { id: '1' } });
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/api/skill-documents/download/:id', req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 404 when file not on disk', async () => {
        get.mockResolvedValue({ id: 1, document_name: 'doc.pdf', file_path: '1700000000_doc.pdf' });
        fs.existsSync = jest.fn().mockReturnValue(false);

        const req = mockReq({ params: { id: '1' } });
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/api/skill-documents/download/:id', req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('downloads file when everything is valid', async () => {
        get.mockResolvedValue({ id: 1, document_name: 'doc.pdf', file_path: '1700000000_doc.pdf' });
        fs.existsSync = jest.fn().mockReturnValue(true);

        const req = mockReq({ params: { id: '1' } });
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/api/skill-documents/download/:id', req, res);

        expect(res.download).toHaveBeenCalled();
    });

    it('returns 500 on unexpected error', async () => {
        get.mockRejectedValue(new Error('DB crash'));

        const req = mockReq({ params: { id: '1' } });
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/api/skill-documents/download/:id', req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// TRASH MANAGEMENT (files.js)
// ═════════════════════════════════════════════════════════════════════════════

describe('GET /api/admin/files/trash — list trash', () => {

    it('returns empty array when trash dir does not exist', async () => {
        fs.existsSync = jest.fn().mockReturnValue(false);

        const req = mockReq();
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/api/admin/files/trash', req, res);

        expect(res.json).toHaveBeenCalledWith([]);
    });

    it('returns trash files with metadata', async () => {
        fs.existsSync = jest.fn().mockReturnValue(true);
        const trashFiles = [
            { name: '1700000000_report.pdf', isFile: () => true },
            { name: '1700000001_notes.md', isFile: () => true },
        ];
        fs.readdirSync = jest.fn().mockReturnValue(trashFiles);
        fs.statSync.mockReturnValue({ size: 2048, mtime: new Date('2024-01-01') });

        const req = mockReq();
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/api/admin/files/trash', req, res);

        expect(res.json).toHaveBeenCalled();
        const result = res.json.mock.calls[0][0];
        expect(result.length).toBe(2);
        // Sorted descending by deletedAt, so 1700000001 comes first
        expect(result[0].originalName).toBe('notes.md');
        expect(result[0].trashName).toBe('1700000001_notes.md');
        expect(result[1].originalName).toBe('report.pdf');
        expect(result[1].trashName).toBe('1700000000_report.pdf');
    });

    it('blocks non-admin users', async () => {
        const req = mockReq({
            session: { user: { id: 3, username: 'viewer1', role: 'viewer' } }
        });
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/api/admin/files/trash', req, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    it('returns 500 on error', async () => {
        fs.existsSync = jest.fn().mockReturnValue(true);
        fs.readdirSync = jest.fn().mockImplementation(() => { throw new Error('Permission denied'); });

        const req = mockReq();
        const res = mockRes();

        await callRoute(filesRouter, 'get', '/api/admin/files/trash', req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

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

    it('restores file with original name when no conflict', async () => {
        // existsSync: true for trash file check, false for destination conflict check
        let callCount = 0;
        fs.existsSync = jest.fn().mockImplementation((p) => {
            callCount++;
            // The last existsSync call checks if the original name already exists in ARCHIVOS_DIR
            // We want that one to return false (no conflict)
            if (String(p).includes('report.pdf') && !String(p).includes('.trash')) return false;
            return true;
        });

        const req = mockReq({ body: { trashName: '1700000000_report.pdf' } });
        const res = mockRes();

        await callRoute(filesRouter, 'post', '/api/admin/files/restore', req, res);

        expect(fs.renameSync).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, filename: 'report.pdf' }));
    });

    it('restores file with renamed name when conflict exists', async () => {
        // existsSync: true for trash file, true for destination conflict
        fs.existsSync = jest.fn().mockReturnValue(true);

        const req = mockReq({ body: { trashName: '1700000000_report.pdf' } });
        const res = mockRes();

        await callRoute(filesRouter, 'post', '/api/admin/files/restore', req, res);

        expect(fs.renameSync).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            filename: expect.stringContaining('report_restored_')
        }));
    });

    it('returns 500 on unexpected error', async () => {
        fs.existsSync = jest.fn().mockReturnValue(true);
        fs.renameSync.mockImplementation(() => { throw new Error('EACCES'); });

        const req = mockReq({ body: { trashName: '1700000000_report.pdf' } });
        const res = mockRes();

        await callRoute(filesRouter, 'post', '/api/admin/files/restore', req, res);

        expect(res.status).toHaveBeenCalledWith(500);
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

    it('returns 500 on unlinkSync error', async () => {
        fs.existsSync = jest.fn().mockReturnValue(true);
        fs.unlinkSync.mockImplementation(() => { throw new Error('EBUSY'); });

        const req = mockReq({ params: { trashName: '1700000000_locked.pdf' } });
        const res = mockRes();

        await callRoute(filesRouter, 'delete', '/api/admin/files/trash/:trashName', req, res);

        expect(res.status).toHaveBeenCalledWith(500);
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

    it('accepts file with .md extension (no magic number check)', async () => {
        const req = mockReq({
            session: { user: { id: 1, username: 'admin', role: 'admin' } },
            file: {
                filename: 'notes.md',
                originalname: 'notes.md',
                path: '/tmp/notes.md',
                size: 512,
                mimetype: 'text/markdown'
            },
            body: { tags: '' },
            path: '/api/upload'
        });
        const res = mockRes();

        await callRoute(uploadRouter, 'post', '/api/upload', req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true, filename: 'notes.md' })
        );
    });

    it('accepts file with .txt extension (no magic number check)', async () => {
        const req = mockReq({
            session: { user: { id: 1, username: 'admin', role: 'admin' } },
            file: {
                filename: 'readme.txt',
                originalname: 'readme.txt',
                path: '/tmp/readme.txt',
                size: 256,
                mimetype: 'text/plain'
            },
            body: { tags: '' },
            path: '/api/upload'
        });
        const res = mockRes();

        await callRoute(uploadRouter, 'post', '/api/upload', req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true, filename: 'readme.txt' })
        );
    });

    it('accepts .docx file with valid PK magic bytes', async () => {
        fs.openSync.mockReturnValue(3);
        fs.readSync.mockImplementation((fd, buf) => {
            buf[0] = 0x50; // P
            buf[1] = 0x4B; // K
            buf[2] = 0x03;
            buf[3] = 0x04;
            return 12;
        });
        fs.closeSync.mockReturnValue(undefined);
        fs.readFileSync.mockReturnValue(Buffer.alloc(64));

        const req = mockReq({
            session: { user: { id: 1, username: 'admin', role: 'admin' } },
            file: {
                filename: 'document.docx',
                originalname: 'document.docx',
                path: '/tmp/document.docx',
                size: 8192,
                mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            },
            body: { tags: '' },
            path: '/api/upload'
        });
        const res = mockRes();

        await callRoute(uploadRouter, 'post', '/api/upload', req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true, filename: 'document.docx' })
        );
    });

    it('saves tags when provided during upload', async () => {
        fs.openSync.mockReturnValue(3);
        fs.readSync.mockImplementation((fd, buf) => {
            buf[0] = 0x25; buf[1] = 0x50; buf[2] = 0x44; buf[3] = 0x46;
            return 12;
        });
        fs.closeSync.mockReturnValue(undefined);
        fs.readFileSync.mockReturnValue(Buffer.alloc(64));

        const req = mockReq({
            session: { user: { id: 1, username: 'admin', role: 'admin' } },
            file: {
                filename: 'tagged.pdf',
                originalname: 'tagged.pdf',
                path: '/tmp/tagged.pdf',
                size: 4096,
                mimetype: 'application/pdf'
            },
            body: { tags: 'finance,Q1,important' },
            path: '/api/upload'
        });
        const res = mockRes();

        await callRoute(uploadRouter, 'post', '/api/upload', req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                tags: ['finance', 'Q1', 'important']
            })
        );
        expect(saveTags).toHaveBeenCalled();
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
// VOICE UPLOAD (upload.js)
// ═════════════════════════════════════════════════════════════════════════════

describe('POST /api/ideas/voice — voice note upload', () => {

    it('blocks consultor from uploading voice notes', async () => {
        const req = mockReq({
            session: { user: { id: 3, username: 'consultor1', role: 'consultor' } },
            file: { filename: 'voice_1700000000.webm', path: '/tmp/voice.webm', size: 1024, mimetype: 'audio/webm', originalname: 'voice.webm' },
            body: { text: 'test idea' },
            path: '/api/ideas/voice'
        });
        const res = mockRes();

        await callRoute(uploadRouter, 'post', '/api/ideas/voice', req, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    it('returns 400 when no audio file is provided', async () => {
        const req = mockReq({
            file: null,
            body: { text: 'test idea' },
            path: '/api/ideas/voice'
        });
        const res = mockRes();

        await callRoute(uploadRouter, 'post', '/api/ideas/voice', req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('audio') }));
    });

    it('saves voice note and creates idea', async () => {
        run.mockResolvedValue({ lastID: 10 });
        get.mockResolvedValue({ id: 10, text: 'Test voice idea', audioUrl: '/voice-notes/voice_123.webm', createdAt: '2024-01-01', status: 'active' });
        processAndSaveIdea.mockResolvedValue(null);

        const req = mockReq({
            file: { filename: 'voice_123.webm', path: '/tmp/voice.webm', size: 2048, mimetype: 'audio/webm', originalname: 'voice.webm' },
            body: { text: 'Test voice idea' },
            path: '/api/ideas/voice'
        });
        const res = mockRes();

        await callRoute(uploadRouter, 'post', '/api/ideas/voice', req, res);

        expect(run).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 10 }));
    });

    it('handles split ideas from processAndSaveIdea', async () => {
        run.mockResolvedValue({ lastID: 10 });
        get.mockResolvedValue({ id: 10, text: 'Multi idea', audioUrl: '/voice-notes/voice_456.webm', createdAt: '2024-01-01', status: 'active' });
        processAndSaveIdea.mockResolvedValue({ split: true, count: 2, savedIds: [11, 12] });
        all.mockResolvedValue([
            { id: 11, text: 'Idea 1', status: 'active' },
            { id: 12, text: 'Idea 2', status: 'active' }
        ]);

        const req = mockReq({
            file: { filename: 'voice_456.webm', path: '/tmp/voice.webm', size: 2048, mimetype: 'audio/webm', originalname: 'voice.webm' },
            body: { text: 'Idea 1. Idea 2.' },
            path: '/api/ideas/voice'
        });
        const res = mockRes();

        await callRoute(uploadRouter, 'post', '/api/ideas/voice', req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ split: true, count: 2 }));
    });

    it('uses default text when body.text is empty', async () => {
        run.mockResolvedValue({ lastID: 15 });
        get.mockResolvedValue({ id: 15, text: 'Nota de voz', audioUrl: '/voice-notes/voice_789.webm', createdAt: '2024-01-01', status: 'active' });
        processAndSaveIdea.mockResolvedValue(null);

        const req = mockReq({
            file: { filename: 'voice_789.webm', path: '/tmp/voice.webm', size: 1024, mimetype: 'audio/webm', originalname: 'voice.webm' },
            body: {},
            path: '/api/ideas/voice'
        });
        const res = mockRes();

        await callRoute(uploadRouter, 'post', '/api/ideas/voice', req, res);

        expect(run).toHaveBeenCalledWith(
            expect.any(String),
            expect.arrayContaining(['Nota de voz'])
        );
    });

    it('returns 500 on unexpected error', async () => {
        run.mockRejectedValue(new Error('DB crash'));

        const req = mockReq({
            file: { filename: 'voice_err.webm', path: '/tmp/voice.webm', size: 1024, mimetype: 'audio/webm', originalname: 'voice.webm' },
            body: { text: 'test' },
            path: '/api/ideas/voice'
        });
        const res = mockRes();

        await callRoute(uploadRouter, 'post', '/api/ideas/voice', req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// UPLOAD — File registration and DB interaction
// ═════════════════════════════════════════════════════════════════════════════

describe('POST /api/upload — file registration in DB', () => {

    it('registers file in DB after successful upload', async () => {
        fs.openSync.mockReturnValue(3);
        fs.readSync.mockImplementation((fd, buf) => {
            buf[0] = 0x25; buf[1] = 0x50; buf[2] = 0x44; buf[3] = 0x46;
            return 12;
        });
        fs.closeSync.mockReturnValue(undefined);
        fs.readFileSync.mockReturnValue(Buffer.alloc(64));
        run.mockResolvedValue({ lastID: 5 });

        const req = mockReq({
            session: { user: { id: 1, username: 'admin', role: 'admin' } },
            file: {
                filename: 'registered.pdf',
                originalname: 'registered.pdf',
                path: '/tmp/registered.pdf',
                size: 4096,
                mimetype: 'application/pdf'
            },
            body: { tags: '' },
            path: '/api/upload'
        });
        const res = mockRes();

        await callRoute(uploadRouter, 'post', '/api/upload', req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        // DB insert should be called (registerFileInDb is fire-and-forget)
        expect(run).toHaveBeenCalled();
    });

    it('handles upload error gracefully', async () => {
        fs.openSync.mockImplementation(() => { throw new Error('disk full'); });

        const req = mockReq({
            session: { user: { id: 1, username: 'admin', role: 'admin' } },
            file: {
                filename: 'problem.pdf',
                originalname: 'problem.pdf',
                path: '/tmp/problem.pdf',
                size: 4096,
                mimetype: 'application/pdf'
            },
            body: { tags: '' },
            path: '/api/upload'
        });
        const res = mockRes();

        await callRoute(uploadRouter, 'post', '/api/upload', req, res);

        // The magic number validation catches the error and returns false,
        // so the file gets rejected as spoofed
        expect(res.status).toHaveBeenCalledWith(400);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// SKILL DOCUMENTS — upload route
// ═════════════════════════════════════════════════════════════════════════════

describe('POST /api/skill-documents/upload', () => {

    it('blocks unauthenticated users', async () => {
        const req = mockReq({
            session: {},
            body: { skill_path: 'core/test.md' },
            file: { filename: '1700000000_doc.pdf', originalname: 'doc.pdf', size: 1024 }
        });
        const res = mockRes();

        await callRoute(filesRouter, 'post', '/api/skill-documents/upload', req, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('blocks non-admin/manager roles', async () => {
        const req = mockReq({
            session: { user: { id: 3, username: 'viewer1', role: 'viewer' } },
            body: { skill_path: 'core/test.md' },
            file: { filename: '1700000000_doc.pdf', originalname: 'doc.pdf', size: 1024 }
        });
        const res = mockRes();

        await callRoute(filesRouter, 'post', '/api/skill-documents/upload', req, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    it('returns 400 when no file is provided', async () => {
        const req = mockReq({
            body: { skill_path: 'core/test.md' },
            file: null
        });
        const res = mockRes();

        await callRoute(filesRouter, 'post', '/api/skill-documents/upload', req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 when skill_path is missing', async () => {
        const req = mockReq({
            body: {},
            file: { filename: '1700000000_doc.pdf', originalname: 'doc.pdf', size: 1024 }
        });
        const res = mockRes();

        await callRoute(filesRouter, 'post', '/api/skill-documents/upload', req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('uploads and registers skill document successfully', async () => {
        run.mockResolvedValue({ lastID: 99 });

        const req = mockReq({
            body: { skill_path: 'core/test.md', description: 'A reference' },
            file: { filename: '1700000000_doc.pdf', originalname: 'doc.pdf', size: 2048 }
        });
        const res = mockRes();

        await callRoute(filesRouter, 'post', '/api/skill-documents/upload', req, res);

        expect(run).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 99 }));
    });

    it('returns 500 on DB error', async () => {
        run.mockRejectedValue(new Error('DB insert failed'));

        const req = mockReq({
            body: { skill_path: 'core/test.md' },
            file: { filename: '1700000000_doc.pdf', originalname: 'doc.pdf', size: 1024 }
        });
        const res = mockRes();

        await callRoute(filesRouter, 'post', '/api/skill-documents/upload', req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
