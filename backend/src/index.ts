import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { sequelize } from './config/database';
import authRoutes from './routes/auth';
import appointmentRoutes from './routes/appointments';
import userRoutes from './routes/users';
import rulesRoutes from './routes/rules';
import notificationRoutes from './routes/notifications';
import availabilityRoutes from './routes/availability';
import linkRoutes from './routes/links';
import { basicLimiter, authLimiter, apiLimiter } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';
import { DatabaseError } from './utils/errors';
import env from './config/env';
import logger from './utils/logger';
import { requestLogger } from './middleware/requestLogger';
import { notFoundHandler } from './middleware/notFound';
import { rateLimit } from 'express-rate-limit';

// Importar modelos com associações configuradas
import './models';

const app = express();
const port = env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(requestLogger);

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rules', rulesRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/links', linkRoutes);

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
        url: env.API_URL || `http://localhost:${port}`,
        description: env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
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
        Availability: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            professionalId: { type: 'integer' },
            dayOfWeek: { type: 'integer', minimum: 0, maximum: 6 },
            startTime: { type: 'string', format: 'time' },
            endTime: { type: 'string', format: 'time' },
            isAvailable: { type: 'boolean' },
            isRecurring: { type: 'boolean' },
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

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
    
    if (env.NODE_ENV !== 'production') {
      try {
        await sequelize.sync({ alter: true });
        logger.info('Database models synchronized.');
      } catch (syncError) {
        logger.error('Error synchronizing models:', syncError);
        // Continue running the server even if sync fails
      }
    }

    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
      logger.info(`Environment: ${env.NODE_ENV || 'development'}`);
      logger.info(`API Documentation: ${env.API_URL}/api-docs`);
    });
  } catch (error) {
    logger.error('Unable to start the server:', error);
    throw new DatabaseError('Failed to initialize database connection');
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

if (require.main === module) {
  startServer();
}

export default app;
