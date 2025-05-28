"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const errorHandler = (err, req, res, next) => {
    // Log error
    console.error('Error:', {
        name: err.name,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
    // Handle ValidationError
    if (err instanceof errors_1.ValidationError) {
        res.status(400).json({
            status: 'error',
            message: err.message,
            errors: err.errors,
        });
        return;
    }
    // Handle known operational errors
    if (err instanceof errors_1.AppError) {
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
        });
        return;
    }
    // Handle Sequelize validation errors
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        res.status(400).json({
            status: 'error',
            message: 'Validation error',
            errors: err.errors.map((e) => ({
                field: e.path,
                message: e.message,
            })),
        });
        return;
    }
    // If error is not operational (i.e., programming error), send generic error message
    if (!(0, errors_1.isOperationalError)(err)) {
        // Log the error for debugging
        console.error('Programming error:', err);
        // Send generic error message in production
        res.status(500).json({
            status: 'error',
            message: process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : err.message,
        });
        return;
    }
    // Handle all other errors
    res.status(500).json({
        status: 'error',
        message: err.message,
    });
};
exports.errorHandler = errorHandler;
