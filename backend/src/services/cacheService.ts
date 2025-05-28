import { createClient } from 'redis';
import logger from '../utils/logger';
import env from '../config/env';

class CacheService {
  private client;
  private readonly defaultTTL = 3600; // 1 hour in seconds

  constructor() {
    this.client = createClient({
      url: env.REDIS_URL || 'redis://localhost:6379',
    });

    this.client.on('error', (error) => {
      logger.error('Redis Client Error:', error);
    });

    this.client.on('connect', () => {
      logger.info('Redis Client Connected');
    });

    this.client.connect().catch((error) => {
      logger.error('Redis Connection Error:', error);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache Get Error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      await this.client.set(key, stringValue, { EX: ttl });
    } catch (error) {
      logger.error('Cache Set Error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Cache Delete Error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.client.flushAll();
    } catch (error) {
      logger.error('Cache Clear Error:', error);
    }
  }

  generateKey(...parts: (string | number)[]): string {
    return parts.join(':');
  }

  async getOrSet<T>(
    key: string,
    callback: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T | null> {
    try {
      const cachedValue = await this.get<T>(key);
      if (cachedValue) {
        return cachedValue;
      }

      const value = await callback();
      await this.set(key, value, ttl);
      return value;
    } catch (error) {
      logger.error('Cache GetOrSet Error:', error);
      return null;
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      logger.error('Cache Invalidate Pattern Error:', error);
    }
  }
}

export default new CacheService(); 