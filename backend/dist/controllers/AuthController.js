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
exports.AuthController = void 0;
const errors_1 = require("../utils/errors");
const types_1 = require("../types");
const UserRepository_1 = require("../repositories/UserRepository");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
class AuthController {
    constructor() {
        this.register = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password, name, role: rawRole, specialty, licenseNumber } = req.body;
                // Converter role para minúsculas para compatibilidade
                const role = typeof rawRole === 'string' ? rawRole.toLowerCase() : rawRole;
                console.log(`Register attempt with email: ${email}, role: ${rawRole} (normalized to: ${role})`);
                // Validate required fields
                if (!email || !password || !name || !role) {
                    throw new errors_1.ValidationError('Missing required fields');
                }
                // Validate role
                if (!Object.values(types_1.UserRole).includes(role) || role === types_1.UserRole.SUPERADMIN) {
                    throw new errors_1.ValidationError('Invalid role');
                }
                // Additional validation for professionals
                if (role === types_1.UserRole.PROFESSIONAL && (!specialty || !licenseNumber)) {
                    throw new errors_1.ValidationError('Professionals must provide specialty and license number');
                }
                // Check if user already exists
                const existingUser = yield this.userRepository.findByEmail(email);
                if (existingUser) {
                    throw new errors_1.ValidationError('Email already registered');
                }
                // Create user
                const user = yield this.userRepository.create({
                    email,
                    password,
                    name,
                    role,
                    specialty,
                    licenseNumber,
                    isActive: true,
                });
                // Generate tokens
                const accessToken = this.generateAccessToken(user);
                const refreshToken = this.generateRefreshToken(user);
                res.status(201).json({
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        specialty: user.specialty,
                        licenseNumber: user.licenseNumber,
                    },
                    accessToken,
                    refreshToken,
                });
            }
            catch (error) {
                next(error);
            }
        });
        this.login = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                console.log(`Login attempt for email: ${email}`);
                if (!email || !password) {
                    throw new errors_1.ValidationError('Email and password are required');
                }
                // Verifica se JWT_SECRET está configurado
                if (!process.env.JWT_SECRET) {
                    console.error('JWT_SECRET environment variable is not set');
                    throw new Error('Authentication configuration error');
                }
                const user = yield this.userRepository.findByEmail(email);
                if (!user || !user.isActive) {
                    console.log(`Login failed: User not found or inactive for email ${email}`);
                    throw new errors_1.UnauthorizedError('Invalid credentials');
                }
                const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
                if (!isPasswordValid) {
                    console.log(`Login failed: Invalid password for email ${email}`);
                    throw new errors_1.UnauthorizedError('Invalid credentials');
                }
                const accessToken = this.generateAccessToken(user);
                const refreshToken = this.generateRefreshToken(user);
                console.log(`Login successful for user ${user.id} (${user.email})`);
                res.json({
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        specialty: user.specialty,
                        licenseNumber: user.licenseNumber,
                    },
                    accessToken,
                    refreshToken,
                });
            }
            catch (error) {
                next(error);
            }
        });
        this.getCurrentUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    throw new errors_1.UnauthorizedError('Not authenticated');
                }
                const user = yield this.userRepository.findById(req.user.id);
                if (!user || !user.isActive) {
                    throw new errors_1.UnauthorizedError('User not found or inactive');
                }
                res.json({
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    specialty: user.specialty,
                    licenseNumber: user.licenseNumber,
                });
            }
            catch (error) {
                next(error);
            }
        });
        this.refreshToken = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { refreshToken } = req.body;
                if (!refreshToken) {
                    throw new errors_1.UnauthorizedError('Refresh token is required');
                }
                if (!process.env.JWT_REFRESH_SECRET) {
                    throw new Error('JWT refresh secret not configured');
                }
                const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                const user = yield this.userRepository.findById(decoded.id);
                if (!user || !user.isActive) {
                    throw new errors_1.UnauthorizedError('Invalid refresh token');
                }
                const accessToken = this.generateAccessToken(user);
                const newRefreshToken = this.generateRefreshToken(user);
                res.json({
                    accessToken,
                    refreshToken: newRefreshToken,
                });
            }
            catch (error) {
                if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                    next(new errors_1.UnauthorizedError('Invalid refresh token'));
                }
                else {
                    next(error);
                }
            }
        });
        this.forgotPassword = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                if (!email) {
                    throw new errors_1.ValidationError('Email is required');
                }
                // Verificar se o usuário existe
                const user = yield this.userRepository.findByEmail(email);
                if (!user) {
                    throw new errors_1.NotFoundError('User not found');
                }
                // Gerar token de recuperação (expira em 1 hora)
                const resetToken = crypto_1.default.randomBytes(20).toString('hex');
                const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora
                // Salvar token no banco
                yield this.userRepository.updateResetToken(user.id, resetToken, resetTokenExpiry);
                // Enviar email com link de recuperação
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
                // Aqui implementaríamos o envio de email com o link
                // Em produção, utilize um serviço como Nodemailer
                console.log(`Link de recuperação: ${resetUrl}`);
                res.status(200).json({
                    message: 'Email de recuperação enviado com sucesso',
                    // Em desenvolvimento, retornamos o token para testes
                    resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
                });
            }
            catch (error) {
                next(error);
            }
        });
        this.resetPassword = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { token, newPassword } = req.body;
                if (!token || !newPassword) {
                    throw new errors_1.ValidationError('Token and new password are required');
                }
                // Verificar se o token é válido e não expirou
                const user = yield this.userRepository.findByResetToken(token);
                if (!user || !user.reset_token_expiry || user.reset_token_expiry < new Date()) {
                    throw new errors_1.ValidationError('Invalid or expired token');
                }
                // Hash da nova senha
                const salt = yield bcrypt_1.default.genSalt(10);
                const hashedPassword = yield bcrypt_1.default.hash(newPassword, salt);
                // Atualizar senha e limpar token
                yield this.userRepository.updatePassword(user.id, hashedPassword);
                res.status(200).json({ message: 'Password updated successfully' });
            }
            catch (error) {
                next(error);
            }
        });
        this.userRepository = new UserRepository_1.SequelizeUserRepository();
    }
    generateAccessToken(user) {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT secret not configured');
        }
        return jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            role: user.role,
        }, process.env.JWT_SECRET, { expiresIn: '15m' });
    }
    generateRefreshToken(user) {
        if (!process.env.JWT_REFRESH_SECRET) {
            throw new Error('JWT refresh secret not configured');
        }
        return jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            role: user.role,
        }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    }
}
exports.AuthController = AuthController;
