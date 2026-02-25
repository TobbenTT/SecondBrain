const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const cron = require('node-cron');
const { procesarReunionDiaria } = require('./scripts/main_orchestrator');
const { enviarReporteSemanal } = require('./scripts/weekly_sender');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware para parsear JSON
app.use(bodyParser.json());

// Logger de Depuración: Ver TODAS las peticiones entrantes con su body
app.use((req, res, next) => {
    console.log(`\n[DEBUG] ${new Date().toISOString()} - ${req.method} ${req.url}`);
    if (req.method === 'POST') {
        console.log('[DEBUG] Body recibido:', JSON.stringify(req.body, null, 2));
    }
    next();
});

/**
 * Obtener transcripción completa desde Fireflies GraphQL API
 */
async function obtenerTranscripcionFireflies(meetingId) {
    const FIREFLIES_API_KEY = process.env.FIREFLIES_API_KEY;

    if (!FIREFLIES_API_KEY) {
        console.log('[AVISO] No hay FIREFLIES_API_KEY. Usando meetingId como referencia.');
        return null;
    }

    const query = `
        query Transcript($transcriptId: String!) {
            transcript(id: $transcriptId) {
                id
                title
                date
                duration
                transcript_url
                participants
                sentences {
                    text
                    speaker_name
                }
                summary {
                    overview
                    action_items
                    shorthand_bullet
                }
            }
        }
    `;

    try {
        const response = await fetch('https://api.fireflies.ai/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${FIREFLIES_API_KEY}`
            },
            body: JSON.stringify({
                query,
                variables: { transcriptId: meetingId }
            })
        });

        const result = await response.json();

        if (result.errors) {
            console.error('[Fireflies API] Error:', result.errors);
            return null;
        }

        const t = result.data.transcript;

        // --- CAPA 1: Transcripción limpia (solo texto) ---
        let fullText = '';
        const speakersDetectados = [];
        if (t.sentences) {
            const speakers = [...new Set(
                t.sentences
                    .map(s => s.speaker_name)
                    .filter(name => name && name !== 'null')
            )];
            speakersDetectados.push(...speakers);

            fullText = t.sentences.map(s => {
                const speaker = (s.speaker_name && s.speaker_name !== 'null')
                    ? s.speaker_name
                    : '';
                return speaker ? `${speaker}: ${s.text}` : s.text;
            }).join('\n');

            console.log(`[Fireflies] Speakers en transcripción: ${speakers.length > 0 ? speakers.join(', ') : 'Ninguno identificado'}`);
        }

        // --- CAPA 2: Metadata estructurada de Fireflies (SEPARADA del texto) ---
        const firefliesMetadata = {
            participants: t.participants || [],
            speakers: speakersDetectados,
            overview: (t.summary && t.summary.overview) || null,
            action_items: (t.summary && t.summary.action_items) || null,
            shorthand_bullet: (t.summary && t.summary.shorthand_bullet) || null
        };

        const hasMetadata = firefliesMetadata.overview || firefliesMetadata.action_items || firefliesMetadata.participants.length > 0;
        console.log(`[Fireflies] Metadata disponible: ${hasMetadata ? 'SÍ' : 'NO'}`);
        if (firefliesMetadata.overview) console.log(`[Fireflies]   Overview: ${firefliesMetadata.overview.substring(0, 100)}...`);
        if (firefliesMetadata.participants.length > 0) console.log(`[Fireflies]   Participants: ${firefliesMetadata.participants.join(', ')}`);

        return {
            id: t.id,
            title: t.title,
            date: t.date ? new Date(parseInt(t.date)).toISOString() : new Date().toISOString(),
            fullText: fullText,           // Solo transcripción limpia
            fireflies: firefliesMetadata  // Metadata estructurada aparte
        };
    } catch (error) {
        console.error('[Fireflies API] Error de conexión:', error.message);
        return null;
    }
}

/**
 * EndPoint para recibir Webhooks de Fireflies.ai
 * 
 * FORMATO REAL del webhook de Fireflies:
 * {
 *   "meetingId": "abc123",
 *   "eventType": "TranscriptionCompleted",
 *   "clientReferenceId": "optional"
 * }
 */
app.post('/webhook/fireflies', async (req, res) => {
    console.log('--- Nueva Notificación Recibida de Fireflies ---');

    const payload = req.body;

    // Detectar el tipo de evento (formato REAL de Fireflies)
    const isTranscriptionEvent =
        payload.eventType === 'TranscriptionCompleted' ||
        payload.event === 'TranscriptionCompleted' ||
        payload.event === 'transcript_ready' ||
        payload.meetingId; // Si tiene meetingId, es de Fireflies

    if (isTranscriptionEvent) {
        // Responder inmediatamente (Fireflies espera respuesta rápida)
        res.status(200).send('Recibido y procesando');

        try {
            const meetingId = payload.meetingId ||
                (payload.data && payload.data.id) ||
                Date.now().toString();

            console.log(`[INFO] Procesando reunión con ID: ${meetingId}`);

            // Intentar obtener transcripción real de Fireflies API
            let reunion = await obtenerTranscripcionFireflies(meetingId);

            if (!reunion) {
                // Fallback: usar datos del payload directamente (para pruebas manuales)
                reunion = {
                    id: meetingId,
                    title: (payload.data && payload.data.title) || `Reunión ${meetingId}`,
                    date: (payload.data && payload.data.date) || new Date().toISOString(),
                    fullText: (payload.data && (payload.data.transcript || payload.data.text)) ||
                        `Transcripción pendiente - ID: ${meetingId}`,
                    fireflies: { participants: [], speakers: [], overview: null, action_items: null, shorthand_bullet: null }
                };
                console.log('[INFO] Usando datos del payload (sin API key o API no disponible)');
            }

            // Disparar procesamiento
            procesarReunionDiaria(reunion).catch(err =>
                console.error('[ERROR] Error en proceso:', err)
            );

        } catch (error) {
            console.error('[ERROR] Error al procesar webhook:', error);
        }
        return; // Ya enviamos respuesta arriba
    }

    console.log(`[AVISO] Evento no reconocido: ${JSON.stringify(payload)}`);
    res.status(200).send('Evento ignorado');
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Sync all meetings from Supabase to Dashboard SQLite
app.post('/sync-to-dashboard', async (req, res) => {
    const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:3000';
    const apiKey = process.env.DASHBOARD_API_KEY;

    if (!apiKey) {
        return res.status(400).json({ error: 'DASHBOARD_API_KEY not configured' });
    }

    try {
        const { pool } = require('./scripts/db');
        const result = await pool.query(
            'SELECT * FROM reuniones_analisis ORDER BY fecha DESC'
        );

        let synced = 0, skipped = 0, failed = 0;

        for (const row of result.rows) {
            const payload = {
                external_id: String(row.id),
                titulo: row.titulo,
                fecha: row.fecha,
                transcripcion_raw: row.transcripcion_raw || null,
                asistentes: typeof row.asistentes === 'string' ? JSON.parse(row.asistentes) : (row.asistentes || []),
                acuerdos: typeof row.acuerdos === 'string' ? JSON.parse(row.acuerdos) : (row.acuerdos || []),
                puntos_clave: typeof row.puntos_clave === 'string' ? JSON.parse(row.puntos_clave) : (row.puntos_clave || []),
                compromisos: typeof row.compromisos === 'string' ? JSON.parse(row.compromisos) : (row.compromisos || []),
                entregables: typeof row.entregables === 'string' ? JSON.parse(row.entregables) : (row.entregables || []),
                proxima_reunion: row.proxima_reunion || null,
                nivel_analisis: row.nivel_analisis || null
            };

            try {
                const resp = await fetch(`${dashboardUrl}/api/webhook/reuniones`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
                    body: JSON.stringify(payload),
                    signal: AbortSignal.timeout(10000)
                });
                const data = await resp.json();
                if (data.message === 'Already exists') skipped++;
                else if (data.success) synced++;
                else failed++;
            } catch (err) {
                console.error(`[SYNC] Failed for ID ${row.id}: ${err.message}`);
                failed++;
            }
        }

        console.log(`[SYNC] Done: ${synced} synced, ${skipped} already existed, ${failed} failed (total: ${result.rows.length})`);
        res.json({ success: true, total: result.rows.length, synced, skipped, failed });
    } catch (err) {
        console.error('[SYNC] Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Tarea Programada: Envío Semanal todos los viernes a las 12:00 PM (hora servidor local)
// Sintaxis cron: 'minuto hora dia mes dia_semana' -> '0 12 * * 5'
cron.schedule('0 12 * * 5', () => {
    console.log('[CRON] Ejecutando tarea programada: Envío Semanal de Compromisos (Viernes 12:00)');
    enviarReporteSemanal().catch(e => console.error('[CRON] Error en la tarea semanal:', e));
}, {
    timezone: "America/Santiago" // Ajustar timezone según ubicación de tu servidor (ej. America/Santiago)
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor de Webhooks operativo en puerto ${PORT}`);
    console.log(`URL de Webhook local: http://localhost:${PORT}/webhook/fireflies`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`📅 Tarea automatizada activa: 'Reporte Semanal' configurado para los viernes a las 12:00 PM.`);
    console.log(`Esperando notificaciones de Fireflies...`);
});
