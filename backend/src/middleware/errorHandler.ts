import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError, isOperationalError } from '../utils/errors';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Handle ValidationError
  if (err instanceof ValidationError) {
    res.status(400).json({
      status: 'error',
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  // Handle known operational errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    res.status(400).json({
      status: 'error',
      message: 'Validation error',
      errors: (err as any).errors.map((e: any) => ({
        field: e.path,
        message: e.message,
      })),
    });
    return;
  }

  // If error is not operational (i.e., programming error), send generic error message
  if (!isOperationalError(err)) {
    // Log the error for debugging
    console.error('Programming error:', err);
    
    // Send generic error message in production
    res.status(500).json({
      status: 'error',
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message,
    });
    return;
  }

  // Handle all other errors
  res.status(500).json({
    status: 'error',
    message: err.message,
  });
};
