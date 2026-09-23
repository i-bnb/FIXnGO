import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CustomersService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(query?: { search?: string; type?: string; limit?: number; offset?: number }) {
    const where: any = { deletedAt: null };
    if (query?.type) where.customerType = query.type;
    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { trn: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        include: {
          contacts: true,
          sites: true,
          _count: { select: { workOrders: true, invoices: true, contracts: true } },
        },
        orderBy: { name: 'asc' },
        take: query?.limit || 50,
        skip: query?.offset || 0,
      }),
      this.prisma.customer.count({ where }),
    ]);

    return { items, total, limit: query?.limit || 50, offset: query?.offset || 0 };
  }

  async findById(id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, deletedAt: null },
      include: {
        contacts: { where: { deletedAt: null } },
        sites: {
          where: { deletedAt: null },
          include: { assets: { where: { deletedAt: null } } },
        },
        contracts: { where: { deletedAt: null } },
        workOrders: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        invoices: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!customer) throw new NotFoundException(`Customer ${id} not found`);
    return customer;
  }

  async create(input: {
    name: string;
    customerType?: string;
    trn?: string;
    email?: string;
    phone: string;
    creditLimit?: number;
    paymentTermsDays?: number;
    siteName?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  }, actorUserId?: string) {
    const customer = await this.prisma.customer.create({
      data: {
        name: input.name,
        customerType: input.customerType || 'COMPANY',
        trn: input.trn || null,
        email: input.email || null,
        phone: input.phone,
        creditLimit: input.creditLimit || 0.00,
        paymentTermsDays: input.paymentTermsDays || 30,
        createdBy: actorUserId || null,
        sites: input.siteName || input.address ? {
          create: {
            siteName: input.siteName || 'Headquarters / Main Site',
            address: input.address || 'Dubai, UAE',
            emirate: 'Dubai',
            area: 'Dubai',
            latitude: input.latitude || 25.2048,
            longitude: input.longitude || 55.2708,
          },
        } : undefined,
      },
      include: { sites: true },
    });

    await this.auditService.log({
      actorUserId,
      action: 'CREATE_CUSTOMER',
      entityName: 'Customer',
      entityId: customer.id,
      details: { name: customer.name, trn: customer.trn },
    });

    return customer;
  }

  async addSite(customerId: string, input: {
    siteName: string;
    address: string;
    emirate?: string;
    area?: string;
    building?: string;
    unit?: string;
    makaniNumber?: string;
    latitude?: number;
    longitude?: number;
  }) {
    return this.prisma.customerSite.create({
      data: {
        customerId,
        siteName: input.siteName,
        address: input.address,
        emirate: input.emirate || 'Dubai',
        area: input.area || 'Business Bay',
        building: input.building || null,
        unit: input.unit || null,
        makaniNumber: input.makaniNumber || null,
        latitude: input.latitude || 25.1860,
        longitude: input.longitude || 55.2715,
      },
    });
  }

  async addAsset(siteId: string, input: {
    assetType: string;
    brand?: string;
    modelNumber?: string;
    serialNumber?: string;
    installationDate?: Date | string;
    warrantyExpiryDate?: Date | string;
    currentCondition?: string;
  }) {
    const site = await this.prisma.customerSite.findUnique({
      where: { id: siteId },
    });
    if (!site) throw new NotFoundException('Site not found');

    return this.prisma.customerAsset.create({
      data: {
        customerId: site.customerId,
        siteId,
        assetType: input.assetType,
        brand: input.brand || null,
        modelNumber: input.modelNumber || null,
        serialNumber: input.serialNumber || null,
        installationDate: input.installationDate ? new Date(input.installationDate) : null,
        warrantyExpiryDate: input.warrantyExpiryDate ? new Date(input.warrantyExpiryDate) : null,
        currentCondition: input.currentCondition || 'OPERATIONAL',
      },
    });
  }

  async findAllContracts(query?: { search?: string; customerId?: string }) {
    const where: any = { deletedAt: null };
    if (query?.customerId) where.customerId = query.customerId;
    return this.prisma.maintenanceContract.findMany({
      where,
      include: {
        customer: true,
        site: true,
        visitSchedules: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createMaintenanceContract(input: {
    customerId: string;
    siteId: string;
    title: string;
    startDate: Date | string;
    endDate: Date | string;
    totalAmount: number;
    visitsPerYear?: number;
  }, actorUserId?: string) {
    const year = new Date().getFullYear();
    const count = await this.prisma.maintenanceContract.count();
    const contractNumber = `AMC-${year}-${(count + 1).toString().padStart(4, '0')}`;

    const visits = input.visitsPerYear || 4;
    const start = new Date(input.startDate);
    const end = new Date(input.endDate);
    const intervalDays = Math.floor((end.getTime() - start.getTime()) / (visits * 24 * 3600 * 1000));

    const visitSchedulesData = [];
    for (let i = 1; i <= visits; i++) {
      const vDate = new Date(start.getTime() + (i - 1) * intervalDays * 24 * 3600 * 1000);
      visitSchedulesData.push({
        visitNumber: i,
        scheduledDate: vDate,
        status: 'SCHEDULED',
      });
    }

    return this.prisma.maintenanceContract.create({
      data: {
        contractNumber,
        customerId: input.customerId,
        siteId: input.siteId,
        title: input.title,
        startDate: start,
        endDate: end,
        totalAmount: input.totalAmount,
        visitsPerYear: visits,
        status: 'ACTIVE',
        createdBy: actorUserId || null,
        visitSchedules: {
          create: visitSchedulesData,
        },
      },
      include: {
        customer: true,
        site: true,
        visitSchedules: true,
      },
    });
  }
}
