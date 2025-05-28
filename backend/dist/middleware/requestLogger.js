"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const requestLogger = (req, res, next) => {
    const start = Date.now();
    // Log request
    logger_1.default.info({
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });
    // Log request body if present and not a file upload
    if (req.body && Object.keys(req.body).length > 0 && !req.is('multipart/form-data')) {
        logger_1.default.debug('Request body:', req.body);
    }
    // Log response
    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusCode = res.statusCode;
        const statusMessage = res.statusMessage;
        const logMessage = `${req.method} ${req.originalUrl} ${statusCode} ${statusMessage} - ${duration}ms`;
        if (statusCode >= 500) {
            logger_1.default.error(logMessage);
        }
        else if (statusCode >= 400) {
            logger_1.default.warn(logMessage);
        }
        else {
            logger_1.default.info(logMessage);
        }
    });
    next();
};
exports.requestLogger = requestLogger;
