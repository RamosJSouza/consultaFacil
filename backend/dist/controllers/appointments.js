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
exports.updateAppointmentStatus = exports.getAppointments = exports.createAppointment = void 0;
const Appointment_1 = __importDefault(require("../models/Appointment"));
const User_1 = __importDefault(require("../models/User"));
const types_1 = require("../types");
const createAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, description, date, startTime, endTime, professionalId } = req.body;
        const clientId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!clientId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        // Validate required fields
        if (!title || !date || !startTime || !endTime || !professionalId) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }
        // Check if professional exists
        const professional = yield User_1.default.findOne({
            where: { id: professionalId, role: types_1.UserRole.PROFESSIONAL, isActive: true },
        });
        if (!professional) {
            res.status(404).json({ message: 'Professional not found' });
            return;
        }
        // Check for conflicting appointments
        const conflictingAppointment = yield Appointment_1.default.findOne({
            where: {
                professionalId,
                date,
                status: 'confirmed',
                [Symbol('or')]: [
                    {
                        startTime: { [Symbol('between')]: [startTime, endTime] },
                    },
                    {
                        endTime: { [Symbol('between')]: [startTime, endTime] },
                    },
                ],
            },
        });
        if (conflictingAppointment) {
            res.status(400).json({ message: 'Time slot is already booked' });
            return;
        }
        const appointment = yield Appointment_1.default.create({
            clientId,
            professionalId,
            title,
            description,
            date,
            startTime,
            endTime,
            status: 'pending',
        });
        res.status(201).json(appointment);
    }
    catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.createAppointment = createAppointment;
const getAppointments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        if (!userId || !userRole) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        let appointments;
        if (userRole === types_1.UserRole.SUPERADMIN) {
            appointments = yield Appointment_1.default.findAll({
                include: [
                    { model: User_1.default, as: 'client', attributes: ['id', 'name', 'email'] },
                    { model: User_1.default, as: 'professional', attributes: ['id', 'name', 'specialty'] },
                ],
            });
        }
        else {
            const whereClause = userRole === types_1.UserRole.CLIENT
                ? { clientId: userId }
                : { professionalId: userId };
            appointments = yield Appointment_1.default.findAll({
                where: whereClause,
                include: [
                    { model: User_1.default, as: 'client', attributes: ['id', 'name', 'email'] },
                    { model: User_1.default, as: 'professional', attributes: ['id', 'name', 'specialty'] },
                ],
            });
        }
        res.json(appointments);
    }
    catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getAppointments = getAppointments;
const updateAppointmentStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        if (!userId || !userRole) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const appointment = yield Appointment_1.default.findByPk(id);
        if (!appointment) {
            res.status(404).json({ message: 'Appointment not found' });
            return;
        }
        // Validate permissions
        if (userRole === types_1.UserRole.CLIENT && appointment.clientId !== userId) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        if (userRole === types_1.UserRole.PROFESSIONAL && appointment.professionalId !== userId) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        yield appointment.update({ status });
        res.json(appointment);
    }
    catch (error) {
        console.error('Update appointment status error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateAppointmentStatus = updateAppointmentStatus;
