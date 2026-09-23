import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@fieldops/shared';

@ApiTags('Audit Logs')
@Controller('api/audit-logs')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Query system audit logs with filters, pagination, and CSV export support' })
  async getAuditLogs(
    @Query('search') search?: string,
    @Query('entity') entity?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    return this.auditService.findAll({
      search,
      entity,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }
}
