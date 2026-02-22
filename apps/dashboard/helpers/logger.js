/**
 * Structured logging with winston.
 * Usage:  const log = require('./helpers/logger');
 *         log.info('Server started', { port: 3000 });
 */
const { createLogger, format, transports } = require('winston');
const path = require('path');

const NODE_ENV = process.env.NODE_ENV || 'development';
const LOG_DIR = path.join(__dirname, '..', 'logs');

const logger = createLogger({
    level: NODE_ENV === 'production' ? 'info' : 'debug',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.json()
    ),
    defaultMeta: { service: 'secondbrain-dashboard' },
    transports: [
        new transports.File({
            filename: path.join(LOG_DIR, 'error.log'),
            level: 'error',
            maxsize: 5 * 1024 * 1024,
            maxFiles: 5,
        }),
        new transports.File({
            filename: path.join(LOG_DIR, 'combined.log'),
            maxsize: 10 * 1024 * 1024,
            maxFiles: 5,
        }),
    ],
});

// In non-production, also log to console with color
if (NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.printf(({ timestamp, level, message, _service, ...meta }) => {
                const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
                return `${timestamp} [${level}] ${message}${extra}`;
            })
        ),
    }));
} else {
    // Production still needs console for Docker/k8s log drivers
    logger.add(new transports.Console({
        format: format.combine(format.timestamp(), format.json()),
    }));
}

module.exports = logger;
