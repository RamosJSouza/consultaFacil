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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const NotificationRepository_1 = require("../repositories/NotificationRepository");
const http_status_codes_1 = require("http-status-codes");
class NotificationController {
    constructor() {
        this.getNotifications = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
                    return;
                }
                const notifications = yield this.notificationRepository.findByUserId(userId);
                res.status(http_status_codes_1.StatusCodes.OK).json(notifications);
            }
            catch (error) {
                console.error('Error getting notifications:', error);
                res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error getting notifications' });
            }
        });
        this.markAsRead = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
                    return;
                }
                const notification = yield this.notificationRepository.findById(parseInt(id));
                if (!notification) {
                    res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ message: 'Notification not found' });
                    return;
                }
                if (notification.userId !== userId) {
                    res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({ message: 'Access denied' });
                    return;
                }
                const updatedNotification = yield this.notificationRepository.markAsRead(parseInt(id));
                res.status(http_status_codes_1.StatusCodes.OK).json(updatedNotification);
            }
            catch (error) {
                console.error('Error marking notification as read:', error);
                res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error marking notification as read' });
            }
        });
        this.clearAll = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
                    return;
                }
                yield this.notificationRepository.deleteAllByUserId(userId);
                res.status(http_status_codes_1.StatusCodes.OK).json({ message: 'All notifications cleared' });
            }
            catch (error) {
                console.error('Error clearing notifications:', error);
                res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error clearing notifications' });
            }
        });
        // Método para inicializar notificações de teste para o usuário autenticado
        this.initTestNotifications = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
                    return;
                }
                // Criar algumas notificações de teste
                const notifications = [
                    {
                        userId,
                        message: 'Bem-vindo ao ConsultaFácil! Seu cadastro foi concluído com sucesso.',
                        isRead: false
                    },
                    {
                        userId,
                        message: 'Você tem uma nova consulta agendada para amanhã.',
                        isRead: false
                    },
                    {
                        userId,
                        message: 'Uma consulta foi cancelada pelo profissional.',
                        isRead: false
                    }
                ];
                // Limpar notificações existentes
                yield this.notificationRepository.deleteAllByUserId(userId);
                // Criar as notificações de teste
                for (const notification of notifications) {
                    yield this.notificationRepository.create(notification);
                }
                res.status(http_status_codes_1.StatusCodes.CREATED).json({
                    message: 'Notificações de teste criadas com sucesso',
                    count: notifications.length
                });
            }
            catch (error) {
                console.error('Error creating test notifications:', error);
                res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error creating test notifications' });
            }
        });
        // Método para criar notificações (a ser usado internamente por outros serviços)
        this.createNotification = (userId, message) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.notificationRepository.create({
                    userId,
                    message,
                    isRead: false
                });
            }
            catch (error) {
                console.error('Error creating notification:', error);
            }
        });
        this.notificationRepository = new NotificationRepository_1.SequelizeNotificationRepository();
    }
}
exports.NotificationController = NotificationController;
