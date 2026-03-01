/**
 * Tests for 2FA routes: publicRouter and protectedRouter
 * Unit-style tests with mocked req/res/next (no supertest).
 */

// ─── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('../database', () => ({
    get: jest.fn(),
    run: jest.fn(),
    all: jest.fn(),
}));

jest.mock('../helpers/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
}));

jest.mock('../helpers/audit', () => ({
    auditLog: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
    compare: jest.fn(),
    hash: jest.fn(),
}));

jest.mock('qrcode', () => ({
    toDataURL: jest.fn(),
}));

jest.mock('otplib', () => ({
    generateSecret: jest.fn(),
    generateURI: jest.fn(),
    verify: jest.fn(),
}));

jest.mock('../helpers/twofa', () => ({
    encryptSecret: jest.fn(),
    decryptSecret: jest.fn(),
    computeDeviceHash: jest.fn(),
    generateDeviceLabel: jest.fn(),
    generateRecoveryCodes: jest.fn(),
    getEncryptionKey: jest.fn(),
    getWebAuthnRPInfo: jest.fn(),
    TRUST_DURATION_DAYS: 30,
}));

jest.mock('@simplewebauthn/server', () => ({
    generateAuthenticationOptions: jest.fn(),
    verifyAuthenticationResponse: jest.fn(),
    generateRegistrationOptions: jest.fn(),
    verifyRegistrationResponse: jest.fn(),
}));

// ─── Imports ────────────────────────────────────────────────────────────────

const { get, run, all } = require('../database');
const { auditLog } = require('../helpers/audit');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');
const { generateSecret, generateURI, verify: verifyTOTP } = require('otplib');
const {
    encryptSecret, decryptSecret,
    computeDeviceHash, generateDeviceLabel,
    generateRecoveryCodes, getEncryptionKey,
    getWebAuthnRPInfo,
} = require('../helpers/twofa');
const simpleWebAuthn = require('@simplewebauthn/server');

const { publicRouter, protectedRouter } = require('../routes/twofa');

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Extract the route handler function from an Express router stack */
function getHandler(router, method, path) {
    const layer = router.stack.find(l =>
        l.route && l.route.path === path && l.route.methods[method]
    );
    return layer ? layer.route.stack[0].handle : null;
}

const mockReq = (overrides = {}) => ({
    session: {},
    body: {},
    params: {},
    headers: { 'user-agent': 'test-agent' },
    ip: '127.0.0.1',
    hostname: 'localhost',
    protocol: 'https',
    ...overrides,
});

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.redirect = jest.fn().mockReturnValue(res);
    res.render = jest.fn().mockReturnValue(res);
    return res;
};

// ─── Common session fixtures ────────────────────────────────────────────────

const pendingSession = {
    pending2FA: {
        userId: 42,
        username: 'carlos',
        role: 'user',
        department: 'Engineering',
        expertise: 'backend',
        avatar: null,
    },
};

const authedSession = {
    user: { id: 42, username: 'carlos', role: 'user' },
    authenticated: true,
};

// ═════════════════════════════════════════════════════════════════════════════
// PUBLIC ROUTER
// ═════════════════════════════════════════════════════════════════════════════

// ─── GET /2fa ────────────────────────────────────────────────────────────────

describe('GET /2fa', () => {
    const handler = getHandler(publicRouter, 'get', '/2fa');

    beforeEach(() => jest.clearAllMocks());

    it('redirects to /login when no pending2FA session', async () => {
        const req = mockReq();
        const res = mockRes();
        await handler(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/login');
    });

    it('renders twofa template with hasPasskeys = false when user has no passkeys', async () => {
        get.mockResolvedValueOnce({ cnt: 0 });
        const req = mockReq({ session: { ...pendingSession } });
        const res = mockRes();
        await handler(req, res);
        expect(res.render).toHaveBeenCalledWith('twofa', {
            username: 'carlos',
            error: null,
            hasPasskeys: false,
        });
    });

    it('renders twofa template with hasPasskeys = true when user has registered credentials', async () => {
        get.mockResolvedValueOnce({ cnt: 2 });
        const req = mockReq({ session: { ...pendingSession } });
        const res = mockRes();
        await handler(req, res);
        expect(res.render).toHaveBeenCalledWith('twofa', {
            username: 'carlos',
            error: null,
            hasPasskeys: true,
        });
    });

    it('defaults hasPasskeys to false when DB query throws', async () => {
        get.mockRejectedValueOnce(new Error('DB down'));
        const req = mockReq({ session: { ...pendingSession } });
        const res = mockRes();
        await handler(req, res);
        expect(res.render).toHaveBeenCalledWith('twofa', {
            username: 'carlos',
            error: null,
            hasPasskeys: false,
        });
    });
});

// ─── POST /2fa ───────────────────────────────────────────────────────────────

describe('POST /2fa', () => {
    const handler = getHandler(publicRouter, 'post', '/2fa');

    beforeEach(() => jest.clearAllMocks());

    it('redirects to /login when no pending2FA session', async () => {
        const req = mockReq();
        const res = mockRes();
        await handler(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/login');
    });

    it('renders error when token is empty', async () => {
        const req = mockReq({ session: { ...pendingSession }, body: { token: '' } });
        const res = mockRes();
        await handler(req, res);
        expect(res.render).toHaveBeenCalledWith('twofa', {
            username: 'carlos',
            error: 'Ingresa un codigo',
        });
    });

    it('renders error when token is whitespace only', async () => {
        const req = mockReq({ session: { ...pendingSession }, body: { token: '   ' } });
        const res = mockRes();
        await handler(req, res);
        expect(res.render).toHaveBeenCalledWith('twofa', {
            username: 'carlos',
            error: 'Ingresa un codigo',
        });
    });

    it('verifies valid TOTP code and completes session', async () => {
        // TOTP lookup returns encrypted secret
        get.mockResolvedValueOnce({ secret_encrypted: 'enc-secret' });
        decryptSecret.mockReturnValue('JBSWY3DPEHPK3PXP');
        verifyTOTP.mockReturnValue(true);
        run.mockResolvedValue({});

        const session = { ...pendingSession };
        const req = mockReq({ session, body: { token: '123456' } });
        const res = mockRes();
        await handler(req, res);

        expect(decryptSecret).toHaveBeenCalledWith('enc-secret');
        expect(verifyTOTP).toHaveBeenCalledWith({ token: '123456', secret: 'JBSWY3DPEHPK3PXP' });
        expect(session.user).toBeDefined();
        expect(session.user.id).toBe(42);
        expect(session.authenticated).toBe(true);
        expect(session.pending2FA).toBeUndefined();
        expect(res.redirect).toHaveBeenCalledWith('/');
    });

    it('verifies valid recovery code and sets recoveryWarning', async () => {
        // No TOTP row
        get.mockResolvedValueOnce(null);
        // Recovery codes
        all.mockResolvedValueOnce([{ id: 7, code_hash: '$2a$10$hashval' }]);
        bcrypt.compare.mockResolvedValueOnce(true);
        run.mockResolvedValue({});
        // Remaining recovery codes after use
        get.mockResolvedValueOnce({ cnt: 4 });

        const session = { ...pendingSession };
        const req = mockReq({ session, body: { token: 'abc12345' } });
        const res = mockRes();
        await handler(req, res);

        expect(bcrypt.compare).toHaveBeenCalledWith('abc12345', '$2a$10$hashval');
        expect(session.authenticated).toBe(true);
        expect(session.recoveryWarning).toBe(4);
        expect(res.redirect).toHaveBeenCalledWith('/');
    });

    it('renders error for invalid code and logs audit', async () => {
        // TOTP not valid
        get.mockResolvedValueOnce({ secret_encrypted: 'enc' });
        decryptSecret.mockReturnValue('SECRET');
        verifyTOTP.mockReturnValue(false);
        // No recovery codes match
        all.mockResolvedValueOnce([]);
        run.mockResolvedValue({});
        // Recent failures < 5
        get.mockResolvedValueOnce({ cnt: 2 });

        const req = mockReq({ session: { ...pendingSession }, body: { token: '000000' } });
        const res = mockRes();
        await handler(req, res);

        expect(auditLog).toHaveBeenCalledWith('2fa_failure', expect.objectContaining({ actor: 'carlos' }));
        expect(res.render).toHaveBeenCalledWith('twofa', {
            username: 'carlos',
            error: 'Codigo invalido. Intenta de nuevo.',
        });
    });

    it('locks account after 5 failed attempts and redirects to /login', async () => {
        // TOTP not valid
        get.mockResolvedValueOnce({ secret_encrypted: 'enc' });
        decryptSecret.mockReturnValue('SECRET');
        verifyTOTP.mockReturnValue(false);
        // No recovery codes match
        all.mockResolvedValueOnce([]);
        run.mockResolvedValue({});
        // 5 recent failures
        get.mockResolvedValueOnce({ cnt: 5 });

        const session = { ...pendingSession };
        const req = mockReq({ session, body: { token: '999999' } });
        const res = mockRes();
        await handler(req, res);

        expect(auditLog).toHaveBeenCalledWith('account_lock', expect.objectContaining({
            actor: 'system',
            target: 'carlos',
        }));
        expect(session.pending2FA).toBeUndefined();
        expect(res.redirect).toHaveBeenCalledWith('/login');
    });

    it('saves trusted device when trustDevice flag is set', async () => {
        get.mockResolvedValueOnce({ secret_encrypted: 'enc' });
        decryptSecret.mockReturnValue('SECRET');
        verifyTOTP.mockReturnValue(true);
        run.mockResolvedValue({});
        computeDeviceHash.mockReturnValue('device-hash-abc');
        generateDeviceLabel.mockReturnValue('Chrome en Windows');

        const session = { ...pendingSession };
        const req = mockReq({ session, body: { token: '123456', trustDevice: true } });
        const res = mockRes();
        await handler(req, res);

        expect(computeDeviceHash).toHaveBeenCalledWith('test-agent');
        expect(generateDeviceLabel).toHaveBeenCalledWith('test-agent');
        // INSERT trusted device should have been called
        expect(run).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO user_trusted_devices'),
            expect.arrayContaining([42, 'device-hash-abc', '127.0.0.1', 'Chrome en Windows']),
        );
        expect(res.redirect).toHaveBeenCalledWith('/');
    });

    it('renders system error when an exception is thrown', async () => {
        get.mockRejectedValueOnce(new Error('unexpected'));

        const req = mockReq({ session: { ...pendingSession }, body: { token: '123456' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.render).toHaveBeenCalledWith('twofa', {
            username: 'carlos',
            error: 'Error del sistema. Intenta de nuevo.',
        });
    });
});

// ─── POST /2fa/passkey/authenticate-begin ────────────────────────────────────

describe('POST /2fa/passkey/authenticate-begin', () => {
    const handler = getHandler(publicRouter, 'post', '/2fa/passkey/authenticate-begin');

    beforeEach(() => jest.clearAllMocks());

    it('returns 401 when no pending session', async () => {
        const req = mockReq();
        const res = mockRes();
        await handler(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'No hay sesion pendiente' });
    });

    it('returns 400 when user has no passkeys registered', async () => {
        all.mockResolvedValueOnce([]);
        const req = mockReq({ session: { ...pendingSession } });
        const res = mockRes();
        await handler(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'No hay passkeys registradas' });
    });

    it('generates authentication options and stores challenge in session', async () => {
        all.mockResolvedValueOnce([
            { credential_id: 'cred-1', public_key: 'pk', counter: 0, transports: '["usb"]' },
        ]);
        getWebAuthnRPInfo.mockReturnValue({ rpID: 'localhost', rpName: 'ValueStrategy Hub', origin: 'http://localhost:3000' });
        const fakeOptions = { challenge: 'random-challenge-123' };
        simpleWebAuthn.generateAuthenticationOptions.mockResolvedValueOnce(fakeOptions);

        const session = { ...pendingSession };
        const req = mockReq({ session });
        const res = mockRes();
        await handler(req, res);

        expect(simpleWebAuthn.generateAuthenticationOptions).toHaveBeenCalledWith(expect.objectContaining({
            rpID: 'localhost',
            userVerification: 'preferred',
        }));
        expect(session.webauthnChallenge).toBe('random-challenge-123');
        expect(res.json).toHaveBeenCalledWith(fakeOptions);
    });

    it('returns 500 when an error is thrown (catch block)', async () => {
        all.mockRejectedValueOnce(new Error('DB connection lost'));

        const req = mockReq({ session: { ...pendingSession } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error al iniciar autenticacion' });
    });
});

// ─── POST /2fa/passkey/authenticate-end ──────────────────────────────────────

describe('POST /2fa/passkey/authenticate-end', () => {
    const handler = getHandler(publicRouter, 'post', '/2fa/passkey/authenticate-end');

    beforeEach(() => jest.clearAllMocks());

    it('returns 401 when no pending session', async () => {
        const req = mockReq();
        const res = mockRes();
        await handler(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'No hay sesion pendiente' });
    });

    it('returns 400 when no challenge is stored in session', async () => {
        const req = mockReq({ session: { ...pendingSession } });
        const res = mockRes();
        await handler(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'No hay challenge pendiente' });
    });

    it('returns 400 when credential is not recognized', async () => {
        get.mockResolvedValueOnce(null); // credential not found
        getWebAuthnRPInfo.mockReturnValue({ rpID: 'localhost', origin: 'http://localhost:3000' });

        const req = mockReq({
            session: { ...pendingSession, webauthnChallenge: 'test-challenge' },
            body: { id: 'unknown-cred' },
        });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Passkey no reconocida' });
    });

    it('completes session on successful verification', async () => {
        const credential = { id: 1, credential_id: 'cred-1', public_key: Buffer.from('pk').toString('base64url'), counter: 0 };
        get.mockResolvedValueOnce(credential);
        getWebAuthnRPInfo.mockReturnValue({ rpID: 'localhost', origin: 'http://localhost:3000' });
        simpleWebAuthn.verifyAuthenticationResponse.mockResolvedValueOnce({
            verified: true,
            authenticationInfo: { newCounter: 1 },
        });
        run.mockResolvedValue({});

        const session = { ...pendingSession, webauthnChallenge: 'test-challenge' };
        const req = mockReq({ session, body: { id: 'cred-1' } });
        const res = mockRes();
        await handler(req, res);

        expect(session.user).toBeDefined();
        expect(session.user.id).toBe(42);
        expect(session.authenticated).toBe(true);
        expect(session.pending2FA).toBeUndefined();
        expect(session.webauthnChallenge).toBeUndefined();
        expect(res.json).toHaveBeenCalledWith({ success: true, redirect: '/' });
        expect(auditLog).toHaveBeenCalledWith('passkey_authenticate', expect.any(Object));
    });

    it('returns 400 when verification fails', async () => {
        const credential = { id: 1, credential_id: 'cred-1', public_key: Buffer.from('pk').toString('base64url'), counter: 0 };
        get.mockResolvedValueOnce(credential);
        getWebAuthnRPInfo.mockReturnValue({ rpID: 'localhost', origin: 'http://localhost:3000' });
        simpleWebAuthn.verifyAuthenticationResponse.mockResolvedValueOnce({
            verified: false,
        });

        const req = mockReq({
            session: { ...pendingSession, webauthnChallenge: 'test-challenge' },
            body: { id: 'cred-1' },
        });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Verificacion fallida' });
        expect(auditLog).toHaveBeenCalledWith('passkey_failure', expect.any(Object));
    });

    it('returns 500 when an error is thrown (catch block)', async () => {
        getWebAuthnRPInfo.mockReturnValue({ rpID: 'localhost', origin: 'http://localhost:3000' });
        get.mockRejectedValueOnce(new Error('DB exploded'));

        const req = mockReq({
            session: { ...pendingSession, webauthnChallenge: 'test-challenge' },
            body: { id: 'cred-1' },
        });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error de verificacion' });
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// PROTECTED ROUTER
// ═════════════════════════════════════════════════════════════════════════════

// ─── GET /status ─────────────────────────────────────────────────────────────

describe('GET /api/twofa/status', () => {
    const handler = getHandler(protectedRouter, 'get', '/status');

    beforeEach(() => jest.clearAllMocks());

    it('returns full 2FA state for the logged-in user', async () => {
        get.mockResolvedValueOnce({ twofa_enabled: true, twofa_enforced: false, last_twofa_at: '2025-01-01' });
        get.mockResolvedValueOnce({ cnt: 6 });
        all.mockResolvedValueOnce([{ id: 1, label: 'Chrome', ip_address: '10.0.0.1', last_used: null, expires_at: '2025-07-01', created_at: '2025-01-01' }]);
        getEncryptionKey.mockReturnValue(Buffer.alloc(32));
        all.mockResolvedValueOnce([{ id: 10, label: 'YubiKey', device_type: 'singleDevice', created_at: '2025-01-01', last_used: null }]);

        const req = mockReq({ session: { ...authedSession } });
        const res = mockRes();
        await handler(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            available: true,
            enabled: true,
            enforced: false,
            recoveryCodesRemaining: 6,
            trustedDevices: expect.any(Array),
            passkeys: expect.any(Array),
        }));
    });

    it('returns available=false when no encryption key is set', async () => {
        get.mockResolvedValueOnce({ twofa_enabled: false, twofa_enforced: false, last_twofa_at: null });
        get.mockResolvedValueOnce({ cnt: 0 });
        all.mockResolvedValueOnce([]);
        getEncryptionKey.mockReturnValue(null);
        all.mockResolvedValueOnce([]);

        const req = mockReq({ session: { ...authedSession } });
        const res = mockRes();
        await handler(req, res);

        const response = res.json.mock.calls[0][0];
        expect(response.available).toBe(false);
    });

    it('returns 500 on database error', async () => {
        get.mockRejectedValueOnce(new Error('DB error'));

        const req = mockReq({ session: { ...authedSession } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─── POST /setup ─────────────────────────────────────────────────────────────

describe('POST /api/twofa/setup', () => {
    const handler = getHandler(protectedRouter, 'post', '/setup');

    beforeEach(() => jest.clearAllMocks());

    it('returns 503 when no encryption key is configured', async () => {
        getEncryptionKey.mockReturnValue(null);

        const req = mockReq({ session: { ...authedSession } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(503);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.stringContaining('TWOFA_ENCRYPTION_KEY'),
        }));
    });

    it('returns 400 when user already has verified 2FA', async () => {
        getEncryptionKey.mockReturnValue(Buffer.alloc(32));
        get.mockResolvedValueOnce({ verified: true });

        const req = mockReq({ session: { ...authedSession } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.stringContaining('ya esta activado'),
        }));
    });

    it('generates QR code for new setup when no existing secret', async () => {
        getEncryptionKey.mockReturnValue(Buffer.alloc(32));
        get.mockResolvedValueOnce(null); // no existing secret
        generateSecret.mockReturnValue('NEWSECRET');
        encryptSecret.mockReturnValue('encrypted-val');
        run.mockResolvedValue({});
        generateURI.mockReturnValue('otpauth://totp/carlos?secret=NEWSECRET&issuer=ValueStrategy%20Hub');
        QRCode.toDataURL.mockResolvedValue('data:image/png;base64,qrdata');

        const req = mockReq({ session: { ...authedSession } });
        const res = mockRes();
        await handler(req, res);

        expect(generateSecret).toHaveBeenCalled();
        expect(encryptSecret).toHaveBeenCalledWith('NEWSECRET');
        expect(run).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO user_totp_secrets'),
            expect.arrayContaining([42, 'encrypted-val']),
        );
        expect(res.json).toHaveBeenCalledWith({
            qrCodeDataUrl: 'data:image/png;base64,qrdata',
            manualEntryKey: 'NEWSECRET',
            issuer: 'ValueStrategy Hub',
        });
    });

    it('updates existing unverified secret on re-setup', async () => {
        getEncryptionKey.mockReturnValue(Buffer.alloc(32));
        get.mockResolvedValueOnce({ verified: false }); // existing unverified
        generateSecret.mockReturnValue('NEWSECRET2');
        encryptSecret.mockReturnValue('encrypted-val2');
        run.mockResolvedValue({});
        generateURI.mockReturnValue('otpauth://totp/...');
        QRCode.toDataURL.mockResolvedValue('data:image/png;base64,qr2');

        const req = mockReq({ session: { ...authedSession } });
        const res = mockRes();
        await handler(req, res);

        expect(run).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE user_totp_secrets'),
            expect.arrayContaining(['encrypted-val2', 42]),
        );
    });

    it('returns 500 when an error is thrown (catch block)', async () => {
        getEncryptionKey.mockReturnValue(Buffer.alloc(32));
        get.mockRejectedValueOnce(new Error('DB failure'));

        const req = mockReq({ session: { ...authedSession } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error al configurar 2FA' });
    });
});

// ─── POST /verify-setup ─────────────────────────────────────────────────────

describe('POST /api/twofa/verify-setup', () => {
    const handler = getHandler(protectedRouter, 'post', '/verify-setup');

    beforeEach(() => jest.clearAllMocks());

    it('returns 400 when token is empty', async () => {
        const req = mockReq({ session: { ...authedSession }, body: { token: '' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: 'Codigo requerido',
        }));
    });

    it('returns 400 when no pending setup exists', async () => {
        get.mockResolvedValueOnce(null);

        const req = mockReq({ session: { ...authedSession }, body: { token: '123456' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.stringContaining('No hay setup pendiente'),
        }));
    });

    it('returns 410 when QR code has expired (>3 min)', async () => {
        const fourMinutesAgo = new Date(Date.now() - 4 * 60 * 1000).toISOString();
        get.mockResolvedValueOnce({ secret_encrypted: 'enc', created_at: fourMinutesAgo });
        run.mockResolvedValue({});

        const req = mockReq({ session: { ...authedSession }, body: { token: '123456' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(410);
        expect(run).toHaveBeenCalledWith(
            expect.stringContaining('DELETE FROM user_totp_secrets'),
            expect.arrayContaining([42]),
        );
    });

    it('returns 400 when TOTP code is invalid', async () => {
        const now = new Date().toISOString();
        get.mockResolvedValueOnce({ secret_encrypted: 'enc', created_at: now });
        decryptSecret.mockReturnValue('SECRET');
        verifyTOTP.mockReturnValue(false);

        const req = mockReq({ session: { ...authedSession }, body: { token: '000000' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.stringContaining('Codigo invalido'),
        }));
    });

    it('activates 2FA and returns recovery codes on valid code', async () => {
        const now = new Date().toISOString();
        get.mockResolvedValueOnce({ secret_encrypted: 'enc', created_at: now });
        decryptSecret.mockReturnValue('SECRET');
        verifyTOTP.mockReturnValue(true);
        run.mockResolvedValue({});
        generateRecoveryCodes.mockReturnValue(['code1', 'code2', 'code3']);
        bcrypt.hash.mockResolvedValue('$2a$12$hashed');

        const req = mockReq({ session: { ...authedSession }, body: { token: '123456' } });
        const res = mockRes();
        await handler(req, res);

        expect(run).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE user_totp_secrets SET verified = TRUE'),
            expect.arrayContaining([42]),
        );
        expect(run).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE users SET twofa_enabled = TRUE'),
            expect.arrayContaining([42]),
        );
        expect(generateRecoveryCodes).toHaveBeenCalledWith(10);
        expect(auditLog).toHaveBeenCalledWith('2fa_enable', expect.any(Object));
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            recoveryCodes: ['code1', 'code2', 'code3'],
        });
    });

    it('returns 500 when an error is thrown (catch block)', async () => {
        get.mockRejectedValueOnce(new Error('DB failure'));

        const req = mockReq({ session: { ...authedSession }, body: { token: '123456' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error al verificar 2FA' });
    });
});

// ─── POST /disable ───────────────────────────────────────────────────────────

describe('POST /api/twofa/disable', () => {
    const handler = getHandler(protectedRouter, 'post', '/disable');

    beforeEach(() => jest.clearAllMocks());

    it('returns 400 when password is missing', async () => {
        const req = mockReq({ session: { ...authedSession }, body: {} });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: 'Contrasena requerida',
        }));
    });

    it('returns 403 when 2FA is enforced by admin', async () => {
        get.mockResolvedValueOnce({ password_hash: '$2a$10$hash', twofa_enforced: true });

        const req = mockReq({ session: { ...authedSession }, body: { currentPassword: 'pass' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.stringContaining('obligatorio'),
        }));
    });

    it('returns 401 when password is incorrect', async () => {
        get.mockResolvedValueOnce({ password_hash: '$2a$10$hash', twofa_enforced: false });
        bcrypt.compare.mockResolvedValueOnce(false);

        const req = mockReq({ session: { ...authedSession }, body: { currentPassword: 'wrong' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: 'Contrasena incorrecta',
        }));
    });

    it('cleans up all 2FA data on successful disable', async () => {
        get.mockResolvedValueOnce({ password_hash: '$2a$10$hash', twofa_enforced: false });
        bcrypt.compare.mockResolvedValueOnce(true);
        run.mockResolvedValue({});

        const req = mockReq({ session: { ...authedSession }, body: { currentPassword: 'correct' } });
        const res = mockRes();
        await handler(req, res);

        // Verify all cleanup queries ran
        const runCalls = run.mock.calls.map(c => c[0]);
        expect(runCalls).toEqual(expect.arrayContaining([
            expect.stringContaining('DELETE FROM user_totp_secrets'),
            expect.stringContaining('DELETE FROM user_recovery_codes'),
            expect.stringContaining('DELETE FROM user_trusted_devices'),
            expect.stringContaining('DELETE FROM user_webauthn_credentials'),
            expect.stringContaining('UPDATE users SET twofa_enabled = FALSE'),
        ]));
        expect(auditLog).toHaveBeenCalledWith('2fa_disable', expect.any(Object));
        expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('returns 500 when an error is thrown (catch block)', async () => {
        get.mockRejectedValueOnce(new Error('DB failure'));

        const req = mockReq({ session: { ...authedSession }, body: { currentPassword: 'correct' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error al desactivar 2FA' });
    });
});

// ─── POST /passkey/register-begin ─────────────────────────────────────────────

describe('POST /api/twofa/passkey/register-begin', () => {
    const handler = getHandler(protectedRouter, 'post', '/passkey/register-begin');

    beforeEach(() => jest.clearAllMocks());

    it('generates registration options with existing credentials excluded', async () => {
        all.mockResolvedValueOnce([{ credential_id: 'existing-cred-1' }]);
        getWebAuthnRPInfo.mockReturnValue({ rpID: 'localhost', rpName: 'ValueStrategy Hub', origin: 'http://localhost:3000' });
        const fakeOptions = { challenge: 'reg-challenge-abc' };
        simpleWebAuthn.generateRegistrationOptions.mockResolvedValueOnce(fakeOptions);

        const session = { ...authedSession };
        const req = mockReq({ session });
        const res = mockRes();
        await handler(req, res);

        expect(simpleWebAuthn.generateRegistrationOptions).toHaveBeenCalledWith(expect.objectContaining({
            rpName: 'ValueStrategy Hub',
            rpID: 'localhost',
            userName: 'carlos',
            userDisplayName: 'carlos',
            excludeCredentials: [{ id: 'existing-cred-1' }],
            attestationType: 'none',
        }));
        expect(session.webauthnRegChallenge).toBe('reg-challenge-abc');
        expect(res.json).toHaveBeenCalledWith(fakeOptions);
    });

    it('generates registration options with no existing credentials', async () => {
        all.mockResolvedValueOnce([]);
        getWebAuthnRPInfo.mockReturnValue({ rpID: 'localhost', rpName: 'ValueStrategy Hub', origin: 'http://localhost:3000' });
        const fakeOptions = { challenge: 'reg-challenge-def' };
        simpleWebAuthn.generateRegistrationOptions.mockResolvedValueOnce(fakeOptions);

        const session = { ...authedSession };
        const req = mockReq({ session });
        const res = mockRes();
        await handler(req, res);

        expect(simpleWebAuthn.generateRegistrationOptions).toHaveBeenCalledWith(expect.objectContaining({
            excludeCredentials: [],
        }));
        expect(session.webauthnRegChallenge).toBe('reg-challenge-def');
        expect(res.json).toHaveBeenCalledWith(fakeOptions);
    });

    it('returns 500 when an error is thrown (catch block)', async () => {
        all.mockRejectedValueOnce(new Error('DB failure'));

        const req = mockReq({ session: { ...authedSession } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error al iniciar registro' });
    });
});

// ─── POST /passkey/register-end ──────────────────────────────────────────────

describe('POST /api/twofa/passkey/register-end', () => {
    const handler = getHandler(protectedRouter, 'post', '/passkey/register-end');

    beforeEach(() => jest.clearAllMocks());

    it('returns 400 when no challenge is stored in session', async () => {
        const req = mockReq({ session: { ...authedSession } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'No hay challenge pendiente' });
    });

    it('returns 400 when verification fails', async () => {
        getWebAuthnRPInfo.mockReturnValue({ rpID: 'localhost', origin: 'http://localhost:3000' });
        simpleWebAuthn.verifyRegistrationResponse.mockResolvedValueOnce({
            verified: false,
        });

        const session = { ...authedSession, webauthnRegChallenge: 'reg-challenge' };
        const req = mockReq({
            session,
            body: { credential: { id: 'new-cred', response: {} } },
        });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Verificacion fallida' });
    });

    it('returns 400 when registrationInfo is missing', async () => {
        getWebAuthnRPInfo.mockReturnValue({ rpID: 'localhost', origin: 'http://localhost:3000' });
        simpleWebAuthn.verifyRegistrationResponse.mockResolvedValueOnce({
            verified: true,
            registrationInfo: null,
        });

        const session = { ...authedSession, webauthnRegChallenge: 'reg-challenge' };
        const req = mockReq({
            session,
            body: { credential: { id: 'new-cred', response: {} } },
        });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Verificacion fallida' });
    });

    it('saves credential to DB and returns label on successful registration', async () => {
        getWebAuthnRPInfo.mockReturnValue({ rpID: 'localhost', origin: 'http://localhost:3000' });
        const fakePublicKey = new Uint8Array([1, 2, 3, 4]);
        simpleWebAuthn.verifyRegistrationResponse.mockResolvedValueOnce({
            verified: true,
            registrationInfo: {
                credential: { id: 'new-cred-id', publicKey: fakePublicKey, counter: 0 },
                credentialDeviceType: 'multiDevice',
            },
        });
        run.mockResolvedValue({});
        generateDeviceLabel.mockReturnValue('Chrome en Windows');

        const session = { ...authedSession, webauthnRegChallenge: 'reg-challenge' };
        const req = mockReq({
            session,
            body: {
                label: 'My YubiKey',
                credential: { id: 'new-cred-id', response: { transports: ['usb'] } },
            },
        });
        const res = mockRes();
        await handler(req, res);

        expect(run).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO user_webauthn_credentials'),
            expect.arrayContaining([
                42,
                'new-cred-id',
                Buffer.from(fakePublicKey).toString('base64url'),
                0,
                'multiDevice',
            ]),
        );
        // Custom label should be used instead of auto-generated one
        expect(res.json).toHaveBeenCalledWith({ success: true, label: 'My YubiKey' });
        expect(session.webauthnRegChallenge).toBeUndefined();
        expect(auditLog).toHaveBeenCalledWith('passkey_register', expect.objectContaining({
            actor: 'carlos',
            details: { label: 'My YubiKey' },
        }));
    });

    it('uses auto-generated label when none is provided', async () => {
        getWebAuthnRPInfo.mockReturnValue({ rpID: 'localhost', origin: 'http://localhost:3000' });
        const fakePublicKey = new Uint8Array([5, 6, 7, 8]);
        simpleWebAuthn.verifyRegistrationResponse.mockResolvedValueOnce({
            verified: true,
            registrationInfo: {
                credential: { id: 'cred-auto', publicKey: fakePublicKey, counter: 0 },
                credentialDeviceType: 'singleDevice',
            },
        });
        run.mockResolvedValue({});
        generateDeviceLabel.mockReturnValue('Firefox en Linux');

        const session = { ...authedSession, webauthnRegChallenge: 'reg-challenge' };
        const req = mockReq({
            session,
            body: {
                // no label provided
                credential: { id: 'cred-auto', response: {} },
            },
        });
        const res = mockRes();
        await handler(req, res);

        expect(generateDeviceLabel).toHaveBeenCalledWith('test-agent');
        expect(res.json).toHaveBeenCalledWith({ success: true, label: 'Firefox en Linux' });
    });

    it('returns 500 when an error is thrown (catch block)', async () => {
        getWebAuthnRPInfo.mockReturnValue({ rpID: 'localhost', origin: 'http://localhost:3000' });
        simpleWebAuthn.verifyRegistrationResponse.mockRejectedValueOnce(new Error('WebAuthn lib crash'));

        const session = { ...authedSession, webauthnRegChallenge: 'reg-challenge' };
        const req = mockReq({
            session,
            body: { credential: { id: 'cred-x', response: {} } },
        });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error al registrar passkey' });
    });
});

// ─── DELETE /passkey/:id ─────────────────────────────────────────────────────

describe('DELETE /api/twofa/passkey/:id', () => {
    const handler = getHandler(protectedRouter, 'delete', '/passkey/:id');

    beforeEach(() => jest.clearAllMocks());

    it('deletes passkey owned by the user', async () => {
        run.mockResolvedValueOnce({ changes: 1 });

        const req = mockReq({ session: { ...authedSession }, params: { id: '5' } });
        const res = mockRes();
        await handler(req, res);

        expect(run).toHaveBeenCalledWith(
            expect.stringContaining('DELETE FROM user_webauthn_credentials WHERE id = ?'),
            ['5', 42],
        );
        expect(auditLog).toHaveBeenCalledWith('passkey_delete', expect.any(Object));
        expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('returns 404 when passkey not found or not owned by user', async () => {
        run.mockResolvedValueOnce({ changes: 0 });

        const req = mockReq({ session: { ...authedSession }, params: { id: '999' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Passkey no encontrada' });
    });

    it('returns 500 on database error', async () => {
        run.mockRejectedValueOnce(new Error('DB error'));

        const req = mockReq({ session: { ...authedSession }, params: { id: '5' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─── DELETE /trusted-devices/:id ─────────────────────────────────────────────

describe('DELETE /api/twofa/trusted-devices/:id', () => {
    const handler = getHandler(protectedRouter, 'delete', '/trusted-devices/:id');

    beforeEach(() => jest.clearAllMocks());

    it('deletes a specific trusted device', async () => {
        run.mockResolvedValueOnce({ changes: 1 });

        const req = mockReq({ session: { ...authedSession }, params: { id: '3' } });
        const res = mockRes();
        await handler(req, res);

        expect(run).toHaveBeenCalledWith(
            expect.stringContaining('DELETE FROM user_trusted_devices WHERE id = ?'),
            ['3', 42],
        );
        expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('returns 404 when device not found', async () => {
        run.mockResolvedValueOnce({ changes: 0 });

        const req = mockReq({ session: { ...authedSession }, params: { id: '999' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Dispositivo no encontrado' });
    });

    it('returns 500 on database error', async () => {
        run.mockRejectedValueOnce(new Error('DB error'));

        const req = mockReq({ session: { ...authedSession }, params: { id: '3' } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─── DELETE /trusted-devices (clear all) ─────────────────────────────────────

describe('DELETE /api/twofa/trusted-devices (clear all)', () => {
    const handler = getHandler(protectedRouter, 'delete', '/trusted-devices');

    beforeEach(() => jest.clearAllMocks());

    it('clears all trusted devices for the user', async () => {
        run.mockResolvedValue({});

        const req = mockReq({ session: { ...authedSession } });
        const res = mockRes();
        await handler(req, res);

        expect(run).toHaveBeenCalledWith(
            expect.stringContaining('DELETE FROM user_trusted_devices WHERE user_id = ?'),
            [42],
        );
        expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('returns 500 on database error', async () => {
        run.mockRejectedValueOnce(new Error('DB error'));

        const req = mockReq({ session: { ...authedSession } });
        const res = mockRes();
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
