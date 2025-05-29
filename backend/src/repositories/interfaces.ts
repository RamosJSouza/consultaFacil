import User from '../models/User';
import Appointment from '../models/Appointment';
import Rule from '../models/Rule';
import AuditLog from '../models/AuditLog';

export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByResetToken(token: string): Promise<User | null>;
  create(data: Partial<User>): Promise<User>;
  update(id: number, data: Partial<User>): Promise<User>;
  updateResetToken(id: number, token: string, expiry: Date): Promise<User>;
  updatePassword(id: number, password: string): Promise<User>;
  delete(id: number): Promise<void>;
  findActiveProfessionals(): Promise<User[]>;
  searchProfessionalsByNameOrSpecialty(searchTerm: string): Promise<User[]>;
  isClientLinkedToProfessional(clientId: number, professionalId: number): Promise<boolean>;
}

export interface IAppointmentRepository {
  findById(id: number): Promise<Appointment | null>;
  findByProfessionalId(professionalId: number): Promise<Appointment[]>;
  findByClientId(clientId: number): Promise<Appointment[]>;
  create(data: Partial<Appointment>): Promise<Appointment>;
  update(id: number, data: Partial<Appointment>): Promise<Appointment>;
  delete(id: number): Promise<void>;
  findConflicts(professionalId: number, date: Date, startTime: string, endTime: string, excludeId?: number): Promise<Appointment[]>;
}

export interface IRuleRepository {
  findByName(name: string): Promise<Rule | null>;
  create(data: Partial<Rule>): Promise<Rule>;
  update(id: number, data: Partial<Rule>): Promise<Rule>;
  delete(id: number): Promise<void>;
  findAll(): Promise<Rule[]>;
}

export interface IAuditLogRepository {
  create(data: Partial<AuditLog>): Promise<AuditLog>;
  findByPerformer(performerId: number): Promise<AuditLog[]>;
}
