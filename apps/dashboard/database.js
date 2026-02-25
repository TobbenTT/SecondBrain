const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const log = require('./helpers/logger');

// Database file path
const dbPath = path.join(__dirname, 'data', 'second_brain.db');

// Connect to SQLite
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        log.error('Error opening database', { error: err.message });
    } else {
        log.info('Connected to SQLite database', { path: dbPath });
        // Performance & reliability PRAGMAs
        db.run('PRAGMA journal_mode = WAL');
        db.run('PRAGMA synchronous = NORMAL');
        db.run('PRAGMA foreign_keys = ON');
        db.run('PRAGMA busy_timeout = 5000');
        initTables();
    }
});

function initTables() {
    db.serialize(() => {
        // Ideas Table
        db.run(`CREATE TABLE IF NOT EXISTS ideas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT,
            audio_url TEXT,
            tags TEXT,
            status TEXT DEFAULT 'inbox',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            ai_type TEXT,
            ai_category TEXT,
            ai_action TEXT,
            ai_summary TEXT
        )`);

        // Migration for existing tables (safe to run)
        const ideasColumnsToAdd = [
            'ai_type', 'ai_category', 'ai_action', 'ai_summary',
            'project_id', 'code_stage', 'para_type',
            'related_area_id', 'distilled_summary', 'expressed_output',
            'assigned_to', 'estimated_time', 'priority',
            // Automation Pipeline columns
            'suggested_agent', 'suggested_skills',
            'execution_status', 'execution_output', 'execution_error',
            'executed_at', 'executed_by',
            // GTD Fields (from Jose's methodology)
            'contexto',           // @email, @calle, @computador, @telefono, @oficina, @casa, @espera
            'energia',            // baja, media, alta
            'fecha_inicio',       // YYYY-MM-DD
            'fecha_objetivo',     // YYYY-MM-DD target
            'fecha_limite',       // YYYY-MM-DD hard deadline
            'es_fecha_limite',    // 1=hard deadline, 0=flexible
            'tipo_compromiso',    // comprometida, esta_semana, algun_dia, tal_vez
            'proxima_accion',     // 1/0 — is this the next action for its project?
            'subproyecto',        // sub-project grouping
            'objetivo',           // area objective this supports
            'notas',              // free-form notes
            'completada',         // 1/0
            'fecha_finalizacion', // DATETIME when completed
            'parent_idea_id',     // FK to parent idea (for project→sub-task decomposition)
            'is_project',         // 1=project, 0=single task/idea
            'source_reunion_id'   // FK to reuniones.id (tasks generated from meetings)
        ];
        ideasColumnsToAdd.forEach(col => {
            db.run(`ALTER TABLE ideas ADD COLUMN ${col} TEXT`, (_err) => {
                // Ignore error if column exists
            });
        });

        // Context Items Table (The "Don't Repeat Yourself" memory)
        db.run(`CREATE TABLE IF NOT EXISTS context_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE,
            content TEXT,
            category TEXT,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Migration: PARA/CODE columns for context_items
        const contextColumnsToAdd = [
            'para_type', 'code_stage', 'source',
            'related_project_id', 'related_area_id', 'distilled_summary'
        ];
        contextColumnsToAdd.forEach(col => {
            db.run(`ALTER TABLE context_items ADD COLUMN ${col} TEXT`, (_err) => {
                // Ignore error if column exists
            });
        });

        // Areas Table (PARA — ongoing responsibilities)
        db.run(`CREATE TABLE IF NOT EXISTS areas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            description TEXT,
            icon TEXT,
            horizon TEXT DEFAULT 'h2',
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Waiting For Table (GTD delegation tracking)
        db.run(`CREATE TABLE IF NOT EXISTS waiting_for (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT,
            delegated_to TEXT,
            delegated_by TEXT,
            related_idea_id INTEGER,
            related_project_id TEXT,
            related_area_id INTEGER,
            status TEXT DEFAULT 'waiting',
            due_date TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            completed_at DATETIME
        )`);

        // Chat History Table
        db.run(`CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            role TEXT,
            message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Projects Table (Migrated from JSON)
        db.run(`CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT,
            description TEXT,
            url TEXT,
            icon TEXT,
            status TEXT,
            tech TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Migration: PARA columns + segmentation for projects
        const projectColumnsToAdd = [
            'related_area_id', 'horizon', 'deadline',
            'project_type',   // 'interno' | 'cliente'
            'client_name',    // client company name
            'geography'       // free text: Chile, LATAM, Worldwide, etc.
        ];
        projectColumnsToAdd.forEach(col => {
            db.run(`ALTER TABLE projects ADD COLUMN ${col} TEXT`, (_err) => {
                // Ignore error if column exists
            });
        });

        // Skills Table
        db.run(`CREATE TABLE IF NOT EXISTS skills (
            id TEXT PRIMARY KEY,
            name TEXT,
            description TEXT,
            content TEXT,
            tags TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password_hash TEXT,
            role TEXT,
            department TEXT,
            expertise TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, function (err) {
            if (!err) seedUsers();
        });

        // Migration: Add department/expertise/avatar/supabase_uid to users
        ['department', 'expertise', 'avatar', 'supabase_uid'].forEach(col => {
            db.run(`ALTER TABLE users ADD COLUMN ${col} TEXT`, (_err) => {
                // Ignore if exists
            });
        });

        // Inbox Log Table (Receipt — audit trail of everything that enters the system)
        db.run(`CREATE TABLE IF NOT EXISTS inbox_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source TEXT,
            input_text TEXT,
            ai_confidence REAL DEFAULT 0,
            ai_classification TEXT,
            routed_to TEXT,
            needs_review INTEGER DEFAULT 0,
            reviewed INTEGER DEFAULT 0,
            original_idea_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Migration: Add confidence score to ideas
        db.run(`ALTER TABLE ideas ADD COLUMN ai_confidence REAL`, (_err) => {});
        db.run(`ALTER TABLE ideas ADD COLUMN needs_review INTEGER DEFAULT 0`, (_err) => {});

        // Migration: Add created_by (identity tracking — who captured this idea?)
        db.run(`ALTER TABLE ideas ADD COLUMN created_by TEXT`, (_err) => {});

        // Migration: Add last_reviewed for weekly review tracking
        db.run(`ALTER TABLE ideas ADD COLUMN last_reviewed DATETIME`, (_err) => {});

        // API Keys Table (for external integrations like OpenClaw)
        db.run(`CREATE TABLE IF NOT EXISTS api_keys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE,
            name TEXT,
            username TEXT,
            permissions TEXT DEFAULT 'read,write',
            active INTEGER DEFAULT 1,
            last_used DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Herramientas Contratadas (subscriptions/tools tracking for Finance agent)
        db.run(`CREATE TABLE IF NOT EXISTS herramientas_contratadas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            proveedor TEXT,
            categoria TEXT DEFAULT 'General',
            costo_mensual REAL DEFAULT 0,
            moneda TEXT DEFAULT 'USD',
            frecuencia TEXT DEFAULT 'mensual',
            fecha_inicio TEXT,
            fecha_renovacion TEXT,
            duracion_contrato TEXT,
            fecha_vencimiento TEXT,
            num_licencias INTEGER DEFAULT 1,
            estado TEXT DEFAULT 'activo',
            notas TEXT,
            created_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        // Migrations for herramientas
        db.run(`ALTER TABLE herramientas_contratadas ADD COLUMN duracion_contrato TEXT`, (_err) => {});
        db.run(`ALTER TABLE herramientas_contratadas ADD COLUMN fecha_vencimiento TEXT`, (_err) => {});

        // Daily Checklist Table (per-consultant task tracking)
        db.run(`CREATE TABLE IF NOT EXISTS daily_checklist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            idea_id INTEGER,
            date TEXT,
            completed INTEGER DEFAULT 0,
            completed_at DATETIME,
            notes TEXT,
            UNIQUE(username, idea_id, date)
        )`);

        // Material de Apoyo Table (reference materials linked to projects/ideas)
        db.run(`CREATE TABLE IF NOT EXISTS material_apoyo (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            url TEXT,
            content TEXT,
            tipo TEXT DEFAULT 'referencia',
            related_idea_id INTEGER,
            related_project_id TEXT,
            related_area_id INTEGER,
            created_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // GTD Contexts Table (predefined GTD contexts)
        db.run(`CREATE TABLE IF NOT EXISTS gtd_contexts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            icon TEXT,
            description TEXT,
            active INTEGER DEFAULT 1
        )`, function(err) {
            if (!err) seedGtdContexts();
        });

        // Notification Dismissals Table (track dismissed notifications per user)
        db.run(`CREATE TABLE IF NOT EXISTS notification_dismissals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            notification_type TEXT NOT NULL,
            notification_id INTEGER NOT NULL,
            dismissed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(username, notification_type, notification_id)
        )`);

        // Comments Table (consultant feedback on skills and outputs)
        db.run(`CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            target_type TEXT NOT NULL,
            target_id TEXT NOT NULL,
            username TEXT NOT NULL,
            content TEXT NOT NULL,
            section TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        db.run(`ALTER TABLE comments ADD COLUMN section TEXT`, (_err) => {});
        db.run(`ALTER TABLE comments ADD COLUMN highlighted_text TEXT`, (_err) => {});

        // Skill Documents Table (reference docs linked to skills)
        db.run(`CREATE TABLE IF NOT EXISTS skill_documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            skill_path TEXT NOT NULL,
            document_name TEXT NOT NULL,
            document_url TEXT,
            description TEXT,
            created_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Migration: file_path column for skill document uploads
        db.run(`ALTER TABLE skill_documents ADD COLUMN file_path TEXT`, (_err) => {});

        // Reuniones Table (meetings intelligence — mirror of Supabase)
        db.run(`CREATE TABLE IF NOT EXISTS reuniones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            external_id TEXT UNIQUE,
            titulo TEXT NOT NULL,
            fecha TEXT NOT NULL,
            transcripcion_raw TEXT,
            asistentes TEXT DEFAULT '[]',
            acuerdos TEXT DEFAULT '[]',
            puntos_clave TEXT DEFAULT '[]',
            compromisos TEXT DEFAULT '[]',
            entregables TEXT DEFAULT '[]',
            proxima_reunion TEXT,
            nivel_analisis TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Reuniones Notifications (per-user meeting attendance alerts)
        db.run(`CREATE TABLE IF NOT EXISTS reuniones_notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            reunion_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(username, reunion_id)
        )`);

        // Reuniones Email Recipients (admin-managed list of email addresses)
        db.run(`CREATE TABLE IF NOT EXISTS reuniones_email_recipients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            nombre TEXT,
            activo INTEGER DEFAULT 1,
            created_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Migration: Review columns for consultant workflow
        db.run(`ALTER TABLE ideas ADD COLUMN review_status TEXT`, (_err) => {});
        db.run(`ALTER TABLE ideas ADD COLUMN reviewed_by TEXT`, (_err) => {});
        db.run(`ALTER TABLE ideas ADD COLUMN reviewed_at DATETIME`, (_err) => {});

        // ─── Indexes (idempotent — safe to run on every startup) ────────
        db.run('CREATE INDEX IF NOT EXISTS idx_ideas_code_stage ON ideas(code_stage)');
        db.run('CREATE INDEX IF NOT EXISTS idx_ideas_assigned_to ON ideas(assigned_to)');
        db.run('CREATE INDEX IF NOT EXISTS idx_ideas_parent ON ideas(parent_idea_id)');
        db.run('CREATE INDEX IF NOT EXISTS idx_ideas_area ON ideas(related_area_id)');
        db.run('CREATE INDEX IF NOT EXISTS idx_ideas_created ON ideas(created_at)');
        db.run('CREATE INDEX IF NOT EXISTS idx_ideas_priority ON ideas(priority)');
        db.run('CREATE INDEX IF NOT EXISTS idx_ideas_completada ON ideas(completada)');
        db.run('CREATE INDEX IF NOT EXISTS idx_checklist_user_date ON daily_checklist(username, date)');
        db.run('CREATE INDEX IF NOT EXISTS idx_waiting_status ON waiting_for(status)');
        db.run('CREATE INDEX IF NOT EXISTS idx_waiting_delegated ON waiting_for(delegated_to)');
        db.run('CREATE INDEX IF NOT EXISTS idx_context_para ON context_items(para_type)');
        db.run('CREATE INDEX IF NOT EXISTS idx_context_area ON context_items(related_area_id)');
        db.run('CREATE INDEX IF NOT EXISTS idx_inbox_log_idea ON inbox_log(original_idea_id)');
        db.run('CREATE INDEX IF NOT EXISTS idx_notif_dismiss_user ON notification_dismissals(username, notification_type)');
        db.run('CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_history(session_id)');
        db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_supabase_uid ON users(supabase_uid)');
        db.run('CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_type, target_id)');
        db.run('CREATE INDEX IF NOT EXISTS idx_comments_username ON comments(username)');
        db.run('CREATE INDEX IF NOT EXISTS idx_skill_docs_path ON skill_documents(skill_path)');
        db.run('CREATE INDEX IF NOT EXISTS idx_ideas_review ON ideas(review_status)');
        db.run('CREATE INDEX IF NOT EXISTS idx_reuniones_fecha ON reuniones(fecha)');
        db.run('CREATE INDEX IF NOT EXISTS idx_reuniones_external ON reuniones(external_id)');
        db.run('CREATE INDEX IF NOT EXISTS idx_reuniones_notif_user ON reuniones_notifications(username)');
        db.run('CREATE INDEX IF NOT EXISTS idx_ideas_created_by ON ideas(created_by)');
        db.run('CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status)');
        db.run('CREATE INDEX IF NOT EXISTS idx_ideas_execution ON ideas(execution_status)');
        db.run('CREATE INDEX IF NOT EXISTS idx_ideas_needs_review ON ideas(needs_review)');
        db.run('CREATE INDEX IF NOT EXISTS idx_ideas_is_project ON ideas(is_project)');
        db.run('CREATE INDEX IF NOT EXISTS idx_ideas_user_date ON ideas(created_by, created_at)');

        // ─── Feedback table ─────────────────────────────────────────────
        db.run(`CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            category TEXT DEFAULT 'mejora',
            priority TEXT DEFAULT 'media',
            status TEXT DEFAULT 'abierto',
            admin_response TEXT,
            responded_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            resolved_at DATETIME
        )`);
        db.run('CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status)');
        db.run('CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback(username)');

        // ─── Feedback attachments ───────────────────────────────────────
        db.run(`CREATE TABLE IF NOT EXISTS feedback_attachments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            feedback_id INTEGER NOT NULL,
            filename TEXT NOT NULL,
            original_name TEXT NOT NULL,
            mimetype TEXT,
            size INTEGER,
            uploaded_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (feedback_id) REFERENCES feedback(id) ON DELETE CASCADE
        )`);
        db.run('CREATE INDEX IF NOT EXISTS idx_fb_attach_feedback ON feedback_attachments(feedback_id)');

        // User Notifications (directed notifications per user)
        db.run(`CREATE TABLE IF NOT EXISTS user_notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT,
            link_section TEXT,
            link_id INTEGER,
            read INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        db.run('CREATE INDEX IF NOT EXISTS idx_user_notif_user ON user_notifications(username, read)');

        // Gallery Photos (corporate intranet imagery)
        db.run(`CREATE TABLE IF NOT EXISTS gallery_photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL,
            caption TEXT,
            category TEXT DEFAULT 'general',
            uploaded_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Reunion Links (many-to-many: reuniones ↔ projects/areas)
        db.run(`CREATE TABLE IF NOT EXISTS reunion_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reunion_id INTEGER NOT NULL,
            link_type TEXT NOT NULL,
            link_id TEXT NOT NULL,
            auto_detected INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(reunion_id, link_type, link_id)
        )`);
        db.run('CREATE INDEX IF NOT EXISTS idx_reunion_links_reunion ON reunion_links(reunion_id)');
        db.run('CREATE INDEX IF NOT EXISTS idx_reunion_links_target ON reunion_links(link_type, link_id)');

        // Migration: temas_detectados for reuniones
        db.run('ALTER TABLE reuniones ADD COLUMN temas_detectados TEXT DEFAULT "[]"', (_err) => {});

        // ─── OKRs Table (Objectives and Key Results) ─────────────────────
        db.run(`CREATE TABLE IF NOT EXISTS okrs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            type TEXT DEFAULT 'objective',
            parent_id INTEGER,
            owner TEXT,
            target_value REAL,
            current_value REAL DEFAULT 0,
            unit TEXT,
            status TEXT DEFAULT 'active',
            period TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES okrs(id) ON DELETE CASCADE
        )`);
        db.run('CREATE INDEX IF NOT EXISTS idx_okrs_parent ON okrs(parent_id)');
        db.run('CREATE INDEX IF NOT EXISTS idx_okrs_owner ON okrs(owner)');
        db.run('CREATE INDEX IF NOT EXISTS idx_okrs_status ON okrs(status)');

        // ─── OKR Links (link projects/ideas to OKRs) ────────────────────
        db.run(`CREATE TABLE IF NOT EXISTS okr_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            okr_id INTEGER NOT NULL,
            link_type TEXT NOT NULL,
            link_id TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(okr_id, link_type, link_id),
            FOREIGN KEY (okr_id) REFERENCES okrs(id) ON DELETE CASCADE
        )`);
        db.run('CREATE INDEX IF NOT EXISTS idx_okr_links_okr ON okr_links(okr_id)');
        db.run('CREATE INDEX IF NOT EXISTS idx_okr_links_target ON okr_links(link_type, link_id)');

        log.info('Database tables and indexes initialized');

        // Seed areas after tables are created
        seedAreas();
        seedApiKeys();
        seedConsultor();
    });
}

function seedAreas() {
    db.get('SELECT count(*) as count FROM areas', [], (err, row) => {
        if (err) return;
        if (row.count === 0) {
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
            const stmt = db.prepare('INSERT OR IGNORE INTO areas (name, description, icon, horizon) VALUES (?, ?, ?, ?)');
            areas.forEach(a => stmt.run(a.name, a.description, a.icon, a.horizon));
            stmt.finalize();
            log.info('Areas seeded successfully');
        }
    });
}

async function seedUsers() {
    // Skip seeding when Supabase Auth is configured — users are managed via Supabase
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
        return;
    }

    db.get('SELECT count(*) as count FROM users', [], async (err, row) => {
        if (err) return log.error('Seed users query failed', { error: err.message });
        if (row.count === 0) {
            log.info('Seeding initial users (SQLite fallback)');
            try {
                const bcrypt = require('bcryptjs');
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash('vsc2026', salt);

                const stmt = db.prepare('INSERT INTO users (username, password_hash, role, department, expertise) VALUES (?, ?, ?, ?, ?)');
                const users = [
                    { username: 'david', role: 'admin', department: 'Direccion', expertise: 'Estrategia,Operaciones,Gestion' },
                    { username: 'gonzalo', role: 'manager', department: 'Operaciones', expertise: 'HSE,Ejecucion,Contratos' },
                    { username: 'jose', role: 'analyst', department: 'Finanzas', expertise: 'Finanzas,Presupuestos,Analisis' }
                ];

                users.forEach(user => {
                    stmt.run(user.username, hash, user.role, user.department, user.expertise);
                });
                stmt.finalize();
                log.info('Users seeded successfully');
            } catch (e) {
                log.error('Seeding error', { error: e.message });
            }
        }
    });
}

function seedApiKeys() {
    db.get('SELECT count(*) as count FROM api_keys', [], (err, row) => {
        if (err) return;
        if (row.count === 0) {
            log.info('Seeding default API keys');
            const crypto = require('crypto');
            const key = 'sb_' + crypto.randomBytes(24).toString('hex');
            db.run(
                'INSERT INTO api_keys (key, name, username, permissions) VALUES (?, ?, ?, ?)',
                [key, 'OpenClaw Agent', 'david', 'read,write'],
                (err) => {
                    if (!err) log.info('API Key created for OpenClaw — save this key', { key });
                }
            );
        }
        // Ensure inteligencia-correos key always exists
        const correosKey = 'sb_12b5199409045112e93c13eef4c149a239841de0b9ed0baf';
        db.run(
            'INSERT OR IGNORE INTO api_keys (key, name, username, permissions) VALUES (?, ?, ?, ?)',
            [correosKey, 'Inteligencia de Correos', 'system', 'read,write'],
            (err) => {
                if (!err) log.info('Inteligencia-de-correos API key ensured');
            }
        );
    });
}

function seedGtdContexts() {
    db.get('SELECT count(*) as count FROM gtd_contexts', [], (err, row) => {
        if (err) return;
        if (row.count === 0) {
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
            const stmt = db.prepare('INSERT OR IGNORE INTO gtd_contexts (name, icon, description) VALUES (?, ?, ?)');
            contexts.forEach(c => stmt.run(c.name, c.icon, c.description));
            stmt.finalize();
            log.info('GTD contexts seeded');
        }
    });
}

async function seedConsultor() {
    db.get("SELECT id FROM users WHERE username = 'consultor'", [], async (err, row) => {
        if (err) return;
        if (!row) {
            try {
                const bcrypt = require('bcryptjs');
                const hash = await bcrypt.hash('vsc2026', 10);
                db.run(
                    'INSERT OR IGNORE INTO users (username, password_hash, role, department, expertise) VALUES (?, ?, ?, ?, ?)',
                    ['consultor', hash, 'consultor', 'Consultoria', 'Gestion de Activos,Confiabilidad,Normativa'],
                    (err) => {
                        if (!err) log.info('Consultor user seeded');
                    }
                );
            } catch (e) {
                log.error('Consultor seed error', { error: e.message });
            }
        }
    });
}

// Migrate existing context_items categories to PARA types
function migrateContextToPara() {
    const migrations = {
        'core': { para_type: 'resource', code_stage: 'expressed' },
        'business': { para_type: 'area', code_stage: 'organized' },
        'personal': { para_type: 'resource', code_stage: 'organized' },
        'preference': { para_type: 'resource', code_stage: 'expressed' }
    };

    Object.entries(migrations).forEach(([category, vals]) => {
        db.run(
            `UPDATE context_items SET para_type = ?, code_stage = ? WHERE category = ? AND para_type IS NULL`,
            [vals.para_type, vals.code_stage, category]
        );
    });

    // Set default code_stage for ideas without one
    db.run(`UPDATE ideas SET code_stage = 'captured' WHERE code_stage IS NULL AND status = 'inbox'`);
    db.run(`UPDATE ideas SET code_stage = 'organized' WHERE code_stage IS NULL AND status = 'processed'`);
}

// Run migration after a short delay to ensure tables exist
const _migrationTimer = setTimeout(migrateContextToPara, 2000);

// Promisified Helper Functions
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function closeDb() {
    clearTimeout(_migrationTimer);
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

module.exports = { db, run, get, all, closeDb };
