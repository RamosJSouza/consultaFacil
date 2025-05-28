import rateLimit from 'express-rate-limit';

// Basic rate limiter for general routes
export const basicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Stricter rate limiter for authentication routes
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 505, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again after an hour',
});

// Rate limiter for API routes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 950, // limit each IP to 50 requests per windowMs
  message: 'Too many API requests from this IP, please try again after 15 minutes',
});
