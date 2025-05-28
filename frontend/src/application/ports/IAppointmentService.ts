import { Appointment, AppointmentStatus } from '../../domain/entities/Appointment';

export interface CreateAppointmentData {
  title: string;
  description?: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  professionalId: string;
}

export interface UpdateAppointmentData {
  title?: string;
  description?: string;
  date?: Date;
  startTime?: Date;
  endTime?: Date;
  status?: AppointmentStatus;
}

export interface IAppointmentService {
  createAppointment(data: CreateAppointmentData): Promise<Appointment>;
  updateAppointment(id: string, data: UpdateAppointmentData): Promise<Appointment>;
  cancelAppointment(id: string): Promise<void>;
  confirmAppointment(id: string): Promise<Appointment>;
  getAppointment(id: string): Promise<Appointment>;
  getAppointments(filters?: {
    startDate?: Date;
    endDate?: Date;
    status?: AppointmentStatus;
    professionalId?: string;
    clientId?: string;
  }): Promise<Appointment[]>;
} 