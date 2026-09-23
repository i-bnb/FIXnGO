import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class EquipmentService {
  private readonly logger = new Logger(EquipmentService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(query?: { search?: string; status?: string; category?: string; limit?: number; offset?: number }) {
    const where: any = { deletedAt: null };
    if (query?.status) where.status = query.status;
    if (query?.category) where.category = query.category;
    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { assetCode: { contains: query.search, mode: 'insensitive' } },
        { serialNumber: { contains: query.search, mode: 'insensitive' } },
        { currentLocation: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.rentalEquipment.findMany({
        where,
        include: {
          contractLines: {
            where: { deletedAt: null },
            include: { rentalContract: true },
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { assetCode: 'asc' },
        take: query?.limit || 50,
        skip: query?.offset || 0,
      }),
      this.prisma.rentalEquipment.count({ where }),
    ]);

    return { items, total, limit: query?.limit || 50, offset: query?.offset || 0 };
  }

  async findById(id: string) {
    const equip = await this.prisma.rentalEquipment.findFirst({
      where: { id, deletedAt: null },
      include: {
        contractLines: {
          where: { deletedAt: null },
          include: { rentalContract: { include: { customer: true } } },
        },
        dispatchesReturns: { orderBy: { actionDate: 'desc' } },
      },
    });

    if (!equip) throw new NotFoundException(`Equipment ${id} not found`);
    return equip;
  }

  async checkAvailability(equipmentId: string, startDate: Date | string, endDate: Date | string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      throw new BadRequestException('Invalid date range: End date must be strictly after start date');
    }

    const equipment = await this.prisma.rentalEquipment.findUnique({
      where: { id: equipmentId },
    });
    if (!equipment) throw new NotFoundException(`Equipment ${equipmentId} not found`);

    const conflicts = await this.prisma.rentalContract.findMany({
      where: {
        deletedAt: null,
        status: { in: ['ACTIVE', 'DRAFT'] },
        lines: {
          some: { equipmentId, deletedAt: null },
        },
        AND: [
          { startDate: { lte: end } },
          { expectedEndDate: { gte: start } },
        ],
      },
      include: {
        customer: true,
      },
    });

    const isAvailable = conflicts.length === 0;

    return {
      equipmentId,
      equipmentName: equipment.name,
      requestedStart: start,
      requestedEnd: end,
      isAvailable,
      conflicts: conflicts.map((c) => ({
        contractId: c.id,
        contractNumber: c.contractNumber,
        customerName: c.customer.name,
        startDate: c.startDate,
        expectedEndDate: c.expectedEndDate,
        status: c.status,
      })),
    };
  }

  async findAllContracts(query?: { search?: string; status?: string; customerId?: string; limit?: number; offset?: number }) {
    const where: any = { deletedAt: null };
    if (query?.status) where.status = query.status;
    if (query?.customerId) where.customerId = query.customerId;
    if (query?.search) {
      where.OR = [
        { contractNumber: { contains: query.search, mode: 'insensitive' } },
        { projectName: { contains: query.search, mode: 'insensitive' } },
        { siteLocation: { contains: query.search, mode: 'insensitive' } },
        { customer: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.rentalContract.findMany({
        where,
        include: {
          customer: true,
          lines: { include: { equipment: true } },
          dispatchesReturns: true,
        },
        orderBy: { createdAt: 'desc' },
        take: query?.limit || 50,
        skip: query?.offset || 0,
      }),
      this.prisma.rentalContract.count({ where }),
    ]);

    return { items, total, limit: query?.limit || 50, offset: query?.offset || 0 };
  }

  async createRentalContract(input: {
    customerId: string;
    equipmentId: string;
    projectName: string;
    siteLocation: string;
    startDate: Date | string;
    expectedEndDate: Date | string;
    rateBasis?: string; // DAILY, WEEKLY, MONTHLY
    appliedRate?: number;
    depositAmount?: number;
  }, actorUserId?: string) {
    const start = new Date(input.startDate);
    const end = new Date(input.expectedEndDate);

    // 1. Strictly enforce availability
    const avail = await this.checkAvailability(input.equipmentId, start, end);
    if (!avail.isAvailable) {
      throw new BadRequestException(
        `Rental Conflict: Equipment is already booked for contract ${avail.conflicts[0]?.contractNumber} (${avail.conflicts[0]?.startDate.toISOString().substring(0, 10)} to ${avail.conflicts[0]?.expectedEndDate.toISOString().substring(0, 10)})`,
      );
    }

    const equip = await this.prisma.rentalEquipment.findUnique({
      where: { id: input.equipmentId },
    });
    if (!equip) throw new NotFoundException('Equipment not found');

    const customer = await this.prisma.customer.findUnique({
      where: { id: input.customerId },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    const basis = input.rateBasis || 'MONTHLY';
    const rate = input.appliedRate || (basis === 'DAILY' ? Number(equip.dailyRate) : basis === 'WEEKLY' ? Number(equip.weeklyRate) : Number(equip.monthlyRate));

    // Calculate duration in days
    const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    let subtotal = rate;
    if (basis === 'DAILY') {
      subtotal = rate * diffDays;
    } else if (basis === 'WEEKLY') {
      subtotal = rate * Math.ceil(diffDays / 7);
    } else {
      subtotal = rate * Math.ceil(diffDays / 30);
    }

    const vatAmount = Math.round(subtotal * 0.05 * 100) / 100;
    const totalAmount = subtotal + vatAmount;

    const year = new Date().getFullYear();
    const count = await this.prisma.rentalContract.count();
    const contractNumber = `RC-${year}-${(count + 1).toString().padStart(4, '0')}`;

    const contract = await this.prisma.rentalContract.create({
      data: {
        contractNumber,
        customerId: customer.id,
        projectName: input.projectName,
        siteLocation: input.siteLocation,
        startDate: start,
        expectedEndDate: end,
        rateBasis: basis,
        depositAmount: input.depositAmount || 5000.00,
        subtotal,
        vatAmount,
        totalAmount,
        status: 'ACTIVE',
        createdBy: actorUserId || null,
        lines: {
          create: {
            equipmentId: equip.id,
            appliedRate: rate,
            rateBasis: basis,
            quantity: 1,
            subtotal,
            vatRate: 0.05,
            vatAmount,
            totalAmount,
          },
        },
      },
      include: {
        customer: true,
        lines: { include: { equipment: true } },
      },
    });

    // Mark equipment status as RENTED
    await this.prisma.rentalEquipment.update({
      where: { id: equip.id },
      data: { status: 'RENTED' },
    });

    await this.auditService.log({
      actorUserId,
      action: 'CREATE_RENTAL',
      entityName: 'RentalContract',
      entityId: contract.id,
      details: { contractNumber, equipment: equip.name, totalAmount },
    });

    return contract;
  }

  async recordDispatchOrReturn(
    contractId: string,
    input: {
      equipmentId: string;
      actionType: 'DISPATCH' | 'RETURN';
      hoursMeterReading?: number;
      fuelLevel?: string;
      conditionNotes?: string;
    },
    actorUserId?: string,
  ) {
    const contract = await this.prisma.rentalContract.findUnique({
      where: { id: contractId },
    });
    if (!contract) throw new NotFoundException('Rental contract not found');

    const record = await this.prisma.rentalDispatchReturn.create({
      data: {
        rentalContractId: contractId,
        equipmentId: input.equipmentId,
        actionType: input.actionType,
        actionDate: new Date(),
        hoursMeterReading: input.hoursMeterReading || 0,
        fuelLevel: input.fuelLevel || '100%',
        conditionNotes: input.conditionNotes || null,
        performedById: actorUserId || null,
      },
    });

    if (input.actionType === 'RETURN') {
      await this.prisma.rentalEquipment.update({
        where: { id: input.equipmentId },
        data: { status: 'AVAILABLE' },
      });
      await this.prisma.rentalContract.update({
        where: { id: contractId },
        data: { status: 'RETURNED', actualEndDate: new Date() },
      });
    }

    return record;
  }
}
