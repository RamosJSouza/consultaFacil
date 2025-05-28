import type { Availability } from '../entities/Availability';

export interface AvailabilityRepository {
  getAll(): Promise<Availability[]>;
  getByProfessional(professionalId: number): Promise<Availability[]>;
  getByProfessionalAndDay(professionalId: number, dayOfWeek: number): Promise<Availability[]>;
  create(availability: Omit<Availability, 'id' | 'createdAt' | 'updatedAt'>): Promise<Availability>;
  update(id: number, availability: Partial<Availability>): Promise<Availability>;
  delete(id: number): Promise<void>;
} 