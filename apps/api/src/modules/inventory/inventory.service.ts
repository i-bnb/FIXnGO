import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAllWarehouses() {
    return this.prisma.warehouse.findMany({
      where: { deletedAt: null },
      include: {
        assignedEmployee: true,
        _count: { select: { stockLevels: true } },
      },
      orderBy: { code: 'asc' },
    });
  }

  async findAllItems(query?: {
    search?: string;
    type?: string;
    lowStockOnly?: boolean;
    warehouseId?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = { deletedAt: null };
    if (query?.type) where.type = query.type;
    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { itemCode: { contains: query.search, mode: 'insensitive' } },
        { barcode: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const items = await this.prisma.item.findMany({
      where,
      include: {
        stockLevels: {
          where: query?.warehouseId ? { warehouseId: query.warehouseId } : undefined,
          include: { warehouse: true },
        },
      },
      orderBy: { itemCode: 'asc' },
      take: query?.limit || 50,
      skip: query?.offset || 0,
    });

    const enriched = items.map((item) => {
      const totalOnHand = item.stockLevels.reduce((sum, s) => sum + s.quantityOnHand, 0);
      const totalReserved = item.stockLevels.reduce((sum, s) => sum + s.quantityReserved, 0);
      const totalAvailable = item.stockLevels.reduce((sum, s) => sum + s.quantityAvailable, 0);
      const minReorder = Math.min(...item.stockLevels.map((s) => s.reorderLevel), 10);
      const isLowStock = totalAvailable <= minReorder;

      return {
        ...item,
        totalOnHand,
        totalReserved,
        totalAvailable,
        reorderLevel: minReorder,
        isLowStock,
      };
    });

    if (query?.lowStockOnly) {
      return enriched.filter((i) => i.isLowStock);
    }

    return enriched;
  }

  async findItemById(id: string) {
    const item = await this.prisma.item.findFirst({
      where: { id, deletedAt: null },
      include: {
        stockLevels: { include: { warehouse: true } },
        stockMovements: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: { sourceWarehouse: true, destinationWarehouse: true },
        },
      },
    });

    if (!item) throw new NotFoundException(`Item ${id} not found`);
    return item;
  }

  async recordStockMovement(input: {
    itemId: string;
    movementType: string; // PURCHASE_RECEIPT, VAN_TRANSFER, JOB_CONSUMPTION, JOB_RETURN, ADJUSTMENT, DIRECT_SALE
    quantity: number;
    sourceWarehouseId?: string;
    destinationWarehouseId?: string;
    referenceType?: string;
    referenceId?: string;
    notes?: string;
  }, actorUserId?: string) {
    const item = await this.prisma.item.findUnique({
      where: { id: input.itemId },
    });
    if (!item) throw new NotFoundException('Item not found');

    const count = await this.prisma.stockMovement.count();
    const movementNumber = `MOV-${Date.now()}-${count + 1}`;

    // Adjust source warehouse if specified
    if (input.sourceWarehouseId) {
      const srcLevel = await this.prisma.stockLevel.findUnique({
        where: {
          itemId_warehouseId: {
            itemId: item.id,
            warehouseId: input.sourceWarehouseId,
          },
        },
      });
      if (srcLevel) {
        await this.prisma.stockLevel.update({
          where: { id: srcLevel.id },
          data: {
            quantityOnHand: Math.max(0, srcLevel.quantityOnHand - input.quantity),
            quantityAvailable: Math.max(0, srcLevel.quantityAvailable - input.quantity),
          },
        });
      }
    }

    // Adjust destination warehouse if specified
    if (input.destinationWarehouseId) {
      await this.prisma.stockLevel.upsert({
        where: {
          itemId_warehouseId: {
            itemId: item.id,
            warehouseId: input.destinationWarehouseId,
          },
        },
        create: {
          itemId: item.id,
          warehouseId: input.destinationWarehouseId,
          quantityOnHand: input.quantity,
          quantityAvailable: input.quantity,
          quantityReserved: 0,
        },
        update: {
          quantityOnHand: { increment: input.quantity },
          quantityAvailable: { increment: input.quantity },
        },
      });
    }

    const movement = await this.prisma.stockMovement.create({
      data: {
        movementNumber,
        itemId: item.id,
        movementType: input.movementType,
        quantity: input.quantity,
        unitCost: item.costPrice,
        sourceWarehouseId: input.sourceWarehouseId || null,
        destinationWarehouseId: input.destinationWarehouseId || null,
        referenceType: input.referenceType || null,
        referenceId: input.referenceId || null,
        notes: input.notes || null,
      },
    });

    await this.auditService.log({
      actorUserId,
      action: 'STOCK_MOVEMENT',
      entityName: 'StockMovement',
      entityId: movement.id,
      details: { movementNumber, type: input.movementType, quantity: input.quantity },
    });

    return movement;
  }
}
