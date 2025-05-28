import nodemailer from 'nodemailer';
import env from '../config/env';
import logger from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    if (env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    } else {
      logger.warn('Email service not configured. Emails will be logged but not sent.');
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: env.SMTP_FROM || 'noreply@consultafacil.com',
        ...options,
      };

      if (env.NODE_ENV === 'development' || !env.SMTP_HOST) {
        logger.info('Email would be sent:', mailOptions);
        return;
      }

      const info = await this.transporter.sendMail(mailOptions);
      logger.info('Email sent:', info.messageId);
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendAppointmentConfirmation(
    to: string,
    appointmentDetails: {
      title: string;
      date: string;
      time: string;
      professional: string;
    }
  ): Promise<void> {
    const subject = 'Appointment Confirmation';
    const html = `
      <h1>Appointment Confirmation</h1>
      <p>Your appointment has been confirmed:</p>
      <ul>
        <li><strong>Title:</strong> ${appointmentDetails.title}</li>
        <li><strong>Date:</strong> ${appointmentDetails.date}</li>
        <li><strong>Time:</strong> ${appointmentDetails.time}</li>
        <li><strong>Professional:</strong> ${appointmentDetails.professional}</li>
      </ul>
      <p>Thank you for using ConsultaFácil!</p>
    `;

    await this.sendEmail({ to, subject, html });
  }

  async sendAppointmentReminder(
    to: string,
    appointmentDetails: {
      title: string;
      date: string;
      time: string;
      professional: string;
    }
  ): Promise<void> {
    const subject = 'Appointment Reminder';
    const html = `
      <h1>Appointment Reminder</h1>
      <p>This is a reminder for your upcoming appointment:</p>
      <ul>
        <li><strong>Title:</strong> ${appointmentDetails.title}</li>
        <li><strong>Date:</strong> ${appointmentDetails.date}</li>
        <li><strong>Time:</strong> ${appointmentDetails.time}</li>
        <li><strong>Professional:</strong> ${appointmentDetails.professional}</li>
      </ul>
      <p>We look forward to seeing you!</p>
    `;

    await this.sendEmail({ to, subject, html });
  }

  async sendPasswordReset(to: string, resetToken: string): Promise<void> {
    const resetLink = `${env.API_URL}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request';
    const html = `
      <h1>Password Reset Request</h1>
      <p>You have requested to reset your password. Click the link below to proceed:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>If you did not request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `;

    await this.sendEmail({ to, subject, html });
  }

  async sendWelcome(to: string, name: string): Promise<void> {
    const subject = 'Welcome to ConsultaFácil';
    const html = `
      <h1>Welcome to ConsultaFácil!</h1>
      <p>Dear ${name},</p>
      <p>Thank you for joining ConsultaFácil. We're excited to have you on board!</p>
      <p>If you have any questions, feel free to contact our support team.</p>
      <p>Best regards,<br>The ConsultaFácil Team</p>
    `;

    await this.sendEmail({ to, subject, html });
  }
}

export default new EmailService();
