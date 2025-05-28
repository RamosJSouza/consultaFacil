import type { User } from './User';

export interface Appointment {
  id: number;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  client: User;
  professional: User;
  createdAt: string;
  updatedAt: string;
} 