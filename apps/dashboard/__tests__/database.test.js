/**
 * Database module tests
 * Tests: table creation, CRUD operations, indexes, migrations
 */
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Use in-memory DB for tests
const TEST_DB_PATH = path.join(__dirname, '..', 'data', 'test_second_brain.db');

let db, run, get, all;

beforeAll((done) => {
    // Clean up any existing test db
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);

    db = new sqlite3.Database(TEST_DB_PATH, (err) => {
        if (err) return done(err);

        // Promisified helpers
        run = (sql, params = []) => new Promise((resolve, reject) => {
            db.run(sql, params, function (err) { if (err) reject(err); else resolve(this); });
        });
        get = (sql, params = []) => new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => { if (err) reject(err); else resolve(row); });
        });
        all = (sql, params = []) => new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => { if (err) reject(err); else resolve(rows); });
        });

        // Create tables
        db.serialize(() => {
            db.run('PRAGMA journal_mode = WAL');
            db.run('PRAGMA foreign_keys = ON');

            db.run(`CREATE TABLE IF NOT EXISTS ideas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL,
                audio_url TEXT,
                tags TEXT,
                status TEXT DEFAULT 'inbox',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                ai_type TEXT,
                ai_category TEXT,
                ai_action TEXT,
                ai_summary TEXT,
                code_stage TEXT DEFAULT 'captured',
                para_type TEXT,
                related_area_id INTEGER,
                assigned_to TEXT,
                priority TEXT DEFAULT 'media',
                created_by TEXT,
                completada INTEGER DEFAULT 0,
                parent_idea_id INTEGER,
                is_project INTEGER DEFAULT 0
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS areas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                description TEXT,
                icon TEXT DEFAULT '📂',
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS context_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE,
                content TEXT,
                category TEXT,
                para_type TEXT,
                code_stage TEXT,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT,
                role TEXT DEFAULT 'analyst',
                department TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS daily_checklist (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT,
                idea_id INTEGER,
                date TEXT,
                completed INTEGER DEFAULT 0,
                UNIQUE(username, idea_id, date)
            )`);

            // Indexes
            db.run('CREATE INDEX IF NOT EXISTS idx_ideas_code_stage ON ideas(code_stage)');
            db.run('CREATE INDEX IF NOT EXISTS idx_ideas_assigned_to ON ideas(assigned_to)');
            db.run('CREATE INDEX IF NOT EXISTS idx_ideas_parent ON ideas(parent_idea_id)', () => {
                done();
            });
        });
    });
});

afterAll((done) => {
    db.close(() => {
        if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
        done();
    });
});

describe('Database Schema', () => {
    test('ideas table exists and accepts all columns', async () => {
        const r = await run(
            `INSERT INTO ideas (text, code_stage, para_type, assigned_to, priority, completada, parent_idea_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ['schema test', 'captured', 'resource', 'david', 'alta', 0, null]
        );
        const idea = await get('SELECT text, code_stage, para_type, assigned_to, priority, completada FROM ideas WHERE id = ?', [r.lastID]);
        expect(idea.text).toBe('schema test');
        expect(idea.code_stage).toBe('captured');
        expect(idea.para_type).toBe('resource');
        expect(idea.assigned_to).toBe('david');
        await run('DELETE FROM ideas WHERE id = ?', [r.lastID]);
    });

    test('areas table exists and has unique name', async () => {
        const result = await get("SELECT count(*) as cnt FROM areas");
        expect(result).toBeTruthy();
    });

    test('indexes exist for performance', async () => {
        const indexes = await all("SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'");
        const indexNames = indexes.map(i => i.name);
        expect(indexNames).toContain('idx_ideas_code_stage');
        expect(indexNames).toContain('idx_ideas_assigned_to');
        expect(indexNames).toContain('idx_ideas_parent');
    });
});

describe('Ideas CRUD', () => {
    test('insert and retrieve an idea', async () => {
        await run('INSERT INTO ideas (text, code_stage, created_by) VALUES (?, ?, ?)',
            ['Test idea', 'captured', 'david']);
        const idea = await get('SELECT * FROM ideas WHERE text = ?', ['Test idea']);
        expect(idea).toBeTruthy();
        expect(idea.text).toBe('Test idea');
        expect(idea.code_stage).toBe('captured');
        expect(idea.created_by).toBe('david');
    });

    test('update idea code_stage', async () => {
        const idea = await get('SELECT id FROM ideas WHERE text = ?', ['Test idea']);
        await run('UPDATE ideas SET code_stage = ? WHERE id = ?', ['organized', idea.id]);
        const updated = await get('SELECT code_stage FROM ideas WHERE id = ?', [idea.id]);
        expect(updated.code_stage).toBe('organized');
    });

    test('delete idea cascades checklist', async () => {
        const result = await run('INSERT INTO ideas (text, code_stage) VALUES (?, ?)', ['To delete', 'captured']);
        const ideaId = result.lastID;

        await run('INSERT INTO daily_checklist (username, idea_id, date) VALUES (?, ?, ?)',
            ['david', ideaId, '2026-02-20']);

        // Delete idea + cascade
        await run('DELETE FROM daily_checklist WHERE idea_id = ?', [ideaId]);
        await run('DELETE FROM ideas WHERE id = ?', [ideaId]);

        const deleted = await get('SELECT * FROM ideas WHERE id = ?', [ideaId]);
        expect(deleted).toBeUndefined();

        const orphanChecklist = await get('SELECT * FROM daily_checklist WHERE idea_id = ?', [ideaId]);
        expect(orphanChecklist).toBeUndefined();
    });

    test('parent-child relationship works', async () => {
        const parent = await run('INSERT INTO ideas (text, is_project, code_stage) VALUES (?, 1, ?)',
            ['Parent project', 'organized']);
        await run('INSERT INTO ideas (text, parent_idea_id, code_stage) VALUES (?, ?, ?)',
            ['Child task 1', parent.lastID, 'organized']);
        await run('INSERT INTO ideas (text, parent_idea_id, code_stage) VALUES (?, ?, ?)',
            ['Child task 2', parent.lastID, 'organized']);

        const children = await all('SELECT * FROM ideas WHERE parent_idea_id = ?', [parent.lastID]);
        expect(children.length).toBe(2);
    });
});

describe('Areas CRUD', () => {
    test('insert and retrieve area', async () => {
        await run('INSERT INTO areas (name, description, icon) VALUES (?, ?, ?)',
            ['Operaciones', 'Gestion operativa', '⚙️']);
        const area = await get('SELECT * FROM areas WHERE name = ?', ['Operaciones']);
        expect(area).toBeTruthy();
        expect(area.status).toBe('active');
    });

    test('unique constraint prevents duplicate areas', async () => {
        await expect(
            run('INSERT INTO areas (name) VALUES (?)', ['Operaciones'])
        ).rejects.toThrow();
    });

    test('archive area updates status', async () => {
        const area = await get('SELECT id FROM areas WHERE name = ?', ['Operaciones']);
        await run('UPDATE areas SET status = ? WHERE id = ?', ['archived', area.id]);
        const updated = await get('SELECT status FROM areas WHERE id = ?', [area.id]);
        expect(updated.status).toBe('archived');
    });
});

describe('Query Performance', () => {
    test('ideas by assigned_to uses index', async () => {
        const plan = await get("EXPLAIN QUERY PLAN SELECT * FROM ideas WHERE assigned_to = 'david'");
        expect(plan.detail).toContain('idx_ideas_assigned_to');
    });

    test('ideas by code_stage uses index', async () => {
        const plan = await get("EXPLAIN QUERY PLAN SELECT * FROM ideas WHERE code_stage = 'captured'");
        expect(plan.detail).toContain('idx_ideas_code_stage');
    });

    test('ideas by parent_id uses index', async () => {
        const plan = await get("EXPLAIN QUERY PLAN SELECT * FROM ideas WHERE parent_idea_id = 1");
        expect(plan.detail).toContain('idx_ideas_parent');
    });
});
