import { Controller, Get, Post, Body, Query, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { FinanceService } from './finance.service';

@ApiTags('Finance & General Ledger')
@Controller('api/finance')
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  @Get('chart-of-accounts')
  @ApiOperation({ summary: 'List Chart of Accounts (Assets, Liabilities, Equity, Revenue, COGS, Expenses)' })
  async getChartOfAccounts() {
    return this.financeService.getChartOfAccounts();
  }

  @Get('journal-entries')
  @ApiOperation({ summary: 'List double-entry General Ledger journal entries' })
  async getJournalEntries(
    @Query('referenceType') referenceType?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.financeService.getJournalEntries({
      referenceType,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  @Post('journal-entries')
  @ApiOperation({ summary: 'Create a manual balanced double-entry journal entry (Debits == Credits)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        entryDate: { type: 'string', example: '2026-03-24' },
        description: { type: 'string', example: 'Monthly Office Internet Expense' },
        referenceType: { type: 'string', example: 'MANUAL' },
        referenceId: { type: 'string', nullable: true },
        lines: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              accountId: { type: 'string' },
              debitAmount: { type: 'number', example: 500.0 },
              creditAmount: { type: 'number', example: 0.0 },
              description: { type: 'string' },
            },
            required: ['accountId', 'debitAmount', 'creditAmount'],
          },
        },
      },
      required: ['description', 'lines'],
    },
  })
  async createJournalEntry(@Body() body: any, @Req() req: any) {
    return this.financeService.createJournalEntry(body, req.user?.id);
  }

  @Get('bank-accounts')
  @ApiOperation({ summary: 'List active company bank accounts with balances and recent cash movements' })
  async getBankAccounts() {
    return this.financeService.getBankAccounts();
  }

  @Get('expense-claims')
  @ApiOperation({ summary: 'List employee expense claims' })
  async getExpenseClaims(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
  ) {
    return this.financeService.getExpenseClaims({ employeeId, status });
  }

  @Post('expense-claims')
  @ApiOperation({ summary: 'Submit an employee expense claim' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        employeeId: { type: 'string' },
        lines: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              expenseType: { type: 'string', example: 'FUEL' },
              description: { type: 'string', example: 'Van Diesel Refuel ENOC Al Barsha' },
              amount: { type: 'number', example: 180.0 },
            },
            required: ['expenseType', 'description', 'amount'],
          },
        },
      },
      required: ['employeeId', 'lines'],
    },
  })
  async submitExpenseClaim(@Body() body: any, @Req() req: any) {
    return this.financeService.submitExpenseClaim(body, req.user?.id);
  }

  @Post('expense-claims/:id/approve')
  @ApiOperation({ summary: 'Approve expense claim and post balanced GL journal entry' })
  async approveExpenseClaim(@Param('id') id: string, @Req() req: any) {
    return this.financeService.approveExpenseClaim(id, req.user?.id);
  }

  @Post('expense-claims/:id/reject')
  @ApiOperation({ summary: 'Reject expense claim' })
  async rejectExpenseClaim(@Param('id') id: string, @Req() req: any) {
    return this.financeService.rejectExpenseClaim(id, req.user?.id);
  }
}
