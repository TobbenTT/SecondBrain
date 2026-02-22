/**
 * Custom error class for operational errors.
 * Allows centralized error handler to distinguish expected vs unexpected errors.
 */
class AppError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message, code = 'BAD_REQUEST') {
        return new AppError(message, 400, code);
    }

    static unauthorized(message = 'Authentication required', code = 'UNAUTHORIZED') {
        return new AppError(message, 401, code);
    }

    static forbidden(message = 'Forbidden', code = 'FORBIDDEN') {
        return new AppError(message, 403, code);
    }

    static notFound(message = 'Resource not found', code = 'NOT_FOUND') {
        return new AppError(message, 404, code);
    }

    static conflict(message, code = 'CONFLICT') {
        return new AppError(message, 409, code);
    }

    static tooMany(message = 'Too many requests', code = 'RATE_LIMITED') {
        return new AppError(message, 429, code);
    }
}

module.exports = AppError;
