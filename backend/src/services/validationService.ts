import { z } from 'zod';
import { UserRole } from '../types';

export const userSchema = {
  create: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(2),
      role: z.nativeEnum(UserRole),
      specialty: z.string().optional(),
      licenseNumber: z.string().optional(),
    }),
  }),

  update: z.object({
    params: z.object({
      id: z.string().transform(Number),
    }),
    body: z.object({
      email: z.string().email().optional(),
      name: z.string().min(2).optional(),
      specialty: z.string().optional(),
      licenseNumber: z.string().optional(),
      isActive: z.boolean().optional(),
    }),
  }),

  login: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string(),
    }),
  }),

  resetPassword: z.object({
    body: z.object({
      token: z.string(),
      password: z.string().min(8),
    }),
  }),
};

export const appointmentSchema = {
  create: z.object({
    body: z.object({
      title: z.string().min(3),
      description: z.string().optional(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
      professionalId: z.number(),
    }),
  }),

  update: z.object({
    params: z.object({
      id: z.string().transform(Number),
    }),
    body: z.object({
      title: z.string().min(3).optional(),
      description: z.string().optional(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
      endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
      status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
    }),
  }),

  list: z.object({
    query: z.object({
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
      professionalId: z.string().transform(Number).optional(),
    }),
  }),
};

export const ruleSchema = {
  create: z.object({
    body: z.object({
      ruleName: z.string().min(3),
      ruleValue: z.any(),
    }),
  }),

  update: z.object({
    params: z.object({
      id: z.string().transform(Number),
    }),
    body: z.object({
      ruleName: z.string().min(3).optional(),
      ruleValue: z.any().optional(),
    }),
  }),
}; 