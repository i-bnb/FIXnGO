import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async getChartOfAccounts() {
    return this.prisma.chartOfAccounts.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { code: 'asc' },
    });
  }

  async getJournalEntries(query?: { limit?: number; offset?: number; referenceType?: string }) {
    const where: any = { deletedAt: null };
    if (query?.referenceType) where.referenceType = query.referenceType;

    const [items, total] = await Promise.all([
      this.prisma.journalEntry.findMany({
        where,
        include: {
          lines: {
            include: { account: true },
          },
        },
        orderBy: { entryDate: 'desc' },
        take: query?.limit || 50,
        skip: query?.offset || 0,
      }),
      this.prisma.journalEntry.count({ where }),
    ]);

    return { items, total, limit: query?.limit || 50, offset: query?.offset || 0 };
  }

  async createJournalEntry(input: {
    entryDate?: Date | string;
    description: string;
    referenceType?: string;
    referenceId?: string;
    lines: Array<{
      accountId: string;
      debitAmount: number;
      creditAmount: number;
      description?: string;
    }>;
  }, actorUserId?: string) {
    if (!input.lines || input.lines.length < 2) {
      throw new BadRequestException('A journal entry must contain at least two balancing lines');
    }

    const totalDebit = input.lines.reduce((sum, l) => sum + (Number(l.debitAmount) || 0), 0);
    const totalCredit = input.lines.reduce((sum, l) => sum + (Number(l.creditAmount) || 0), 0);

    // Double-entry balance invariant: debits must equal credits
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new BadRequestException(
        `Unbalanced Journal Entry: Total Debits (AED ${totalDebit.toFixed(2)}) must equal Total Credits (AED ${totalCredit.toFixed(2)})`,
      );
    }

    const year = new Date().getFullYear();
    const count = await this.prisma.journalEntry.count();
    const entryNumber = `JE-${year}-${(count + 1).toString().padStart(4, '0')}`;

    return this.prisma.journalEntry.create({
      data: {
        entryNumber,
        entryDate: input.entryDate ? new Date(input.entryDate) : new Date(),
        description: input.description,
        referenceType: input.referenceType || 'MANUAL',
        referenceId: input.referenceId || null,
        status: 'POSTED',
        postedAt: new Date(),
        postedById: actorUserId || null,
        createdBy: actorUserId || null,
        lines: {
          create: input.lines.map((l) => ({
            accountId: l.accountId,
            debitAmount: l.debitAmount || 0.00,
            creditAmount: l.creditAmount || 0.00,
            description: l.description || input.description,
          })),
        },
      },
      include: {
        lines: { include: { account: true } },
      },
    });
  }

  async getBankAccounts() {
    return this.prisma.bankAccount.findMany({
      where: { deletedAt: null, isActive: true },
      include: {
        account: true,
        transactions: {
          take: 10,
          orderBy: { transactionDate: 'desc' },
        },
      },
    });
  }

  async getExpenseClaims(query?: { employeeId?: string; status?: string }) {
    const where: any = { deletedAt: null };
    if (query?.employeeId) where.employeeId = query.employeeId;
    if (query?.status) where.status = query.status;

    return this.prisma.expenseClaim.findMany({
      where,
      include: {
        employee: true,
        lines: true,
      },
      orderBy: { claimDate: 'desc' },
    });
  }

  async submitExpenseClaim(input: {
    employeeId: string;
    lines: Array<{
      expenseType: string;
      description: string;
      amount: number;
    }>;
  }, actorUserId?: string) {
    const totalAmount = input.lines.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
    const count = await this.prisma.expenseClaim.count();
    const claimNumber = `EXP-${Date.now()}-${count + 1}`;

    return this.prisma.expenseClaim.create({
      data: {
        claimNumber,
        employeeId: input.employeeId,
        totalAmount,
        status: 'SUBMITTED',
        createdBy: actorUserId || null,
        lines: {
          create: input.lines,
        },
      },
      include: { lines: true },
    });
  }

  async approveExpenseClaim(id: string, actorUserId?: string) {
    const claim = await this.prisma.expenseClaim.findUnique({
      where: { id },
      include: { lines: true, employee: true },
    });

    if (!claim) {
      throw new NotFoundException(`Expense claim with ID ${id} not found`);
    }

    if (claim.status !== 'SUBMITTED') {
      throw new BadRequestException(`Cannot approve expense claim with status ${claim.status}`);
    }

    const updatedClaim = await this.prisma.expenseClaim.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedById: actorUserId || null,
      },
      include: { lines: true, employee: true },
    });

    // Automatically post balanced GL Journal Entry for approved expense
    const expenseAccount = await this.prisma.chartOfAccounts.findFirst({
      where: { code: '6010', deletedAt: null },
    });
    const payableAccount = await this.prisma.chartOfAccounts.findFirst({
      where: { code: '2010', deletedAt: null },
    });

    if (expenseAccount && payableAccount) {
      const claimAmount = Number(claim.totalAmount);
      await this.createJournalEntry({
        description: `Approved Employee Expense Claim ${claim.claimNumber} (${claim.employee.firstName} ${claim.employee.lastName})`,
        referenceType: 'EXPENSE',
        referenceId: claim.id,
        lines: [
          { accountId: expenseAccount.id, debitAmount: claimAmount, creditAmount: 0, description: `Expense Claim ${claim.claimNumber}` },
          { accountId: payableAccount.id, debitAmount: 0, creditAmount: claimAmount, description: `Accrued reimbursement to employee ${claim.employee.employeeCode}` },
        ],
      }, actorUserId);
    }

    return updatedClaim;
  }

  async rejectExpenseClaim(id: string, actorUserId?: string) {
    const claim = await this.prisma.expenseClaim.findUnique({ where: { id } });
    if (!claim) throw new NotFoundException(`Expense claim ${id} not found`);

    return this.prisma.expenseClaim.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedById: actorUserId || null,
      },
    });
  }
}
