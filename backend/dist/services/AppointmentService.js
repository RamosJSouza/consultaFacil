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
exports.AppointmentService = void 0;
const errors_1 = require("../utils/errors");
const types_1 = require("../types");
class AppointmentService {
    constructor(appointmentRepository, ruleRepository, emailService) {
        this.appointmentRepository = appointmentRepository;
        this.ruleRepository = ruleRepository;
        this.emailService = emailService;
    }
    createAppointment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            // Validate times
            if (data.startTime >= data.endTime) {
                throw new errors_1.ValidationError('End time must be after start time');
            }
            // Validate future date
            if (new Date(data.date) < new Date()) {
                throw new errors_1.ValidationError('Appointment date must be in the future');
            }
            // Check appointment rules
            const maxAppointmentsRule = yield this.ruleRepository.findByName('max_appointments_per_day');
            if (maxAppointmentsRule) {
                const existingAppointments = yield this.appointmentRepository.findByProfessionalId(data.professionalId);
                const sameDay = existingAppointments.filter(apt => apt.date.toISOString().split('T')[0] === data.date.toISOString().split('T')[0]);
                if (sameDay.length >= maxAppointmentsRule.ruleValue.max_appointments_per_day) {
                    throw new errors_1.ValidationError('Professional has reached maximum appointments for this day');
                }
            }
            // Check for conflicts
            const conflicts = yield this.appointmentRepository.findConflicts(data.professionalId, data.date, data.startTime, data.endTime);
            if (conflicts.length > 0) {
                throw new errors_1.ValidationError('Time slot is already booked');
            } // Create appointment
            const appointment = yield this.appointmentRepository.create(Object.assign(Object.assign({}, data), { status: 'pending' }));
            // Send email notifications
            if (this.emailService && ((_a = data.client) === null || _a === void 0 ? void 0 : _a.email) && ((_b = data.professional) === null || _b === void 0 ? void 0 : _b.email)) {
                const emailData = {
                    professionalName: data.professional.name,
                    clientName: data.client.name,
                    title: data.title,
                    date: data.date.toLocaleDateString(),
                    startTime: data.startTime,
                    endTime: data.endTime,
                    status: 'pending'
                };
                try {
                    // Send to client
                    yield this.emailService.sendAppointmentNotification(data.client.email, emailData);
                    // Send to professional
                    yield this.emailService.sendAppointmentNotification(data.professional.email, emailData);
                }
                catch (error) {
                    // Log error but don't fail the appointment creation
                    console.error('Failed to send email notifications:', error);
                }
            }
            return appointment;
        });
    }
    updateAppointmentStatus(appointmentId, status, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const appointment = yield this.appointmentRepository.findById(appointmentId);
            if (!appointment) {
                throw new errors_1.NotFoundError('Appointment');
            }
            // Validate permissions
            if (userRole === types_1.UserRole.CLIENT &&
                appointment.clientId !== userId) {
                throw new errors_1.ForbiddenError();
            }
            if (userRole === types_1.UserRole.PROFESSIONAL &&
                appointment.professionalId !== userId) {
                throw new errors_1.ForbiddenError();
            }
            // Update status
            const updatedAppointment = yield this.appointmentRepository.update(appointmentId, { status }); // Send email notifications if we have the associated users
            if (this.emailService && ((_a = appointment.client) === null || _a === void 0 ? void 0 : _a.email) && ((_b = appointment.professional) === null || _b === void 0 ? void 0 : _b.email)) {
                const emailData = {
                    professionalName: appointment.professional.name,
                    clientName: appointment.client.name,
                    title: appointment.title,
                    date: appointment.date.toLocaleDateString(),
                    startTime: appointment.startTime,
                    endTime: appointment.endTime,
                    status
                };
                try {
                    // Send to client
                    yield this.emailService.sendAppointmentNotification(appointment.client.email, emailData);
                    // Send to professional
                    yield this.emailService.sendAppointmentNotification(appointment.professional.email, emailData);
                }
                catch (error) {
                    // Log error but don't fail the status update
                    console.error('Failed to send email notifications:', error);
                }
            }
            return updatedAppointment;
        });
    }
    getAppointments(userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (userRole) {
                case types_1.UserRole.CLIENT:
                    return this.appointmentRepository.findByClientId(userId);
                case types_1.UserRole.PROFESSIONAL:
                    return this.appointmentRepository.findByProfessionalId(userId);
                case types_1.UserRole.SUPERADMIN:
                    // For superadmin, we could implement a method to get all appointments with pagination
                    throw new Error('Not implemented');
                default:
                    throw new errors_1.ForbiddenError();
            }
        });
    }
}
exports.AppointmentService = AppointmentService;
