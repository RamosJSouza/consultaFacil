"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = __importDefault(require("../config/env"));
class TokenService {
    constructor() {
        this.accessTokenSecret = env_1.default.JWT_SECRET;
        this.refreshTokenSecret = env_1.default.JWT_SECRET + '_refresh';
        this.accessTokenExpiration = env_1.default.JWT_EXPIRES_IN;
        this.refreshTokenExpiration = env_1.default.JWT_REFRESH_EXPIRES_IN;
    }
    generateTokens(payload) {
        const accessTokenOptions = {
            expiresIn: this.accessTokenExpiration,
        };
        const refreshTokenOptions = {
            expiresIn: this.refreshTokenExpiration,
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, this.accessTokenSecret, accessTokenOptions);
        const refreshToken = jsonwebtoken_1.default.sign(payload, this.refreshTokenSecret, refreshTokenOptions);
        return {
            accessToken,
            refreshToken,
            expiresIn: this.getExpirationTime(this.accessTokenExpiration),
        };
    }
    verifyAccessToken(token) {
        return jsonwebtoken_1.default.verify(token, this.accessTokenSecret);
    }
    verifyRefreshToken(token) {
        return jsonwebtoken_1.default.verify(token, this.refreshTokenSecret);
    }
    getExpirationTime(expiration) {
        const match = expiration.match(/^(\d+)([smhd])$/);
        if (!match)
            return 3600; // Default to 1 hour
        const [, value, unit] = match;
        const multipliers = {
            s: 1,
            m: 60,
            h: 3600,
            d: 86400,
        };
        return parseInt(value) * (multipliers[unit] || 3600);
    }
}
exports.default = new TokenService();
