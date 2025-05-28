import { IUserRepository } from './interfaces';
import User from '../models/User';
import { NotFoundError } from '../utils/errors';
import { UserRole } from '../types';

export class SequelizeUserRepository implements IUserRepository {
  async findById(id: number): Promise<User | null> {
    return User.findByPk(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }

  async findAll(): Promise<User[]> {
    return User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'specialty', 'licenseNumber', 'isActive'],
    });
  }

  async create(data: Partial<User>): Promise<User> {
    return User.create(data as any);
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user.update(data);
  }

  async delete(id: number): Promise<void> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError('User');
    }
    await user.update({ isActive: false });
  }

  async findActiveProfessionals(): Promise<User[]> {
    return User.findAll({
      where: {
        role: UserRole.PROFESSIONAL,
        isActive: true
      },
      attributes: ['id', 'name', 'email', 'specialty', 'licenseNumber']
    });
  }
}
