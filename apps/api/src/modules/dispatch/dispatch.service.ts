import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

export interface PingInput {
  employeeId: string;
  latitude: number;
  longitude: number;
  speedKmh?: number;
  headingDegrees?: number;
  workOrderId?: string;
}

@Injectable()
export class DispatchService {
  private readonly logger = new Logger(DispatchService.name);

  constructor(
    private prisma: PrismaService,
    private realtimeGateway: RealtimeGateway,
  ) {}

  // Helper: Haversine distance formula (in km) as robust fallback
  private calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }

  async getDispatchOverview() {
    const [employees, unassignedOrders, activeOrders] = await Promise.all([
      this.prisma.employee.findMany({
        where: { deletedAt: null, status: 'ACTIVE' },
        include: {
          user: {
            select: { id: true, fullName: true, phone: true, avatarUrl: true, email: true },
          },
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
      }),
      this.prisma.workOrder.findMany({
        where: {
          deletedAt: null,
          status: 'NEW',
          assignments: { none: { deletedAt: null } },
        },
        include: {
          customer: true,
          site: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.workOrder.findMany({
        where: {
          deletedAt: null,
          status: { in: ['ASSIGNED', 'EN_ROUTE', 'ON_SITE', 'IN_PROGRESS'] },
        },
        include: {
          customer: true,
          site: true,
          assignments: {
            where: { deletedAt: null },
            include: { employee: true },
          },
        },
      }),
    ]);

    const activeTechCount = employees.filter((e) => e.assignments.length > 0).length;
    const availableTechCount = employees.filter((e) => e.assignments.length === 0).length;

    return {
      technicians: employees.map((e) => ({
        id: e.id,
        employeeCode: e.employeeCode,
        fullName: `${e.firstName} ${e.lastName}`,
        trade: e.trade,
        mobileNumber: e.mobileNumber,
        hourlyBillingRate: e.hourlyBillingRate,
        currentLocation: e.locations[0] || null,
        activeJobsCount: e.assignments.length,
        isAvailable: e.assignments.length === 0,
      })),
      unassignedOrders,
      activeOrders,
      stats: {
        totalTechs: employees.length,
        activeTechs: activeTechCount,
        availableTechs: availableTechCount,
        unassignedJobs: unassignedOrders.length,
        activeJobs: activeOrders.length,
      },
    };
  }

  async suggestNearestTechnicians(query: {
    workOrderId?: string;
    latitude?: number;
    longitude?: number;
    trade?: string;
    radiusKm?: number;
  }) {
    let targetLat = query.latitude;
    let targetLng = query.longitude;
    let targetTrade = query.trade;

    if (query.workOrderId) {
      const wo = await this.prisma.workOrder.findUnique({
        where: { id: query.workOrderId },
        include: { site: true },
      });
      if (wo) {
        targetLat = targetLat || Number(wo.latitude) || Number(wo.site?.latitude) || 25.2048;
        targetLng = targetLng || Number(wo.longitude) || Number(wo.site?.longitude) || 55.2708;
        targetTrade = targetTrade || wo.serviceType;
      }
    }

    if (!targetLat || !targetLng) {
      targetLat = 25.2048; // Default Dubai coordinates
      targetLng = 55.2708;
    }

    // Try executing PostGIS native query first
    try {
      const sqlResults: any[] = await this.prisma.$queryRaw`
        SELECT 
          e.id AS "employeeId",
          e.employee_code AS "employeeCode",
          e.first_name || ' ' || e.last_name AS "fullName",
          e.trade,
          e.mobile_number AS "mobileNumber",
          e.hourly_billing_rate AS "hourlyBillingRate",
          tl.latitude::float AS latitude,
          tl.longitude::float AS longitude,
          tl.speed_kmh::float AS "speedKmh",
          tl.recorded_at AS "recordedAt",
          ROUND((ST_DistanceSphere(
            ST_MakePoint(tl.longitude::float, tl.latitude::float),
            ST_MakePoint(${targetLng}::float, ${targetLat}::float)
          ) / 1000.0)::numeric, 2) AS "distanceKm",
          ROUND((((ST_DistanceSphere(
            ST_MakePoint(tl.longitude::float, tl.latitude::float),
            ST_MakePoint(${targetLng}::float, ${targetLat}::float)
          ) / 1000.0) / 40.0) * 60.0)::numeric, 0) AS "estimatedEtaMinutes",
          (
            SELECT COUNT(*)::int
            FROM work_order_assignments woa
            JOIN work_orders wo ON wo.id = woa.work_order_id
            WHERE woa.employee_id = e.id 
              AND woa.deleted_at IS NULL 
              AND wo.deleted_at IS NULL
              AND wo.status IN ('ASSIGNED', 'EN_ROUTE', 'ON_SITE', 'IN_PROGRESS')
          ) AS "activeJobsCount"
        FROM employees e
        JOIN LATERAL (
          SELECT latitude, longitude, speed_kmh, recorded_at
          FROM technician_locations
          WHERE employee_id = e.id
          ORDER BY recorded_at DESC
          LIMIT 1
        ) tl ON true
        WHERE e.deleted_at IS NULL 
          AND e.status = 'ACTIVE'
          AND (${targetTrade}::text IS NULL OR e.trade = ${targetTrade}::text OR ${targetTrade}::text = 'MEP' OR ${targetTrade}::text = 'GENERAL')
        ORDER BY ST_DistanceSphere(
          ST_MakePoint(tl.longitude::float, tl.latitude::float),
          ST_MakePoint(${targetLng}::float, ${targetLat}::float)
        ) ASC
        LIMIT 20;
      `;

      if (sqlResults && sqlResults.length > 0) {
        return sqlResults.map((r) => ({
          ...r,
          distanceKm: Number(r.distanceKm),
          estimatedEtaMinutes: Number(r.estimatedEtaMinutes),
          activeJobsCount: Number(r.activeJobsCount),
          isAvailable: Number(r.activeJobsCount) === 0,
        }));
      }
    } catch (sqlErr) {
      this.logger.warn(`PostGIS query note (using fallback distance algorithm): ${(sqlErr as Error).message}`);
    }

    // Fallback: Haversine distance in TypeScript
    const employees = await this.prisma.employee.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        ...(targetTrade && targetTrade !== 'MEP' && targetTrade !== 'GENERAL' ? { trade: targetTrade } : {}),
      },
      include: {
        locations: { orderBy: { recordedAt: 'desc' }, take: 1 },
        assignments: {
          where: {
            deletedAt: null,
            workOrder: {
              deletedAt: null,
              status: { in: ['ASSIGNED', 'EN_ROUTE', 'ON_SITE', 'IN_PROGRESS'] },
            },
          },
        },
      },
    });

    const suggestions = employees.map((emp) => {
      const loc = emp.locations[0] || { latitude: 25.2048, longitude: 55.2708, recordedAt: new Date() };
      const dist = this.calculateHaversineDistanceKm(
        targetLat!,
        targetLng!,
        Number(loc.latitude),
        Number(loc.longitude),
      );
      const eta = Math.round((dist / 40.0) * 60.0); // 40 km/h average speed in UAE urban traffic

      return {
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        fullName: `${emp.firstName} ${emp.lastName}`,
        trade: emp.trade,
        mobileNumber: emp.mobileNumber,
        hourlyBillingRate: emp.hourlyBillingRate,
        latitude: Number(loc.latitude),
        longitude: Number(loc.longitude),
        recordedAt: loc.recordedAt,
        distanceKm: dist,
        estimatedEtaMinutes: Math.max(5, eta),
        activeJobsCount: emp.assignments.length,
        isAvailable: emp.assignments.length === 0,
      };
    });

    suggestions.sort((a, b) => a.distanceKm - b.distanceKm);

    return suggestions;
  }

  async recordPing(input: PingInput) {
    const loc = await this.prisma.technicianLocation.create({
      data: {
        employeeId: input.employeeId,
        latitude: input.latitude,
        longitude: input.longitude,
        speedKmh: input.speedKmh || null,
        headingDegrees: input.headingDegrees || null,
        recordedAt: new Date(),
      },
    });

    // Broadcast over Socket.IO
    this.realtimeGateway.emitTechnicianLocation({
      employeeId: input.employeeId,
      latitude: input.latitude,
      longitude: input.longitude,
      speedKmh: input.speedKmh,
      headingDegrees: input.headingDegrees,
      workOrderId: input.workOrderId,
      recordedAt: loc.recordedAt,
    });

    return {
      success: true,
      locationId: loc.id,
      timestamp: loc.recordedAt,
    };
  }

  async getLivePositions() {
    const employees = await this.prisma.employee.findMany({
      where: { deletedAt: null, status: 'ACTIVE' },
      include: {
        locations: { orderBy: { recordedAt: 'desc' }, take: 1 },
        assignments: {
          where: {
            deletedAt: null,
            workOrder: {
              deletedAt: null,
              status: { in: ['ASSIGNED', 'EN_ROUTE', 'ON_SITE', 'IN_PROGRESS'] },
            },
          },
          include: { workOrder: true },
        },
      },
    });

    return employees.map((emp) => ({
      employeeId: emp.id,
      employeeCode: emp.employeeCode,
      fullName: `${emp.firstName} ${emp.lastName}`,
      trade: emp.trade,
      mobileNumber: emp.mobileNumber,
      lastKnownLocation: emp.locations[0] || null,
      currentWorkOrder: emp.assignments[0]?.workOrder || null,
      isAvailable: emp.assignments.length === 0,
    }));
  }

  async getRouteHistory(workOrderId: string) {
    const wo = await this.prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        assignments: {
          where: { deletedAt: null, isInCharge: true },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!wo) throw new NotFoundException('Work order not found');

    const inCharge = wo.assignments[0];
    if (!inCharge) {
      return {
        workOrderId,
        coordinates: [
          { latitude: Number(wo.latitude), longitude: Number(wo.longitude), timestamp: wo.createdAt },
        ],
      };
    }

    const locations = await this.prisma.technicianLocation.findMany({
      where: {
        employeeId: inCharge.employeeId,
        recordedAt: {
          gte: inCharge.assignedAt,
          lte: wo.actualEnd || new Date(),
        },
      },
      orderBy: { recordedAt: 'asc' },
      take: 200,
    });

    return {
      workOrderId,
      employeeId: inCharge.employeeId,
      coordinates: locations.map((l) => ({
        latitude: Number(l.latitude),
        longitude: Number(l.longitude),
        speedKmh: Number(l.speedKmh) || 0,
        recordedAt: l.recordedAt,
      })),
    };
  }

  // ==============================================================
  // REAL-TIME GPS TELEMATICS SIMULATOR (5 DEMO ACTORS ALONG DUBAI ROADS)
  // ==============================================================
  private simulatorTimer: NodeJS.Timeout | null = null;
  private simulatorStep = 0;

  private readonly SIMULATOR_ROUTES = [
    {
      employeeCode: 'EMP-T01',
      name: 'Rashid Al-Nuaimi',
      vanCode: 'Van-01',
      workOrderId: 'wo-demo-01',
      route: [
        [25.1856, 55.2708],
        [25.1885, 55.2720],
        [25.1915, 55.2732],
        [25.1945, 55.2740],
        [25.1972, 55.2744], // Downtown Dubai
        [25.2010, 55.2762],
        [25.2055, 55.2785],
        [25.2095, 55.2815],
        [25.2055, 55.2785],
        [25.2010, 55.2762],
        [25.1972, 55.2744],
        [25.1915, 55.2732],
      ],
    },
    {
      employeeCode: 'EMP-T02',
      name: 'Vikram Sharma',
      vanCode: 'Van-02',
      workOrderId: 'wo-2',
      route: [
        [25.2048, 55.2435],
        [25.1990, 55.2380],
        [25.1850, 55.2280],
        [25.1680, 55.2150],
        [25.1500, 55.2050],
        [25.1380, 55.1950],
        [25.1500, 55.2050],
        [25.1680, 55.2150],
        [25.1850, 55.2280],
      ],
    },
    {
      employeeCode: 'EMP-T03',
      name: 'Mohammad Rizwan',
      vanCode: 'Van-03',
      workOrderId: 'wo-3',
      route: [
        [25.0762, 55.1403],
        [25.0790, 55.1440],
        [25.0830, 55.1490],
        [25.0880, 55.1550],
        [25.0940, 55.1620],
        [25.0990, 55.1690],
        [25.0880, 55.1550],
        [25.0790, 55.1440],
      ],
    },
    {
      employeeCode: 'EMP-T04',
      name: 'Kareem Mostafa',
      vanCode: 'Van-04',
      route: [
        [25.2632, 55.3218],
        [25.2580, 55.3260],
        [25.2490, 55.3340],
        [25.2380, 55.3420],
        [25.2280, 55.3500],
        [25.2380, 55.3420],
        [25.2580, 55.3260],
      ],
    },
    {
      employeeCode: 'EMP-H01',
      name: 'Sajid Ali',
      vanCode: 'Van-05',
      route: [
        [25.1325, 55.2341],
        [25.1250, 55.2280],
        [25.1180, 55.2200],
        [25.1100, 55.2100],
        [25.1180, 55.2200],
        [25.1250, 55.2280],
      ],
    },
  ];

  startSimulator() {
    if (this.simulatorTimer) {
      return { isRunning: true, message: 'Simulator already running', step: this.simulatorStep };
    }

    this.logger.log('Starting GPS Telematics Simulator for 5 technicians...');
    this.simulatorTimer = setInterval(async () => {
      this.simulatorStep++;

      for (const actor of this.SIMULATOR_ROUTES) {
        const routeIdx = this.simulatorStep % actor.route.length;
        const coords = actor.route[routeIdx];
        const nextCoords = actor.route[(routeIdx + 1) % actor.route.length];

        const lat = coords[0];
        const lng = coords[1];
        const heading = Math.round(
          (Math.atan2(nextCoords[1] - lng, nextCoords[0] - lat) * 180) / Math.PI + 360
        ) % 360;
        const speed = 40 + Math.floor(Math.random() * 20); // 40-60 km/h

        // Broadcast to Socket.IO realtime rooms
        this.realtimeGateway.emitTechnicianLocation({
          employeeId: actor.employeeCode,
          employeeName: actor.name,
          latitude: lat,
          longitude: lng,
          speedKmh: speed,
          headingDegrees: heading,
          recordedAt: new Date().toISOString(),
          workOrderId: actor.workOrderId,
        });
      }
    }, 3000);

    return { isRunning: true, message: 'GPS Telematics Simulator started', step: this.simulatorStep, techniciansCount: 5 };
  }

  stopSimulator() {
    if (this.simulatorTimer) {
      clearInterval(this.simulatorTimer);
      this.simulatorTimer = null;
      this.logger.log('Stopped GPS Telematics Simulator.');
    }
    return { isRunning: false, message: 'GPS Telematics Simulator stopped', step: this.simulatorStep };
  }

  getSimulatorStatus() {
    return {
      isRunning: !!this.simulatorTimer,
      currentStep: this.simulatorStep,
      techniciansCount: this.SIMULATOR_ROUTES.length,
      routes: this.SIMULATOR_ROUTES.map((r) => ({ name: r.name, vanCode: r.vanCode, pointsCount: r.route.length })),
    };
  }
}

