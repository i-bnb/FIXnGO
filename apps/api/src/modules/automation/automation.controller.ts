import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AutomationService } from './automation.service';

@ApiTags('Automation & Background Tasks')
@Controller('api/automation')
export class AutomationController {
  constructor(private automationService: AutomationService) {}

  @Post('run-all')
  @ApiOperation({ summary: 'Manually trigger all automated checks (SLA, AMC, Rentals, Overdue Invoices, Stock)' })
  async runAll() {
    return this.automationService.runScheduledChecks();
  }

  @Post('check-sla')
  @ApiOperation({ summary: 'Scan for SLA breaches and dispatch fleet alerts' })
  async checkSla() {
    return this.automationService.checkSlaBreaches();
  }

  @Post('check-amc')
  @ApiOperation({ summary: 'Scan for upcoming AMC preventive maintenance visits' })
  async checkAmc() {
    return this.automationService.checkAmcVisitReminders();
  }

  @Post('check-rentals')
  @ApiOperation({ summary: 'Scan for equipment rentals due for return / off-hire' })
  async checkRentals() {
    return this.automationService.checkRentalReturns();
  }

  @Post('check-invoices')
  @ApiOperation({ summary: 'Scan for overdue invoices and schedule dunning reminders' })
  async checkInvoices() {
    return this.automationService.checkOverdueInvoices();
  }

  @Post('check-stock')
  @ApiOperation({ summary: 'Scan warehouse and van inventory for low-stock reorder thresholds' })
  async checkStock() {
    return this.automationService.checkLowStockAlerts();
  }

  @Post('auto-reply/:serviceRequestId')
  @ApiOperation({ summary: 'Trigger simulated instant auto-reply for a customer service request' })
  async triggerAutoReply(@Param('serviceRequestId') serviceRequestId: string) {
    return this.automationService.triggerAutoReply(serviceRequestId);
  }

  @Get('rules')
  @ApiOperation({ summary: 'List configured automation rules' })
  async getRules() {
    return this.automationService.getRules();
  }

  @Get('reminders')
  @ApiOperation({ summary: 'List generated reminders and alerts' })
  async getReminders() {
    return this.automationService.getReminders();
  }

  @Get('scenarios')
  @ApiOperation({ summary: 'List available 1-click demo scenario definitions' })
  async getScenarios() {
    return this.automationService.getScenarioDefinitions();
  }

  @Post('scenarios/:scenarioKey')
  @ApiOperation({ summary: 'Trigger a specific 1-click business automation scenario' })
  async runScenario(@Param('scenarioKey') scenarioKey: string) {
    return this.automationService.runScenario(scenarioKey);
  }

  // -------------------------------------------------------------------------
  // 5 OPERATIONAL DEMO ACTION ENDPOINTS
  // -------------------------------------------------------------------------

  @Post('demo/reset-data')
  @ApiOperation({ summary: 'Reset demo state, clear temporary jobs, reset simulator and technician coordinates' })
  async resetDemoData() {
    return this.automationService.resetDemoData();
  }

  @Post('demo/start-gps')
  @ApiOperation({ summary: 'Start real-time GPS telematics simulator for the 5 demo technicians' })
  async startGps() {
    return this.automationService.startGpsSimulator();
  }

  @Post('demo/stop-gps')
  @ApiOperation({ summary: 'Stop real-time GPS telematics simulator' })
  async stopGps() {
    return this.automationService.stopGpsSimulator();
  }

  @Get('demo/gps-status')
  @ApiOperation({ summary: 'Get status of the GPS telematics simulator' })
  async getGpsStatus() {
    return this.automationService.getGpsSimulatorStatus();
  }

  @Post('demo/emergency-job')
  @ApiOperation({ summary: 'Spawn a fresh high-priority emergency work order for live dispatch demo' })
  async createEmergencyJob() {
    return this.automationService.createEmergencyJob();
  }

  @Post('demo/overdue-reminders')
  @ApiOperation({ summary: 'Trigger automated invoice dunning sweep and dispatch reminder alerts' })
  async triggerOverdueReminders() {
    return this.automationService.triggerOverdueReminders();
  }

  @Post('demo/fast-forward-rental')
  @ApiOperation({ summary: 'Fast-forward a rental contract to off-hire date and trigger return notification' })
  async fastForwardRental() {
    return this.automationService.fastForwardRental();
  }
}
