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
describe('Rate Limiting Middleware', () => {
    let app;
    beforeEach(() => {
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        jest.setTimeout(30000); // Increase timeout for rate limit tests
    });
    describe('basicLimiter', () => {
        beforeEach(() => {
            app.use('/test', rateLimit_1.basicLimiter, (_req, res) => {
                res.status(200).send('OK');
            });
        });
        it('should allow requests within the limit', () => __awaiter(void 0, void 0, void 0, function* () {
            // Make multiple requests but stay under limit
            const responses = yield Promise.all(Array(5).fill(null).map(() => (0, supertest_1.default)(app).get('/test')));
            responses.forEach(response => {
                expect(response.status).toBe(200);
            });
        }));
        it('should block requests over the limit', () => __awaiter(void 0, void 0, void 0, function* () {
            // Force rate limit to be exceeded
            const promises = Array(101).fill(null).map(() => (0, supertest_1.default)(app).get('/test'));
            const responses = yield Promise.all(promises);
            const blockedResponses = responses.filter(r => r.status === 429);
            expect(blockedResponses.length).toBeGreaterThan(0);
        }));
    });
    describe('authLimiter', () => {
        beforeEach(() => {
            app.use('/auth', rateLimit_1.authLimiter, (_req, res) => res.send('OK'));
        });
        it('should block after 5 attempts', () => __awaiter(void 0, void 0, void 0, function* () {
            // Make 6 requests
            const responses = [];
            for (let i = 0; i < 6; i++) {
                const response = yield (0, supertest_1.default)(app).post('/auth');
                responses.push(response);
            }
            // Last request should be blocked
            expect(responses[5].status).toBe(429);
        }));
    });
    describe('apiLimiter', () => {
        beforeEach(() => {
            app.use('/api', rateLimit_1.apiLimiter, (_req, res) => res.send('OK'));
        });
        it('should allow 30 requests per minute', () => __awaiter(void 0, void 0, void 0, function* () {
            // Make 30 requests
            for (let i = 0; i < 30; i++) {
                const response = yield (0, supertest_1.default)(app).get('/api');
                expect(response.status).toBe(200);
            }
            // 31st request should be blocked
            const response = yield (0, supertest_1.default)(app).get('/api');
            expect(response.status).toBe(429);
        }));
    });
});
