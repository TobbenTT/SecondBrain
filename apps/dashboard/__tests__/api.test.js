const request = require('supertest');

// Set test env before requiring app
process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-key';
process.env.SESSION_SECRET = 'test-secret-for-integration';

const { app } = require('../server');
const { db, run, get } = require('../database');
const bcrypt = require('bcryptjs');

let agent; // supertest agent with cookies

beforeAll(async () => {
    // Wait for DB to initialize
    await new Promise((resolve) => {
        const check = () => {
            db.get('SELECT 1', (err) => {
                if (err) return setTimeout(check, 50);
                resolve();
            });
        };
        check();
    });

    // Create test user
    const hash = await bcrypt.hash('testpass123', 10);
    await run('INSERT OR IGNORE INTO users (username, password_hash, role, department, expertise) VALUES (?, ?, ?, ?, ?)',
        ['testuser', hash, 'admin', 'engineering', 'testing']);

    // Create test area (clean up leftovers first)
    await run("DELETE FROM areas WHERE name IN ('Test Area', 'Integration Test Area')");
    await run('INSERT OR IGNORE INTO areas (name, description, icon) VALUES (?, ?, ?)',
        ['Test Area', 'Area for testing', '🧪']);

    // Create agent with persistent cookies
    agent = request.agent(app);

    // Login
    await agent.post('/login')
        .send({ username: 'testuser', password: 'testpass123' })
        .expect(302);
});

afterAll(async () => {
    // Cleanup test data
    await run("DELETE FROM ideas WHERE created_by = 'testuser'");
    await run("DELETE FROM users WHERE username = 'testuser'");
    await run("DELETE FROM areas WHERE name = 'Test Area'");

    await new Promise((resolve) => db.close(resolve));
});

// ═══════════════════════════════════════════════════════════════════════════════
// Health Check
// ═══════════════════════════════════════════════════════════════════════════════

describe('Health Check', () => {
    it('GET /health returns ok', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
        expect(res.body).toHaveProperty('uptime');
        expect(res.body).toHaveProperty('timestamp');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Auth
// ═══════════════════════════════════════════════════════════════════════════════

describe('Authentication', () => {
    it('GET /login renders login page', async () => {
        const res = await request(app).get('/login');
        expect(res.status).toBe(200);
        expect(res.text).toContain('login');
    });

    it('POST /login with bad credentials shows error', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'nobody', password: 'wrong' });
        expect(res.status).toBe(200);
        expect(res.text).toContain('inválidas');
    });

    it('unauthenticated API calls return 401', async () => {
        const res = await request(app).get('/api/ideas');
        expect(res.status).toBe(401);
        expect(res.body.error).toContain('Authentication required');
    });

    it('authenticated agent can access protected routes', async () => {
        const res = await agent.get('/');
        expect(res.status).toBe(200);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Areas API
// ═══════════════════════════════════════════════════════════════════════════════

describe('Areas API', () => {
    let areaId;

    it('GET /api/areas returns array', async () => {
        const res = await agent.get('/api/areas');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /api/areas creates area', async () => {
        const res = await agent.post('/api/areas')
            .send({ name: 'Integration Test Area', description: 'Created by test', icon: '🔬' });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        // Fetch to get the ID
        const areas = await agent.get('/api/areas');
        const found = areas.body.find(a => a.name === 'Integration Test Area');
        expect(found).toBeDefined();
        areaId = found.id;
    });

    it('PUT /api/areas/:id updates area', async () => {
        const res = await agent.put(`/api/areas/${areaId}`)
            .send({ name: 'Integration Test Area', description: 'Updated description', icon: '🔬', horizon: 'h2', status: 'active' });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('DELETE /api/areas/:id archives area', async () => {
        const res = await agent.delete(`/api/areas/${areaId}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        // Verify it's archived, not deleted
        const area = await get('SELECT status FROM areas WHERE id = ?', [areaId]);
        expect(area.status).toBe('archived');
    });

    it('POST /api/areas without name returns 400', async () => {
        const res = await agent.post('/api/areas').send({});
        expect(res.status).toBe(400);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Ideas API (CRUD without AI — we test the DB layer)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Ideas API', () => {
    let testIdeaId;

    it('GET /api/ideas returns paginated response', async () => {
        const res = await agent.get('/api/ideas');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('ideas');
        expect(res.body).toHaveProperty('pagination');
        expect(res.body.pagination).toHaveProperty('page');
        expect(res.body.pagination).toHaveProperty('limit');
        expect(res.body.pagination).toHaveProperty('total');
    });

    it('GET /api/ideas supports query filters', async () => {
        const res = await agent.get('/api/ideas?code_stage=captured&page=1&limit=5');
        expect(res.status).toBe(200);
        expect(res.body.pagination.limit).toBe(5);
    });

    it('POST /api/ideas without text returns 400', async () => {
        const res = await agent.post('/api/ideas').send({});
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    it('DELETE /api/ideas/:id deletes idea', async () => {
        // Insert directly to avoid AI dependency
        const result = await run("INSERT INTO ideas (text, code_stage, created_by) VALUES (?, ?, ?)",
            ['Test idea for deletion', 'captured', 'testuser']);
        testIdeaId = result.lastID;

        const res = await agent.delete(`/api/ideas/${testIdeaId}`);
        expect(res.status).toBe(200);
        expect(res.body.deleted).toBe(true);

        const check = await get('SELECT id FROM ideas WHERE id = ?', [testIdeaId]);
        expect(check).toBeUndefined();
    });

    it('DELETE /api/ideas (mass) requires admin', async () => {
        // Our test user IS admin, so this would succeed
        // Test with a non-admin by creating a separate session
        const nonAdminHash = await bcrypt.hash('nonadmin', 10);
        await run('INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)',
            ['viewer', nonAdminHash, 'viewer']);

        const viewerAgent = request.agent(app);
        await viewerAgent.post('/login').send({ username: 'viewer', password: 'nonadmin' });

        const res = await viewerAgent.delete('/api/ideas');
        expect(res.status).toBe(403);

        await run("DELETE FROM users WHERE username = 'viewer'");
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Stats API
// ═══════════════════════════════════════════════════════════════════════════════

describe('Stats API', () => {
    it('GET /api/stats/code returns CODE stages', async () => {
        const res = await agent.get('/api/stats/code');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('captured');
        expect(res.body).toHaveProperty('organized');
        expect(res.body).toHaveProperty('distilled');
        expect(res.body).toHaveProperty('expressed');
    });

    it('GET /api/stats/para returns PARA types', async () => {
        const res = await agent.get('/api/stats/para');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('project');
        expect(res.body).toHaveProperty('area');
        expect(res.body).toHaveProperty('resource');
        expect(res.body).toHaveProperty('archive');
    });

    it('GET /api/stats/overview returns counts', async () => {
        const res = await agent.get('/api/stats/overview');
        expect(res.status).toBe(200);
        expect(typeof res.body.ideas).toBe('number');
        expect(typeof res.body.areas).toBe('number');
    });

    it('GET /api/stats/analytics returns chart data', async () => {
        const res = await agent.get('/api/stats/analytics');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('ideasPerDay');
        expect(res.body).toHaveProperty('codeFlow');
        expect(res.body).toHaveProperty('byType');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GTD API
// ═══════════════════════════════════════════════════════════════════════════════

describe('GTD API', () => {
    let gtdIdeaId;

    beforeAll(async () => {
        const result = await run("INSERT INTO ideas (text, code_stage, created_by, assigned_to) VALUES (?, ?, ?, ?)",
            ['GTD test task', 'organized', 'testuser', 'testuser']);
        gtdIdeaId = result.lastID;
    });

    afterAll(async () => {
        await run('DELETE FROM ideas WHERE id = ?', [gtdIdeaId]);
    });

    it('GET /api/gtd/contexts returns contexts', async () => {
        const res = await agent.get('/api/gtd/contexts');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /api/gtd/effectiveness returns breakdown', async () => {
        const res = await agent.get('/api/gtd/effectiveness');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('byContext');
        expect(res.body).toHaveProperty('byEnergy');
        expect(res.body).toHaveProperty('nextActions');
    });

    it('PUT /api/ideas/:id/gtd updates GTD fields', async () => {
        const res = await agent.put(`/api/ideas/${gtdIdeaId}/gtd`)
            .send({ contexto: '@computador', energia: 'alta', tipo_compromiso: 'comprometida' });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        const idea = await get('SELECT contexto, energia, tipo_compromiso FROM ideas WHERE id = ?', [gtdIdeaId]);
        expect(idea.contexto).toBe('@computador');
        expect(idea.energia).toBe('alta');
    });

    it('POST /api/ideas/:id/complete marks idea done', async () => {
        const res = await agent.post(`/api/ideas/${gtdIdeaId}/complete`);
        expect(res.status).toBe(200);

        const idea = await get('SELECT completada, code_stage FROM ideas WHERE id = ?', [gtdIdeaId]);
        expect(Number(idea.completada)).toBe(1);
        expect(idea.code_stage).toBe('expressed');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Waiting For API
// ═══════════════════════════════════════════════════════════════════════════════

describe('Waiting For API', () => {
    let waitingId;

    it('POST /api/waiting-for creates item', async () => {
        const res = await agent.post('/api/waiting-for')
            .send({ description: 'Waiting for test', delegated_to: 'testuser', delegated_by: 'testuser' });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        const item = await get("SELECT id FROM waiting_for WHERE description = 'Waiting for test'");
        waitingId = item.id;
    });

    it('GET /api/waiting-for returns items', async () => {
        const res = await agent.get('/api/waiting-for');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('PUT /api/waiting-for/:id/complete marks done', async () => {
        const res = await agent.put(`/api/waiting-for/${waitingId}/complete`);
        expect(res.status).toBe(200);

        const item = await get('SELECT status FROM waiting_for WHERE id = ?', [waitingId]);
        expect(item.status).toBe('completed');
    });

    it('DELETE /api/waiting-for/:id removes item', async () => {
        const res = await agent.delete(`/api/waiting-for/${waitingId}`);
        expect(res.status).toBe(200);

        const item = await get('SELECT id FROM waiting_for WHERE id = ?', [waitingId]);
        expect(item).toBeUndefined();
    });

    it('POST /api/waiting-for without description returns 400', async () => {
        const res = await agent.post('/api/waiting-for').send({});
        expect(res.status).toBe(400);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Admin API (Search, Users, Projects, Notifications)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Admin API', () => {
    it('GET /api/users returns users', async () => {
        const res = await agent.get('/api/users');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        const testUser = res.body.find(u => u.username === 'testuser');
        expect(testUser).toBeDefined();
        expect(testUser).not.toHaveProperty('password_hash');
    });

    it('GET /api/search with query returns results', async () => {
        const res = await agent.get('/api/search?q=test');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('query', 'test');
        expect(res.body).toHaveProperty('results');
        expect(res.body).toHaveProperty('total');
    });

    it('GET /api/search with short query returns 400', async () => {
        const res = await agent.get('/api/search?q=a');
        expect(res.status).toBe(400);
    });

    it('GET /api/notifications/check returns notification data', async () => {
        const res = await agent.get('/api/notifications/check');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('total');
        expect(res.body).toHaveProperty('urgent_tasks');
        expect(res.body).toHaveProperty('overdue_delegations');
    });

    it('GET /api/projects returns array', async () => {
        const res = await agent.get('/api/projects');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /api/export returns full export', async () => {
        const res = await agent.get('/api/export');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('version');
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('ideas');
        expect(res.body.data).toHaveProperty('areas');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Security: Rate limiting headers, CORS, etc.
// ═══════════════════════════════════════════════════════════════════════════════

describe('Security Headers', () => {
    it('responses include helmet security headers', async () => {
        const res = await request(app).get('/health');
        expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
        expect(res.headers).toHaveProperty('x-frame-options');
    });

    it('API rate limit headers present', async () => {
        const res = await agent.get('/api/stats/overview');
        expect(res.headers).toHaveProperty('ratelimit-limit');
        expect(res.headers).toHaveProperty('ratelimit-remaining');
    });
});
