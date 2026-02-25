/**
 * email_sender.js - Envío de reportes por correo electrónico
 */

require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Cargar template HTML (lazy, con fallback si el archivo no existe)
const TEMPLATE_PATH = path.join(__dirname, '..', 'templates', 'daily_email.html');
let _templateHTML = null;
function getTemplate() {
    if (!_templateHTML) {
        try {
            _templateHTML = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
        } catch (err) {
            console.error('[EMAIL] Template no encontrado:', TEMPLATE_PATH, err.message);
            _templateHTML = '<html><body><h1>{{titulo}}</h1><p>{{resumen}}</p></body></html>';
        }
    }
    return _templateHTML;
}

/**
 * Crea el transporter SMTP
 */
function crearTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false, // true para 465, false para otros puertos
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
}

/**
 * Genera el HTML del email a partir de los datos
 */
function generarHTML(reunion, datosIA) {
    let html = getTemplate();

    // Reemplazos simples (sin Handlebars, implementación directa)
    html = html.replace('{{titulo}}', reunion.title || 'Reunión sin título');
    html = html.replace('{{fecha}}', formatearFecha(reunion.date));
    html = html.replace('{{resumen}}', datosIA.resumen || 'Sin resumen disponible');

    // Asistentes
    const asistentesTexto = (datosIA.asistentes || []).join(', ') || 'No identificados';
    html = html.replace(/{{#join asistentes ", "}}{{this}}{{\/join}}/g, asistentesTexto);

    // Acuerdos
    if (datosIA.acuerdos && datosIA.acuerdos.length > 0) {
        const acuerdosHTML = datosIA.acuerdos
            .map(a => `<li>✅ ${a}</li>`)
            .join('\n                ');
        // Reemplazar el bloque condicional completo
        html = html.replace(
            /{{#if acuerdos\.length}}([\s\S]*?){{\/if}}/,
            `<div class="section">
            <span class="section-title">Acuerdos & Decisiones</span>
            <ul>
                ${acuerdosHTML}
            </ul>
        </div>`
        );
    } else {
        html = html.replace(/{{#if acuerdos\.length}}[\s\S]*?{{\/if}}/, '');
    }

    // Compromisos
    if (datosIA.compromisos && datosIA.compromisos.length > 0) {
        const compromisosHTML = datosIA.compromisos
            .map(c => `
            <div class="commitment-card">
                <span class="priority">${c.prioridad || 'Media'}</span>
                <span class="owner">${c.quien || 'Sin asignar'}</span>: ${c.tarea || 'Sin descripción'}
                <br>
                <span class="date">📅 Límite: ${c.cuando || 'Por definir'}</span>
            </div>`)
            .join('\n');
        html = html.replace(
            /{{#each compromisos}}[\s\S]*?{{\/each}}/,
            compromisosHTML
        );
    } else {
        html = html.replace(
            /{{#each compromisos}}[\s\S]*?{{\/each}}/,
            '<p style="color:#999;">No se registraron compromisos en esta reunión.</p>'
        );
    }

    // Próxima reunión
    if (datosIA.proxima_reunion) {
        html = html.replace(
            /{{#if proxima_reunion}}([\s\S]*?){{\/if}}/,
            `<div class="section">
            <span class="section-title">Próxima Reunión</span>
            <p>Programada para el <strong>${datosIA.proxima_reunion}</strong></p>
        </div>`
        );
    } else {
        html = html.replace(/{{#if proxima_reunion}}[\s\S]*?{{\/if}}/, '');
    }

    return html;
}

/**
 * Envía el reporte por correo
 */
async function enviarReporte(reunion, datosIA, destinatarios) {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    // Validar que las credenciales SMTP estén configuradas
    if (!smtpUser || smtpUser === 'tu_correo@gmail.com' ||
        !smtpPass || smtpPass === 'tu_password_de_aplicacion') {
        console.log('[EMAIL] ⚠️ Credenciales SMTP no configuradas. Saltando envío de correo.');
        console.log('[EMAIL] Para activar: configura SMTP_USER y SMTP_PASS en .env');

        // Guardar el HTML localmente como respaldo
        const htmlContent = generarHTML(reunion, datosIA);
        const reportPath = path.join(__dirname, '..', 'repositorio_reuniones',
            `reporte_${sanitizar(reunion.title)}.html`);
        fs.writeFileSync(reportPath, htmlContent, 'utf-8');
        console.log(`[EMAIL] Reporte HTML guardado localmente: ${reportPath}`);

        return { sent: false, savedLocally: true, path: reportPath };
    }

    try {
        const transporter = crearTransporter();
        const htmlContent = generarHTML(reunion, datosIA);

        // Lista de destinatarios
        const to = destinatarios || process.env.EMAIL_TO || smtpUser;

        const mailOptions = {
            from: `"Reporte Reuniones IA" <${process.env.EMAIL_FROM || smtpUser}>`,
            to: to,
            subject: `📋 Reporte: ${reunion.title} - ${formatearFecha(reunion.date)}`,
            html: htmlContent
        };

        console.log(`[EMAIL] Enviando reporte a: ${to}`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] ✅ Correo enviado exitosamente. ID: ${info.messageId}`);

        return { sent: true, messageId: info.messageId };

    } catch (error) {
        console.error(`[EMAIL] ❌ Error al enviar correo: ${error.message}`);

        // Guardar localmente si falla el envío
        const htmlContent = generarHTML(reunion, datosIA);
        const reportPath = path.join(__dirname, '..', 'repositorio_reuniones',
            `reporte_${sanitizar(reunion.title)}.html`);
        fs.writeFileSync(reportPath, htmlContent, 'utf-8');
        console.log(`[EMAIL] Reporte guardado localmente como respaldo: ${reportPath}`);

        return { sent: false, error: error.message, savedLocally: true, path: reportPath };
    }
}

/**
 * Helpers
 */
function formatearFecha(fecha) {
    try {
        const d = new Date(fecha);
        return d.toLocaleDateString('es-ES', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    } catch {
        return fecha || 'Fecha no disponible';
    }
}

function sanitizar(texto) {
    return (texto || 'sin-titulo')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .substring(0, 50);
}

module.exports = { enviarReporte, generarHTML };
