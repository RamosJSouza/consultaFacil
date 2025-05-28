import axios from 'axios';
import { Appointment } from '../../domain/entities/Appointment';
import type { AppointmentProps } from '../../domain/entities/Appointment';
import type { IAppointmentService, CreateAppointmentData, UpdateAppointmentData } from '../../application/ports/IAppointmentService';
import { config } from '../config';

interface AppointmentResponse extends AppointmentProps {
  id: string;
}

export class AppointmentService implements IAppointmentService {
  private readonly authToken: string | null;

  constructor() {
    this.authToken = localStorage.getItem('token');
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.authToken}`
    };
  }

  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    try {
      const response = await axios.post<AppointmentResponse>(`${config.apiUrl}/appointments`, data, {
        headers: this.headers
      });
      return Appointment.create(response.data, response.data.id);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to create appointment');
      }
      throw new Error('Failed to create appointment');
    }
  }

  async updateAppointment(id: string, data: UpdateAppointmentData): Promise<Appointment> {
    try {
      const response = await axios.put<AppointmentResponse>(`${config.apiUrl}/appointments/${id}`, data, {
        headers: this.headers
      });
      return Appointment.create(response.data, response.data.id);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to update appointment');
      }
      throw new Error('Failed to update appointment');
    }
  }

  async cancelAppointment(id: string): Promise<void> {
    try {
      await axios.post(`${config.apiUrl}/appointments/${id}/cancel`, {}, {
        headers: this.headers
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to cancel appointment');
      }
      throw new Error('Failed to cancel appointment');
    }
  }

  async confirmAppointment(id: string): Promise<Appointment> {
    try {
      const response = await axios.post<AppointmentResponse>(`${config.apiUrl}/appointments/${id}/confirm`, {}, {
        headers: this.headers
      });
      return Appointment.create(response.data, response.data.id);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to confirm appointment');
      }
      throw new Error('Failed to confirm appointment');
    }
  }

  async getAppointment(id: string): Promise<Appointment> {
    try {
      const response = await axios.get<AppointmentResponse>(`${config.apiUrl}/appointments/${id}`, {
        headers: this.headers
      });
      return Appointment.create(response.data, response.data.id);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to get appointment');
      }
      throw new Error('Failed to get appointment');
    }
  }

  async getAppointments(filters?: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
    professionalId?: string;
    clientId?: string;
  }): Promise<Appointment[]> {
    try {
      const response = await axios.get<AppointmentResponse[]>(`${config.apiUrl}/appointments`, {
        headers: this.headers,
        params: filters
      });
      return response.data.map(appointmentData => 
        Appointment.create(appointmentData, appointmentData.id)
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to get appointments');
      }
      throw new Error('Failed to get appointments');
    }
  }
} 