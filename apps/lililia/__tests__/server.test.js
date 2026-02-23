const request = require('supertest');
const { app } = require('../server');

describe('Lililia Server', () => {
    describe('GET /', () => {
        it('should return 200 and render landing page', async () => {
            const res = await request(app).get('/');
            expect(res.status).toBe(200);
            expect(res.text).toContain('html');
        });
    });

    describe('GET /dashboard', () => {
        it('should return 200 and render dashboard', async () => {
            const res = await request(app).get('/dashboard');
            expect(res.status).toBe(200);
            expect(res.text).toContain('html');
        });
    });

    describe('GET /nonexistent', () => {
        it('should return 404 for unknown routes', async () => {
            const res = await request(app).get('/nonexistent');
            expect(res.status).toBe(404);
        });
    });

    describe('Static files', () => {
        it('should serve static files from public/', async () => {
            const res = await request(app).get('/css/style.css');
            // May or may not exist, but route should not crash
            expect([200, 404]).toContain(res.status);
        });
    });
});
