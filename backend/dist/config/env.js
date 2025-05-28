"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    API_URL: process.env.API_URL || 'http://localhost:3000',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
    DB_NAME: process.env.DB_NAME || 'postgres',
    DB_USER: process.env.DB_USER || 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD || 'root',
    JWT_SECRET: process.env.JWT_SECRET || 'your-jwt-secret',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-jwt-refresh-secret',
    JWT_ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION || '15m',
    JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || '7d',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    LOG_FILE_PATH: process.env.LOG_FILE_PATH || 'logs',
};
// Validate critical environment variables in production
if (env.NODE_ENV === 'production') {
    const requiredEnvVars = [
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
    ];
    for (const envVar of requiredEnvVars) {
        if (process.env[envVar] === undefined) {
            throw new Error(`Environment variable ${envVar} is required in production`);
        }
    }
}
exports.default = env;
