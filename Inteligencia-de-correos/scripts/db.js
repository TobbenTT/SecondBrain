const { Pool } = require('pg');
require('dotenv').config();

/**
 * Módulo de conexión a Base de Datos (PostgreSQL)
 * Asegúrate de haber ejecutado database/schema.sql antes.
 */

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ...(process.env.DB_SSL === 'false' ? {} : { ssl: { rejectUnauthorized: false } })
});

async function guardarMetadatosReunion(reunion, datosIA) {
    const query = `
        INSERT INTO reuniones_analisis (
            titulo, 
            fecha, 
            transcripcion_raw,
            asistentes, 
            acuerdos, 
            puntos_clave, 
            compromisos, 
            entregables, 
            proxima_reunion
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id;
    `;

    const values = [
        reunion.title,
        reunion.date,
        reunion.fullText || null,
        JSON.stringify(datosIA.asistentes),
        JSON.stringify(datosIA.acuerdos),
        JSON.stringify([datosIA.resumen]),
        JSON.stringify(datosIA.compromisos),
        JSON.stringify(datosIA.entregables),
        datosIA.proxima_reunion
    ];

    try {
        const res = await pool.query(query, values);
        return res.rows[0].id;
    } catch (err) {
        console.error('[DB Error] Error al insertar datos:', err.message);
        throw err;
    }
}

async function obtenerCompromisosSemana() {
    const query = `
        SELECT * FROM reuniones_analisis 
        WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY fecha DESC;
    `;

    try {
        const res = await pool.query(query);
        return res.rows;
    } catch (err) {
        console.error('[DB Error] Error al consultar semana:', err.stack);
        throw err;
    }
}

module.exports = {
    pool,
    guardarMetadatosReunion,
    obtenerCompromisosSemana
};
