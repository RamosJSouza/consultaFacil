import type { Appointment } from '../../domain/entities/Appointment';

export interface CreateAppointmentData {
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  professionalId: number;
}

export interface UpdateAppointmentData {
  title?: string;
  description?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
}

export interface IAppointmentService {
  createAppointment(data: CreateAppointmentData): Promise<Appointment>;
  updateAppointment(id: number, data: UpdateAppointmentData): Promise<Appointment>;
  cancelAppointment(id: number): Promise<void>;
  confirmAppointment(id: number): Promise<Appointment>;
  getAppointment(id: number): Promise<Appointment>;
  getAppointments(filters?: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
    professionalId?: number;
    clientId?: number;
  }): Promise<Appointment[]>;
} 