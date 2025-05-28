export interface Availability {
  id: number;
  professionalId: number;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM:SS format
  endTime: string; // HH:MM:SS format
  isAvailable: boolean;
  isRecurring: boolean; // Indica se a disponibilidade se repete semanalmente
  createdAt: string;
  updatedAt: string;
} 