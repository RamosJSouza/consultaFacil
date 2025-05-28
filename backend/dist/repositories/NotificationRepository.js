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
exports.SequelizeNotificationRepository = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
const errors_1 = require("../utils/errors");
class SequelizeNotificationRepository {
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return Notification_1.default.findByPk(id);
        });
    }
    findByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return Notification_1.default.findAll({
                where: { userId },
                order: [['createdAt', 'DESC']]
            });
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Notification_1.default.create(data);
        });
    }
    markAsRead(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const notification = yield Notification_1.default.findByPk(id);
            if (!notification) {
                throw new errors_1.NotFoundError('Notification');
            }
            return notification.update({ isRead: true });
        });
    }
    deleteAllByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Notification_1.default.destroy({
                where: { userId }
            });
        });
    }
}
exports.SequelizeNotificationRepository = SequelizeNotificationRepository;
