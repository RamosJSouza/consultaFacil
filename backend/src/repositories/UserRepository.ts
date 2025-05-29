import { IUserRepository } from './interfaces';
import User from '../models/User';
import { NotFoundError } from '../utils/errors';
import { UserRole } from '../types';
import { Op } from 'sequelize';

export class SequelizeUserRepository implements IUserRepository {
  async findById(id: number): Promise<User | null> {
    return User.findByPk(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return User.findOne({ where: { reset_token: token } });
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

  async updateResetToken(id: number, token: string, expiry: Date): Promise<User> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user.update({
      reset_token: token,
      reset_token_expiry: expiry
    });
  }

  async updatePassword(id: number, password: string): Promise<User> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user.update({
      password,
      reset_token: null,
      reset_token_expiry: null
    });
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

  async searchProfessionalsByNameOrSpecialty(searchTerm: string): Promise<User[]> {
    return User.findAll({
      where: {
        role: UserRole.PROFESSIONAL,
        isActive: true,
        [Op.or]: [
          {
            name: {
              [Op.like]: `%${searchTerm}%`
            }
          },
          {
            specialty: {
              [Op.like]: `%${searchTerm}%`
            }
          }
        ]
      },
      attributes: ['id', 'name', 'email', 'specialty', 'licenseNumber']
    });
  }
}
