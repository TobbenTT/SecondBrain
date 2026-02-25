/**
 * weekly_sender.js - Orquesta el envío del reporte semanal de compromisos
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { obtenerCompromisosSemana } = require('./db');
const nodemailer = require('nodemailer');

const TEMPLATE_PATH = path.join(__dirname, '..', 'templates', 'weekly_email.html');
let _weeklyTemplate = null;
function getWeeklyTemplate() {
    if (!_weeklyTemplate) {
        try {
            _weeklyTemplate = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
        } catch (err) {
            console.error('[WEEKLY] Template no encontrado:', TEMPLATE_PATH, err.message);
            _weeklyTemplate = '<html><body><h1>Reporte Semanal</h1><p>{{bloque_reuniones}}</p></body></html>';
        }
    }
    return _weeklyTemplate;
}

function crearTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
}

function generarHTMLSemanal(reuniones) {
    let html = getWeeklyTemplate();

    // Calcular fechas
    const hoy = new Date();
    const hace7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);

    html = html.replace('{{inicio_semana}}', hace7Dias.toLocaleDateString('es-ES'));
    html = html.replace('{{fin_semana}}', hoy.toLocaleDateString('es-ES'));

    html = html.replace('{{total_reuniones}}', reuniones.length.toString());

    let compromisosTotales = 0;
    let bloquesReunionesHTML = '';

    reuniones.forEach(r => {
        let compromisos = [];
        try { compromisos = typeof r.compromisos === 'string' ? JSON.parse(r.compromisos) : (r.compromisos || []); }
        catch (e) { compromisos = []; }

        // Extraer resumen/puntos clave
        let resumen = '';
        try {
            const puntos = typeof r.puntos_clave === 'string' ? JSON.parse(r.puntos_clave) : (r.puntos_clave || []);
            if (Array.isArray(puntos) && puntos.length > 0) {
                resumen = puntos[0];
            } else if (typeof puntos === 'string') {
                resumen = puntos;
            }
            // Evitar objetos en crudo si el parsing falló parcialmente
            if (typeof resumen !== 'string') resumen = '';
        } catch (e) {
            resumen = '';
        }

        // Si la reunión no tiene compromisos ni resumen, la saltamos
        if (compromisos.length > 0 || resumen) {
            compromisosTotales += compromisos.length;
            const fechaStr = new Date(r.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });

            let itemsCompromisos = '';
            if (compromisos.length > 0) {
                itemsCompromisos = compromisos.map(c => `
                    <div class="commitment-card">
                        <span class="priority-${c.prioridad || 'Media'}">[${c.prioridad || 'Media'}]</span>
                        <span class="owner">${c.quien || 'Sin asigar'}</span>: ${c.tarea}
                        <br><span style="font-size:12px; color:#5e6c84">📅 Vence: ${c.cuando || 'Por definir'}</span>
                    </div>
                `).join('');
            } else {
                itemsCompromisos = '<p style="font-size:13px; color:#999; margin-top:8px;"><em>Solo registro informativo. No hubo compromisos dictados.</em></p>';
            }

            bloquesReunionesHTML += `
                <div class="meeting-block">
                    <div class="meeting-header">
                        <h4 class="meeting-title">${r.titulo}</h4>
                        <span class="meeting-date">${fechaStr}</span>
                    </div>
                    ${resumen ? `<p class="meeting-summary">${resumen}</p>` : ''}
                    ${itemsCompromisos}
                </div>
            `;
        }
    });

    if (compromisosTotales === 0) {
        bloquesReunionesHTML = '<p style="text-align:center; padding: 20px; color:#666;">No se registraron compromisos nuevos esta semana. ¡Buen trabajo de equipo!</p>';
    }

    html = html.replace('{{total_compromisos}}', compromisosTotales.toString());
    html = html.replace('{{bloque_reuniones}}', bloquesReunionesHTML);

    return html;
}

async function enviarReporteSemanal(destinatarios) {
    console.log(`\n======================================================`);
    console.log(`[${new Date().toISOString()}] GENERANDO REPORTE SEMANAL`);
    console.log(`======================================================`);

    try {
        const bd_reuniones = await obtenerCompromisosSemana();
        console.log(`📊 Se encontraron ${bd_reuniones.length} reuniones en los últimos 7 días.`);

        const htmlContent = generarHTMLSemanal(bd_reuniones);
        const transporter = crearTransporter();
        const to = destinatarios || process.env.EMAIL_TO || process.env.SMTP_USER;

        const mailOptions = {
            from: `"Reporte Global IA" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
            to: to,
            subject: `📆 Resumen Semanal de Compromisos Operativos`,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Reporte Semanal enviado exitosamente a ${to}. ID: ${info.messageId}\n`);
        return true;

    } catch (error) {
        console.error(`❌ Error al crear o enviar el reporte semanal:`, error);
        return false;
    }
}

// Permitir ejecución manual directo desde consola (node weekly_sender.js)
if (require.main === module) {
    enviarReporteSemanal().then(() => process.exit(0));
}

module.exports = { enviarReporteSemanal, generarHTMLSemanal };
