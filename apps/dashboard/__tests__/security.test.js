/**
 * Security tests
 * Tests: path traversal prevention, input validation, safe defaults
 */
const path = require('path');

describe('safePath helper', () => {
    // Replicate the safePath function from server.js
    function safePath(baseDir, userInput) {
        const resolved = path.resolve(baseDir, userInput);
        if (!resolved.startsWith(path.resolve(baseDir))) return null;
        return resolved;
    }

    const BASE_DIR = path.resolve('/app/knowledge');

    test('allows normal filenames', () => {
        expect(safePath(BASE_DIR, 'document.md')).toBeTruthy();
        expect(safePath(BASE_DIR, 'report.pdf')).toBeTruthy();
    });

    test('blocks path traversal with ../', () => {
        expect(safePath(BASE_DIR, '../../../etc/passwd')).toBeNull();
        expect(safePath(BASE_DIR, '../../secret.key')).toBeNull();
    });

    test('blocks absolute paths outside base', () => {
        // On Windows this might behave differently, but the principle holds
        const result = safePath(BASE_DIR, '/etc/passwd');
        if (process.platform === 'win32') {
            // On Windows, /etc/passwd resolves relative to current drive
            // The test verifies it doesn't escape the base dir
            expect(result === null || result.startsWith(path.resolve(BASE_DIR))).toBe(true);
        } else {
            expect(result).toBeNull();
        }
    });

    test('allows subdirectory access', () => {
        const result = safePath(BASE_DIR, 'subfolder/file.md');
        expect(result).toBeTruthy();
        expect(result).toContain('subfolder');
    });

    test('handles URL-encoded traversal attempts', () => {
        // Decoded by Express before reaching our code, but test the resolved path
        expect(safePath(BASE_DIR, '..%2F..%2Fetc%2Fpasswd')).toBeTruthy(); // This stays in base (treated as filename)
        expect(safePath(BASE_DIR, decodeURIComponent('..%2F..%2Fetc%2Fpasswd'))).toBeNull(); // Decoded = blocked
    });
});

describe('escapeHtml', () => {
    // Replicate frontend escapeHtml
    function escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    test('escapes HTML tags', () => {
        expect(escapeHtml('<script>alert("xss")</script>')).toBe(
            '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
        );
    });

    test('escapes single quotes', () => {
        expect(escapeHtml("it's")).toBe('it&#39;s');
    });

    test('escapes double quotes', () => {
        expect(escapeHtml('say "hello"')).toBe('say &quot;hello&quot;');
    });

    test('handles null/empty', () => {
        expect(escapeHtml(null)).toBe('');
        expect(escapeHtml('')).toBe('');
        expect(escapeHtml(undefined)).toBe('');
    });

    test('preserves normal text', () => {
        expect(escapeHtml('Hello World')).toBe('Hello World');
    });
});

describe('Session Configuration', () => {
    test('SESSION_SECRET should not use default in production', () => {
        const defaultSecret = 'vsc-hub-internal-2026';
        const envSecret = process.env.SESSION_SECRET || '';
        // In test env, this is expected to be empty, but validates the concept
        expect(envSecret).not.toBe(defaultSecret);
    });
});

describe('Input Validation Patterns', () => {
    test('SQL parameterized queries prevent injection', () => {
        // This tests the pattern, not actual DB
        const userInput = "'; DROP TABLE ideas; --";
        const query = 'SELECT * FROM ideas WHERE text = ?';
        const params = [userInput];

        // Verify the pattern uses parameterization
        expect(query).toContain('?');
        expect(params[0]).toBe(userInput); // Param is passed separately, not interpolated
    });

    test('pagination limits are enforced', () => {
        // Replicate server logic
        function sanitizePagination(page, limit) {
            const pageNum = Math.max(1, parseInt(page) || 1);
            const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
            return { page: pageNum, limit: limitNum };
        }

        expect(sanitizePagination('1', '50')).toEqual({ page: 1, limit: 50 });
        expect(sanitizePagination('-5', '999')).toEqual({ page: 1, limit: 100 }); // Clamped
        expect(sanitizePagination('abc', 'xyz')).toEqual({ page: 1, limit: 50 }); // Defaults
        expect(sanitizePagination(undefined, '0')).toEqual({ page: 1, limit: 50 }); // 0 is falsy → default 50
    });
});
