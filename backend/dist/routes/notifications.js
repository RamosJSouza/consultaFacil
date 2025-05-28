"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const NotificationController_1 = require("../controllers/NotificationController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const notificationController = new NotificationController_1.NotificationController();
/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Obter todas as notificações do usuário autenticado
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de notificações
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro no servidor
 */
router.get('/', auth_1.authenticate, notificationController.getNotifications);
/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Marcar notificação como lida
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da notificação
 *     responses:
 *       200:
 *         description: Notificação marcada como lida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Notificação não encontrada
 *       500:
 *         description: Erro no servidor
 */
router.patch('/:id/read', auth_1.authenticate, notificationController.markAsRead);
/**
 * @swagger
 * /api/notifications:
 *   delete:
 *     summary: Limpar todas as notificações do usuário
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas as notificações foram removidas
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro no servidor
 */
router.delete('/', auth_1.authenticate, notificationController.clearAll);
/**
 * @swagger
 * /api/notifications/test-init:
 *   post:
 *     summary: Criar notificações de teste para o usuário
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Notificações de teste criadas
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro no servidor
 */
router.post('/test-init', auth_1.authenticate, notificationController.initTestNotifications);
exports.default = router;
