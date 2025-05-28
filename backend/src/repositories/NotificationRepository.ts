import { INotificationRepository } from './interfaces/INotificationRepository';
import Notification from '../models/Notification';
import { NotFoundError } from '../utils/errors';

export class SequelizeNotificationRepository implements INotificationRepository {
  async findById(id: number): Promise<Notification | null> {
    return Notification.findByPk(id);
  }

  async findByUserId(userId: number): Promise<Notification[]> {
    return Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
  }

  async create(data: Partial<Notification>): Promise<Notification> {
    return Notification.create(data as any);
  }

  async markAsRead(id: number): Promise<Notification> {
    const notification = await Notification.findByPk(id);
    if (!notification) {
      throw new NotFoundError('Notification');
    }
    return notification.update({ isRead: true });
  }

  async deleteAllByUserId(userId: number): Promise<void> {
    await Notification.destroy({
      where: { userId }
    });
  }
} 