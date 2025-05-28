import cron from 'node-cron';
import { Op } from 'sequelize';
import logger from '../utils/logger';
import Appointment from '../models/Appointment';
import User from '../models/User';
import AuditLog from '../models/AuditLog';
import emailService from './emailService';
import { format } from 'date-fns';
import { AppointmentStatus } from '../types';

class SchedulerService {
  private tasks: cron.ScheduledTask[] = [];

  start(): void {
    // Send appointment reminders daily at 8 AM
    this.tasks.push(
      cron.schedule('0 8 * * *', () => {
        this.sendAppointmentReminders().catch((error) => {
          logger.error('Failed to send appointment reminders:', error);
        });
      })
    );

    // Clean up old audit logs monthly
    this.tasks.push(
      cron.schedule('0 0 1 * *', () => {
        this.cleanupAuditLogs().catch((error) => {
          logger.error('Failed to clean up audit logs:', error);
        });
      })
    );

    // Update appointment statuses every hour
    this.tasks.push(
      cron.schedule('0 * * * *', () => {
        this.updateAppointmentStatuses().catch((error) => {
          logger.error('Failed to update appointment statuses:', error);
        });
      })
    );

    logger.info('Scheduler service started');
  }

  stop(): void {
    this.tasks.forEach((task) => task.stop());
    this.tasks = [];
    logger.info('Scheduler service stopped');
  }

  private async sendAppointmentReminders(): Promise<void> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    const appointments = await Appointment.findAll({
      where: {
        date: {
          [Op.between]: [tomorrow, endOfTomorrow],
        },
        status: AppointmentStatus.CONFIRMED,
      },
      include: [
        {
          model: User,
          as: 'Client',
          attributes: ['email', 'name'],
        },
        {
          model: User,
          as: 'Professional',
          attributes: ['name'],
        },
      ],
    });

    for (const appointment of appointments) {
      try {
        const client = await User.findByPk(appointment.clientId);
        const professional = await User.findByPk(appointment.professionalId);

        if (!client || !professional) {
          logger.warn(`Missing user data for appointment ${appointment.id}`);
          continue;
        }

        await emailService.sendAppointmentReminder(
          client.email,
          {
            title: appointment.title,
            date: format(appointment.date, 'dd/MM/yyyy'),
            time: `${appointment.startTime} - ${appointment.endTime}`,
            professional: professional.name,
          }
        );
        logger.info(`Sent reminder for appointment ${appointment.id}`);
      } catch (error) {
        logger.error(`Failed to send reminder for appointment ${appointment.id}:`, error);
      }
    }
  }

  private async cleanupAuditLogs(): Promise<void> {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    try {
      const result = await AuditLog.destroy({
        where: {
          createdAt: {
            [Op.lt]: threeMonthsAgo,
          },
        },
      });
      logger.info(`Cleaned up ${result} audit logs`);
    } catch (error) {
      logger.error('Failed to clean up audit logs:', error);
      throw error;
    }
  }

  private async updateAppointmentStatuses(): Promise<void> {
    const now = new Date();

    try {
      // Update past appointments to 'completed'
      await Appointment.update(
        { status: AppointmentStatus.COMPLETED },
        {
          where: {
            date: {
              [Op.lt]: now,
            },
            status: AppointmentStatus.CONFIRMED,
          },
        }
      );

      // Cancel appointments that were not confirmed 24 hours before
      const tomorrow = new Date(now);
      tomorrow.setHours(now.getHours() + 24);

      await Appointment.update(
        { status: AppointmentStatus.CANCELLED },
        {
          where: {
            date: {
              [Op.lt]: tomorrow,
            },
            status: AppointmentStatus.PENDING,
          },
        }
      );

      logger.info('Updated appointment statuses');
    } catch (error) {
      logger.error('Failed to update appointment statuses:', error);
      throw error;
    }
  }
}

export default new SchedulerService(); 