import { User } from '../../domain/entities/User';
import { UserRole } from '../../domain/entities/UserRole';

export interface IUserService {
  getUsers(filters?: {
    role?: UserRole;
    isActive?: boolean;
  }): Promise<User[]>;
  getUser(id: string): Promise<User>;
  updateUser(id: string, data: {
    name?: string;
    specialty?: string;
    licenseNumber?: string;
    isActive?: boolean;
  }): Promise<User>;
  deactivateUser(id: string): Promise<void>;
  activateUser(id: string): Promise<void>;
  linkProfessional(clientId: string, professionalId: string): Promise<void>;
  unlinkProfessional(clientId: string, professionalId: string): Promise<void>;
  getLinkedProfessionals(clientId: string): Promise<User[]>;
  getLinkedClients(professionalId: string): Promise<User[]>;
} 