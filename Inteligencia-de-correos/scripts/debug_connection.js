const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');

const LOG_FILE = 'connection_debug.log';

async function log(msg) {
    console.log(msg);
    fs.appendFileSync(LOG_FILE, msg + '\n');
}

async function testConnection(port, label) {
    await log(`probandoconexion puerto: ${port} (${label})...`);
    const pool = new Pool({
        host: process.env.DB_HOST,
        port: port,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
    });

    try {
        const client = await pool.connect();
        const res = await client.query('SELECT version()');
        await log(`[EXITO] Conectado en puerto ${port}: ${res.rows[0].version}`);
        client.release();
        await pool.end();
        return true;
    } catch (err) {
        await log(`[FALLO] Puerto ${port}: ${err.message}`);
        return false;
    }
}

(async () => {
    fs.writeFileSync(LOG_FILE, `--- TEST INICIADO ${new Date().toISOString()} ---\n`);
    await log(`HOST: ${process.env.DB_HOST}`);
    await log(`USER: ${process.env.DB_USER}`);

    // Test Port 6543 (Pooler)
    const poolerOk = await testConnection(6543, 'Pooler');

    // Test Port 5432 (Direct)
    const directOk = await testConnection(5432, 'Direct');

    if (!poolerOk && !directOk) {
        await log('\n[CONCLUSION] Ambas conexiones fallaron. Revisa Host o Password.');
    } else {
        await log('\n[CONCLUSION] Al menos una conexión funcionó. Configura .env con ese puerto.');
    }
})();
