import axios from 'axios';
import { Notification } from '../../domain/entities/Notification';
import type { NotificationProps } from '../../domain/entities/Notification';
import { config } from '../config';

export class NotificationService {
  private readonly authToken: string | null;

  constructor() {
    this.authToken = localStorage.getItem('token');
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.authToken}`
    };
  }

  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await axios.get<NotificationProps[]>(`${config.apiUrl}/notifications`, {
        headers: this.headers
      });
      return response.data.map(notification => Notification.create(notification));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to get notifications');
      }
      throw new Error('Failed to get notifications');
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await axios.post(
        `${config.apiUrl}/notifications/${notificationId}/read`,
        {},
        { headers: this.headers }
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to mark notification as read');
      }
      throw new Error('Failed to mark notification as read');
    }
  }

  async clearAll(): Promise<void> {
    try {
      await axios.delete(`${config.apiUrl}/notifications`, {
        headers: this.headers
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to clear notifications');
      }
      throw new Error('Failed to clear notifications');
    }
  }
} 