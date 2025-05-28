import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { UserRole, AuthenticatedRequest } from '../types';
import { SequelizeUserRepository } from '../repositories/UserRepository';

const userRepository = new SequelizeUserRepository();

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedError('No authorization header');
    }

    const [type, token] = authHeader.split(' ');
    
    if (type.toLowerCase() !== 'bearer') {
      throw new UnauthorizedError('Invalid authorization type');
    }

    try {
      // Verificar se JWT_SECRET está configurado
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET environment variable is not set');
        throw new Error('Authentication configuration error');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
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
  } catch (error) {
    next(error);
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


