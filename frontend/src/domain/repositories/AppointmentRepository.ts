import type { Appointment } from '../entities/Appointment';

export interface AppointmentRepository {
  getAll(): Promise<Appointment[]>;
  getById(id: number): Promise<Appointment | null>;
  getByClient(clientId: number): Promise<Appointment[]>;
  getByProfessional(professionalId: number): Promise<Appointment[]>;
  getByProfessionalAndDate(professionalId: number, date: string): Promise<Appointment[]>;
  create(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment>;
  update(id: number, appointment: Partial<Appointment>): Promise<Appointment>;
  updateStatus(id: number, status: string): Promise<Appointment>;
  delete(id: number): Promise<void>;
} 