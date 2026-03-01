/**
 * Tests for feedback routes: CRUD operations, role-based access control.
 */
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-key';
process.env.SESSION_SECRET = 'test-secret-feedback';

const { app } = require('../server');
const { db, run, get, closeDb } = require('../database');
const bcrypt = require('bcryptjs');

let adminAgent;
let consultorAgent;

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

    // Create test users
    const hash = await bcrypt.hash('testpass', 12);
    await run('INSERT OR IGNORE INTO users (username, password_hash, role, department, expertise) VALUES (?, ?, ?, ?, ?)',
        ['fb_admin', hash, 'admin', 'engineering', 'testing']);
    await run('INSERT OR IGNORE INTO users (username, password_hash, role, department, expertise) VALUES (?, ?, ?, ?, ?)',
        ['fb_consultor', hash, 'consultor', 'operations', 'consulting']);

    // Login admin
    adminAgent = request.agent(app);
    await adminAgent.post('/login').send({ username: 'fb_admin', password: 'testpass' }).expect(302);

    // Login consultor
    consultorAgent = request.agent(app);
    await consultorAgent.post('/login').send({ username: 'fb_consultor', password: 'testpass' }).expect(302);
});

afterAll(async () => {
    await run("DELETE FROM feedback WHERE username IN ('fb_admin', 'fb_consultor')");
    await run("DELETE FROM users WHERE username IN ('fb_admin', 'fb_consultor')");
    await closeDb();
});

describe('Feedback Routes', () => {
    let feedbackId;

    describe('POST /api/feedback', () => {
        it('creates feedback successfully', async () => {
            const res = await consultorAgent.post('/api/feedback')
                .send({ title: 'Mejora UI', content: 'El dashboard necesita dark mode', category: 'mejora', priority: 'media' });
            expect(res.status).toBe(200);
            expect(res.body.title).toBe('Mejora UI');
            expect(res.body.username).toBe('fb_consultor');
            expect(res.body.category).toBe('mejora');
            expect(res.body.status).toBe('abierto');
            feedbackId = res.body.id;
        });

        it('rejects feedback without title', async () => {
            const res = await consultorAgent.post('/api/feedback')
                .send({ content: 'Missing title' });
            expect(res.status).toBe(400);
            expect(res.body.error).toContain('title');
        });

        it('rejects feedback without content', async () => {
            const res = await consultorAgent.post('/api/feedback')
                .send({ title: 'Has title' });
            expect(res.status).toBe(400);
        });

        it('defaults invalid category to mejora', async () => {
            const res = await consultorAgent.post('/api/feedback')
                .send({ title: 'Test', content: 'Content', category: 'invalid' });
            expect(res.status).toBe(200);
            expect(res.body.category).toBe('mejora');
        });

        it('defaults invalid priority to media', async () => {
            const res = await consultorAgent.post('/api/feedback')
                .send({ title: 'Test', content: 'Content', priority: 'invalid' });
            expect(res.status).toBe(200);
            expect(res.body.priority).toBe('media');
        });

        it('requires authentication', async () => {
            const res = await request(app).post('/api/feedback')
                .send({ title: 'Test', content: 'Content' });
            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/feedback', () => {
        it('lists all feedback', async () => {
            const res = await adminAgent.get('/api/feedback');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });
    });

    describe('PUT /api/feedback/:id/status', () => {
        it('admin can update status', async () => {
            const res = await adminAgent.put(`/api/feedback/${feedbackId}/status`)
                .send({ status: 'en_progreso' });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('sets resolved_at for terminal statuses', async () => {
            await adminAgent.put(`/api/feedback/${feedbackId}/status`)
                .send({ status: 'resuelto' });
            const fb = await get('SELECT * FROM feedback WHERE id = ?', [feedbackId]);
            expect(fb.resolved_at).not.toBeNull();
        });

        it('consultor cannot update status', async () => {
            const res = await consultorAgent.put(`/api/feedback/${feedbackId}/status`)
                .send({ status: 'en_progreso' });
            expect(res.status).toBe(403);
        });

        it('rejects invalid status', async () => {
            const res = await adminAgent.put(`/api/feedback/${feedbackId}/status`)
                .send({ status: 'invalid_status' });
            expect(res.status).toBe(400);
        });
    });

    describe('PUT /api/feedback/:id/respond', () => {
        it('admin can respond', async () => {
            const res = await adminAgent.put(`/api/feedback/${feedbackId}/respond`)
                .send({ response: 'Gracias por el feedback, lo implementaremos' });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            const fb = await get('SELECT * FROM feedback WHERE id = ?', [feedbackId]);
            expect(fb.admin_response).toContain('Gracias');
            expect(fb.responded_by).toBe('fb_admin');
        });

        it('consultor cannot respond', async () => {
            const res = await consultorAgent.put(`/api/feedback/${feedbackId}/respond`)
                .send({ response: 'Should fail' });
            expect(res.status).toBe(403);
        });

        it('rejects empty response', async () => {
            const res = await adminAgent.put(`/api/feedback/${feedbackId}/respond`)
                .send({ response: '' });
            expect(res.status).toBe(400);
        });
    });

    describe('DELETE /api/feedback/:id', () => {
        it('author can delete own feedback', async () => {
            // Create one to delete
            const created = await consultorAgent.post('/api/feedback')
                .send({ title: 'To Delete', content: 'Will be deleted' });
            const delRes = await consultorAgent.delete(`/api/feedback/${created.body.id}`);
            expect(delRes.status).toBe(200);
            expect(delRes.body.deleted).toBe(true);
        });

        it('admin can delete any feedback', async () => {
            const created = await consultorAgent.post('/api/feedback')
                .send({ title: 'Admin Delete', content: 'Admin will delete this' });
            const delRes = await adminAgent.delete(`/api/feedback/${created.body.id}`);
            expect(delRes.status).toBe(200);
        });

        it('returns 404 for non-existent feedback', async () => {
            const res = await adminAgent.delete('/api/feedback/99999');
            expect(res.status).toBe(404);
        });
    });
});
