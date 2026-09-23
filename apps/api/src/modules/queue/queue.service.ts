import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import { RedisService } from './redis.service';

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private queue: Queue | null = null;
  private worker: Worker | null = null;

  constructor(private redisService: RedisService) {}

  onModuleInit() {
    const client = this.redisService.getClient();
    if (!client) {
      this.logger.warn('Redis client unavailable; BullMQ background queue deferred.');
      return;
    }

    try {
      // Initialize BullMQ Queue
      this.queue = new Queue('fieldops-background-tasks', {
        connection: client as any,
      });

      // Configure BullMQ Worker:
      // - concurrency: 1 (single worker)
      // - drainDelay: 30s (respects Upstash free request limits by pausing polling when idle)
      this.worker = new Worker(
        'fieldops-background-tasks',
        async (job: Job) => {
          this.logger.log(`Processing background task: ${job.name} (ID: ${job.id})`);
          return { completed: true, timestamp: new Date().toISOString() };
        },
        {
          connection: client as any,
          concurrency: 1,
          drainDelay: 30, // 30 seconds
        },
      );

      this.worker.on('completed', (job: Job) => {
        this.logger.log(`Background task completed: ${job.name} (ID: ${job.id})`);
      });

      this.worker.on('failed', (job: Job | undefined, err: Error) => {
        this.logger.error(`Background task failed: ${job?.name || 'unknown'}: ${err.message}`);
      });

      this.worker.on('error', (err: Error) => {
        // Log quietly so harmless disconnects don't pollute logs
        this.logger.warn(`BullMQ worker status: ${err.message}`);
      });

      this.logger.log('BullMQ initialized with Upstash settings (1 worker, drainDelay: 30s)');
    } catch (err: any) {
      this.logger.warn(`Could not start BullMQ queue: ${err.message}`);
    }
  }

  async addJob(name: string, data: any, opts?: any) {
    if (!this.queue) {
      this.logger.warn(`Queue not available, job "${name}" was not dispatched to Redis.`);
      return null;
    }
    return this.queue.add(name, data, opts);
  }

  async onModuleDestroy() {
    if (this.worker) {
      try {
        await this.worker.close();
      } catch (err: any) {
        this.logger.warn(`Error closing BullMQ worker: ${err.message}`);
      }
    }
    if (this.queue) {
      try {
        await this.queue.close();
      } catch (err: any) {
        this.logger.warn(`Error closing BullMQ queue: ${err.message}`);
      }
    }
  }
}
