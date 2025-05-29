import axios from 'axios';
import type { Appointment } from '../../domain/entities/Appointment';
import { config } from '../config';
import type { IAppointmentService, CreateAppointmentData, UpdateAppointmentData } from '../../application/ports/IAppointmentService';

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
      const response = await axios.post<Appointment>(`${config.apiUrl}/appointments`, data, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to create appointment');
      }
      throw new Error('Failed to create appointment');
    }
  }

  async updateAppointment(id: number, data: UpdateAppointmentData): Promise<Appointment> {
    try {
      const response = await axios.put<Appointment>(`${config.apiUrl}/appointments/${id}`, data, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to update appointment');
      }
      throw new Error('Failed to update appointment');
    }
  }

  async cancelAppointment(id: number): Promise<void> {
    try {
      await axios.patch(`${config.apiUrl}/appointments/${id}/cancel`, {}, {
        headers: this.headers
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to cancel appointment');
      }
      throw new Error('Failed to cancel appointment');
    }
  }

  async confirmAppointment(id: number): Promise<Appointment> {
    try {
      const response = await axios.patch<Appointment>(`${config.apiUrl}/appointments/${id}/confirm`, {}, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to confirm appointment');
      }
      throw new Error('Failed to confirm appointment');
    }
  }

  async getAppointment(id: number): Promise<Appointment> {
    try {
      const response = await axios.get<Appointment>(`${config.apiUrl}/appointments/${id}`, {
        headers: this.headers
      });
      return response.data;
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
    professionalId?: number;
    clientId?: number;
  }): Promise<Appointment[]> {
    try {
      const response = await axios.get<Appointment[]>(`${config.apiUrl}/appointments`, {
        headers: this.headers,
        params: filters
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to get appointments');
      }
      throw new Error('Failed to get appointments');
    }
  }
} 