import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface CreateAuditLogParams {
  actorUserId?: string | null;
  actorName?: string | null;
  actorRole?: string | null;
  action: string;
  entityName: string;
  entityId: string;
  details?: Record<string, any> | null;
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async log(params: CreateAuditLogParams) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          actorUserId: params.actorUserId || null,
          actorName: params.actorName || 'System',
          actorRole: params.actorRole || 'SYSTEM',
          action: params.action,
          entityName: params.entityName,
          entityId: params.entityId,
          oldValuesJson: params.oldValues || null,
          newValuesJson: params.newValues || params.details || null,
          ipAddress: params.ipAddress || null,
          userAgent: params.userAgent || null,
        },
      });
    } catch (err) {
      this.logger.error('Failed to write audit log entry:', (err as Error).message);
      return null;
    }
  }

  async findAll(query?: { search?: string; entity?: string; limit?: number; offset?: number }) {
    const where: any = { deletedAt: null };
    if (query?.entity) {
      where.entityName = query.entity;
    }
    if (query?.search) {
      where.OR = [
        { actorName: { contains: query.search, mode: 'insensitive' } },
        { action: { contains: query.search, mode: 'insensitive' } },
        { entityId: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: query?.limit || 50,
        skip: query?.offset || 0,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      total,
      limit: query?.limit || 50,
      offset: query?.offset || 0,
    };
  }
}
