import User from '../../models/User';

export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByResetToken(token: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(data: Partial<User>): Promise<User>;
  update(id: number, data: Partial<User>): Promise<User>;
  updateResetToken(id: number, token: string, expiry: Date): Promise<User>;
  updatePassword(id: number, password: string): Promise<User>;
  delete(id: number): Promise<void>;
  findActiveProfessionals(): Promise<User[]>;
} 