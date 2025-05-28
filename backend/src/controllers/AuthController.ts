import { Request, Response, NextFunction } from 'express';
import { ValidationError, UnauthorizedError, NotFoundError } from '../utils/errors';
import { AuthenticatedRequest, UserRole } from '../types';
import { SequelizeUserRepository } from '../repositories/UserRepository';
import bcrypt from 'bcrypt';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import crypto from 'crypto';
import env from '../config/env'; // Import env configuration

// Define StringValue type para corresponder à definição em jsonwebtoken
type StringValue = string & { __brand: 'StringValue' };

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
      const { email, password, name, role: rawRole, specialty, licenseNumber } = req.body;
      
      // Convert role to lowercase for consistency
      const role = typeof rawRole === 'string' ? rawRole.toLowerCase() : rawRole;

      console.log(`Register attempt with email: ${email}, role: ${role}, specialty: ${specialty}, licenseNumber: ${licenseNumber}`);

      // Validate required fields
      if (!email || !password || !name || !role) {
        throw new ValidationError('Missing required fields');
      }

      // Validate role
      if (!Object.values(UserRole).includes(role) || role === UserRole.SUPERADMIN) {
        throw new ValidationError('Invalid role');
      }

      // Additional validation for professionals
      if (role === UserRole.PROFESSIONAL) {
        if (!specialty) {
          throw new ValidationError('Professionals must provide specialty');
        }
        if (!licenseNumber) {
          throw new ValidationError('Professionals must provide license number');
        }
      }

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new ValidationError('Email already registered');
      }

      // Create user with appropriate fields
      const userData = {
        email,
        password,
        name,
        role,
        isActive: true,
        ...(role === UserRole.PROFESSIONAL ? { specialty, licenseNumber } : {})
      };

      // Create user
      const user = await this.userRepository.create(userData);

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
      console.error('Registration error:', error);
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

      console.log(`Login attempt for email: ${email}`);

      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      // Use env.JWT_SECRET instead of process.env.JWT_SECRET
      if (!env.JWT_SECRET) {
        console.error('JWT_SECRET environment variable is not set');
        throw new Error('Authentication configuration error');
      }

      const user = await this.userRepository.findByEmail(email);
      if (!user || !user.isActive) {
        console.log(`Login failed: User not found or inactive for email ${email}`);
        throw new UnauthorizedError('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log(`Login failed: Invalid password for email ${email}`);
        throw new UnauthorizedError('Invalid credentials');
      }

      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      console.log(`Login successful for user ${user.id} (${user.email})`);

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

      // Use env.JWT_REFRESH_SECRET instead of process.env.JWT_REFRESH_SECRET
      if (!env.JWT_REFRESH_SECRET) {
        throw new Error('JWT refresh secret not configured');
      }

      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
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

  forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        throw new ValidationError('Email is required');
      }

      // Verificar se o usuário existe
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Gerar token de recuperação (expira em 1 hora)
      const resetToken = crypto.randomBytes(20).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

      // Salvar token no banco
      await this.userRepository.updateResetToken(user.id, resetToken, resetTokenExpiry);

      // Enviar email com link de recuperação
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
      
      // Aqui implementaríamos o envio de email com o link
      // Em produção, utilize um serviço como Nodemailer
      console.log(`Link de recuperação: ${resetUrl}`);

      res.status(200).json({ 
        message: 'Email de recuperação enviado com sucesso',
        // Em desenvolvimento, retornamos o token para testes
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        throw new ValidationError('Token and new password are required');
      }

      // Verificar se o token é válido e não expirou
      const user = await this.userRepository.findByResetToken(token);
      
      if (!user || !user.reset_token_expiry || user.reset_token_expiry < new Date()) {
        throw new ValidationError('Invalid or expired token');
      }

      // Hash da nova senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Atualizar senha e limpar token
      await this.userRepository.updatePassword(user.id, hashedPassword);

      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  private generateAccessToken(user: { id: number; email: string; role: UserRole }): string {
    if (!env.JWT_SECRET) {
      throw new Error('JWT secret not configured');
    }
    
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      env.JWT_SECRET as Secret,
      { expiresIn: '15m' } // Usar valor literal em vez da variável de ambiente
    );
  }

  private generateRefreshToken(user: { id: number; email: string; role: UserRole }): string {
    if (!env.JWT_REFRESH_SECRET) {
      throw new Error('JWT refresh secret not configured');
    }
    
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      env.JWT_REFRESH_SECRET as Secret,
      { expiresIn: '7d' } // Usar valor literal em vez da variável de ambiente
    );
  }
} 