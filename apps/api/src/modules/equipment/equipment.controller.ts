import { Controller, Get, Post, Query, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { EquipmentService } from './equipment.service';

@ApiTags('Equipment Rental')
@Controller('api/equipment')
export class EquipmentController {
  constructor(private equipmentService: EquipmentService) {}

  @Get()
  @ApiOperation({ summary: 'List equipment rental fleet with status & category filters' })
  async getEquipment(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.equipmentService.findAll({
      search,
      status,
      category,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  @Get('check-availability')
  @ApiOperation({ summary: 'Check equipment availability by date range (detects overlapping contracts)' })
  async checkAvailability(
    @Query('equipmentId') equipmentId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.equipmentService.checkAvailability(equipmentId, startDate, endDate);
  }

  @Get('contracts')
  @ApiOperation({ summary: 'List all equipment rental contracts' })
  async getContracts(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.equipmentService.findAllContracts({
      search,
      status,
      customerId,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single equipment item with contract history' })
  async getEquipmentById(@Param('id') id: string) {
    return this.equipmentService.findById(id);
  }

  @Post(['contracts', 'rentals'])
  @ApiOperation({ summary: 'Create a new equipment rental contract (rejects overlapping periods)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        customerId: { type: 'string' },
        equipmentId: { type: 'string' },
        projectName: { type: 'string', example: 'Downtown Tower Project C' },
        siteLocation: { type: 'string', example: 'Downtown Dubai' },
        startDate: { type: 'string', example: '2026-03-01T00:00:00.000Z' },
        expectedEndDate: { type: 'string', example: '2026-03-31T00:00:00.000Z' },
        rateBasis: { type: 'string', enum: ['DAILY', 'WEEKLY', 'MONTHLY'], example: 'MONTHLY' },
        depositAmount: { type: 'number', example: 5000 },
      },
      required: ['customerId', 'equipmentId', 'projectName', 'siteLocation', 'startDate', 'expectedEndDate'],
    },
  })
  async createRental(@Body() body: any, @Req() req: any) {
    return this.equipmentService.createRentalContract(body, req.user?.id);
  }

  @Post('contracts/:id/dispatch-return')
  @ApiOperation({ summary: 'Record equipment pre-dispatch or post-return inspection' })
  async recordDispatchOrReturn(
    @Param('id') contractId: string,
    @Body() body: {
      equipmentId: string;
      actionType: 'DISPATCH' | 'RETURN';
      hoursMeterReading?: number;
      fuelLevel?: string;
      conditionNotes?: string;
    },
    @Req() req: any,
  ) {
    return this.equipmentService.recordDispatchOrReturn(contractId, body, req.user?.id);
  }
}
