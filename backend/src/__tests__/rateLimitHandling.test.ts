import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { basicLimiter, authLimiter, apiLimiter } from '../middleware/rateLimit';

const createTestHandler = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).send('OK');
    } catch (error) {
      next(error);
    }
  };
};

describe('Rate Limiting Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    jest.setTimeout(30000); // Increase timeout for rate limit tests
  });

  describe('basicLimiter', () => {
    beforeEach(() => {
      app.use('/test', basicLimiter, createTestHandler());
    });

    it('should allow requests within the limit', async () => {
      const responses = await Promise.all(
        Array(5).fill(null).map(() => request(app).get('/test'))
      );
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should block requests over the limit', async () => {
      const responses = await Promise.all(
        Array(101).fill(null).map(() => request(app).get('/test'))
      );
      
      const blockedResponses = responses.filter(r => r.status === 429);
      expect(blockedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('authLimiter', () => {
    beforeEach(() => {
      app.use('/auth', authLimiter, createTestHandler());
    });

    it('should block after 5 attempts', async () => {
      const responses = await Promise.all(
        Array(6).fill(null).map(() => request(app).post('/auth'))
      );

      // First 5 should succeed, 6th should be blocked
      responses.slice(0, 5).forEach(response => {
        expect(response.status).toBe(200);
      });
      expect(responses[5].status).toBe(429);
    });
  });

  describe('apiLimiter', () => {
    beforeEach(() => {
      app.use('/api', apiLimiter, createTestHandler());
    });

    it('should allow 30 requests per minute', async () => {
      const responses = await Promise.all(
        Array(31).fill(null).map(() => request(app).get('/api'))
      );

      // First 30 should succeed
      responses.slice(0, 30).forEach(response => {
        expect(response.status).toBe(200);
      });

      // 31st should be blocked
      expect(responses[30].status).toBe(429);
    });
  });
});
