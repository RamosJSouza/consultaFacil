import type { User } from '../../domain/entities/User';
import type { UserRole } from '../../domain/entities/UserRole';

export interface IUserService {
  getUsers(filters?: {
    role?: UserRole;
    isActive?: boolean;
  }): Promise<User[]>;
  getUser(id: number): Promise<User>;
  updateUser(id: number, data: {
    name?: string;
    specialty?: string;
    licenseNumber?: string;
    isActive?: boolean;
  }): Promise<User>;
  deactivateUser(id: number): Promise<void>;
  activateUser(id: number): Promise<void>;
  linkProfessional(clientId: number, professionalId: number): Promise<void>;
  unlinkProfessional(clientId: number, professionalId: number): Promise<void>;
  getLinkedProfessionals(clientId: number): Promise<User[]>;
  getLinkedClients(professionalId: number): Promise<User[]>;
} 