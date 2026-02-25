const { Pool } = require('pg');
const log = require('./helpers/logger');

// ─── PostgreSQL Connection ────────────────────────────────────────────────────

const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432'),
    user: process.env.PG_USER || 'secondbrain',
    password: process.env.PG_PASSWORD || 'staging_sb_2026',
    database: process.env.PG_DATABASE || 'secondbrain',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
});

pool.on('connect', () => {
    log.info('Connected to PostgreSQL database', {
        host: process.env.PG_HOST || 'localhost',
        database: process.env.PG_DATABASE || 'secondbrain'
    });
});

pool.on('error', (err) => {
    log.error('PostgreSQL pool error', { error: err.message });
});

// ─── SQLite → PostgreSQL Compatibility Layer ──────────────────────────────────
// Converts ? placeholders to $1, $2, $3... for pg driver compatibility
// This allows all existing route files to work without changes to their SQL

function convertPlaceholders(sql) {
    let index = 0;
    // Only replace ? that are actual placeholders (not inside strings)
    return sql.replace(/\?/g, () => `$${++index}`);
}

// ─── Promisified Helper Functions (same API as SQLite version) ────────────────

async function run(sql, params = []) {
    const pgSql = convertPlaceholders(sql);
    const isInsert = /^\s*INSERT/i.test(pgSql);

    // Auto-add RETURNING id for INSERTs that don't have it
    const finalSql = (isInsert && !/RETURNING/i.test(pgSql))
        ? pgSql + ' RETURNING id'
        : pgSql;

    const result = await pool.query(finalSql, params);
    return {
        lastID: (isInsert && result.rows && result.rows[0]) ? result.rows[0].id : null,
        changes: result.rowCount
    };
}

async function get(sql, params = []) {
    const result = await pool.query(convertPlaceholders(sql), params);
    return result.rows[0] || undefined; // sqlite3 returns undefined for no rows
}

async function all(sql, params = []) {
    const result = await pool.query(convertPlaceholders(sql), params);
    return result.rows;
}

async function closeDb() {
    await pool.end();
}

// ─── Initialization (seeds — schema is handled by init-pg.sql) ───────────────

async function initDatabase() {
    try {
        // Verify connection
        const client = await pool.connect();
        log.info('Connected to PostgreSQL database', { path: `${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}` });
        client.release();

        // Run seeds
        await seedAreas();
        await seedApiKeys();
        await seedUsers();
        await seedGtdContexts();
        await seedConsultor();
        await migrateContextToPara();
        await migrateAddSoftDelete();

        log.info('Database tables and indexes initialized');
    } catch (err) {
        log.error('Database initialization error', { error: err.message });
    }
}

async function seedAreas() {
    const row = await get('SELECT count(*) as count FROM areas');
    if (row && parseInt(row.count) === 0) {
        log.info('Seeding corporate areas');
        const areas = [
            { name: 'Operaciones', description: 'Gestion operativa diaria, dotacion y turnos', icon: '⚙️', horizon: 'h2' },
            { name: 'HSE', description: 'Salud, Seguridad y Medio Ambiente', icon: '🛡️', horizon: 'h2' },
            { name: 'Finanzas', description: 'Presupuestos OPEX, control de costos', icon: '💰', horizon: 'h2' },
            { name: 'Contratos', description: 'Gestion contractual y cumplimiento', icon: '📋', horizon: 'h2' },
            { name: 'Ejecucion', description: 'Seguimiento de proyectos y entregables', icon: '🎯', horizon: 'h2' },
            { name: 'Gestion de Activos', description: 'Mantenimiento e integridad de activos', icon: '🏭', horizon: 'h2' },
            { name: 'Capacitacion', description: 'Formacion, mallas curriculares y competencias', icon: '📚', horizon: 'h2' },
            { name: 'Desarrollo Profesional', description: 'Crecimiento personal y del equipo', icon: '🚀', horizon: 'h3' }
        ];
        for (const a of areas) {
            await run(
                'INSERT INTO areas (name, description, icon, horizon) VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO NOTHING',
                [a.name, a.description, a.icon, a.horizon]
            );
        }
        log.info('Areas seeded successfully');
    }
}

async function seedUsers() {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) return;

    const row = await get('SELECT count(*) as count FROM users');
    if (row && parseInt(row.count) === 0) {
        log.info('Seeding initial users (PostgreSQL)');
        try {
            const bcrypt = require('bcryptjs');
            const hash = await bcrypt.hash('vsc2026', 10);
            const users = [
                { username: 'david', role: 'admin', department: 'Direccion', expertise: 'Estrategia,Operaciones,Gestion' },
                { username: 'gonzalo', role: 'manager', department: 'Operaciones', expertise: 'HSE,Ejecucion,Contratos' },
                { username: 'jose', role: 'analyst', department: 'Finanzas', expertise: 'Finanzas,Presupuestos,Analisis' }
            ];
            for (const u of users) {
                await run(
                    'INSERT INTO users (username, password_hash, role, department, expertise) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (username) DO NOTHING',
                    [u.username, hash, u.role, u.department, u.expertise]
                );
            }
            log.info('Users seeded successfully');
        } catch (e) {
            log.error('Seeding error', { error: e.message });
        }
    }
}

async function seedApiKeys() {
    const row = await get('SELECT count(*) as count FROM api_keys');
    if (row && parseInt(row.count) === 0) {
        log.info('Seeding default API keys');
        const crypto = require('crypto');
        const key = 'sb_' + crypto.randomBytes(24).toString('hex');
        await run(
            'INSERT INTO api_keys (key, name, username, permissions) VALUES ($1, $2, $3, $4) ON CONFLICT (key) DO NOTHING',
            [key, 'OpenClaw Agent', 'david', 'read,write']
        );
        log.info('API Key created for OpenClaw — save this key', { key });
    }
    // Ensure inteligencia-correos key always exists
    const correosKey = 'sb_12b5199409045112e93c13eef4c149a239841de0b9ed0baf';
    await run(
        'INSERT INTO api_keys (key, name, username, permissions) VALUES ($1, $2, $3, $4) ON CONFLICT (key) DO NOTHING',
        [correosKey, 'Inteligencia de Correos', 'system', 'read,write']
    );
    log.info('Inteligencia-de-correos API key ensured');
}

async function seedGtdContexts() {
    const row = await get('SELECT count(*) as count FROM gtd_contexts');
    if (row && parseInt(row.count) === 0) {
        log.info('Seeding GTD contexts');
        const contexts = [
            { name: '@computador', icon: '💻', description: 'Tareas que requieren computador' },
            { name: '@email', icon: '📧', description: 'Correos por enviar o responder' },
            { name: '@telefono', icon: '📱', description: 'Llamadas por hacer' },
            { name: '@oficina', icon: '🏢', description: 'Tareas presenciales en oficina' },
            { name: '@calle', icon: '🚶', description: 'Diligencias fuera de oficina/casa' },
            { name: '@casa', icon: '🏠', description: 'Tareas para hacer en casa' },
            { name: '@espera', icon: '⏳', description: 'A la espera de alguien' },
            { name: '@compras', icon: '🛒', description: 'Cosas por comprar' },
            { name: '@investigar', icon: '🔍', description: 'Temas por investigar/Deep Research' },
            { name: '@reunion', icon: '👥', description: 'Temas para discutir en reunion' },
            { name: '@leer', icon: '📖', description: 'Material por leer/revisar' }
        ];
        for (const c of contexts) {
            await run(
                'INSERT INTO gtd_contexts (name, icon, description) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
                [c.name, c.icon, c.description]
            );
        }
        log.info('GTD contexts seeded');
    }
}

async function seedConsultor() {
    const row = await get("SELECT id FROM users WHERE username = 'consultor'");
    if (!row) {
        try {
            const bcrypt = require('bcryptjs');
            const hash = await bcrypt.hash('vsc2026', 10);
            await run(
                'INSERT INTO users (username, password_hash, role, department, expertise) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (username) DO NOTHING',
                ['consultor', hash, 'consultor', 'Consultoria', 'Gestion de Activos,Confiabilidad,Normativa']
            );
            log.info('Consultor user seeded');
        } catch (e) {
            log.error('Consultor seed error', { error: e.message });
        }
    }
}

async function migrateContextToPara() {
    const migrations = {
        'core': { para_type: 'resource', code_stage: 'expressed' },
        'business': { para_type: 'area', code_stage: 'organized' },
        'personal': { para_type: 'resource', code_stage: 'organized' },
        'preference': { para_type: 'resource', code_stage: 'expressed' }
    };

    for (const [category, vals] of Object.entries(migrations)) {
        await pool.query(
            'UPDATE context_items SET para_type = $1, code_stage = $2 WHERE category = $3 AND para_type IS NULL',
            [vals.para_type, vals.code_stage, category]
        );
    }

    await pool.query("UPDATE ideas SET code_stage = 'captured' WHERE code_stage IS NULL AND status = 'inbox'");
    await pool.query("UPDATE ideas SET code_stage = 'organized' WHERE code_stage IS NULL AND status = 'processed'");
}

async function migrateAddSoftDelete() {
    const tables = ['ideas', 'projects', 'feedback', 'reuniones', 'okrs'];
    for (const table of tables) {
        await pool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP`);
    }
}

// Start initialization
initDatabase();

module.exports = { db: pool, pool, run, get, all, closeDb };
