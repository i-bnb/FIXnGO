import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { WorkOrdersService } from './work-orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Work Orders')
@Controller('api/work-orders')
export class WorkOrdersController {
  constructor(private workOrdersService: WorkOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List work orders with search, filters, pagination' })
  async getWorkOrders(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('serviceType') serviceType?: string,
    @Query('priority') priority?: string,
    @Query('customerId') customerId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('technicianId') technicianId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.workOrdersService.findAll({
      search,
      status,
      serviceType,
      priority,
      customerId,
      employeeId: employeeId || technicianId,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full work order details by ID' })
  async getWorkOrderById(@Param('id') id: string) {
    return this.workOrdersService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new work order' })
  async createWorkOrder(@Body() body: any, @Req() req: any) {
    return this.workOrdersService.create(body, req.user?.id);
  }

  @Post('book')
  @ApiOperation({ summary: 'Customer on-demand service booking (Pronto-style)' })
  async createBooking(@Body() body: any, @Req() req: any) {
    return this.workOrdersService.create({
      customerId: body.customerId,
      siteId: body.siteId,
      serviceType: body.serviceType || 'HVAC',
      title: body.title || `${body.serviceType || 'MEP'} Service Request`,
      description: body.description || 'On-demand service booking',
      priority: body.priority || 'MEDIUM',
      address: body.address,
      latitude: body.latitude,
      longitude: body.longitude,
      scheduledStart: body.scheduledDate,
    }, req.user?.id);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign technician in-charge + helpers with double-booking check' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        inChargeEmployeeId: { type: 'string' },
        helperEmployeeIds: { type: 'array', items: { type: 'string' } },
        notes: { type: 'string' },
      },
      required: ['inChargeEmployeeId'],
    },
  })
  async assignTechnicians(
    @Param('id') id: string,
    @Body() body: { inChargeEmployeeId?: string; technicianId?: string; helperEmployeeIds?: string[]; notes?: string },
    @Req() req: any,
  ) {
    return this.workOrdersService.assign(
      id,
      {
        inChargeEmployeeId: body.inChargeEmployeeId || body.technicianId || '',
        helperEmployeeIds: body.helperEmployeeIds,
        notes: body.notes,
      },
      req.user?.id,
    );
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update work order status via allowed state machine' })
  async updateStatusPatch(
    @Param('id') id: string,
    @Body() body: { status: string; reason?: string; latitude?: number; longitude?: number },
    @Req() req: any,
  ) {
    return this.workOrdersService.updateStatus(
      id,
      body.status,
      body.reason,
      { latitude: body.latitude, longitude: body.longitude },
      req.user?.id,
    );
  }

  @Post(':id/status')
  @ApiOperation({ summary: 'Update work order status (POST alternative)' })
  async updateStatusPost(
    @Param('id') id: string,
    @Body() body: { status: string; reason?: string; latitude?: number; longitude?: number },
    @Req() req: any,
  ) {
    return this.workOrdersService.updateStatus(
      id,
      body.status,
      body.reason,
      { latitude: body.latitude, longitude: body.longitude },
      req.user?.id,
    );
  }

  @Post(':id/parts')
  @ApiOperation({ summary: 'Issue parts to job and decrement van / warehouse inventory' })
  async addPart(
    @Param('id') id: string,
    @Body() body: { itemId: string; quantity: number; warehouseId?: string; partAction?: string; serialNumberFitted?: string; serialNumberRemoved?: string },
    @Req() req: any,
  ) {
    return this.workOrdersService.addPart(id, body, req.user?.id);
  }

  // Backwards compatible endpoint
  @Post(':id/materials')
  @ApiOperation({ summary: 'Issue materials consumed on site (alias for /parts)' })
  async addMaterial(
    @Param('id') id: string,
    @Body() body: { materialItemId?: string; itemId?: string; quantity: number; warehouseId?: string },
    @Req() req: any,
  ) {
    return this.workOrdersService.addPart(
      id,
      {
        itemId: body.itemId || body.materialItemId || '',
        quantity: body.quantity,
        warehouseId: body.warehouseId,
      },
      req.user?.id,
    );
  }

  @Post(':id/labour')
  @ApiOperation({ summary: 'Record labour hours worked on job' })
  async addLabour(
    @Param('id') id: string,
    @Body() body: { employeeId: string; hours: number; hourlyBillingRate?: number; hourlyCostRate?: number },
    @Req() req: any,
  ) {
    return this.workOrdersService.addLabour(id, body, req.user?.id);
  }

  @Post(':id/attachments')
  @ApiOperation({ summary: 'Attach before/after photo or document to work order' })
  async addAttachment(
    @Param('id') id: string,
    @Body() body: { attachmentType: string; fileId: string; fileName: string; fileUrl: string; fileSizeBytes: number; mimeType: string; caption?: string },
    @Req() req: any,
  ) {
    return this.workOrdersService.addAttachment(id, body, req.user?.id);
  }

  @Post(':id/signoff')
  @ApiOperation({ summary: 'Customer digital sign-off and rating' })
  async signoff(
    @Param('id') id: string,
    @Body() body: { signedByName: string; signatureUrl: string; rating?: number; feedbackComments?: string },
    @Req() req: any,
  ) {
    return this.workOrdersService.signoff(id, body, req.user?.id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete job (validates mandatory after-photo and signature)' })
  async completeJob(
    @Param('id') id: string,
    @Body() body: {
      requireAfterPhoto?: boolean;
      requireSignoff?: boolean;
      signedByName?: string;
      signatureUrl?: string;
      rating?: number;
      feedbackComments?: string;
      afterPhotoUrl?: string;
    },
    @Req() req: any,
  ) {
    return this.workOrdersService.complete(id, body, req.user?.id);
  }

  @Post(':id/generate-invoice')
  @ApiOperation({ summary: 'Generate 5% VAT invoice from work order and post General Ledger journal' })
  async generateInvoice(@Param('id') id: string, @Req() req: any) {
    return this.workOrdersService.generateInvoice(id, req.user?.id);
  }
}
