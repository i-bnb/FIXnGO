import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../queue/redis.service';

export interface HealthResponse {
  status: 'ok';
  db: boolean;
  redis: boolean;
  timestamp: string;
}

@ApiTags('System & Health')
@Controller()
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  @Get('api/health')
  @ApiOperation({ summary: 'System Health Check & Connectivity Probe' })
  @ApiResponse({
    status: 200,
    description: 'System health status with database and Redis probe indicators',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        db: { type: 'boolean', example: true },
        redis: { type: 'boolean', example: true },
        timestamp: { type: 'string', example: '2026-09-23T15:00:00.000Z' },
      },
    },
  })
  async getApiHealth(): Promise<HealthResponse> {
    return this.checkHealth();
  }

  @Get('health')
  @ApiOperation({ summary: 'Root Health Check Alias' })
  async getRootHealth(): Promise<HealthResponse> {
    return this.checkHealth();
  }

  private async checkHealth(): Promise<HealthResponse> {
    let db = false;
    let redis = false;

    // 1. Probe PostgreSQL / Neon via raw query
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      db = true;
    } catch {
      db = false;
    }

    // 2. Probe Redis / Upstash via ping command
    try {
      redis = await this.redisService.ping();
    } catch {
      redis = false;
    }

    return {
      status: 'ok',
      db,
      redis,
      timestamp: new Date().toISOString(),
    };
  }
}
