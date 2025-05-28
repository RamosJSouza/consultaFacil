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
exports.UserController = void 0;
const errors_1 = require("../utils/errors");
const types_1 = require("../types");
const UserRepository_1 = require("../repositories/UserRepository");
class UserController {
    constructor() {
        this.getAllUsers = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield this.userRepository.findAll();
                res.json(users);
            }
            catch (error) {
                next(error);
            }
        });
        this.getActiveProfessionals = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const professionals = yield this.userRepository.findActiveProfessionals();
                res.json(professionals);
            }
            catch (error) {
                next(error);
            }
        });
        this.getUserById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = parseInt(req.params.id);
                if (isNaN(userId)) {
                    throw new errors_1.ValidationError('Invalid user ID');
                }
                const user = yield this.userRepository.findById(userId);
                if (!user) {
                    throw new errors_1.NotFoundError('User');
                }
                // Check if user has permission to view this profile
                if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== types_1.UserRole.SUPERADMIN &&
                    ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) !== userId) {
                    throw new errors_1.ForbiddenError('Access denied');
                }
                res.json({
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    specialty: user.specialty,
                    licenseNumber: user.licenseNumber,
                    isActive: user.isActive,
                });
            }
            catch (error) {
                next(error);
            }
        });
        this.updateUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = parseInt(req.params.id);
                if (isNaN(userId)) {
                    throw new errors_1.ValidationError('Invalid user ID');
                }
                // Check if user exists
                const user = yield this.userRepository.findById(userId);
                if (!user) {
                    throw new errors_1.NotFoundError('User');
                }
                // Check if user has permission to update this profile
                if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== types_1.UserRole.SUPERADMIN &&
                    ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) !== userId) {
                    throw new errors_1.ForbiddenError('Access denied');
                }
                const { name, specialty, licenseNumber } = req.body;
                // Additional validation for professionals
                if (user.role === types_1.UserRole.PROFESSIONAL) {
                    if (specialty !== undefined && !specialty) {
                        throw new errors_1.ValidationError('Specialty is required for professionals');
                    }
                    if (licenseNumber !== undefined && !licenseNumber) {
                        throw new errors_1.ValidationError('License number is required for professionals');
                    }
                }
                const updatedUser = yield this.userRepository.update(userId, {
                    name,
                    specialty,
                    licenseNumber,
                });
                res.json({
                    id: updatedUser.id,
                    email: updatedUser.email,
                    name: updatedUser.name,
                    role: updatedUser.role,
                    specialty: updatedUser.specialty,
                    licenseNumber: updatedUser.licenseNumber,
                    isActive: updatedUser.isActive,
                });
            }
            catch (error) {
                next(error);
            }
        });
        this.deactivateUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = parseInt(req.params.id);
                if (isNaN(userId)) {
                    throw new errors_1.ValidationError('Invalid user ID');
                }
                // Check if user exists
                const user = yield this.userRepository.findById(userId);
                if (!user) {
                    throw new errors_1.NotFoundError('User');
                }
                // Prevent deactivating own account
                if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === userId) {
                    throw new errors_1.ForbiddenError('Cannot deactivate your own account');
                }
                yield this.userRepository.delete(userId);
                res.status(204).send();
            }
            catch (error) {
                next(error);
            }
        });
        this.userRepository = new UserRepository_1.SequelizeUserRepository();
    }
}
exports.UserController = UserController;
