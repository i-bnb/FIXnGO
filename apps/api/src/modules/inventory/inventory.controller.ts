import { Controller, Get, Post, Query, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';

@ApiTags('Inventory & Warehouses')
@Controller('api/inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get('warehouses')
  @ApiOperation({ summary: 'List all warehouses, central stores, and technician van stores' })
  async getWarehouses() {
    return this.inventoryService.findAllWarehouses();
  }

  @Get('items')
  @ApiOperation({ summary: 'List items / spare parts with stock levels and reorder alerts' })
  async getItems(
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('lowStockOnly') lowStockOnly?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.inventoryService.findAllItems({
      search,
      type,
      lowStockOnly: lowStockOnly === 'true',
      warehouseId,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  @Get('items/:id')
  @ApiOperation({ summary: 'Get single item with stock level breakdown across warehouses' })
  async getItemById(@Param('id') id: string) {
    return this.inventoryService.findItemById(id);
  }

  @Post('movements')
  @ApiOperation({ summary: 'Record inventory stock movement (transfer, purchase receipt, adjustment)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        itemId: { type: 'string' },
        movementType: { type: 'string', example: 'VAN_TRANSFER' },
        quantity: { type: 'number', example: 5 },
        sourceWarehouseId: { type: 'string' },
        destinationWarehouseId: { type: 'string' },
        notes: { type: 'string' },
      },
      required: ['itemId', 'movementType', 'quantity'],
    },
  })
  async createMovement(@Body() body: any, @Req() req: any) {
    return this.inventoryService.recordStockMovement(body, req.user?.id);
  }
}
