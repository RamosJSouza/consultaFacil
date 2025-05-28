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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../utils/errors");
const UserRepository_1 = require("../repositories/UserRepository");
class AuthService {
    constructor() {
        this.ACCESS_TOKEN_EXPIRATION = '15m';
        this.REFRESH_TOKEN_EXPIRATION = '7d';
        this.userRepository = new UserRepository_1.SequelizeUserRepository();
        // Set JWT secrets
        if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
            throw new Error('JWT secrets not configured');
        }
        this.JWT_SECRET = process.env.JWT_SECRET;
        this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
        // Override expiration times if set in environment
        if (process.env.JWT_ACCESS_EXPIRATION) {
            this.ACCESS_TOKEN_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION;
        }
        if (process.env.JWT_REFRESH_EXPIRATION) {
            this.REFRESH_TOKEN_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION;
        }
    }
    validateCredentials(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findByEmail(email);
            if (!user || !user.isActive) {
                throw new errors_1.UnauthorizedError('Invalid credentials');
            }
            const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                throw new errors_1.UnauthorizedError('Invalid credentials');
            }
            return user;
        });
    }
    generateTokens(user) {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
        const accessTokenOptions = {
            expiresIn: this.ACCESS_TOKEN_EXPIRATION,
        };
        const refreshTokenOptions = {
            expiresIn: this.REFRESH_TOKEN_EXPIRATION,
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, this.JWT_SECRET, accessTokenOptions);
        const refreshToken = jsonwebtoken_1.default.sign(payload, this.JWT_REFRESH_SECRET, refreshTokenOptions);
        return { accessToken, refreshToken };
    }
    validateToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, this.JWT_SECRET);
                const user = yield this.userRepository.findById(decoded.id);
                if (!user || !user.isActive) {
                    throw new errors_1.UnauthorizedError('Invalid token');
                }
                return {
                    id: decoded.id,
                    email: decoded.email,
                    role: decoded.role,
                };
            }
            catch (error) {
                if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                    throw new errors_1.UnauthorizedError('Invalid token');
                }
                throw error;
            }
        });
    }
    validateRefreshToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, this.JWT_REFRESH_SECRET);
                const user = yield this.userRepository.findById(decoded.id);
                if (!user || !user.isActive) {
                    throw new errors_1.UnauthorizedError('Invalid refresh token');
                }
                return user;
            }
            catch (error) {
                if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                    throw new errors_1.UnauthorizedError('Invalid refresh token');
                }
                throw error;
            }
        });
    }
    register(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate required fields
            if (!userData.email || !userData.password || !userData.name || !userData.role) {
                throw new errors_1.ValidationError('Missing required fields');
            }
            // Check if user already exists
            const existingUser = yield this.userRepository.findByEmail(userData.email);
            if (existingUser) {
                throw new errors_1.ValidationError('Email already registered');
            }
            // Create user
            const user = yield this.userRepository.create(Object.assign(Object.assign({}, userData), { isActive: true }));
            // Remove password from response
            const _a = user.get(), { password } = _a, userWithoutPassword = __rest(_a, ["password"]);
            return userWithoutPassword;
        });
    }
}
exports.AuthService = AuthService;
