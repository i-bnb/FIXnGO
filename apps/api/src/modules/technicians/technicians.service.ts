import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class TechniciansService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: {
    search?: string;
    trade?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = { deletedAt: null };
    if (query?.trade) where.trade = query.trade;
    if (query?.status) where.status = query.status;
    if (query?.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { employeeCode: { contains: query.search, mode: 'insensitive' } },
        { mobileNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, fullName: true, phone: true, avatarUrl: true },
          },
          skills: true,
          locations: {
            orderBy: { recordedAt: 'desc' },
            take: 1,
          },
          assignments: {
            where: {
              deletedAt: null,
              status: 'ACTIVE',
              workOrder: {
                deletedAt: null,
                status: { in: ['ASSIGNED', 'EN_ROUTE', 'ON_SITE', 'IN_PROGRESS'] },
              },
            },
            include: { workOrder: true },
          },
        },
        orderBy: { employeeCode: 'asc' },
        take: query?.limit || 50,
        skip: query?.offset || 0,
      }),
      this.prisma.employee.count({ where }),
    ]);

    return {
      items: items.map((emp) => ({
        ...emp,
        fullName: `${emp.firstName} ${emp.lastName}`,
        currentLocation: emp.locations[0] || null,
        activeJobsCount: emp.assignments.length,
        isAvailable: emp.assignments.length === 0,
      })),
      total,
      limit: query?.limit || 50,
      offset: query?.offset || 0,
    };
  }

  async findById(id: string) {
    const emp = await this.prisma.employee.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: true,
        skills: true,
        locations: { orderBy: { recordedAt: 'desc' }, take: 10 },
        assignments: {
          where: { deletedAt: null },
          include: { workOrder: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        attendance: {
          orderBy: { checkInTime: 'desc' },
          take: 7,
        },
        leaves: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!emp) throw new NotFoundException(`Technician ${id} not found`);

    return {
      ...emp,
      fullName: `${emp.firstName} ${emp.lastName}`,
      currentLocation: emp.locations[0] || null,
      isAvailable: !emp.assignments.some(
        (a) =>
          a.status === 'ACTIVE' &&
          ['ASSIGNED', 'EN_ROUTE', 'ON_SITE', 'IN_PROGRESS'].includes(a.workOrder.status),
      ),
    };
  }

  async checkIn(employeeId: string, input: { latitude?: number; longitude?: number; address?: string }) {
    return this.prisma.employeeAttendance.create({
      data: {
        employeeId,
        checkInTime: new Date(),
        checkInLatitude: input.latitude || null,
        checkInLongitude: input.longitude || null,
        checkInAddress: input.address || null,
        status: 'PRESENT',
      },
    });
  }

  async checkOut(attendanceId: string, input: { latitude?: number; longitude?: number; address?: string }) {
    return this.prisma.employeeAttendance.update({
      where: { id: attendanceId },
      data: {
        checkOutTime: new Date(),
        checkOutLatitude: input.latitude || null,
        checkOutLongitude: input.longitude || null,
        checkOutAddress: input.address || null,
      },
    });
  }
}
