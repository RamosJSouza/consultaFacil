import type { UserRole } from './UserRole';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  specialty?: string;
  licenseNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
} 