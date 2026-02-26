const log = require('../helpers/logger');

let transporter = null;

function isConfigured() {
    return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
    if (transporter) return transporter;
    if (!isConfigured()) return null;
    try {
        const nodemailer = require('nodemailer');
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        log.info('SMTP transport configured', { host: process.env.SMTP_HOST });
        return transporter;
    } catch (err) {
        log.error('SMTP setup error', { error: err.message });
        return null;
    }
}

async function sendDigestEmail(to, subject, htmlContent) {
    const t = getTransporter();
    if (!t) return false;
    try {
        await t.sendMail({
            from: process.env.SMTP_FROM || `"VSC Hub" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html: htmlContent
        });
        return true;
    } catch (err) {
        log.error('Email send error', { to, error: err.message });
        return false;
    }
}

module.exports = { isConfigured, sendDigestEmail };
