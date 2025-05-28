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
exports.AppointmentController = void 0;
const errors_1 = require("../utils/errors");
const types_1 = require("../types");
const AppointmentRepository_1 = require("../repositories/AppointmentRepository");
const UserRepository_1 = require("../repositories/UserRepository");
class AppointmentController {
    constructor() {
        this.getAllAppointments = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const appointments = yield this.appointmentRepository.findAll();
                res.json(appointments);
            }
            catch (error) {
                next(error);
            }
        });
        this.getUserAppointments = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    throw new errors_1.ValidationError('User not authenticated');
                }
                let appointments;
                if (req.user.role === types_1.UserRole.CLIENT) {
                    appointments = yield this.appointmentRepository.findByClientId(req.user.id);
                }
                else if (req.user.role === types_1.UserRole.PROFESSIONAL) {
                    appointments = yield this.appointmentRepository.findByProfessionalId(req.user.id);
                }
                else {
                    appointments = yield this.appointmentRepository.findAll();
                }
                res.json(appointments);
            }
            catch (error) {
                next(error);
            }
        });
        this.getAppointmentById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const appointmentId = parseInt(req.params.id);
                if (isNaN(appointmentId)) {
                    throw new errors_1.ValidationError('Invalid appointment ID');
                }
                const appointment = yield this.appointmentRepository.findById(appointmentId);
                if (!appointment) {
                    throw new errors_1.NotFoundError('Appointment');
                }
                // Check if user has access to this appointment
                if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== types_1.UserRole.SUPERADMIN &&
                    ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) !== appointment.clientId &&
                    ((_c = req.user) === null || _c === void 0 ? void 0 : _c.id) !== appointment.professionalId) {
                    throw new errors_1.ForbiddenError('Access denied');
                }
                res.json(appointment);
            }
            catch (error) {
                next(error);
            }
        });
        this.createAppointment = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    throw new errors_1.ValidationError('User not authenticated');
                }
                const { professionalId, date, startTime, endTime, title, description } = req.body;
                // Validate required fields
                if (!professionalId || !date || !startTime || !endTime || !title) {
                    throw new errors_1.ValidationError('Missing required fields');
                }
                // Check if professional exists and is active
                const professional = yield this.userRepository.findById(professionalId);
                if (!professional || !professional.isActive || professional.role !== types_1.UserRole.PROFESSIONAL) {
                    throw new errors_1.ValidationError('Invalid professional');
                }
                // Check for overlapping appointments
                const overlappingAppointments = yield this.appointmentRepository.findOverlappingAppointments(professionalId, new Date(date), startTime, endTime);
                if (overlappingAppointments.length > 0) {
                    throw new errors_1.ValidationError('Professional is not available at this time');
                }
                const appointment = yield this.appointmentRepository.create({
                    clientId: req.user.id,
                    professionalId,
                    date: new Date(date),
                    startTime,
                    endTime,
                    title,
                    description,
                    status: types_1.AppointmentStatus.PENDING
                });
                res.status(201).json(appointment);
            }
            catch (error) {
                next(error);
            }
        });
        this.updateAppointment = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const appointmentId = parseInt(req.params.id);
                if (isNaN(appointmentId)) {
                    throw new errors_1.ValidationError('Invalid appointment ID');
                }
                const appointment = yield this.appointmentRepository.findById(appointmentId);
                if (!appointment) {
                    throw new errors_1.NotFoundError('Appointment');
                }
                // Check if user has permission to update
                if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== types_1.UserRole.SUPERADMIN &&
                    ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) !== appointment.clientId &&
                    ((_c = req.user) === null || _c === void 0 ? void 0 : _c.id) !== appointment.professionalId) {
                    throw new errors_1.ForbiddenError('Access denied');
                }
                // If updating date/time, check for overlapping appointments
                if (req.body.date || req.body.startTime || req.body.endTime) {
                    const overlappingAppointments = yield this.appointmentRepository.findOverlappingAppointments(appointment.professionalId, new Date(req.body.date || appointment.date), req.body.startTime || appointment.startTime, req.body.endTime || appointment.endTime, appointmentId);
                    if (overlappingAppointments.length > 0) {
                        throw new errors_1.ValidationError('Professional is not available at this time');
                    }
                }
                const updatedAppointment = yield this.appointmentRepository.update(appointmentId, req.body);
                res.json(updatedAppointment);
            }
            catch (error) {
                next(error);
            }
        });
        this.updateAppointmentStatus = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const appointmentId = parseInt(req.params.id);
                if (isNaN(appointmentId)) {
                    throw new errors_1.ValidationError('Invalid appointment ID');
                }
                const { status } = req.body;
                if (!Object.values(types_1.AppointmentStatus).includes(status)) {
                    throw new errors_1.ValidationError('Invalid status');
                }
                const appointment = yield this.appointmentRepository.findById(appointmentId);
                if (!appointment) {
                    throw new errors_1.NotFoundError('Appointment');
                }
                // Check permissions based on status change
                if (status === types_1.AppointmentStatus.CONFIRMED &&
                    ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== types_1.UserRole.PROFESSIONAL &&
                    ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== types_1.UserRole.SUPERADMIN) {
                    throw new errors_1.ForbiddenError('Only professionals can confirm appointments');
                }
                const updatedAppointment = yield this.appointmentRepository.update(appointmentId, { status });
                res.json(updatedAppointment);
            }
            catch (error) {
                next(error);
            }
        });
        this.cancelAppointment = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const appointmentId = parseInt(req.params.id);
                if (isNaN(appointmentId)) {
                    throw new errors_1.ValidationError('Invalid appointment ID');
                }
                const appointment = yield this.appointmentRepository.findById(appointmentId);
                if (!appointment) {
                    throw new errors_1.NotFoundError('Appointment');
                }
                // Check if user has permission to cancel
                if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== types_1.UserRole.SUPERADMIN &&
                    ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) !== appointment.clientId &&
                    ((_c = req.user) === null || _c === void 0 ? void 0 : _c.id) !== appointment.professionalId) {
                    throw new errors_1.ForbiddenError('Access denied');
                }
                const updatedAppointment = yield this.appointmentRepository.update(appointmentId, { status: types_1.AppointmentStatus.CANCELLED });
                res.json(updatedAppointment);
            }
            catch (error) {
                next(error);
            }
        });
        this.confirmAppointment = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const appointmentId = parseInt(req.params.id);
                if (isNaN(appointmentId)) {
                    throw new errors_1.ValidationError('Invalid appointment ID');
                }
                const appointment = yield this.appointmentRepository.findById(appointmentId);
                if (!appointment) {
                    throw new errors_1.NotFoundError('Appointment');
                }
                // Only the professional can confirm appointments
                if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== types_1.UserRole.SUPERADMIN &&
                    ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) !== appointment.professionalId) {
                    throw new errors_1.ForbiddenError('Only professionals can confirm appointments');
                }
                const updatedAppointment = yield this.appointmentRepository.update(appointmentId, { status: types_1.AppointmentStatus.CONFIRMED });
                res.json(updatedAppointment);
            }
            catch (error) {
                next(error);
            }
        });
        this.appointmentRepository = new AppointmentRepository_1.SequelizeAppointmentRepository();
        this.userRepository = new UserRepository_1.SequelizeUserRepository();
    }
}
exports.AppointmentController = AppointmentController;
