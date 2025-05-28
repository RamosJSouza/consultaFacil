import Notification from '../../models/Notification';

export interface INotificationRepository {
  findById(id: number): Promise<Notification | null>;
  findByUserId(userId: number): Promise<Notification[]>;
  create(data: Partial<Notification>): Promise<Notification>;
  markAsRead(id: number): Promise<Notification>;
  deleteAllByUserId(userId: number): Promise<void>;
} 