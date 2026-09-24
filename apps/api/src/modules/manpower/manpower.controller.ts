import { Controller, Get, Post, Body, Query, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ManpowerService } from './manpower.service';

@ApiTags('Manpower & Labour Supply')
@Controller('api/manpower')
export class ManpowerController {
  constructor(private manpowerService: ManpowerService) {}

  @Get('deployments')
  @ApiOperation({ summary: 'List construction site labour supply deployments' })
  async getDeployments(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.manpowerService.findAllDeployments({
      search,
      status,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  @Get('deployments/:id')
  @ApiOperation({ summary: 'Get deployment details with full timesheets ledger' })
  async getDeploymentById(@Param('id') id: string) {
    return this.manpowerService.findDeploymentById(id);
  }

  @Post('deployments')
  @ApiOperation({ summary: 'Create a new labour supply project deployment' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        clientName: { type: 'string', example: 'Palm Crest Properties LLC' },
        projectName: { type: 'string', example: 'Palm Crest Tower Phase 3' },
        siteLocation: { type: 'string', example: 'Downtown Dubai, UAE' },
        startDate: { type: 'string', example: '2026-03-01' },
        endDate: { type: 'string', example: '2026-08-31' },
        billingType: { type: 'string', example: 'DAILY' },
      },
      required: ['clientName', 'projectName', 'siteLocation', 'startDate', 'endDate'],
    },
  })
  async createDeployment(@Body() body: any, @Req() req: any) {
    return this.manpowerService.createDeployment(body, req.user?.id);
  }

  @Post('timesheets')
  @ApiOperation({ summary: 'Submit daily labour timesheet with regular/overtime hours and supervisor signoff' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        deploymentId: { type: 'string' },
        employeeId: { type: 'string' },
        workDate: { type: 'string', example: '2026-03-23' },
        regularHours: { type: 'number', example: 8.0 },
        overtimeHours: { type: 'number', example: 2.0 },
        siteSupervisorSignature: { type: 'string', example: 'Eng. Basel Al-Kurdi' },
      },
      required: ['deploymentId', 'employeeId', 'workDate'],
    },
  })
  async submitTimesheet(@Body() body: any, @Req() req: any) {
    return this.manpowerService.submitTimesheet(body, req.user?.id);
  }

  @Post('deployments/:id/monthly-invoice')
  @ApiOperation({ summary: 'Aggregate unbilled timesheets and generate monthly consolidated 5% VAT invoice' })
  async generateMonthlyInvoice(@Param('id') id: string, @Req() req: any) {
    return this.manpowerService.generateMonthlyInvoice(id, req.user?.id);
  }
}
