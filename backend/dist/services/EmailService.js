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
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = __importDefault(require("../config/env"));
const logger_1 = __importDefault(require("../utils/logger"));
class EmailService {
    constructor() {
        if (env_1.default.SMTP_HOST && env_1.default.SMTP_PORT && env_1.default.SMTP_USER && env_1.default.SMTP_PASS) {
            this.transporter = nodemailer_1.default.createTransport({
                host: env_1.default.SMTP_HOST,
                port: env_1.default.SMTP_PORT,
                secure: env_1.default.SMTP_PORT === 465,
                auth: {
                    user: env_1.default.SMTP_USER,
                    pass: env_1.default.SMTP_PASS,
                },
            });
        }
        else {
            logger_1.default.warn('Email service not configured. Emails will be logged but not sent.');
            this.transporter = nodemailer_1.default.createTransport({
                jsonTransport: true,
            });
        }
    }
    sendEmail(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mailOptions = Object.assign({ from: env_1.default.SMTP_FROM || 'noreply@consultafacil.com' }, options);
                if (env_1.default.NODE_ENV === 'development' || !env_1.default.SMTP_HOST) {
                    logger_1.default.info('Email would be sent:', mailOptions);
                    return;
                }
                const info = yield this.transporter.sendMail(mailOptions);
                logger_1.default.info('Email sent:', info.messageId);
            }
            catch (error) {
                logger_1.default.error('Failed to send email:', error);
                throw error;
            }
        });
    }
    sendAppointmentConfirmation(to, appointmentDetails) {
        return __awaiter(this, void 0, void 0, function* () {
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
            yield this.sendEmail({ to, subject, html });
        });
    }
    sendAppointmentReminder(to, appointmentDetails) {
        return __awaiter(this, void 0, void 0, function* () {
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
            yield this.sendEmail({ to, subject, html });
        });
    }
    sendPasswordReset(to, resetToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const resetLink = `${env_1.default.API_URL}/reset-password?token=${resetToken}`;
            const subject = 'Password Reset Request';
            const html = `
      <h1>Password Reset Request</h1>
      <p>You have requested to reset your password. Click the link below to proceed:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>If you did not request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `;
            yield this.sendEmail({ to, subject, html });
        });
    }
    sendWelcome(to, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const subject = 'Welcome to ConsultaFácil';
            const html = `
      <h1>Welcome to ConsultaFácil!</h1>
      <p>Dear ${name},</p>
      <p>Thank you for joining ConsultaFácil. We're excited to have you on board!</p>
      <p>If you have any questions, feel free to contact our support team.</p>
      <p>Best regards,<br>The ConsultaFácil Team</p>
    `;
            yield this.sendEmail({ to, subject, html });
        });
    }
}
exports.default = new EmailService();
