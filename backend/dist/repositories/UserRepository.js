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
exports.SequelizeUserRepository = void 0;
const User_1 = __importDefault(require("../models/User"));
const errors_1 = require("../utils/errors");
const types_1 = require("../types");
class SequelizeUserRepository {
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return User_1.default.findByPk(id);
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return User_1.default.findOne({ where: { email } });
        });
    }
    findByResetToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            return User_1.default.findOne({ where: { reset_token: token } });
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return User_1.default.findAll({
                attributes: ['id', 'name', 'email', 'role', 'specialty', 'licenseNumber', 'isActive'],
            });
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return User_1.default.create(data);
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.findByPk(id);
            if (!user) {
                throw new errors_1.NotFoundError('User');
            }
            return user.update(data);
        });
    }
    updateResetToken(id, token, expiry) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.findByPk(id);
            if (!user) {
                throw new errors_1.NotFoundError('User');
            }
            return user.update({
                reset_token: token,
                reset_token_expiry: expiry
            });
        });
    }
    updatePassword(id, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.findByPk(id);
            if (!user) {
                throw new errors_1.NotFoundError('User');
            }
            return user.update({
                password,
                reset_token: null,
                reset_token_expiry: null
            });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.findByPk(id);
            if (!user) {
                throw new errors_1.NotFoundError('User');
            }
            yield user.update({ isActive: false });
        });
    }
    findActiveProfessionals() {
        return __awaiter(this, void 0, void 0, function* () {
            return User_1.default.findAll({
                where: {
                    role: types_1.UserRole.PROFESSIONAL,
                    isActive: true
                },
                attributes: ['id', 'name', 'email', 'specialty', 'licenseNumber']
            });
        });
    }
}
exports.SequelizeUserRepository = SequelizeUserRepository;
