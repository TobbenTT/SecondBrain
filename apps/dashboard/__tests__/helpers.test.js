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
const { safePath, formatFileSize } = require('../helpers/utils');

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
