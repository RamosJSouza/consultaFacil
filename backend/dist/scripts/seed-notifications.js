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
const database_1 = require("../config/database");
const User_1 = __importDefault(require("../models/User"));
const Notification_1 = __importDefault(require("../models/Notification"));
const logger_1 = __importDefault(require("../utils/logger"));
const types_1 = require("../types");
function seedNotifications() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Verificar conexão com o banco de dados
            yield database_1.sequelize.authenticate();
            logger_1.default.info('Database connection established successfully.');
            // Encontrar usuários existentes para criar notificações
            const users = yield User_1.default.findAll({
                where: {
                    isActive: true
                },
                limit: 5 // Limitar para não criar muitos dados de teste
            });
            if (users.length === 0) {
                logger_1.default.info('No active users found. Creating a test user...');
                // Criar um usuário de teste se não existir nenhum
                const testUser = yield User_1.default.create({
                    name: 'Usuário de Teste',
                    email: 'teste@consultafacil.com',
                    password: 'senha123', // Será hasheada automaticamente pelo hook
                    role: types_1.UserRole.CLIENT,
                    isActive: true
                });
                users.push(testUser);
                logger_1.default.info(`Created test user with ID: ${testUser.id}`);
            }
            // Mensagens de exemplo para notificações
            const notificationMessages = [
                'Bem-vindo ao ConsultaFácil! Seu cadastro foi concluído com sucesso.',
                'Você tem uma consulta agendada para amanhã às 14:00.',
                'Uma consulta foi cancelada pelo profissional.',
                'Seu horário foi confirmado com sucesso!',
                'Lembrete: Você tem uma consulta em 1 hora.',
                'Profissional alterou o horário da sua consulta.',
                'Consulta reagendada com sucesso!',
                'Nova mensagem recebida de Dr. Silva.',
                'Sua avaliação foi registrada. Obrigado pelo feedback!',
                'Precisamos confirmar alguns dados. Entre em contato conosco.'
            ];
            // Limpar notificações existentes
            yield Notification_1.default.destroy({
                where: {},
                truncate: true,
                cascade: true,
                restartIdentity: true
            });
            logger_1.default.info('Cleared existing notifications.');
            // Criar notificações para cada usuário
            const createdNotifications = [];
            for (const user of users) {
                // Selecionar aleatoriamente entre 3 e 6 mensagens para cada usuário
                const messagesToCreate = Math.floor(Math.random() * 4) + 3;
                for (let i = 0; i < messagesToCreate; i++) {
                    const messageIndex = Math.floor(Math.random() * notificationMessages.length);
                    const isRead = Math.random() > 0.6; // 40% chance de ser não lida
                    const notification = yield Notification_1.default.create({
                        userId: user.id,
                        message: notificationMessages[messageIndex],
                        isRead
                    });
                    createdNotifications.push(notification);
                }
            }
            logger_1.default.info(`Created ${createdNotifications.length} notifications for ${users.length} users.`);
            logger_1.default.info('Notification seeding completed successfully.');
            process.exit(0);
        }
        catch (error) {
            logger_1.default.error('Notification seeding failed:', error);
            process.exit(1);
        }
    });
}
// Executar o script
seedNotifications();
