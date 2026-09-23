import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private connectionAttempted = false;

  getClient(): Redis | null {
    if (this.client) {
      return this.client;
    }

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    try {
      const isTls = redisUrl.startsWith('rediss://');
      const options: RedisOptions = {
        maxRetriesPerRequest: null, // Mandatory for BullMQ compatibility
        lazyConnect: true,
        enableOfflineQueue: false,
        retryStrategy: (times) => {
          if (times > 3) {
            // Stop aggressive retrying to conserve free tier quotas
            return null;
          }
          return Math.min(times * 2000, 10000);
        },
      };

      if (isTls) {
        options.tls = {
          rejectUnauthorized: false,
        };
      }

      this.client = new Redis(redisUrl, options);

      this.client.on('error', (err) => {
        // Log once or quietly without crashing application
        if (!this.connectionAttempted) {
          this.logger.warn(`Redis connection warning: ${err.message}`);
          this.connectionAttempted = true;
        }
      });

      this.client.connect().catch((err) => {
        this.logger.warn(`Redis initial connection could not be established: ${err.message}`);
      });

      return this.client;
    } catch (err: any) {
      this.logger.warn(`Failed to instantiate Redis client: ${err.message}`);
      return null;
    }
  }

  async ping(): Promise<boolean> {
    try {
      const client = this.getClient();
      if (!client) {
        return false;
      }
      const response = await client.ping();
      return response === 'PONG';
    } catch {
      return false;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {
        this.client.disconnect();
      }
    }
  }
}
