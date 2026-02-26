/**
 * Tests for helper modules: AppError, validate, utils.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// AppError
// ═══════════════════════════════════════════════════════════════════════════════

const AppError = require('../helpers/AppError');

describe('AppError', () => {
    it('creates error with default values', () => {
        const err = new AppError('something failed');
        expect(err.message).toBe('something failed');
        expect(err.statusCode).toBe(500);
        expect(err.code).toBe('INTERNAL_ERROR');
        expect(err.isOperational).toBe(true);
        expect(err.name).toBe('AppError');
        expect(err).toBeInstanceOf(Error);
    });

    it('creates error with custom statusCode and code', () => {
        const err = new AppError('custom', 422, 'VALIDATION_ERROR');
        expect(err.statusCode).toBe(422);
        expect(err.code).toBe('VALIDATION_ERROR');
    });

    it('badRequest returns 400', () => {
        const err = AppError.badRequest('invalid input');
        expect(err.statusCode).toBe(400);
        expect(err.code).toBe('BAD_REQUEST');
        expect(err.message).toBe('invalid input');
    });

    it('badRequest accepts custom code', () => {
        const err = AppError.badRequest('nope', 'CUSTOM');
        expect(err.code).toBe('CUSTOM');
    });

    it('unauthorized returns 401', () => {
        const err = AppError.unauthorized();
        expect(err.statusCode).toBe(401);
        expect(err.code).toBe('UNAUTHORIZED');
        expect(err.message).toBe('Authentication required');
    });

    it('forbidden returns 403', () => {
        const err = AppError.forbidden();
        expect(err.statusCode).toBe(403);
        expect(err.code).toBe('FORBIDDEN');
    });

    it('notFound returns 404', () => {
        const err = AppError.notFound();
        expect(err.statusCode).toBe(404);
        expect(err.code).toBe('NOT_FOUND');
    });

    it('conflict returns 409', () => {
        const err = AppError.conflict('already exists');
        expect(err.statusCode).toBe(409);
        expect(err.code).toBe('CONFLICT');
    });

    it('tooMany returns 429', () => {
        const err = AppError.tooMany();
        expect(err.statusCode).toBe(429);
        expect(err.code).toBe('RATE_LIMITED');
    });

    it('has a stack trace', () => {
        const err = new AppError('test');
        expect(err.stack).toBeDefined();
        expect(err.stack).toContain('AppError');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// validate.js
// ═══════════════════════════════════════════════════════════════════════════════

const {
    isNonEmptyString,
    isOptionalString,
    isPositiveInt,
    isDateString,
    isOneOf,
    validateBody,
} = require('../helpers/validate');

describe('isNonEmptyString', () => {
    it('returns true for valid strings', () => {
        expect(isNonEmptyString('hello')).toBe(true);
        expect(isNonEmptyString('a')).toBe(true);
    });

    it('returns false for empty or whitespace strings', () => {
        expect(isNonEmptyString('')).toBe(false);
        expect(isNonEmptyString('   ')).toBe(false);
    });

    it('returns false for non-strings', () => {
        expect(isNonEmptyString(123)).toBe(false);
        expect(isNonEmptyString(null)).toBe(false);
        expect(isNonEmptyString(undefined)).toBe(false);
    });

    it('respects maxLen', () => {
        expect(isNonEmptyString('abc', 3)).toBe(true);
        expect(isNonEmptyString('abcd', 3)).toBe(false);
    });
});

describe('isOptionalString', () => {
    it('returns true for null/undefined', () => {
        expect(isOptionalString(null)).toBe(true);
        expect(isOptionalString(undefined)).toBe(true);
    });

    it('returns true for valid string within maxLen', () => {
        expect(isOptionalString('hello')).toBe(true);
    });

    it('returns false for string exceeding maxLen', () => {
        expect(isOptionalString('abcd', 3)).toBe(false);
    });

    it('returns false for non-string truthy values', () => {
        expect(isOptionalString(123)).toBe(false);
    });
});

describe('isPositiveInt', () => {
    it('returns true for positive integers', () => {
        expect(isPositiveInt(1)).toBe(true);
        expect(isPositiveInt(100)).toBe(true);
        expect(isPositiveInt('5')).toBe(true);
    });

    it('returns false for zero, negatives, and non-integers', () => {
        expect(isPositiveInt(0)).toBe(false);
        expect(isPositiveInt(-1)).toBe(false);
        expect(isPositiveInt(1.5)).toBe(false);
        expect(isPositiveInt('abc')).toBe(false);
    });
});

describe('isDateString', () => {
    it('returns true for valid dates and null/undefined', () => {
        expect(isDateString('2024-01-15')).toBe(true);
        expect(isDateString(null)).toBe(true);
        expect(isDateString(undefined)).toBe(true);
    });

    it('returns false for invalid formats', () => {
        expect(isDateString('01-15-2024')).toBe(false);
        expect(isDateString('2024/01/15')).toBe(false);
        expect(isDateString('not-a-date')).toBe(false);
    });
});

describe('isOneOf', () => {
    it('returns true when value is in allowed list', () => {
        expect(isOneOf('a', ['a', 'b', 'c'])).toBe(true);
    });

    it('returns false when value is not in allowed list', () => {
        expect(isOneOf('d', ['a', 'b', 'c'])).toBe(false);
    });
});

describe('validateBody middleware', () => {
    const mockRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    it('passes when all required fields present', () => {
        const middleware = validateBody({
            name: { required: true, type: 'string' },
        });
        const req = { body: { name: 'test' } };
        const res = mockRes();
        const next = jest.fn();

        middleware(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('returns 400 when required field missing', () => {
        const middleware = validateBody({
            name: { required: true, type: 'string' },
        });
        const req = { body: {} };
        const res = mockRes();
        const next = jest.fn();

        middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });

    it('validates string type and maxLen', () => {
        const middleware = validateBody({
            title: { type: 'string', maxLen: 5 },
        });
        const req = { body: { title: 'toolong' } };
        const res = mockRes();
        const next = jest.fn();

        middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('validates number type', () => {
        const middleware = validateBody({
            count: { type: 'number' },
        });
        const req = { body: { count: 'not-a-number' } };
        const res = mockRes();
        const next = jest.fn();

        middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('validates array type', () => {
        const middleware = validateBody({
            items: { type: 'array' },
        });
        const req = { body: { items: 'not-an-array' } };
        const res = mockRes();
        const next = jest.fn();

        middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('validates oneOf constraint', () => {
        const middleware = validateBody({
            status: { oneOf: ['active', 'archived'] },
        });
        const req = { body: { status: 'invalid' } };
        const res = mockRes();
        const next = jest.fn();

        middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('validates date format', () => {
        const middleware = validateBody({
            deadline: { date: true },
        });
        const req = { body: { deadline: 'not-a-date' } };
        const res = mockRes();
        const next = jest.fn();

        middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('validates custom validate function', () => {
        const middleware = validateBody({
            age: { validate: (v) => v > 0 && v < 150 },
        });
        const req = { body: { age: 200 } };
        const res = mockRes();
        const next = jest.fn();

        middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('skips optional fields when not present', () => {
        const middleware = validateBody({
            optional: { type: 'string', maxLen: 10 },
        });
        const req = { body: {} };
        const res = mockRes();
        const next = jest.fn();

        middleware(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('aggregates multiple errors', () => {
        const middleware = validateBody({
            name: { required: true },
            email: { required: true },
        });
        const req = { body: {} };
        const res = mockRes();
        const next = jest.fn();

        middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        const errorMsg = res.json.mock.calls[0][0].error;
        expect(errorMsg).toContain('name');
        expect(errorMsg).toContain('email');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// utils.js
// ═══════════════════════════════════════════════════════════════════════════════

const path = require('path');
const fs = require('fs');
const { safePath, formatFileSize, getFilesRecursively, findDynamicPage, loadTags, saveTags } = require('../helpers/utils');

describe('safePath', () => {
    it('returns resolved path for safe input', () => {
        const base = '/home/user/data';
        const result = safePath(base, 'file.txt');
        expect(result).toBe(path.resolve(base, 'file.txt'));
    });

    it('returns null for directory traversal attempt', () => {
        const base = '/home/user/data';
        expect(safePath(base, '../../../etc/passwd')).toBe(null);
        expect(safePath(base, '../../secret')).toBe(null);
    });

    it('allows subdirectory paths', () => {
        const base = '/home/user/data';
        const result = safePath(base, 'subdir/file.txt');
        expect(result).not.toBe(null);
    });
});

describe('formatFileSize', () => {
    it('formats 0 bytes', () => {
        expect(formatFileSize(0)).toBe('0 B');
    });

    it('formats bytes', () => {
        expect(formatFileSize(500)).toBe('500 B');
    });

    it('formats kilobytes', () => {
        expect(formatFileSize(1024)).toBe('1 KB');
        expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('formats megabytes', () => {
        expect(formatFileSize(1048576)).toBe('1 MB');
    });

    it('formats gigabytes', () => {
        expect(formatFileSize(1073741824)).toBe('1 GB');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// getFilesRecursively
// ═══════════════════════════════════════════════════════════════════════════════

jest.mock('fs');

describe('getFilesRecursively', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns empty array when directory does not exist', () => {
        fs.existsSync.mockReturnValue(false);
        const result = getFilesRecursively('/nonexistent');
        expect(result).toEqual([]);
    });

    it('returns .md files with metadata', () => {
        fs.existsSync.mockReturnValue(true);
        fs.readdirSync.mockReturnValue(['classify-idea.md', 'notes.txt']);
        fs.statSync.mockImplementation((filePath) => ({
            isDirectory: () => false,
            size: 1234,
        }));

        const result = getFilesRecursively('/skills/core');
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('classify-idea.md');
        expect(result[0].size).toBe(1234);
        expect(result[0].functionalGroup).toBe('gtd');
    });

    it('recurses into subdirectories', () => {
        fs.existsSync.mockReturnValue(true);
        fs.readdirSync
            .mockReturnValueOnce(['subdir'])
            .mockReturnValueOnce(['create-case-study.md']);
        fs.statSync
            .mockReturnValueOnce({ isDirectory: () => true, size: 0 })
            .mockReturnValueOnce({ isDirectory: () => false, size: 500 });

        const result = getFilesRecursively('/skills');
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('create-case-study.md');
        expect(result[0].functionalGroup).toBe('communication');
    });

    it('uses category default group for unknown skill names', () => {
        fs.existsSync.mockReturnValue(true);
        fs.readdirSync.mockReturnValue(['unknown-skill.md']);
        fs.statSync.mockReturnValue({ isDirectory: () => false, size: 100 });

        // The parent dir name is used as category
        const result = getFilesRecursively('/base/customizable');
        expect(result).toHaveLength(1);
        expect(result[0].category).toBe('customizable');
        expect(result[0].functionalGroup).toBe('communication');
    });

    it('falls back to engineering for unknown skill and unknown category', () => {
        fs.existsSync.mockReturnValue(true);
        fs.readdirSync.mockReturnValue(['random-thing.md']);
        fs.statSync.mockReturnValue({ isDirectory: () => false, size: 50 });

        const result = getFilesRecursively('/base/unknowncategory');
        expect(result).toHaveLength(1);
        expect(result[0].functionalGroup).toBe('engineering');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// findDynamicPage
// ═══════════════════════════════════════════════════════════════════════════════

describe('findDynamicPage', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns null when dinamics directory does not exist', () => {
        fs.existsSync.mockReturnValue(false);
        const result = findDynamicPage('some-file.md', '/dinamicas');
        expect(result).toBe(null);
    });

    it('returns null when no matching directory found', () => {
        fs.existsSync.mockReturnValue(true);
        fs.readdirSync.mockReturnValueOnce([
            { name: 'Unrelated-Topic', isDirectory: () => true },
        ]);

        const result = findDynamicPage('completely-different-words.md', '/dinamicas');
        expect(result).toBe(null);
    });

    it('finds a matching dynamic page based on word overlap', () => {
        fs.existsSync.mockReturnValue(true);
        fs.readdirSync
            .mockReturnValueOnce([
                { name: 'Analyze-Equipment-Criticality', isDirectory: () => true },
            ])
            .mockReturnValueOnce(['index.html', 'styles.css']);

        const result = findDynamicPage('analyze-equipment-criticality.md', '/dinamicas');
        expect(result).not.toBe(null);
        expect(result.folder).toBe('Analyze-Equipment-Criticality');
        expect(result.htmlFile).toBe('index.html');
        expect(result.url).toContain('/dinamicas/');
    });

    it('skips Proximamente directory', () => {
        fs.existsSync.mockReturnValue(true);
        fs.readdirSync.mockReturnValueOnce([
            { name: 'Proximamente', isDirectory: () => true },
        ]);

        const result = findDynamicPage('analyze-equipment-criticality.md', '/dinamicas');
        expect(result).toBe(null);
    });

    it('returns null when matching folder has no html files', () => {
        fs.existsSync.mockReturnValue(true);
        fs.readdirSync
            .mockReturnValueOnce([
                { name: 'Analyze-Equipment-Criticality', isDirectory: () => true },
            ])
            .mockReturnValueOnce(['readme.md']);

        const result = findDynamicPage('analyze-equipment-criticality.md', '/dinamicas');
        expect(result).toBe(null);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// loadTags / saveTags
// ═══════════════════════════════════════════════════════════════════════════════

describe('loadTags', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns parsed JSON from file', () => {
        fs.readFileSync.mockReturnValue('{"tag1": "value1"}');
        const result = loadTags('/path/to/tags.json');
        expect(result).toEqual({ tag1: 'value1' });
        expect(fs.readFileSync).toHaveBeenCalledWith('/path/to/tags.json', 'utf-8');
    });

    it('returns empty object when file does not exist', () => {
        fs.readFileSync.mockImplementation(() => { throw new Error('ENOENT'); });
        const result = loadTags('/nonexistent/tags.json');
        expect(result).toEqual({});
    });

    it('returns empty object when file contains invalid JSON', () => {
        fs.readFileSync.mockReturnValue('not valid json');
        const result = loadTags('/path/to/tags.json');
        expect(result).toEqual({});
    });
});

describe('saveTags', () => {
    beforeEach(() => jest.clearAllMocks());

    it('writes JSON to file', () => {
        fs.writeFileSync.mockImplementation(() => {});
        saveTags('/path/to/tags.json', { tag1: 'value1' });
        expect(fs.writeFileSync).toHaveBeenCalledWith(
            '/path/to/tags.json',
            JSON.stringify({ tag1: 'value1' }, null, 2),
            'utf-8'
        );
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// validatePassword
// ═══════════════════════════════════════════════════════════════════════════════

const { validatePassword, checkBreachedPassword } = require('../helpers/validate');

describe('validatePassword', () => {
    it('returns valid for a strong password', () => {
        const result = validatePassword('MyStr0ng!Pass');
        expect(result.valid).toBe(true);
    });

    it('rejects null/undefined/non-string', () => {
        expect(validatePassword(null).valid).toBe(false);
        expect(validatePassword(null).error).toBe('Contraseña requerida');
        expect(validatePassword(undefined).valid).toBe(false);
        expect(validatePassword(123).valid).toBe(false);
    });

    it('rejects passwords shorter than 8 characters', () => {
        const result = validatePassword('Ab1!xyz');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Minimo 8 caracteres');
    });

    it('rejects passwords longer than 128 characters', () => {
        const longPass = 'A'.repeat(100) + 'a'.repeat(20) + '1!!!!!!!2';
        const result = validatePassword(longPass);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Maximo 128 caracteres');
    });

    it('rejects password without uppercase', () => {
        const result = validatePassword('nouppercase1!');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('mayuscula');
    });

    it('rejects password without lowercase', () => {
        const result = validatePassword('NOLOWERCASE1!');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('minuscula');
    });

    it('rejects password without digit', () => {
        const result = validatePassword('NoDigitsHere!');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('numero');
    });

    it('rejects password without special character', () => {
        const result = validatePassword('NoSpecial1A');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('caracter especial');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// checkBreachedPassword
// ═══════════════════════════════════════════════════════════════════════════════

describe('checkBreachedPassword', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
        global.fetch = originalFetch;
    });

    it('returns breached:true when password found in HIBP', async () => {
        const crypto = require('crypto');
        const testPassword = 'password123';
        const sha1 = crypto.createHash('sha1').update(testPassword).digest('hex').toUpperCase();
        const suffix = sha1.substring(5);

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            text: () => Promise.resolve(`${suffix}:42\nABCDEF12345678901234567890ABCDE:5`),
        });

        const result = await checkBreachedPassword(testPassword);
        expect(result.breached).toBe(true);
        expect(result.count).toBe(42);
    });

    it('returns breached:false when password not found in HIBP', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            text: () => Promise.resolve('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:10\nBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB:20'),
        });

        const result = await checkBreachedPassword('MyV3ryUn1queP@ssw0rd!XYZ');
        expect(result.breached).toBe(false);
    });

    it('returns breached:false when API returns non-ok status', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
        });

        const result = await checkBreachedPassword('anypassword');
        expect(result.breached).toBe(false);
    });

    it('returns breached:false on network error', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

        const result = await checkBreachedPassword('anypassword');
        expect(result.breached).toBe(false);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// validateBody — additional coverage for string type check (line 45)
// ═══════════════════════════════════════════════════════════════════════════════

describe('validateBody — non-string value for string type', () => {
    const mockRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    it('rejects non-string value when type is string', () => {
        const middleware = validateBody({
            name: { type: 'string' },
        });
        const req = { body: { name: 12345 } };
        const res = mockRes();
        const next = jest.fn();

        middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        const errorMsg = res.json.mock.calls[0][0].error;
        expect(errorMsg).toContain('name must be a string');
    });

    it('accepts actual string value for string type', () => {
        const middleware = validateBody({
            name: { type: 'string' },
        });
        const req = { body: { name: 'valid' } };
        const res = mockRes();
        const next = jest.fn();

        middleware(req, res, next);
        expect(next).toHaveBeenCalled();
    });
});
