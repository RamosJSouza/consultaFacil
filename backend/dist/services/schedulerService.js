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
const node_cron_1 = __importDefault(require("node-cron"));
const sequelize_1 = require("sequelize");
const logger_1 = __importDefault(require("../utils/logger"));
const Appointment_1 = __importDefault(require("../models/Appointment"));
const User_1 = __importDefault(require("../models/User"));
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const emailService_1 = __importDefault(require("./emailService"));
const date_fns_1 = require("date-fns");
const types_1 = require("../types");
class SchedulerService {
    constructor() {
        this.tasks = [];
    }
    start() {
        // Send appointment reminders daily at 8 AM
        this.tasks.push(node_cron_1.default.schedule('0 8 * * *', () => {
            this.sendAppointmentReminders().catch((error) => {
                logger_1.default.error('Failed to send appointment reminders:', error);
            });
        }));
        // Clean up old audit logs monthly
        this.tasks.push(node_cron_1.default.schedule('0 0 1 * *', () => {
            this.cleanupAuditLogs().catch((error) => {
                logger_1.default.error('Failed to clean up audit logs:', error);
            });
        }));
        // Update appointment statuses every hour
        this.tasks.push(node_cron_1.default.schedule('0 * * * *', () => {
            this.updateAppointmentStatuses().catch((error) => {
                logger_1.default.error('Failed to update appointment statuses:', error);
            });
        }));
        logger_1.default.info('Scheduler service started');
    }
    stop() {
        this.tasks.forEach((task) => task.stop());
        this.tasks = [];
        logger_1.default.info('Scheduler service stopped');
    }
    sendAppointmentReminders() {
        return __awaiter(this, void 0, void 0, function* () {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const endOfTomorrow = new Date(tomorrow);
            endOfTomorrow.setHours(23, 59, 59, 999);
            const appointments = yield Appointment_1.default.findAll({
                where: {
                    date: {
                        [sequelize_1.Op.between]: [tomorrow, endOfTomorrow],
                    },
                    status: types_1.AppointmentStatus.CONFIRMED,
                },
                include: [
                    {
                        model: User_1.default,
                        as: 'Client',
                        attributes: ['email', 'name'],
                    },
                    {
                        model: User_1.default,
                        as: 'Professional',
                        attributes: ['name'],
                    },
                ],
            });
            for (const appointment of appointments) {
                try {
                    const client = yield User_1.default.findByPk(appointment.clientId);
                    const professional = yield User_1.default.findByPk(appointment.professionalId);
                    if (!client || !professional) {
                        logger_1.default.warn(`Missing user data for appointment ${appointment.id}`);
                        continue;
                    }
                    yield emailService_1.default.sendAppointmentReminder(client.email, {
                        title: appointment.title,
                        date: (0, date_fns_1.format)(appointment.date, 'dd/MM/yyyy'),
                        time: `${appointment.startTime} - ${appointment.endTime}`,
                        professional: professional.name,
                    });
                    logger_1.default.info(`Sent reminder for appointment ${appointment.id}`);
                }
                catch (error) {
                    logger_1.default.error(`Failed to send reminder for appointment ${appointment.id}:`, error);
                }
            }
        });
    }
    cleanupAuditLogs() {
        return __awaiter(this, void 0, void 0, function* () {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            try {
                const result = yield AuditLog_1.default.destroy({
                    where: {
                        createdAt: {
                            [sequelize_1.Op.lt]: threeMonthsAgo,
                        },
                    },
                });
                logger_1.default.info(`Cleaned up ${result} audit logs`);
            }
            catch (error) {
                logger_1.default.error('Failed to clean up audit logs:', error);
                throw error;
            }
        });
    }
    updateAppointmentStatuses() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            try {
                // Update past appointments to 'completed'
                yield Appointment_1.default.update({ status: types_1.AppointmentStatus.COMPLETED }, {
                    where: {
                        date: {
                            [sequelize_1.Op.lt]: now,
                        },
                        status: types_1.AppointmentStatus.CONFIRMED,
                    },
                });
                // Cancel appointments that were not confirmed 24 hours before
                const tomorrow = new Date(now);
                tomorrow.setHours(now.getHours() + 24);
                yield Appointment_1.default.update({ status: types_1.AppointmentStatus.CANCELLED }, {
                    where: {
                        date: {
                            [sequelize_1.Op.lt]: tomorrow,
                        },
                        status: types_1.AppointmentStatus.PENDING,
                    },
                });
                logger_1.default.info('Updated appointment statuses');
            }
            catch (error) {
                logger_1.default.error('Failed to update appointment statuses:', error);
                throw error;
            }
        });
    }
}
exports.default = new SchedulerService();
