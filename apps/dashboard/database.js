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
        await migrate2FA();
        await migrateAccountLockout();
        await migrateAuditLog();
        await migrateWebAuthn();
        await migrateDigest();

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

async function migrate2FA() {
    // Columns on users table
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS twofa_enabled BOOLEAN DEFAULT FALSE");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS twofa_enforced BOOLEAN DEFAULT FALSE");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_twofa_at TIMESTAMP");

    // TOTP secrets
    await pool.query(`CREATE TABLE IF NOT EXISTS user_totp_secrets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        secret_encrypted TEXT NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
    )`);

    // Recovery codes (single-use backup)
    await pool.query(`CREATE TABLE IF NOT EXISTS user_recovery_codes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        code_hash TEXT NOT NULL,
        used_at TIMESTAMP
    )`);
    await pool.query("CREATE INDEX IF NOT EXISTS idx_recovery_user ON user_recovery_codes(user_id)");

    // Trusted devices (skip 2FA for known device+IP)
    await pool.query(`CREATE TABLE IF NOT EXISTS user_trusted_devices (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        device_hash TEXT NOT NULL,
        ip_address TEXT NOT NULL,
        label TEXT,
        last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await pool.query("CREATE INDEX IF NOT EXISTS idx_trusted_user ON user_trusted_devices(user_id)");
    await pool.query("CREATE INDEX IF NOT EXISTS idx_trusted_lookup ON user_trusted_devices(user_id, device_hash, ip_address)");

    // Login attempts (risk assessment)
    await pool.query(`CREATE TABLE IF NOT EXISTS user_login_attempts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        username TEXT NOT NULL,
        ip_address TEXT,
        success BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await pool.query("CREATE INDEX IF NOT EXISTS idx_login_attempts_user ON user_login_attempts(user_id, created_at)");
    await pool.query("CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON user_login_attempts(ip_address, created_at)");
}

async function migrateAccountLockout() {
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP");
}

async function migrateAuditLog() {
    await pool.query(`CREATE TABLE IF NOT EXISTS audit_log (
        id SERIAL PRIMARY KEY,
        event_type TEXT NOT NULL,
        actor TEXT,
        target TEXT,
        ip_address TEXT,
        user_agent TEXT,
        details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await pool.query("CREATE INDEX IF NOT EXISTS idx_audit_event ON audit_log(event_type)");
    await pool.query("CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor)");
    await pool.query("CREATE INDEX IF NOT EXISTS idx_audit_target ON audit_log(target)");
    await pool.query("CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at)");
}

async function migrateWebAuthn() {
    await pool.query(`CREATE TABLE IF NOT EXISTS user_webauthn_credentials (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        credential_id TEXT NOT NULL UNIQUE,
        public_key TEXT NOT NULL,
        counter INTEGER DEFAULT 0,
        device_type TEXT,
        transports TEXT,
        label TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_used TIMESTAMP
    )`);
    await pool.query("CREATE INDEX IF NOT EXISTS idx_webauthn_user ON user_webauthn_credentials(user_id)");
    await pool.query("CREATE INDEX IF NOT EXISTS idx_webauthn_credid ON user_webauthn_credentials(credential_id)");
}

async function migrateDigest() {
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS digest_enabled BOOLEAN DEFAULT TRUE");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS digest_email TEXT");
    await pool.query(`CREATE TABLE IF NOT EXISTS daily_digests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        summary TEXT,
        delivered_via TEXT DEFAULT 'in_app',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await pool.query("CREATE INDEX IF NOT EXISTS idx_digest_user ON daily_digests(user_id, created_at)");
}

// Start initialization
initDatabase();

module.exports = { db: pool, pool, run, get, all, closeDb };
