import request from 'supertest';
import express from 'express';
import { basicLimiter, authLimiter, apiLimiter } from '../middleware/rateLimit';

describe('Rate Limiting Middleware', () => {  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    jest.setTimeout(30000); // Increase timeout for rate limit tests
  });
  describe('basicLimiter', () => {
    beforeEach(() => {
      app.use('/test', basicLimiter, (_req: express.Request, res: express.Response) => {
        res.status(200).send('OK');
      });
    });

    it('should allow requests within the limit', async () => {
      // Make multiple requests but stay under limit
      const responses = await Promise.all(
        Array(5).fill(null).map(() => request(app).get('/test'))
      );
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should block requests over the limit', async () => {
      // Force rate limit to be exceeded
      const promises = Array(101).fill(null).map(() => 
        request(app).get('/test')
      );
      
      const responses = await Promise.all(promises);
      const blockedResponses = responses.filter(r => r.status === 429);
      expect(blockedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('authLimiter', () => {
    beforeEach(() => {
      app.use('/auth', authLimiter, (_req, res) => res.send('OK'));
    });

    it('should block after 5 attempts', async () => {
      // Make 6 requests
      const responses = [];
      for (let i = 0; i < 6; i++) {
        const response = await request(app).post('/auth');
        responses.push(response);
      }

      // Last request should be blocked
      expect(responses[5].status).toBe(429);
    });
  });

  describe('apiLimiter', () => {
    beforeEach(() => {
      app.use('/api', apiLimiter, (_req, res) => res.send('OK'));
    });

    it('should allow 30 requests per minute', async () => {
      // Make 30 requests
      for (let i = 0; i < 30; i++) {
        const response = await request(app).get('/api');
        expect(response.status).toBe(200);
      }

      // 31st request should be blocked
      const response = await request(app).get('/api');
      expect(response.status).toBe(429);
    });
  });
});
