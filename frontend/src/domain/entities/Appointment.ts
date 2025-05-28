import type { User } from './User';

export interface Appointment {
  id: number;
  clientId: number;
  professionalId: number;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM:SS
  endTime: string; // HH:MM:SS
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  client?: {
    id: number;
    name: string;
    email: string;
  };
  professional?: {
    id: number;
    name: string;
    specialty?: string;
  };
} 