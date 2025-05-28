import { Request } from 'express';

export enum UserRole {
  CLIENT = 'client',
  PROFESSIONAL = 'professional',
  SUPERADMIN = 'superadmin'
}

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled'
}

export interface IUser {
  id?: number;
  email: string;
  password?: string;
  role: UserRole;
  name: string;
  specialty?: string | null;
  licenseNumber?: string | null;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAppointment {
  id: number;
  clientId: number;
  professionalId: number;
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAvailability {
  id?: number;
  professionalId: number;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM:SS format
  endTime: string; // HH:MM:SS format
  isAvailable: boolean;
  isRecurring: boolean; // Indica se a disponibilidade se repete semanalmente
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IClientProfessionalLink {
  id?: number;
  clientId: number;
  professionalId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRule {
  id?: number;
  ruleName: string;
  ruleValue: Record<string, any>;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAuditLog {
  id?: number;
  action: string;
  performedBy: number;
  details: Record<string, any>;
  createdAt?: Date;
}

export interface INotification {
  id?: number;
  userId: number;
  message: string;
  isRead?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthUser {
  id: number;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: UserRole;
  };
}
