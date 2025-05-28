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
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const rateLimit_1 = require("../middleware/rateLimit");
const createTestHandler = () => {
    return (req, res, next) => {
        try {
            res.status(200).send('OK');
        }
        catch (error) {
            next(error);
        }
    };
};
describe('Rate Limiting Middleware', () => {
    let app;
    beforeEach(() => {
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        jest.setTimeout(30000); // Increase timeout for rate limit tests
    });
    describe('basicLimiter', () => {
        beforeEach(() => {
            app.use('/test', rateLimit_1.basicLimiter, createTestHandler());
        });
        it('should allow requests within the limit', () => __awaiter(void 0, void 0, void 0, function* () {
            const responses = yield Promise.all(Array(5).fill(null).map(() => (0, supertest_1.default)(app).get('/test')));
            responses.forEach(response => {
                expect(response.status).toBe(200);
            });
        }));
        it('should block requests over the limit', () => __awaiter(void 0, void 0, void 0, function* () {
            const responses = yield Promise.all(Array(101).fill(null).map(() => (0, supertest_1.default)(app).get('/test')));
            const blockedResponses = responses.filter(r => r.status === 429);
            expect(blockedResponses.length).toBeGreaterThan(0);
        }));
    });
    describe('authLimiter', () => {
        beforeEach(() => {
            app.use('/auth', rateLimit_1.authLimiter, createTestHandler());
        });
        it('should block after 5 attempts', () => __awaiter(void 0, void 0, void 0, function* () {
            const responses = yield Promise.all(Array(6).fill(null).map(() => (0, supertest_1.default)(app).post('/auth')));
            // First 5 should succeed, 6th should be blocked
            responses.slice(0, 5).forEach(response => {
                expect(response.status).toBe(200);
            });
            expect(responses[5].status).toBe(429);
        }));
    });
    describe('apiLimiter', () => {
        beforeEach(() => {
            app.use('/api', rateLimit_1.apiLimiter, createTestHandler());
        });
        it('should allow 30 requests per minute', () => __awaiter(void 0, void 0, void 0, function* () {
            const responses = yield Promise.all(Array(31).fill(null).map(() => (0, supertest_1.default)(app).get('/api')));
            // First 30 should succeed
            responses.slice(0, 30).forEach(response => {
                expect(response.status).toBe(200);
            });
            // 31st should be blocked
            expect(responses[30].status).toBe(429);
        }));
    });
});
