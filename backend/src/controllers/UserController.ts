import { Request, Response, NextFunction } from 'express';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors';
import { AuthenticatedRequest, UserRole } from '../types';
import { SequelizeUserRepository } from '../repositories/UserRepository';
import logger from '../utils/logger';

export class UserController {
  private userRepository: SequelizeUserRepository;

  constructor() {
    this.userRepository = new SequelizeUserRepository();
  }

  getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const users = await this.userRepository.findAll();
      res.json(users);
    } catch (error) {
      next(error);
    }
  };

  getActiveProfessionals = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      logger.info('Buscando profissionais ativos');
      const professionals = await this.userRepository.findActiveProfessionals();
      logger.info(`Encontrados ${professionals.length} profissionais ativos`);
      res.json(professionals);
    } catch (error) {
      logger.error('Erro ao buscar profissionais ativos:', error);
      next(error);
    }
  };

  getUserById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        throw new ValidationError('Invalid user ID');
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundError('User');
      }

      // Check if user has permission to view this profile
      if (
        req.user?.role !== UserRole.SUPERADMIN &&
        req.user?.id !== userId
      ) {
        throw new ForbiddenError('Access denied');
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        specialty: user.specialty,
        licenseNumber: user.licenseNumber,
        isActive: user.isActive,
      });
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        throw new ValidationError('Invalid user ID');
      }

      // Check if user exists
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundError('User');
      }

      // Check if user has permission to update this profile
      if (
        req.user?.role !== UserRole.SUPERADMIN &&
        req.user?.id !== userId
      ) {
        throw new ForbiddenError('Access denied');
      }

      const { name, specialty, licenseNumber } = req.body;

      // Additional validation for professionals
      if (user.role === UserRole.PROFESSIONAL) {
        if (specialty !== undefined && !specialty) {
          throw new ValidationError('Specialty is required for professionals');
        }
        if (licenseNumber !== undefined && !licenseNumber) {
          throw new ValidationError('License number is required for professionals');
        }
      }

      const updatedUser = await this.userRepository.update(userId, {
        name,
        specialty,
        licenseNumber,
      });

      res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        specialty: updatedUser.specialty,
        licenseNumber: updatedUser.licenseNumber,
        isActive: updatedUser.isActive,
      });
    } catch (error) {
      next(error);
    }
  };

  deactivateUser = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        throw new ValidationError('Invalid user ID');
      }

      // Check if user exists
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundError('User');
      }

      // Prevent deactivating own account
      if (req.user?.id === userId) {
        throw new ForbiddenError('Cannot deactivate your own account');
      }

      await this.userRepository.delete(userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
} 