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
const redis_1 = require("redis");
const logger_1 = __importDefault(require("../utils/logger"));
const env_1 = __importDefault(require("../config/env"));
class CacheService {
    constructor() {
        this.defaultTTL = 3600; // 1 hour in seconds
        this.client = (0, redis_1.createClient)({
            url: env_1.default.REDIS_URL || 'redis://localhost:6379',
        });
        this.client.on('error', (error) => {
            logger_1.default.error('Redis Client Error:', error);
        });
        this.client.on('connect', () => {
            logger_1.default.info('Redis Client Connected');
        });
        this.client.connect().catch((error) => {
            logger_1.default.error('Redis Connection Error:', error);
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const value = yield this.client.get(key);
                return value ? JSON.parse(value) : null;
            }
            catch (error) {
                logger_1.default.error('Cache Get Error:', error);
                return null;
            }
        });
    }
    set(key_1, value_1) {
        return __awaiter(this, arguments, void 0, function* (key, value, ttl = this.defaultTTL) {
            try {
                const stringValue = JSON.stringify(value);
                yield this.client.set(key, stringValue, { EX: ttl });
            }
            catch (error) {
                logger_1.default.error('Cache Set Error:', error);
            }
        });
    }
    del(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.del(key);
            }
            catch (error) {
                logger_1.default.error('Cache Delete Error:', error);
            }
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.flushAll();
            }
            catch (error) {
                logger_1.default.error('Cache Clear Error:', error);
            }
        });
    }
    generateKey(...parts) {
        return parts.join(':');
    }
    getOrSet(key_1, callback_1) {
        return __awaiter(this, arguments, void 0, function* (key, callback, ttl = this.defaultTTL) {
            try {
                const cachedValue = yield this.get(key);
                if (cachedValue) {
                    return cachedValue;
                }
                const value = yield callback();
                yield this.set(key, value, ttl);
                return value;
            }
            catch (error) {
                logger_1.default.error('Cache GetOrSet Error:', error);
                return null;
            }
        });
    }
    invalidatePattern(pattern) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const keys = yield this.client.keys(pattern);
                if (keys.length > 0) {
                    yield this.client.del(keys);
                }
            }
            catch (error) {
                logger_1.default.error('Cache Invalidate Pattern Error:', error);
            }
        });
    }
}
exports.default = new CacheService();
