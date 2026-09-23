import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('Reports & Analytics')
@Controller('api/reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('dashboard-summary')
  @ApiOperation({ summary: 'High-level real-time KPI overview for Admin ERP Dashboard' })
  async getDashboardSummary() {
    return this.reportsService.getDashboardSummary();
  }

  @Get('job-profitability')
  @ApiOperation({ summary: 'Job profitability report (Revenue vs Parts Cost, Labour Cost, Expenses, Margin %)' })
  async getJobProfitability() {
    return this.reportsService.getJobProfitability();
  }

  @Get('technician-performance')
  @ApiOperation({ summary: 'Technician performance report (Jobs completed, hours worked, billed revenue, rating)' })
  async getTechnicianPerformance() {
    return this.reportsService.getTechnicianPerformance();
  }

  @Get('equipment-utilization')
  @ApiOperation({ summary: 'Heavy equipment rental utilization and revenue generated' })
  async getEquipmentUtilization() {
    return this.reportsService.getEquipmentUtilization();
  }

  @Get('inventory-status')
  @ApiOperation({ summary: 'Inventory stock level status, valuation, and reorder alerts' })
  async getInventoryStatus() {
    return this.reportsService.getInventoryStatus();
  }

  @Get('receivables-aging')
  @ApiOperation({ summary: 'Customer Accounts Receivable (A/R) aging buckets (Current, 1-30, 31-60, 61-90, 90+)' })
  async getReceivablesAging() {
    return this.reportsService.getReceivablesAging();
  }

  @Get('payables-aging')
  @ApiOperation({ summary: 'Supplier Accounts Payable (A/P) aging buckets (Current, 1-30, 31-60, 60+)' })
  async getPayablesAging() {
    return this.reportsService.getPayablesAging();
  }

  @Get('monthly-pnl')
  @ApiOperation({ summary: 'Monthly Profit & Loss (P&L) statement directly from General Ledger' })
  async getMonthlyPnL() {
    return this.reportsService.getMonthlyPnL();
  }
}
