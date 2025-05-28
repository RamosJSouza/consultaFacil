"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const database_1 = require("./config/database");
const auth_1 = __importDefault(require("./routes/auth"));
const appointments_1 = __importDefault(require("./routes/appointments"));
const users_1 = __importDefault(require("./routes/users"));
const rules_1 = __importDefault(require("./routes/rules"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const rateLimit_1 = require("./middleware/rateLimit");
const errorHandler_1 = require("./middleware/errorHandler");
const errors_1 = require("./utils/errors");
const env_1 = __importDefault(require("./config/env"));
const logger_1 = __importDefault(require("./utils/logger"));
const requestLogger_1 = require("./middleware/requestLogger");
const notFound_1 = require("./middleware/notFound");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = env_1.default.PORT || 3000;
// Middleware
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
app.use(requestLogger_1.requestLogger);
// Rate limiting
app.use('/api/', rateLimit_1.apiLimiter);
app.use('/api/auth', rateLimit_1.authLimiter);
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/appointments', appointments_1.default);
app.use('/api/users', users_1.default);
app.use('/api/rules', rules_1.default);
app.use('/api/notifications', notifications_1.default);
// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ConsultaFácil API',
            version: '1.0.0',
            description: 'API documentation for ConsultaFácil appointment scheduling system',
        },
        servers: [
            {
                url: env_1.default.API_URL || `http://localhost:${port}`,
                description: env_1.default.NODE_ENV === 'production' ? 'Production server' : 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT token obtido do endpoint /api/auth/login. Use o token retornado no campo "accessToken" da resposta.'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        email: { type: 'string' },
                        name: { type: 'string' },
                        role: { type: 'string', enum: ['client', 'professional', 'superadmin'] },
                        specialty: { type: 'string', nullable: true },
                        licenseNumber: { type: 'string', nullable: true },
                        isActive: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Appointment: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        title: { type: 'string' },
                        description: { type: 'string', nullable: true },
                        date: { type: 'string', format: 'date' },
                        startTime: { type: 'string', format: 'time' },
                        endTime: { type: 'string', format: 'time' },
                        status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled'] },
                        clientId: { type: 'integer' },
                        professionalId: { type: 'integer' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Notification: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        userId: { type: 'integer' },
                        message: { type: 'string' },
                        isRead: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Rule: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        ruleName: { type: 'string' },
                        ruleValue: { type: 'object' },
                        createdBy: { type: 'integer' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        statusCode: { type: 'integer' }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.ts'],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
// Error handling
app.use(notFound_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
// Database connection and server start
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.sequelize.authenticate();
        logger_1.default.info('Database connection established successfully.');
        if (env_1.default.NODE_ENV !== 'production') {
            yield database_1.sequelize.sync({ alter: true });
            logger_1.default.info('Database models synchronized.');
        }
        app.listen(port, () => {
            logger_1.default.info(`Server is running on port ${port}`);
            logger_1.default.info(`Environment: ${env_1.default.NODE_ENV || 'development'}`);
            logger_1.default.info(`API Documentation: ${env_1.default.API_URL}/api-docs`);
        });
    }
    catch (error) {
        logger_1.default.error('Unable to start the server:', error);
        throw new errors_1.DatabaseError('Failed to initialize database connection');
    }
});
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger_1.default.error('Uncaught Exception:', error);
    process.exit(1);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    logger_1.default.error('Unhandled Rejection:', error);
    process.exit(1);
});
if (require.main === module) {
    startServer();
}
exports.default = app;
