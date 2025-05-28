"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const database_1 = require("../config/database");
const addResetTokenToUsers = __importStar(require("../migrations/add-reset-token-to-users"));
const createNotificationsTable = __importStar(require("../migrations/create-notifications-table"));
const logger_1 = __importDefault(require("../utils/logger"));
// Array de migrações ordenadas (pulando a migração fix-updated-at que já foi aplicada)
const migrations = [
    { name: 'add-reset-token-to-users', migration: addResetTokenToUsers },
    { name: 'create-notifications-table', migration: createNotificationsTable }
];
function runMigrations() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Verifica conexão com o banco de dados
            yield database_1.sequelize.authenticate();
            logger_1.default.info('Database connection established successfully.');
            // Executa cada migração na ordem
            for (const { name, migration } of migrations) {
                try {
                    logger_1.default.info(`Running migration: ${name}`);
                    yield migration.up(database_1.sequelize.getQueryInterface());
                    logger_1.default.info(`Migration ${name} completed successfully.`);
                }
                catch (error) {
                    // Verificar se o erro é devido a uma coluna que já existe
                    if (error.parent && error.parent.code === '42701') {
                        logger_1.default.warn(`Column already exists in migration ${name}, skipping...`);
                        continue;
                    }
                    // Verificar se o erro é devido a uma tabela que já existe
                    if (error.parent && error.parent.code === '42P07') {
                        logger_1.default.warn(`Table already exists in migration ${name}, skipping...`);
                        continue;
                    }
                    logger_1.default.error(`Error running migration ${name}:`, error);
                    throw error;
                }
            }
            logger_1.default.info('All migrations completed successfully.');
            process.exit(0);
        }
        catch (error) {
            logger_1.default.error('Migration process failed:', error);
            process.exit(1);
        }
    });
}
// Executa o script
runMigrations();
