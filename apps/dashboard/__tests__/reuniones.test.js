/**
 * Tests for reuniones routes: webhook, listing, detail, notifications, email recipients.
 */
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-key';
process.env.SESSION_SECRET = 'test-secret-reuniones';

const { app } = require('../server');
const { db, run, get, all, closeDb } = require('../database');
const bcrypt = require('bcryptjs');

let adminAgent;
let consultorAgent;
let testApiKey;

beforeAll(async () => {
    await new Promise((resolve) => {
        const check = () => {
            db.get('SELECT 1', (err) => {
                if (err) return setTimeout(check, 50);
                resolve();
            });
        };
        check();
    });

    const hash = await bcrypt.hash('testpass', 10);
    await run('INSERT OR IGNORE INTO users (username, password_hash, role, department, expertise) VALUES (?, ?, ?, ?, ?)',
        ['reun_admin', hash, 'admin', 'engineering', 'testing']);
    await run('INSERT OR IGNORE INTO users (username, password_hash, role, department, expertise) VALUES (?, ?, ?, ?, ?)',
        ['reun_consultor', hash, 'consultor', 'operations', 'consulting']);

    // Create a test API key
    testApiKey = 'test_key_reuniones_' + Date.now();
    await run('INSERT OR IGNORE INTO api_keys (key, name, username) VALUES (?, ?, ?)',
        [testApiKey, 'test-reuniones', 'reun_admin']);

    adminAgent = request.agent(app);
    await adminAgent.post('/login').send({ username: 'reun_admin', password: 'testpass' }).expect(302);

    consultorAgent = request.agent(app);
    await consultorAgent.post('/login').send({ username: 'reun_consultor', password: 'testpass' }).expect(302);
});

afterAll(async () => {
    await run("DELETE FROM reuniones WHERE titulo LIKE 'Test Meeting%'");
    await run("DELETE FROM reuniones_notifications WHERE username IN ('reun_admin', 'reun_consultor')");
    await run("DELETE FROM reuniones_email_recipients WHERE email LIKE 'test_%@test.com'");
    await run("DELETE FROM api_keys WHERE name = 'test-reuniones'");
    await run("DELETE FROM users WHERE username IN ('reun_admin', 'reun_consultor')");
    await closeDb();
});

describe('Reuniones Routes', () => {
    let reunionId;

    describe('POST /api/webhook/reuniones', () => {
        it('requires API key', async () => {
            const res = await request(app).post('/api/webhook/reuniones')
                .send({ titulo: 'Test', fecha: '2026-01-15' });
            expect(res.status).toBe(401);
        });

        it('creates meeting via webhook', async () => {
            const res = await request(app).post('/api/webhook/reuniones')
                .set('X-API-Key', testApiKey)
                .send({
                    titulo: 'Test Meeting Standup',
                    fecha: '2026-02-20',
                    asistentes: ['reun_admin', 'reun_consultor'],
                    acuerdos: ['Revisar tareas pendientes'],
                    puntos_clave: ['Proyecto avanza bien'],
                    compromisos: [{ responsable: 'reun_admin', tarea: 'Preparar reporte' }],
                    entregables: [],
                });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.id).toBeDefined();
            reunionId = res.body.id;
        });

        it('rejects meeting without titulo', async () => {
            const res = await request(app).post('/api/webhook/reuniones')
                .set('X-API-Key', testApiKey)
                .send({ fecha: '2026-02-20' });
            expect(res.status).toBe(400);
        });

        it('deduplicates by external_id', async () => {
            const payload = {
                external_id: 'dedup-test-123',
                titulo: 'Test Meeting Dedup',
                fecha: '2026-02-21',
            };
            const res1 = await request(app).post('/api/webhook/reuniones')
                .set('X-API-Key', testApiKey).send(payload);
            expect(res1.body.success).toBe(true);

            const res2 = await request(app).post('/api/webhook/reuniones')
                .set('X-API-Key', testApiKey).send(payload);
            expect(res2.body.success).toBe(true);
            expect(res2.body.message).toBe('Already exists');
        });
    });

    describe('GET /api/reuniones', () => {
        it('lists meetings with pagination', async () => {
            const res = await adminAgent.get('/api/reuniones');
            expect(res.status).toBe(200);
            expect(res.body.reuniones).toBeDefined();
            expect(res.body.pagination).toBeDefined();
            expect(res.body.pagination.total).toBeGreaterThan(0);
        });

        it('supports search filter', async () => {
            const res = await adminAgent.get('/api/reuniones?search=Standup');
            expect(res.status).toBe(200);
            const titles = res.body.reuniones.map(r => r.titulo);
            expect(titles.some(t => t.includes('Standup'))).toBe(true);
        });

        it('parses JSON arrays in response', async () => {
            const res = await adminAgent.get('/api/reuniones');
            const meeting = res.body.reuniones.find(r => r.titulo === 'Test Meeting Standup');
            if (meeting) {
                expect(Array.isArray(meeting.asistentes)).toBe(true);
                expect(Array.isArray(meeting.acuerdos)).toBe(true);
            }
        });
    });

    describe('GET /api/reuniones/:id', () => {
        it('returns single meeting detail', async () => {
            const res = await adminAgent.get(`/api/reuniones/${reunionId}`);
            expect(res.status).toBe(200);
            expect(res.body.titulo).toBe('Test Meeting Standup');
            expect(Array.isArray(res.body.asistentes)).toBe(true);
        });

        it('returns 404 for non-existent meeting', async () => {
            const res = await adminAgent.get('/api/reuniones/99999');
            expect(res.status).toBe(404);
        });
    });

    describe('GET /api/reuniones/stats/summary', () => {
        it('returns meeting statistics', async () => {
            const res = await adminAgent.get('/api/reuniones/stats/summary');
            expect(res.status).toBe(200);
            expect(res.body.total_reuniones).toBeDefined();
            expect(typeof res.body.total_reuniones).toBe('number');
        });
    });

    describe('Email Recipients', () => {
        let recipientId;

        it('admin can add email recipient', async () => {
            const res = await adminAgent.post('/api/reuniones/email-recipients')
                .send({ email: 'test_user@test.com', nombre: 'Test User' });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            recipientId = res.body.id;
        });

        it('rejects invalid email', async () => {
            const res = await adminAgent.post('/api/reuniones/email-recipients')
                .send({ email: 'invalid-email' });
            expect(res.status).toBe(400);
        });

        it('rejects duplicate email', async () => {
            const res = await adminAgent.post('/api/reuniones/email-recipients')
                .send({ email: 'test_user@test.com', nombre: 'Duplicate' });
            expect(res.status).toBe(409);
        });

        it('lists active recipients', async () => {
            const res = await adminAgent.get('/api/reuniones/email-recipients');
            expect(res.status).toBe(200);
            expect(res.body.recipients).toBeDefined();
        });

        it('consultor cannot add recipients', async () => {
            const res = await consultorAgent.post('/api/reuniones/email-recipients')
                .send({ email: 'test_blocked@test.com', nombre: 'Blocked' });
            expect(res.status).toBe(403);
        });

        it('admin can update recipient', async () => {
            const res = await adminAgent.put(`/api/reuniones/email-recipients/${recipientId}`)
                .send({ nombre: 'Updated Name' });
            expect(res.status).toBe(200);
        });

        it('admin can delete recipient', async () => {
            const res = await adminAgent.delete(`/api/reuniones/email-recipients/${recipientId}`);
            expect(res.status).toBe(200);
        });
    });
});
