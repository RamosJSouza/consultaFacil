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
exports.isResourceOwner = exports.isSuperAdmin = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../utils/errors");
const types_1 = require("../types");
const UserRepository_1 = require("../repositories/UserRepository");
const userRepository = new UserRepository_1.SequelizeUserRepository();
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new errors_1.UnauthorizedError('No authorization header');
        }
        const [type, token] = authHeader.split(' ');
        if (type.toLowerCase() !== 'bearer') {
            throw new errors_1.UnauthorizedError('Invalid authorization type');
        }
        try {
            // Verificar se JWT_SECRET está configurado
            if (!process.env.JWT_SECRET) {
                console.error('JWT_SECRET environment variable is not set');
                throw new Error('Authentication configuration error');
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                next(new errors_1.UnauthorizedError('Invalid token'));
            }
            else {
                next(error);
            }
        }
    }
    catch (error) {
        next(error);
    }
});
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new errors_1.UnauthorizedError('User not authenticated');
        }
        if (!roles.includes(req.user.role)) {
            throw new errors_1.ForbiddenError('User not authorized');
        }
        next();
    };
};
exports.authorize = authorize;
const isSuperAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            throw new errors_1.UnauthorizedError('User not authenticated');
        }
        if (req.user.role !== types_1.UserRole.SUPERADMIN) {
            throw new errors_1.ForbiddenError('Superadmin access required');
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.isSuperAdmin = isSuperAdmin;
const isResourceOwner = (resourceUserId) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                throw new errors_1.UnauthorizedError('User not authenticated');
            }
            if (req.user.role !== types_1.UserRole.SUPERADMIN &&
                req.user.id !== resourceUserId) {
                throw new errors_1.ForbiddenError('Access denied');
            }
            next();
        }
        catch (error) {
            next(error);
        }
    });
};
exports.isResourceOwner = isResourceOwner;
