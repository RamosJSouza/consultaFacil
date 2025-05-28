import bcrypt from 'bcrypt';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { ValidationError, UnauthorizedError, ForbiddenError } from '../utils/errors';
import { IUser, UserRole } from '../types';
import { SequelizeUserRepository } from '../repositories/UserRepository';
import User from '../models/User';

type StringValue = `${number}${'s' | 'm' | 'h' | 'd' | 'y'}`;

export class AuthService {
  private userRepository: SequelizeUserRepository;
  private readonly JWT_SECRET: Secret;
  private readonly JWT_REFRESH_SECRET: Secret;
  private readonly ACCESS_TOKEN_EXPIRATION: StringValue = '15m';
  private readonly REFRESH_TOKEN_EXPIRATION: StringValue = '7d';

  constructor() {
    this.userRepository = new SequelizeUserRepository();
    
    // Set JWT secrets
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT secrets not configured');
    }
    this.JWT_SECRET = process.env.JWT_SECRET;
    this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

    // Override expiration times if set in environment
    if (process.env.JWT_ACCESS_EXPIRATION) {
      this.ACCESS_TOKEN_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION as StringValue;
    }
    if (process.env.JWT_REFRESH_EXPIRATION) {
      this.REFRESH_TOKEN_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION as StringValue;
    }
  }

  async validateCredentials(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    return user;
  }

  generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessTokenOptions: SignOptions = {
      expiresIn: this.ACCESS_TOKEN_EXPIRATION,
    };

    const refreshTokenOptions: SignOptions = {
      expiresIn: this.REFRESH_TOKEN_EXPIRATION,
    };

    const accessToken = jwt.sign(payload, this.JWT_SECRET, accessTokenOptions);
    const refreshToken = jwt.sign(payload, this.JWT_REFRESH_SECRET, refreshTokenOptions);

    return { accessToken, refreshToken };
  }

  async validateToken(token: string): Promise<{ id: number; email: string; role: UserRole }> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as {
        id: number;
        email: string;
        role: UserRole;
      };

      const user = await this.userRepository.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new UnauthorizedError('Invalid token');
      }

      return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid token');
      }
      throw error;
    }
  }

  async validateRefreshToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, this.JWT_REFRESH_SECRET) as {
        id: number;
        email: string;
        role: UserRole;
      };

      const user = await this.userRepository.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      return user;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid refresh token');
      }
      throw error;
    }
  }

  async register(userData: Partial<IUser>): Promise<IUser> {
    // Validate required fields
    if (!userData.email || !userData.password || !userData.name || !userData.role) {
      throw new ValidationError('Missing required fields');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    // Create user
    const user = await this.userRepository.create({
      ...userData,
      isActive: true,
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user.get();
    return userWithoutPassword as IUser;
  }
}
