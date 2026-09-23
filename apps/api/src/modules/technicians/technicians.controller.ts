import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { TechniciansService } from './technicians.service';

@ApiTags('Technicians & Workforce')
@Controller('api/technicians')
export class TechniciansController {
  constructor(private techniciansService: TechniciansService) {}

  @Get()
  @ApiOperation({ summary: 'List field technicians and workforce with availability, trade, and location' })
  async getTechnicians(
    @Query('search') search?: string,
    @Query('trade') trade?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.techniciansService.findAll({
      search,
      trade,
      status,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full technician profile with skills, recent jobs, and telematics history' })
  async getTechnicianById(@Param('id') id: string) {
    return this.techniciansService.findById(id);
  }

  @Post(':id/attendance/check-in')
  @ApiOperation({ summary: 'Record technician mobile attendance clock-in with geo-coordinates' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        latitude: { type: 'number', example: 25.1972 },
        longitude: { type: 'number', example: 55.2744 },
        address: { type: 'string', example: 'Downtown Dubai, UAE' },
      },
    },
  })
  async checkIn(@Param('id') employeeId: string, @Body() body: any) {
    return this.techniciansService.checkIn(employeeId, body);
  }

  @Post('attendance/:attendanceId/check-out')
  @ApiOperation({ summary: 'Record technician mobile attendance clock-out with geo-coordinates' })
  async checkOut(@Param('attendanceId') attendanceId: string, @Body() body: any) {
    return this.techniciansService.checkOut(attendanceId, body);
  }
}
