const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'data', 'second_brain.db');

// Connect to SQLite
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
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
        const columnsToAdd = ['ai_type', 'ai_category', 'ai_action', 'ai_summary'];
        columnsToAdd.forEach(col => {
            db.run(`ALTER TABLE ideas ADD COLUMN ${col} TEXT`, (err) => {
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

        // Chat History Table
        db.run(`CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            role TEXT,
            message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password_hash TEXT,
            role TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, function (err) {
            if (!err) seedUsers();
        });

        console.log('Database tables initialized.');
    });
}

async function seedUsers() {
    // Check if users exist using the Promise wrapper 'get' not defined yet, so we use db.get directly or wait?
    // Actually, 'get', 'run', 'all' are defined below but not exported to here easily inside initTables if we use 'this'.
    // Let's use raw db.get for seeding to avoid complexity or move seeding to a separate function.

    db.get('SELECT count(*) as count FROM users', [], async (err, row) => {
        if (err) return console.error(err.message);
        if (row.count === 0) {
            console.log('🌱 Seeding initial users...');
            try {
                const bcrypt = require('bcryptjs');
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash('vsc2026', salt);

                const stmt = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)');
                const users = [
                    { username: 'david', role: 'admin' },
                    { username: 'gonzalo', role: 'manager' },
                    { username: 'jose', role: 'analyst' }
                ];

                users.forEach(user => {
                    stmt.run(user.username, hash, user.role);
                });
                stmt.finalize();
                console.log('✅ Users seeded successfully.');
            } catch (e) {
                console.error('Seeding error:', e);
            }
        }
    });
}

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

module.exports = { db, run, get, all };
