import { Controller, Get, Post, Body, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApprovalsService } from './approvals.service';

@ApiTags('Approvals & Workflow Authorization')
@Controller('api/approvals')
export class ApprovalsController {
  constructor(private approvalsService: ApprovalsService) {}

  @Get()
  @ApiOperation({ summary: 'List approval requests (filter by status, requestType, approver)' })
  async getRequests(
    @Query('status') status?: string,
    @Query('requestType') requestType?: string,
    @Query('approverUserId') approverUserId?: string,
  ) {
    return this.approvalsService.getRequests({ status, requestType, approverUserId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of an approval request' })
  async getRequestById(@Param('id') id: string) {
    return this.approvalsService.getRequestById(id);
  }

  @Post('request')
  @ApiOperation({ summary: 'Submit an approval request (e.g. QUOTATION_DISCOUNT, PURCHASE_ORDER, EXPENSE_CLAIM)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        requestType: { type: 'string', example: 'QUOTATION_DISCOUNT' },
        entityId: { type: 'string' },
        approverRole: { type: 'string', example: 'OPERATIONS_MANAGER' },
        comments: { type: 'string', example: 'Client requested 15% discount on AC retrofit' },
      },
      required: ['requestType', 'entityId'],
    },
  })
  async createRequest(@Body() body: any, @Req() req: any) {
    const userId = req.user?.id || 'demo-admin-id';
    return this.approvalsService.createRequest(body, userId);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a request and execute cascading workflow updates' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        comments: { type: 'string', example: 'Approved by Operations Director' },
      },
    },
  })
  async approveRequest(@Param('id') id: string, @Body() body: { comments?: string }, @Req() req: any) {
    return this.approvalsService.approveRequest(id, body?.comments, req.user?.id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject an approval request' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        comments: { type: 'string', example: 'Discount exceeds margin threshold' },
      },
    },
  })
  async rejectRequest(@Param('id') id: string, @Body() body: { comments?: string }, @Req() req: any) {
    return this.approvalsService.rejectRequest(id, body?.comments, req.user?.id);
  }
}
