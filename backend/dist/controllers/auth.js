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
exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const types_1 = require("../types");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name, role, specialty, licenseNumber } = req.body;
        // Validate required fields
        if (!email || !password || !name || !role) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }
        // Validate role
        if (!Object.values(types_1.UserRole).includes(role)) {
            res.status(400).json({ message: 'Invalid role' });
            return;
        }
        // Check if user exists
        const existingUser = yield User_1.default.findOne({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'Email already registered' });
            return;
        }
        // Validate professional fields
        if (role === types_1.UserRole.PROFESSIONAL && (!specialty || !licenseNumber)) {
            res.status(400).json({ message: 'Professionals must provide specialty and license number' });
            return;
        }
        // Create user
        const user = yield User_1.default.create({
            email,
            password,
            name,
            role,
            specialty,
            licenseNumber,
            isActive: true,
        });
        // Generate token
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'your-secret-key-here', { expiresIn: '24h' });
        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                specialty: user.specialty,
                licenseNumber: user.licenseNumber,
                isActive: user.isActive,
            },
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Validate required fields
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }
        // Find user
        const user = yield User_1.default.findOne({ where: { email } });
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        // Check if user is active
        if (!user.isActive) {
            res.status(403).json({ message: 'Account is deactivated' });
            return;
        }
        // Verify password
        const validPassword = yield bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        // Generate token
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'your-secret-key-here', { expiresIn: '24h' });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                specialty: user.specialty,
                licenseNumber: user.licenseNumber,
                isActive: user.isActive,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.login = login;
