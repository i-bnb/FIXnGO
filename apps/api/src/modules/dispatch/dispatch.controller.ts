import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { DispatchService, PingInput } from './dispatch.service';

@ApiTags('Dispatch & Fleet Tracking')
@Controller()
export class DispatchController {
  constructor(private dispatchService: DispatchService) {}

  @Get('api/dispatch/overview')
  @ApiOperation({ summary: 'Live operations dispatch board: active technicians, pending & active work orders' })
  async getOverview() {
    return this.dispatchService.getDispatchOverview();
  }

  @Get('api/dispatch/suggest-technicians')
  @ApiOperation({ summary: 'Suggest nearest available technicians using PostGIS spatial ST_DistanceSphere / KNN' })
  async suggestTechnicians(
    @Query('workOrderId') workOrderId?: string,
    @Query('latitude') latitude?: string,
    @Query('longitude') longitude?: string,
    @Query('trade') trade?: string,
    @Query('radiusKm') radiusKm?: string,
  ) {
    return this.dispatchService.suggestNearestTechnicians({
      workOrderId,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      trade,
      radiusKm: radiusKm ? parseFloat(radiusKm) : 50,
    });
  }

  @Get('api/dispatch/suggestions/:workOrderId')
  @ApiOperation({ summary: 'Suggest nearest technicians for a specific work order' })
  async getSuggestionsForJob(@Param('workOrderId') workOrderId: string) {
    return this.dispatchService.suggestNearestTechnicians({ workOrderId });
  }

  @Post(['tracking/ping', 'api/tracking/ping'])
  @ApiOperation({ summary: 'Technician telematics GPS ping: persists coordinate and broadcasts to Socket.IO' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        employeeId: { type: 'string' },
        latitude: { type: 'number', example: 25.1972 },
        longitude: { type: 'number', example: 55.2744 },
        speedKmh: { type: 'number', example: 45.0 },
        headingDegrees: { type: 'number', example: 120.0 },
        workOrderId: { type: 'string' },
      },
      required: ['employeeId', 'latitude', 'longitude'],
    },
  })
  async recordPing(@Body() body: PingInput) {
    return this.dispatchService.recordPing(body);
  }

  @Get(['tracking/live', 'api/tracking/live'])
  @ApiOperation({ summary: 'Get last known positions and job assignments for all on-duty technicians' })
  async getLivePositions() {
    return this.dispatchService.getLivePositions();
  }

  @Get(['tracking/route/:workOrderId', 'api/tracking/route/:workOrderId'])
  @ApiOperation({ summary: 'Get historical GPS route coordinates path for a work order' })
  async getRouteHistory(@Param('workOrderId') workOrderId: string) {
    return this.dispatchService.getRouteHistory(workOrderId);
  }

  // ==============================================================
  // GPS TELEMATICS SIMULATOR ENDPOINTS FOR LIVE DEMO
  // ==============================================================
  @Post(['api/dispatch/simulator/start', 'dispatch/simulator/start'])
  @ApiOperation({ summary: 'Start real-time movement simulation for 5 demo technicians along Dubai roads' })
  startSimulator() {
    return this.dispatchService.startSimulator();
  }

  @Post(['api/dispatch/simulator/stop', 'dispatch/simulator/stop'])
  @ApiOperation({ summary: 'Stop real-time movement simulation' })
  stopSimulator() {
    return this.dispatchService.stopSimulator();
  }

  @Get(['api/dispatch/simulator/status', 'dispatch/simulator/status'])
  @ApiOperation({ summary: 'Get GPS Telematics simulator active state and step count' })
  getSimulatorStatus() {
    return this.dispatchService.getSimulatorStatus();
  }
}

