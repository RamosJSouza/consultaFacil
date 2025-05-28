import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

  // Log request
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Log request body if present and not a file upload
  if (req.body && Object.keys(req.body).length > 0 && !req.is('multipart/form-data')) {
    logger.debug('Request body:', req.body);
  }

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const statusMessage = res.statusMessage;

    const logMessage = `${req.method} ${req.originalUrl} ${statusCode} ${statusMessage} - ${duration}ms`;

    if (statusCode >= 500) {
      logger.error(logMessage);
    } else if (statusCode >= 400) {
      logger.warn(logMessage);
    } else {
      logger.info(logMessage);
    }
  });

  next();
}; 