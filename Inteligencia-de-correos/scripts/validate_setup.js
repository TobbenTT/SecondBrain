const { Pool } = require('pg');
require('dotenv').config();
const http = require('http');

const COLORS = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m"
};

async function log(msg, color = COLORS.reset) {
    console.log(`${color}${msg}${COLORS.reset}`);
}

async function checkEnv() {
    await log('\n1. Verificando Variables de Entorno (.env)...', COLORS.blue);
    const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    const missing = required.filter(key => !process.env[key] || process.env[key].includes('ESCRIBE_AQUI'));

    if (missing.length > 0) {
        await log(`[FALLO] Faltan configurar: ${missing.join(', ')}`, COLORS.red);
        if (process.env.DB_PASSWORD && process.env.DB_PASSWORD.includes('ESCRIBE_AQUI')) {
            await log(`[CRITICO] Aún no has puesto tu contraseña real en DB_PASSWORD.`, COLORS.red);
        }
        return false;
    }
    await log('[OK] Variables de entorno completas.', COLORS.green);
    return true;
}

async function checkDatabase() {
    await log('\n2. Verificando Conexión a Supabase (SSL + Pooler)...', COLORS.blue);
    const pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
    });

    try {
        const client = await pool.connect();
        const res = await client.query('SELECT NOW() as time');
        await log(`[OK] Conectado exitosamente: ${res.rows[0].time}`, COLORS.green);
        client.release();
        await pool.end();
        return true;
    } catch (err) {
        await log(`[FALLO] Error de conexión: ${err.message}`, COLORS.red);
        if (err.message.includes('password')) {
            await log('-> Verifica que la contraseña en .env sea correcta.', COLORS.yellow);
        }
        return false;
    }
}

async function checkServer() {
    await log('\n3. Verificando Servidor Local (Puerto 3000)...', COLORS.blue);

    return new Promise((resolve) => {
        const req = http.request({
            host: 'localhost',
            port: 3000,
            path: '/webhook/fireflies',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, (res) => {
            if (res.statusCode === 200) {
                log('[OK] El servidor responde correctamente.', COLORS.green);
                resolve(true);
            } else {
                log(`[ADVERTENCIA] El servidor respondió con estado: ${res.statusCode}`, COLORS.yellow);
                resolve(true);
            }
        });

        req.on('error', (e) => {
            log(`[FALLO] El servidor NO está corriendo: ${e.message}`, COLORS.red);
            log('-> Ejecuta "node server.js" en otra terminal.', COLORS.yellow);
            resolve(false);
        });

        req.write(JSON.stringify({ event: 'test_health_check' }));
        req.end();
    });
}

(async () => {
    await log('--- INICIANDO VALIDACIÓN DE SISTEMA ---', COLORS.blue);

    if (!await checkEnv()) return;
    const dbOk = await checkDatabase();

    // Solo verificamos servidor si la DB está OK, ya que server.js falla al inicio si no hay DB
    if (dbOk) {
        await checkServer();
    }

    await log('\n--- FIN DE DIAGNÓSTICO ---', COLORS.blue);
    process.exit(0);
})();
