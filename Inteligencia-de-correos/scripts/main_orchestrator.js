/**
 * main_orchestrator.js - Versión PRODUCTIVA
 * Flujo: Webhook → Análisis IA (3 niveles) → Base de Datos → Email → Dashboard
 */

require('dotenv').config();
const { guardarArchivoReunion } = require('./storage_handler');
const { guardarMetadatosReunion, obtenerCompromisosSemana } = require('./db');
const { analizarConIA } = require('./ai_analyzer');
const { enviarReporte } = require('./email_sender');
const fs = require('fs');
const path = require('path');

/**
 * Obtiene la lista de destinatarios de email desde el Dashboard.
 * Fallback: usa EMAIL_TO del .env si el dashboard no responde.
 */
async function obtenerDestinatarios() {
    const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:3000';
    const apiKey = process.env.DASHBOARD_API_KEY;

    if (!apiKey) {
        console.log('[EMAIL] Sin DASHBOARD_API_KEY — usando EMAIL_TO del .env');
        return null;
    }

    try {
        const response = await fetch(`${dashboardUrl}/api/reuniones/email-recipients`, {
            headers: { 'X-API-Key': apiKey },
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            console.warn(`[EMAIL] Dashboard respondio ${response.status} — usando EMAIL_TO del .env`);
            return null;
        }

        const data = await response.json();
        const emails = (data.recipients || []).map(r => r.email).filter(Boolean);

        if (emails.length === 0) {
            console.log('[EMAIL] Dashboard no tiene destinatarios configurados — usando EMAIL_TO del .env');
            return null;
        }

        console.log(`[EMAIL] ${emails.length} destinatario(s) desde Dashboard: ${emails.join(', ')}`);
        return emails.join(', ');
    } catch (err) {
        console.warn(`[EMAIL] Error al consultar destinatarios (no-fatal): ${err.message}`);
        return null;
    }
}

/**
 * Notifica al Dashboard SecondBrain con los datos de la reunión.
 * No-fatal: si falla, solo loguea warning.
 */
async function notificarDashboard(reunion, datosIA, supabaseId) {
    const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:3000';
    const apiKey = process.env.DASHBOARD_API_KEY;

    if (!apiKey) {
        console.log('[DASHBOARD] No DASHBOARD_API_KEY configurada. Saltando notificación.');
        return { sent: false, reason: 'no_api_key' };
    }

    try {
        const payload = {
            external_id: String(supabaseId),
            titulo: reunion.title,
            fecha: reunion.date,
            transcripcion_raw: reunion.fullText || null,
            asistentes: datosIA.asistentes,
            acuerdos: datosIA.acuerdos,
            puntos_clave: [datosIA.resumen],
            compromisos: datosIA.compromisos,
            entregables: datosIA.entregables,
            proxima_reunion: datosIA.proxima_reunion,
            nivel_analisis: datosIA._nivel || null
        };

        const response = await fetch(`${dashboardUrl}/api/webhook/reuniones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(10000)
        });

        if (!response.ok) {
            const text = await response.text();
            console.warn(`[DASHBOARD] Error ${response.status}: ${text.substring(0, 200)}`);
            return { sent: false, error: `HTTP ${response.status}` };
        }

        const result = await response.json();
        console.log(`[DASHBOARD] Notificación enviada: ${JSON.stringify(result)}`);
        return { sent: true, result };
    } catch (err) {
        console.warn(`[DASHBOARD] Error al notificar (no-fatal): ${err.message}`);
        return { sent: false, error: err.message };
    }
}

/**
 * Procesa una reunión en tiempo real recibida por Webhook
 */
async function procesarReunionDiaria(reunion) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`[${new Date().toISOString()}] PROCESANDO: ${reunion.title}`);
    console.log(`${'='.repeat(60)}`);

    try {
        // 1. Almacenamiento Local (Backup .txt)
        console.log('\n[PASO 1/5] Guardando backup local...');
        guardarArchivoReunion(reunion);
        console.log('[PASO 1/5] Backup local guardado.');

        // 2. Análisis con IA (3 niveles: Gemini → Fireflies metadata → Mínimo)
        console.log('\n[PASO 2/5] Analizando con Inteligencia Artificial...');
        const datosExtraidos = await analizarConIA(reunion);  // Pasa objeto COMPLETO
        console.log('[PASO 2/5] Análisis completado.');
        console.log(`   Nivel: ${datosExtraidos._nivel || 'desconocido'}`);
        console.log(`   Asistentes: ${datosExtraidos.asistentes.join(', ')}`);
        console.log(`   Resumen: ${datosExtraidos.resumen.substring(0, 120)}...`);
        console.log(`   Acuerdos: ${datosExtraidos.acuerdos.length}`);
        console.log(`   Compromisos: ${datosExtraidos.compromisos.length}`);

        // 3. Guardar en Base de Datos (Supabase)
        console.log('\n[PASO 3/5] Guardando en Supabase...');
        const recordId = await guardarMetadatosReunion(reunion, datosExtraidos);
        console.log(`[PASO 3/5] Registro guardado en BD con ID: ${recordId}`);

        // 4. Enviar Reporte por Email (destinatarios desde Dashboard o .env)
        console.log('\n[PASO 4/5] Obteniendo destinatarios y enviando reporte...');
        const destinatarios = await obtenerDestinatarios();
        const emailResult = await enviarReporte(reunion, datosExtraidos, destinatarios);
        if (emailResult.sent) {
            console.log(`[PASO 4/5] Correo enviado. ID: ${emailResult.messageId}`);
        } else if (emailResult.savedLocally) {
            console.log(`[PASO 4/5] Correo no enviado (SMTP). Reporte en: ${emailResult.path}`);
        }

        // 5. Notificar al Dashboard SecondBrain (mirror SQLite + notificaciones)
        console.log('\n[PASO 5/5] Notificando al Dashboard SecondBrain...');
        const dashResult = await notificarDashboard(reunion, datosExtraidos, recordId);
        if (dashResult.sent) {
            console.log('[PASO 5/5] Dashboard notificado.');
        } else {
            console.log(`[PASO 5/5] Dashboard no notificado: ${dashResult.reason || dashResult.error || 'desconocido'}`);
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log(`[EXITO] Flujo completado para ID: ${reunion.id}`);
        console.log(`${'='.repeat(60)}\n`);

        return { success: true, id: recordId, email: emailResult, dashboard: dashResult };
    } catch (error) {
        console.error(`\n[CRITICO] Error en el flujo diario:`, error.message);
        throw error;
    }
}

module.exports = { procesarReunionDiaria };
