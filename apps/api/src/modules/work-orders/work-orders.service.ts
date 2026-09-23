import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

// Allowed State Machine Transitions
export const ALLOWED_WO_TRANSITIONS: Record<string, string[]> = {
  NEW: ['QUOTED', 'APPROVED', 'ASSIGNED', 'CANCELLED'],
  QUOTED: ['APPROVED', 'CANCELLED'],
  APPROVED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['EN_ROUTE', 'ASSIGNED', 'CANCELLED'],
  EN_ROUTE: ['ON_SITE', 'ASSIGNED'],
  ON_SITE: ['IN_PROGRESS', 'ON_HOLD'],
  IN_PROGRESS: ['ON_HOLD', 'COMPLETED'],
  ON_HOLD: ['IN_PROGRESS', 'CANCELLED'],
  COMPLETED: ['INVOICED', 'CLOSED'],
  INVOICED: ['CLOSED'],
  CLOSED: [],
  CANCELLED: [],
};

@Injectable()
export class WorkOrdersService {
  private readonly logger = new Logger(WorkOrdersService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private realtimeGateway: RealtimeGateway,
  ) {}

  async findAll(query?: {
    search?: string;
    status?: string;
    serviceType?: string;
    priority?: string;
    customerId?: string;
    employeeId?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = { deletedAt: null };
    if (query?.status) where.status = query.status;
    if (query?.serviceType) where.serviceType = query.serviceType;
    if (query?.priority) where.priority = query.priority;
    if (query?.customerId) where.customerId = query.customerId;
    if (query?.employeeId) {
      where.assignments = {
        some: { employeeId: query.employeeId, deletedAt: null },
      };
    }

    if (query?.search) {
      where.OR = [
        { orderNumber: { contains: query.search, mode: 'insensitive' } },
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { customer: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where,
        include: {
          customer: true,
          site: true,
          asset: true,
          assignments: {
            where: { deletedAt: null },
            include: { employee: true },
          },
          parts: { where: { deletedAt: null } },
          labour: { where: { deletedAt: null } },
          attachments: { where: { deletedAt: null } },
          signoff: true,
        },
        orderBy: { createdAt: 'desc' },
        take: query?.limit || 50,
        skip: query?.offset || 0,
      }),
      this.prisma.workOrder.count({ where }),
    ]);

    return {
      items,
      total,
      limit: query?.limit || 50,
      offset: query?.offset || 0,
    };
  }

  async findById(id: string) {
    const wo = await this.prisma.workOrder.findFirst({
      where: { id, deletedAt: null },
      include: {
        customer: { include: { contacts: true } },
        site: true,
        asset: true,
        assignments: {
          where: { deletedAt: null },
          include: { employee: true },
        },
        tasks: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } },
        parts: { where: { deletedAt: null }, include: { item: true } },
        labour: { where: { deletedAt: null }, include: { employee: true } },
        expenses: { where: { deletedAt: null } },
        attachments: { where: { deletedAt: null } },
        signoff: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        invoices: { where: { deletedAt: null } },
      },
    });

    if (!wo) {
      throw new NotFoundException(`Work order with ID ${id} not found`);
    }

    return wo;
  }

  async create(input: {
    customerId: string;
    siteId: string;
    assetId?: string;
    serviceType: string;
    title: string;
    description: string;
    priority?: string;
    isEmergency?: boolean;
    address?: string;
    latitude?: number;
    longitude?: number;
    scheduledStart?: Date | string;
    scheduledEnd?: Date | string;
  }, actorUserId?: string) {
    const site = await this.prisma.customerSite.findUnique({
      where: { id: input.siteId },
    });
    if (!site) {
      throw new NotFoundException('Customer site not found');
    }

    const year = new Date().getFullYear();
    const count = await this.prisma.workOrder.count();
    const orderNumber = `WO-${year}-${(count + 1).toString().padStart(4, '0')}`;

    const workOrder = await this.prisma.workOrder.create({
      data: {
        orderNumber,
        customerId: input.customerId,
        siteId: input.siteId,
        assetId: input.assetId || null,
        serviceType: input.serviceType,
        title: input.title,
        description: input.description,
        priority: input.priority || 'MEDIUM',
        isEmergency: input.isEmergency || false,
        address: input.address || site.address,
        latitude: input.latitude || site.latitude,
        longitude: input.longitude || site.longitude,
        scheduledStart: input.scheduledStart ? new Date(input.scheduledStart) : null,
        scheduledEnd: input.scheduledEnd ? new Date(input.scheduledEnd) : null,
        status: 'NEW',
        createdBy: actorUserId || null,
        statusHistory: {
          create: {
            fromStatus: 'NONE',
            toStatus: 'NEW',
            changedById: actorUserId || null,
            reason: 'Work order created',
          },
        },
      },
      include: {
        customer: true,
        site: true,
      },
    });

    this.realtimeGateway.emitWorkOrderStatusChanged(workOrder.id, 'NEW', {
      orderNumber: workOrder.orderNumber,
      title: workOrder.title,
    });

    await this.auditService.log({
      actorUserId,
      action: 'CREATE',
      entityName: 'WorkOrder',
      entityId: workOrder.id,
      details: { orderNumber: workOrder.orderNumber, title: workOrder.title },
    });

    return workOrder;
  }

  async updateStatus(
    id: string,
    newStatus: string,
    reason?: string,
    coords?: { latitude?: number; longitude?: number },
    actorUserId?: string,
  ) {
    const wo = await this.prisma.workOrder.findFirst({
      where: { id, deletedAt: null },
    });
    if (!wo) {
      throw new NotFoundException(`Work order ${id} not found`);
    }

    const currentStatus = wo.status;
    const allowed = ALLOWED_WO_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(newStatus) && currentStatus !== newStatus) {
      throw new BadRequestException(
        `Invalid status transition: Cannot change status from '${currentStatus}' to '${newStatus}'. Allowed: [${allowed.join(', ')}]`,
      );
    }

    const updateData: any = {
      status: newStatus,
    };

    if (newStatus === 'IN_PROGRESS' && !wo.actualStart) {
      updateData.actualStart = new Date();
    }
    if (newStatus === 'COMPLETED' && !wo.actualEnd) {
      updateData.actualEnd = new Date();
    }

    const updated = await this.prisma.workOrder.update({
      where: { id },
      data: {
        ...updateData,
        statusHistory: {
          create: {
            fromStatus: currentStatus,
            toStatus: newStatus,
            reason: reason || `Status changed to ${newStatus}`,
            changedById: actorUserId || null,
            latitude: coords?.latitude || null,
            longitude: coords?.longitude || null,
          },
        },
      },
      include: {
        customer: true,
        site: true,
        assignments: { include: { employee: true } },
      },
    });

    this.realtimeGateway.emitWorkOrderStatusChanged(id, newStatus, {
      fromStatus: currentStatus,
      toStatus: newStatus,
      reason,
      orderNumber: updated.orderNumber,
    });

    await this.auditService.log({
      actorUserId,
      action: 'STATUS_CHANGE',
      entityName: 'WorkOrder',
      entityId: id,
      details: { from: currentStatus, to: newStatus, reason },
    });

    return updated;
  }

  async assign(
    id: string,
    input: {
      inChargeEmployeeId: string;
      helperEmployeeIds?: string[];
      notes?: string;
    },
    actorUserId?: string,
  ) {
    const wo = await this.prisma.workOrder.findFirst({
      where: { id, deletedAt: null },
    });
    if (!wo) {
      throw new NotFoundException(`Work order ${id} not found`);
    }

    const allEmployeeIds = [
      input.inChargeEmployeeId,
      ...(input.helperEmployeeIds || []),
    ];

    // Double-Booking Check: Are any of these employees assigned to an active overlapping job?
    const warnings: string[] = [];
    const activeAssignments = await this.prisma.workOrderAssignment.findMany({
      where: {
        employeeId: { in: allEmployeeIds },
        deletedAt: null,
        workOrderId: { not: id },
        workOrder: {
          status: { in: ['ASSIGNED', 'EN_ROUTE', 'ON_SITE', 'IN_PROGRESS'] },
          deletedAt: null,
        },
      },
      include: {
        employee: true,
        workOrder: true,
      },
    });

    for (const active of activeAssignments) {
      warnings.push(
        `Technician ${active.employee.firstName} ${active.employee.lastName} is already assigned to active job ${active.workOrder.orderNumber} (${active.workOrder.status})`,
      );
    }

    // Soft-delete existing active assignments for this job to reassign cleanly
    await this.prisma.workOrderAssignment.updateMany({
      where: { workOrderId: id, deletedAt: null },
      data: { deletedAt: new Date(), status: 'REASSIGNED' },
    });

    // Create In-Charge Assignment
    const inChargeAssignment = await this.prisma.workOrderAssignment.create({
      data: {
        workOrderId: id,
        employeeId: input.inChargeEmployeeId,
        roleInJob: 'LEAD_TECHNICIAN',
        isInCharge: true,
        status: 'ACTIVE',
        createdBy: actorUserId || null,
      },
      include: { employee: true },
    });

    // Create Helper Assignments
    const helperAssignments = [];
    if (input.helperEmployeeIds && input.helperEmployeeIds.length > 0) {
      for (const helperId of input.helperEmployeeIds) {
        const hAssignment = await this.prisma.workOrderAssignment.create({
          data: {
            workOrderId: id,
            employeeId: helperId,
            roleInJob: 'HELPER',
            isInCharge: false,
            status: 'ACTIVE',
            createdBy: actorUserId || null,
          },
          include: { employee: true },
        });
        helperAssignments.push(hAssignment);
      }
    }

    // If status is NEW or APPROVED, automatically advance to ASSIGNED
    let currentWoStatus = wo.status;
    if (wo.status === 'NEW' || wo.status === 'APPROVED') {
      await this.updateStatus(id, 'ASSIGNED', 'Technician assigned to work order', undefined, actorUserId);
      currentWoStatus = 'ASSIGNED';
    }

    const staffCount = 1 + (input.helperEmployeeIds?.length || 0);

    return {
      success: true,
      workOrderId: id,
      status: currentWoStatus,
      staffCount,
      assignments: [inChargeAssignment, ...helperAssignments],
      warnings,
      doubleBooked: warnings.length > 0,
    };
  }

  async addPart(
    id: string,
    input: {
      itemId: string;
      quantity: number;
      warehouseId?: string;
      partAction?: string;
      serialNumberFitted?: string;
      serialNumberRemoved?: string;
    },
    actorUserId?: string,
  ) {
    const wo = await this.prisma.workOrder.findFirst({
      where: { id, deletedAt: null },
      include: { assignments: { where: { deletedAt: null, isInCharge: true } } },
    });
    if (!wo) {
      throw new NotFoundException(`Work order ${id} not found`);
    }

    const item = await this.prisma.item.findUnique({
      where: { id: input.itemId },
    });
    if (!item) {
      throw new NotFoundException(`Item ${input.itemId} not found`);
    }

    // Determine warehouse: explicitly provided or primary warehouse
    let targetWarehouseId = input.warehouseId;
    if (!targetWarehouseId) {
      const primaryWh = await this.prisma.warehouse.findFirst({
        where: { type: 'CENTRAL_WAREHOUSE', isActive: true },
      });
      targetWarehouseId = primaryWh?.id;
    }

    // Check & decrement inventory stock if warehouse identified
    if (targetWarehouseId) {
      const stockLevel = await this.prisma.stockLevel.findUnique({
        where: {
          itemId_warehouseId: {
            itemId: item.id,
            warehouseId: targetWarehouseId,
          },
        },
      });

      if (stockLevel && stockLevel.quantityAvailable < input.quantity) {
        this.logger.warn(`Insufficient stock for item ${item.itemCode}. Available: ${stockLevel.quantityAvailable}, Requested: ${input.quantity}`);
      }

      if (stockLevel) {
        await this.prisma.stockLevel.update({
          where: { id: stockLevel.id },
          data: {
            quantityOnHand: Math.max(0, stockLevel.quantityOnHand - input.quantity),
            quantityAvailable: Math.max(0, stockLevel.quantityAvailable - input.quantity),
          },
        });

        // Record stock movement
        const count = await this.prisma.stockMovement.count();
        await this.prisma.stockMovement.create({
          data: {
            movementNumber: `MOV-${Date.now()}-${count + 1}`,
            itemId: item.id,
            movementType: 'JOB_CONSUMPTION',
            quantity: input.quantity,
            unitCost: item.costPrice,
            sourceWarehouseId: targetWarehouseId,
            referenceType: 'WORK_ORDER',
            referenceId: id,
            notes: `Consumed on job ${wo.orderNumber}`,
          },
        });
      }
    }

    const unitPrice = Number(item.sellingPrice);
    const unitCost = Number(item.costPrice);
    const totalPrice = unitPrice * input.quantity;

    const part = await this.prisma.workOrderPart.create({
      data: {
        workOrderId: id,
        itemId: item.id,
        description: item.name,
        quantity: input.quantity,
        unitCost,
        unitPrice,
        totalPrice,
        partAction: input.partAction || 'FITTED_NEW',
        serialNumberFitted: input.serialNumberFitted || null,
        serialNumberRemoved: input.serialNumberRemoved || null,
        createdBy: actorUserId || null,
      },
    });

    // Update work order financial subtotal
    const newSubtotal = Number(wo.subtotal) + totalPrice;
    const vatAmount = Math.round(newSubtotal * 0.05 * 100) / 100;
    await this.prisma.workOrder.update({
      where: { id },
      data: {
        subtotal: newSubtotal,
        vatAmount,
        totalAmount: newSubtotal + vatAmount,
      },
    });

    return part;
  }

  async addLabour(
    id: string,
    input: {
      employeeId: string;
      hours: number;
      hourlyBillingRate?: number;
      hourlyCostRate?: number;
    },
    actorUserId?: string,
  ) {
    const wo = await this.prisma.workOrder.findFirst({ where: { id, deletedAt: null } });
    if (!wo) throw new NotFoundException(`Work order ${id} not found`);

    const employee = await this.prisma.employee.findUnique({
      where: { id: input.employeeId },
    });
    if (!employee) throw new NotFoundException(`Employee ${input.employeeId} not found`);

    const costRate = input.hourlyCostRate || Number(employee.hourlyCostRate) || 45.00;
    const billingRate = input.hourlyBillingRate || Number(employee.hourlyBillingRate) || 110.00;
    const totalCost = costRate * input.hours;
    const totalBilled = billingRate * input.hours;

    const labour = await this.prisma.workOrderLabour.create({
      data: {
        workOrderId: id,
        employeeId: employee.id,
        hours: input.hours,
        hourlyCostRate: costRate,
        hourlyBillingRate: billingRate,
        totalCost,
        totalBilled,
        createdBy: actorUserId || null,
      },
    });

    const newSubtotal = Number(wo.subtotal) + totalBilled;
    const vatAmount = Math.round(newSubtotal * 0.05 * 100) / 100;
    await this.prisma.workOrder.update({
      where: { id },
      data: {
        subtotal: newSubtotal,
        vatAmount,
        totalAmount: newSubtotal + vatAmount,
      },
    });

    return labour;
  }

  async addAttachment(
    id: string,
    input: {
      attachmentType: string;
      fileId: string;
      fileName: string;
      fileUrl: string;
      fileSizeBytes: number;
      mimeType: string;
      caption?: string;
    },
    actorUserId?: string,
  ) {
    const wo = await this.prisma.workOrder.findFirst({ where: { id, deletedAt: null } });
    if (!wo) throw new NotFoundException(`Work order ${id} not found`);

    return this.prisma.workOrderAttachment.create({
      data: {
        workOrderId: id,
        attachmentType: input.attachmentType, // BEFORE_PHOTO, AFTER_PHOTO, etc.
        fileId: input.fileId,
        fileName: input.fileName,
        fileUrl: input.fileUrl,
        fileSizeBytes: input.fileSizeBytes,
        mimeType: input.mimeType,
        caption: input.caption || null,
        createdBy: actorUserId || null,
      },
    });
  }

  async signoff(
    id: string,
    input: {
      signedByName: string;
      signatureUrl: string;
      rating?: number;
      feedbackComments?: string;
    },
    actorUserId?: string,
  ) {
    const wo = await this.prisma.workOrder.findFirst({ where: { id, deletedAt: null } });
    if (!wo) throw new NotFoundException(`Work order ${id} not found`);

    return this.prisma.customerSignoff.upsert({
      where: { workOrderId: id },
      create: {
        workOrderId: id,
        customerId: wo.customerId,
        signedByName: input.signedByName,
        signatureUrl: input.signatureUrl,
        rating: input.rating || 5,
        feedbackComments: input.feedbackComments || null,
        signedAt: new Date(),
        createdBy: actorUserId || null,
      },
      update: {
        signedByName: input.signedByName,
        signatureUrl: input.signatureUrl,
        rating: input.rating || 5,
        feedbackComments: input.feedbackComments || null,
        signedAt: new Date(),
      },
    });
  }

  async complete(
    id: string,
    input?: {
      requireAfterPhoto?: boolean;
      requireSignoff?: boolean;
      signedByName?: string;
      signatureUrl?: string;
      rating?: number;
      feedbackComments?: string;
      afterPhotoUrl?: string;
    },
    actorUserId?: string,
  ) {
    const wo = await this.prisma.workOrder.findFirst({
      where: { id, deletedAt: null },
      include: {
        attachments: { where: { deletedAt: null } },
        signoff: true,
      },
    });
    if (!wo) throw new NotFoundException(`Work order ${id} not found`);

    // 1. Process on-the-fly signoff if provided
    if (input?.signedByName && input?.signatureUrl) {
      await this.signoff(id, {
        signedByName: input.signedByName,
        signatureUrl: input.signatureUrl,
        rating: input.rating,
        feedbackComments: input.feedbackComments,
      }, actorUserId);
    }

    // 2. Process on-the-fly after-photo if provided
    if (input?.afterPhotoUrl) {
      await this.addAttachment(id, {
        attachmentType: 'AFTER_PHOTO',
        fileId: `file_${Date.now()}`,
        fileName: 'job_completion_after.jpg',
        fileUrl: input.afterPhotoUrl,
        fileSizeBytes: 200000,
        mimeType: 'image/jpeg',
        caption: 'Completed job inspection photo',
      }, actorUserId);
    }

    // 3. Validate After Photo Requirement
    const requireAfter = input?.requireAfterPhoto !== false;
    if (requireAfter) {
      const hasAfterPhoto = wo.attachments.some((a) => a.attachmentType === 'AFTER_PHOTO') || !!input?.afterPhotoUrl;
      if (!hasAfterPhoto) {
        throw new BadRequestException(
          'Completion Rejected: Work order requires at least one AFTER_PHOTO attachment before completion.',
        );
      }
    }

    // 4. Validate Customer Signoff Requirement
    const requireSign = input?.requireSignoff !== false;
    if (requireSign) {
      const hasSignoff = !!wo.signoff || (!!input?.signedByName && !!input?.signatureUrl);
      if (!hasSignoff) {
        throw new BadRequestException(
          'Completion Rejected: Work order requires customer sign-off and digital signature before completion.',
        );
      }
    }

    return this.updateStatus(id, 'COMPLETED', 'Job completed with verified after-photos and customer signature', undefined, actorUserId);
  }

  async generateInvoice(id: string, actorUserId?: string) {
    const wo = await this.prisma.workOrder.findFirst({
      where: { id, deletedAt: null },
      include: {
        customer: true,
        site: true,
        parts: { where: { deletedAt: null } },
        labour: { where: { deletedAt: null } },
        expenses: { where: { deletedAt: null } },
        invoices: { where: { deletedAt: null } },
      },
    });

    if (!wo) throw new NotFoundException(`Work order ${id} not found`);

    if (wo.invoices.length > 0) {
      return {
        message: 'Invoice already generated for this work order',
        invoice: wo.invoices[0],
      };
    }

    const partsSubtotal = wo.parts.reduce((sum, p) => sum + Number(p.totalPrice), 0);
    const labourSubtotal = wo.labour.reduce((sum, l) => sum + Number(l.totalBilled), 0);
    const expenseSubtotal = wo.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const subtotal = partsSubtotal + labourSubtotal + expenseSubtotal || Number(wo.subtotal) || 150.00;

    const vatRate = 0.05;
    const vatAmount = Math.round(subtotal * vatRate * 100) / 100;
    const totalAmount = subtotal + vatAmount;

    const year = new Date().getFullYear();
    const count = await this.prisma.invoice.count();
    const invoiceNumber = `INV-${year}-${(count + 1).toString().padStart(4, '0')}`;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // NET 30

    // Create Invoice with Line Items
    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        invoiceType: 'STANDARD_TAX_INVOICE',
        workOrderId: id,
        customerId: wo.customerId,
        customerName: wo.customer.name,
        customerAddress: wo.site?.address || 'Dubai, UAE',
        customerTrn: wo.customer.trn || null,
        companyName: 'FieldOps Technical Services LLC',
        companyTrn: '100345678900003',
        companyAddress: 'Al Quoz Industrial Area 3, Dubai, UAE',
        issueDate: new Date(),
        dueDate,
        subtotal,
        vatRate,
        vatAmount,
        totalAmount,
        balanceDue: totalAmount,
        paymentStatus: 'PENDING',
        createdBy: actorUserId || null,
      },
    });

    // Create Invoice Lines
    if (labourSubtotal > 0) {
      await this.prisma.invoiceLine.create({
        data: {
          invoiceId: invoice.id,
          description: `Field Service & Labour (${wo.title})`,
          quantity: 1,
          unitPrice: labourSubtotal,
          subtotal: labourSubtotal,
          vatRate,
          vatAmount: Math.round(labourSubtotal * vatRate * 100) / 100,
          totalAmount: labourSubtotal + Math.round(labourSubtotal * vatRate * 100) / 100,
        },
      });
    }

    for (const part of wo.parts) {
      const pSub = Number(part.totalPrice);
      const pVat = Math.round(pSub * vatRate * 100) / 100;
      await this.prisma.invoiceLine.create({
        data: {
          invoiceId: invoice.id,
          itemId: part.itemId,
          description: part.description,
          quantity: part.quantity,
          unitPrice: part.unitPrice,
          subtotal: pSub,
          vatRate,
          vatAmount: pVat,
          totalAmount: pSub + pVat,
        },
      });
    }

    if (wo.parts.length === 0 && labourSubtotal === 0) {
      await this.prisma.invoiceLine.create({
        data: {
          invoiceId: invoice.id,
          description: `MEP Service Inspection & Execution (${wo.title})`,
          quantity: 1,
          unitPrice: subtotal,
          subtotal,
          vatRate,
          vatAmount,
          totalAmount,
        },
      });
    }

    // Automatically post balanced Double-Entry General Ledger Journal:
    // Dr Accounts Receivable (1050): totalAmount
    // Cr Service Revenue (4010): labourSubtotal
    // Cr Material Sales Revenue (4020): partsSubtotal
    // Cr VAT Output Liability (2050): vatAmount
    try {
      const coaAccounts = await this.prisma.chartOfAccounts.findMany({
        where: { code: { in: ['1050', '4010', '4020', '2050'] } },
      });
      const coaMap = Object.fromEntries(coaAccounts.map((a) => [a.code, a.id]));

      if (coaMap['1050'] && coaMap['2050']) {
        const jeCount = await this.prisma.journalEntry.count();
        const je = await this.prisma.journalEntry.create({
          data: {
            entryNumber: `JE-INV-${year}-${(jeCount + 1).toString().padStart(4, '0')}`,
            entryDate: new Date(),
            referenceType: 'INVOICE',
            referenceId: invoice.id,
            description: `Revenue & VAT for Invoice ${invoice.invoiceNumber} (Job ${wo.orderNumber})`,
            status: 'POSTED',
            postedAt: new Date(),
          },
        });

        const revAccount = coaMap['4010'] || coaMap['4020'];
        await this.prisma.journalLine.createMany({
          data: [
            {
              journalEntryId: je.id,
              accountId: coaMap['1050'],
              debitAmount: totalAmount,
              creditAmount: 0.00,
              description: `A/R for Invoice ${invoice.invoiceNumber}`,
            },
            {
              journalEntryId: je.id,
              accountId: revAccount,
              debitAmount: 0.00,
              creditAmount: subtotal,
              description: `Revenue from Job ${wo.orderNumber}`,
            },
            {
              journalEntryId: je.id,
              accountId: coaMap['2050'],
              debitAmount: 0.00,
              creditAmount: vatAmount,
              description: `UAE 5% VAT Output Liability`,
            },
          ],
        });
      }
    } catch (glErr) {
      this.logger.warn(`General Ledger auto-posting note: ${(glErr as Error).message}`);
    }

    // Update Work Order to INVOICED
    if (wo.status === 'COMPLETED') {
      await this.updateStatus(id, 'INVOICED', `Invoice ${invoice.invoiceNumber} generated`, undefined, actorUserId);
    }

    return {
      message: 'Invoice generated successfully with balanced GL entries',
      invoice,
    };
  }
}
