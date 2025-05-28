import { Request, Response } from 'express';
import { SequelizeNotificationRepository } from '../repositories/NotificationRepository';
import { AuthenticatedRequest } from '../types';
import { StatusCodes } from 'http-status-codes';

export class NotificationController {
  private notificationRepository: SequelizeNotificationRepository;

  constructor() {
    this.notificationRepository = new SequelizeNotificationRepository();
  }

  getNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
        return;
      }

      const notifications = await this.notificationRepository.findByUserId(userId);
      res.status(StatusCodes.OK).json(notifications);
    } catch (error) {
      console.error('Error getting notifications:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error getting notifications' });
    }
  };

  markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
        return;
      }

      const notification = await this.notificationRepository.findById(parseInt(id));
      
      if (!notification) {
        res.status(StatusCodes.NOT_FOUND).json({ message: 'Notification not found' });
        return;
      }
      
      if (notification.userId !== userId) {
        res.status(StatusCodes.FORBIDDEN).json({ message: 'Access denied' });
        return;
      }

      const updatedNotification = await this.notificationRepository.markAsRead(parseInt(id));
      res.status(StatusCodes.OK).json(updatedNotification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error marking notification as read' });
    }
  };

  clearAll = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
        return;
      }

      await this.notificationRepository.deleteAllByUserId(userId);
      res.status(StatusCodes.OK).json({ message: 'All notifications cleared' });
    } catch (error) {
      console.error('Error clearing notifications:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error clearing notifications' });
    }
  };

  // Método para inicializar notificações de teste para o usuário autenticado
  initTestNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
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
      await this.notificationRepository.deleteAllByUserId(userId);

      // Criar as notificações de teste
      for (const notification of notifications) {
        await this.notificationRepository.create(notification);
      }

      res.status(StatusCodes.CREATED).json({
        message: 'Notificações de teste criadas com sucesso',
        count: notifications.length
      });
    } catch (error) {
      console.error('Error creating test notifications:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error creating test notifications' });
    }
  };

  // Método para criar notificações (a ser usado internamente por outros serviços)
  createNotification = async (userId: number, message: string): Promise<void> => {
    try {
      await this.notificationRepository.create({
        userId,
        message,
        isRead: false
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };
} 