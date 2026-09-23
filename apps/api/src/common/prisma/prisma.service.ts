import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err) {
      console.warn('Prisma could not connect to PostgreSQL. Mock/in-memory fallback will activate if DB is unavailable:', (err as Error).message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
