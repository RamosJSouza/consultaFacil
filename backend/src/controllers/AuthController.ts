import { Request, Response, NextFunction } from 'express';
import { ValidationError, UnauthorizedError } from '../utils/errors';
import { AuthenticatedRequest, UserRole } from '../types';
import { SequelizeUserRepository } from '../repositories/UserRepository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthController {
  private userRepository: SequelizeUserRepository;

  constructor() {
    this.userRepository = new SequelizeUserRepository();
  }

  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password, name, role, specialty, licenseNumber } = req.body;

      // Validate required fields
      if (!email || !password || !name || !role) {
        throw new ValidationError('Missing required fields');
      }

      // Validate role
      if (!Object.values(UserRole).includes(role) || role === UserRole.SUPERADMIN) {
        throw new ValidationError('Invalid role');
      }

      // Additional validation for professionals
      if (role === UserRole.PROFESSIONAL && (!specialty || !licenseNumber)) {
        throw new ValidationError('Professionals must provide specialty and license number');
      }

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new ValidationError('Email already registered');
      }

      // Create user
      const user = await this.userRepository.create({
        email,
        password,
        name,
        role,
        specialty,
        licenseNumber,
        isActive: true,
      });

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          specialty: user.specialty,
          licenseNumber: user.licenseNumber,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      const user = await this.userRepository.findByEmail(email);
      if (!user || !user.isActive) {
        throw new UnauthorizedError('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid credentials');
      }

      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          specialty: user.specialty,
          licenseNumber: user.licenseNumber,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  };

  getCurrentUser = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Not authenticated');
      }

      const user = await this.userRepository.findById(req.user.id);
      if (!user || !user.isActive) {
        throw new UnauthorizedError('User not found or inactive');
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        specialty: user.specialty,
        licenseNumber: user.licenseNumber,
      });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new UnauthorizedError('Refresh token is required');
      }

      if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT refresh secret not configured');
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET) as {
        id: number;
        email: string;
        role: UserRole;
      };

      const user = await this.userRepository.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const accessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      res.json({
        accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        next(new UnauthorizedError('Invalid refresh token'));
      } else {
        next(error);
      }
    }
  };

  private generateAccessToken(user: { id: number; email: string; role: UserRole }): string {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT secret not configured');
    }

    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
  }

  private generateRefreshToken(user: { id: number; email: string; role: UserRole }): string {
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT refresh secret not configured');
    }

    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
  }
} 