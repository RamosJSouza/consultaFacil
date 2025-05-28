import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/AuthService';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { UserRole, AuthenticatedRequest } from '../types';
import { SequelizeUserRepository } from '../repositories/UserRepository';
import Container from '../config/container';

const authService = new AuthService();
const userRepository = new SequelizeUserRepository();

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedError('No authorization header');
    }

    const [type, token] = authHeader.split(' ');
    
    if (type.toLowerCase() === 'basic') {
      // Handle basic auth for login
      const credentials = Buffer.from(token, 'base64').toString('utf-8');
      const [email, password] = credentials.split(':');
      
      if (!email || !password) {
        throw new UnauthorizedError('Invalid basic auth credentials');
      }

      req.body = { email, password };
      return next();
    }

    if (type.toLowerCase() !== 'bearer') {
      throw new UnauthorizedError('Invalid authorization type');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      email: string;
      role: UserRole;
    };

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('User not authorized');
    }

    next();
  };
};

export const isSuperAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    if (req.user.role !== UserRole.SUPERADMIN) {
      throw new ForbiddenError('Superadmin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const isResourceOwner = (resourceUserId: number) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      if (
        req.user.role !== UserRole.SUPERADMIN && 
        req.user.id !== resourceUserId
      ) {
        throw new ForbiddenError('Access denied');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
