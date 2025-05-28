"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ruleSchema = exports.appointmentSchema = exports.userSchema = void 0;
const zod_1 = require("zod");
const types_1 = require("../types");
exports.userSchema = {
    create: zod_1.z.object({
        body: zod_1.z.object({
            email: zod_1.z.string().email(),
            password: zod_1.z.string().min(8),
            name: zod_1.z.string().min(2),
            role: zod_1.z.nativeEnum(types_1.UserRole),
            specialty: zod_1.z.string().optional(),
            licenseNumber: zod_1.z.string().optional(),
        }),
    }),
    update: zod_1.z.object({
        params: zod_1.z.object({
            id: zod_1.z.string().transform(Number),
        }),
        body: zod_1.z.object({
            email: zod_1.z.string().email().optional(),
            name: zod_1.z.string().min(2).optional(),
            specialty: zod_1.z.string().optional(),
            licenseNumber: zod_1.z.string().optional(),
            isActive: zod_1.z.boolean().optional(),
        }),
    }),
    login: zod_1.z.object({
        body: zod_1.z.object({
            email: zod_1.z.string().email(),
            password: zod_1.z.string(),
        }),
    }),
    resetPassword: zod_1.z.object({
        body: zod_1.z.object({
            token: zod_1.z.string(),
            password: zod_1.z.string().min(8),
        }),
    }),
};
exports.appointmentSchema = {
    create: zod_1.z.object({
        body: zod_1.z.object({
            title: zod_1.z.string().min(3),
            description: zod_1.z.string().optional(),
            date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
            startTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/),
            endTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/),
            professionalId: zod_1.z.number(),
        }),
    }),
    update: zod_1.z.object({
        params: zod_1.z.object({
            id: zod_1.z.string().transform(Number),
        }),
        body: zod_1.z.object({
            title: zod_1.z.string().min(3).optional(),
            description: zod_1.z.string().optional(),
            date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
            startTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/).optional(),
            endTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/).optional(),
            status: zod_1.z.enum(['pending', 'confirmed', 'cancelled']).optional(),
        }),
    }),
    list: zod_1.z.object({
        query: zod_1.z.object({
            startDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
            endDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
            status: zod_1.z.enum(['pending', 'confirmed', 'cancelled']).optional(),
            professionalId: zod_1.z.string().transform(Number).optional(),
        }),
    }),
};
exports.ruleSchema = {
    create: zod_1.z.object({
        body: zod_1.z.object({
            ruleName: zod_1.z.string().min(3),
            ruleValue: zod_1.z.any(),
        }),
    }),
    update: zod_1.z.object({
        params: zod_1.z.object({
            id: zod_1.z.string().transform(Number),
        }),
        body: zod_1.z.object({
            ruleName: zod_1.z.string().min(3).optional(),
            ruleValue: zod_1.z.any().optional(),
        }),
    }),
};
