import type { User } from '../../domain/entities/User';
import type { UserRole } from '../../domain/entities/UserRole';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role: UserRole;
  specialty?: string;
  licenseNumber?: string;
}

export interface IAuthenticationService {
  login(credentials: LoginCredentials): Promise<{ user: User; token: string }>;
  register(data: RegisterData): Promise<{ user: User; token: string }>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  isAuthenticated(): boolean;
} 