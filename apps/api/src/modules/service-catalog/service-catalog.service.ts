import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ServiceCatalogService {
  constructor(private prisma: PrismaService) {}

  async findAllCategories() {
    return this.prisma.serviceCategory.findMany({
      where: { deletedAt: null, isActive: true },
      include: {
        services: { where: { deletedAt: null } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findAllServices(query?: { search?: string; categoryId?: string }) {
    const where: any = { deletedAt: null };
    if (query?.categoryId) where.categoryId = query.categoryId;
    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.service.findMany({
      where,
      include: { category: true, priceListItems: { include: { priceList: true } } },
      orderBy: { code: 'asc' },
    });
  }

  async findPriceLists() {
    return this.prisma.priceList.findMany({
      include: {
        items: { include: { service: true } },
      },
    });
  }

  // Service Requests (Customer Submissions)
  async findAllServiceRequests(query?: { search?: string; status?: string; customerId?: string }) {
    const where: any = { deletedAt: null };
    if (query?.status) where.status = query.status;
    if (query?.customerId) where.customerId = query.customerId;

    return this.prisma.serviceRequest.findMany({
      where,
      include: {
        customer: true,
        site: true,
        requestedService: true,
        workOrders: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createServiceRequest(input: {
    customerId: string;
    siteId: string;
    serviceId?: string;
    title?: string;
    description: string;
    urgencyLevel?: string;
    priority?: string;
    preferredDate?: Date | string;
  }) {
    const count = await this.prisma.serviceRequest.count();
    const year = new Date().getFullYear();
    const requestNumber = `SR-${year}-${(count + 1).toString().padStart(4, '0')}`;

    return this.prisma.serviceRequest.create({
      data: {
        requestNumber,
        customerId: input.customerId,
        siteId: input.siteId,
        requestedServiceId: input.serviceId || null,
        description: input.description || input.title || 'Service Request',
        priority: input.priority || input.urgencyLevel || 'MEDIUM',
        preferredDate: input.preferredDate ? new Date(input.preferredDate) : null,
        status: 'OPEN',
      },
      include: {
        customer: true,
        site: true,
        requestedService: true,
      },
    });
  }

  // Complaints
  async findAllComplaints(query?: { customerId?: string; status?: string }) {
    const where: any = { deletedAt: null };
    if (query?.customerId) where.customerId = query.customerId;
    if (query?.status) where.status = query.status;

    return this.prisma.complaint.findMany({
      where,
      include: { customer: true, workOrder: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createComplaint(input: {
    customerId: string;
    workOrderId?: string;
    title?: string;
    category?: string;
    description: string;
    severity?: string;
  }) {
    const count = await this.prisma.complaint.count();
    const complaintNumber = `CMP-${Date.now()}-${count + 1}`;

    return this.prisma.complaint.create({
      data: {
        complaintNumber,
        customerId: input.customerId,
        workOrderId: input.workOrderId || null,
        title: input.title || input.category || 'Customer Complaint',
        description: input.description,
        severity: input.severity || 'MEDIUM',
        status: 'OPEN',
      },
    });
  }
}
