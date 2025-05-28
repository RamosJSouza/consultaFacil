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
exports.SequelizeAppointmentRepository = void 0;
const Appointment_1 = __importDefault(require("../models/Appointment"));
const errors_1 = require("../utils/errors");
const sequelize_1 = require("sequelize");
class SequelizeAppointmentRepository {
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return Appointment_1.default.findAll({
                order: [['date', 'ASC'], ['startTime', 'ASC']]
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return Appointment_1.default.findByPk(id);
        });
    }
    findByClientId(clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            return Appointment_1.default.findAll({
                where: { clientId },
                order: [['date', 'ASC'], ['startTime', 'ASC']]
            });
        });
    }
    findByProfessionalId(professionalId) {
        return __awaiter(this, void 0, void 0, function* () {
            return Appointment_1.default.findAll({
                where: { professionalId },
                order: [['date', 'ASC'], ['startTime', 'ASC']]
            });
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Appointment_1.default.create(data);
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointment = yield Appointment_1.default.findByPk(id);
            if (!appointment) {
                throw new errors_1.NotFoundError('Appointment');
            }
            return appointment.update(data);
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointment = yield Appointment_1.default.findByPk(id);
            if (!appointment) {
                throw new errors_1.NotFoundError('Appointment');
            }
            yield appointment.destroy();
        });
    }
    findOverlappingAppointments(professionalId, date, startTime, endTime, excludeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {
                professionalId,
                date,
                [sequelize_1.Op.or]: [
                    {
                        startTime: {
                            [sequelize_1.Op.between]: [startTime, endTime]
                        }
                    },
                    {
                        endTime: {
                            [sequelize_1.Op.between]: [startTime, endTime]
                        }
                    }
                ]
            };
            if (excludeId) {
                where.id = { [sequelize_1.Op.ne]: excludeId };
            }
            return Appointment_1.default.findAll({ where });
        });
    }
}
exports.SequelizeAppointmentRepository = SequelizeAppointmentRepository;
