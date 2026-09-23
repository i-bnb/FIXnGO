import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ManpowerService {
  private readonly logger = new Logger(ManpowerService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAllDeployments(query?: { search?: string; status?: string; limit?: number; offset?: number }) {
    const where: any = { deletedAt: null };
    if (query?.status) where.status = query.status;
    if (query?.search) {
      where.OR = [
        { requisitionNumber: { contains: query.search, mode: 'insensitive' } },
        { clientName: { contains: query.search, mode: 'insensitive' } },
        { projectName: { contains: query.search, mode: 'insensitive' } },
        { siteLocation: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.labourSupplyDeployment.findMany({
        where,
        include: {
          timesheets: {
            where: { deletedAt: null },
            include: { employee: true },
            orderBy: { workDate: 'desc' },
            take: 10,
          },
          _count: { select: { timesheets: true, invoices: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: query?.limit || 50,
        skip: query?.offset || 0,
      }),
      this.prisma.labourSupplyDeployment.count({ where }),
    ]);

    return { items, total, limit: query?.limit || 50, offset: query?.offset || 0 };
  }

  async findDeploymentById(id: string) {
    const deployment = await this.prisma.labourSupplyDeployment.findFirst({
      where: { id, deletedAt: null },
      include: {
        timesheets: {
          where: { deletedAt: null },
          include: { employee: true },
          orderBy: { workDate: 'desc' },
        },
        invoices: { where: { deletedAt: null } },
      },
    });

    if (!deployment) throw new NotFoundException(`Deployment ${id} not found`);
    return deployment;
  }

  async createDeployment(input: {
    clientName: string;
    projectName: string;
    siteLocation: string;
    startDate: Date | string;
    endDate: Date | string;
    billingType?: string; // HOURLY, DAILY, MONTHLY_FIXED
    status?: string;
  }, actorUserId?: string) {
    const count = await this.prisma.labourSupplyDeployment.count();
    const year = new Date().getFullYear();
    const requisitionNumber = `DEP-${year}-${(count + 1).toString().padStart(4, '0')}`;

    const deployment = await this.prisma.labourSupplyDeployment.create({
      data: {
        requisitionNumber,
        clientName: input.clientName,
        projectName: input.projectName,
        siteLocation: input.siteLocation,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        billingType: input.billingType || 'DAILY',
        status: input.status || 'ACTIVE',
        createdBy: actorUserId || null,
      },
    });

    await this.auditService.log({
      actorUserId,
      action: 'CREATE_DEPLOYMENT',
      entityName: 'LabourSupplyDeployment',
      entityId: deployment.id,
      details: { requisitionNumber, client: input.clientName, project: input.projectName },
    });

    return deployment;
  }

  async submitTimesheet(input: {
    deploymentId: string;
    employeeId: string;
    workDate: Date | string;
    regularHours?: number;
    overtimeHours?: number;
    siteSupervisorSignature?: string;
  }, actorUserId?: string) {
    const deployment = await this.prisma.labourSupplyDeployment.findUnique({
      where: { id: input.deploymentId },
    });
    if (!deployment) throw new NotFoundException('Deployment not found');

    const employee = await this.prisma.employee.findUnique({
      where: { id: input.employeeId },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    const reg = input.regularHours ?? 8.0;
    const ot = input.overtimeHours ?? 0.0;
    const totalHours = reg + ot;

    const timesheet = await this.prisma.labourDailyTimesheet.create({
      data: {
        deploymentId: input.deploymentId,
        employeeId: input.employeeId,
        workDate: new Date(input.workDate),
        regularHours: reg,
        overtimeHours: ot,
        totalHours,
        siteSupervisorSignature: input.siteSupervisorSignature || 'Eng. Basel Al-Kurdi',
        isBilled: false,
        createdBy: actorUserId || null,
      },
      include: { employee: true },
    });

    return timesheet;
  }

  async generateMonthlyInvoice(deploymentId: string, actorUserId?: string) {
    const deployment = await this.prisma.labourSupplyDeployment.findUnique({
      where: { id: deploymentId },
      include: {
        timesheets: {
          where: { isBilled: false, deletedAt: null },
          include: { employee: true },
        },
      },
    });

    if (!deployment) throw new NotFoundException('Deployment not found');
    if (deployment.timesheets.length === 0) {
      throw new BadRequestException('No unbilled timesheets found for this deployment');
    }

    let subtotal = 0;
    for (const ts of deployment.timesheets) {
      const rate = Number(ts.employee.hourlyBillingRate) || 55.00;
      const regPay = Number(ts.regularHours) * rate;
      const otPay = Number(ts.overtimeHours) * (rate * 1.25);
      subtotal += regPay + otPay;
    }

    const vatRate = 0.05;
    const vatAmount = Math.round(subtotal * vatRate * 100) / 100;
    const totalAmount = subtotal + vatAmount;

    const year = new Date().getFullYear();
    const count = await this.prisma.invoice.count();
    const invoiceNumber = `INV-DEP-${year}-${(count + 1).toString().padStart(4, '0')}`;

    // Look up or link customer
    let customer = await this.prisma.customer.findFirst({
      where: { name: { contains: deployment.clientName, mode: 'insensitive' } },
    });
    if (!customer) {
      customer = await this.prisma.customer.findFirst();
    }

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        invoiceType: 'LABOUR_INVOICE',
        labourDeploymentId: deployment.id,
        customerId: customer!.id,
        customerName: deployment.clientName,
        customerAddress: deployment.siteLocation,
        companyName: 'FieldOps Technical Services LLC',
        companyTrn: '100345678900003',
        companyAddress: 'Al Quoz Industrial Area 3, Dubai, UAE',
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        subtotal,
        vatRate,
        vatAmount,
        totalAmount,
        balanceDue: totalAmount,
        paymentStatus: 'PENDING',
        createdBy: actorUserId || null,
        lines: {
          create: {
            description: `Monthly Manpower Supply Services (${deployment.projectName}) - ${deployment.timesheets.length} Days`,
            quantity: deployment.timesheets.length,
            unitPrice: Math.round((subtotal / deployment.timesheets.length) * 100) / 100,
            subtotal,
            vatRate,
            vatAmount,
            totalAmount,
          },
        },
      },
    });

    // Mark timesheets as billed
    await this.prisma.labourDailyTimesheet.updateMany({
      where: {
        id: { in: deployment.timesheets.map((t) => t.id) },
      },
      data: { isBilled: true },
    });

    return {
      message: 'Monthly labour invoice generated successfully',
      invoice,
      billedTimesheetsCount: deployment.timesheets.length,
    };
  }
}
