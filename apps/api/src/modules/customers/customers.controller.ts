import { Controller, Get, Post, Body, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { CustomersService } from './customers.service';

@ApiTags('Customers & Sites')
@Controller('api/customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'List customers with search and filters' })
  async getCustomers(
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.customersService.findAll({
      search,
      type,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  @Get('contracts')
  @ApiOperation({ summary: 'List maintenance contracts (AMC) across customers' })
  async getContracts(@Query('customerId') customerId?: string) {
    return this.customersService.findAllContracts({ customerId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full customer profile with sites, assets, and service history' })
  async getCustomerById(@Param('id') id: string) {
    return this.customersService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new customer with site' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Crescent Bay Commercial Complex' },
        customerType: { type: 'string', example: 'COMPANY' },
        trn: { type: 'string', example: '100000000000002 (demo)' },
        email: { type: 'string', example: 'facilities@crescentbay.example' },
        phone: { type: 'string', example: '+97143673333' },
        siteName: { type: 'string', example: 'Burj Khalifa Commercial' },
        address: { type: 'string', example: 'Downtown Dubai, UAE' },
        latitude: { type: 'number', example: 25.1972 },
        longitude: { type: 'number', example: 55.2744 },
      },
      required: ['name', 'phone'],
    },
  })
  async createCustomer(@Body() body: any, @Req() req: any) {
    return this.customersService.create(body, req.user?.id);
  }

  @Post(':id/sites')
  @ApiOperation({ summary: 'Add a new location/site to a customer' })
  async addSite(@Param('id') customerId: string, @Body() body: any) {
    return this.customersService.addSite(customerId, body);
  }

  @Post('sites/:siteId/assets')
  @ApiOperation({ summary: 'Register an equipment/MEP asset at a customer site' })
  async addAsset(@Param('siteId') siteId: string, @Body() body: any) {
    return this.customersService.addAsset(siteId, body);
  }

  @Post('contracts')
  @ApiOperation({ summary: 'Create annual maintenance contract (AMC) with scheduled visits' })
  async createContract(@Body() body: any, @Req() req: any) {
    return this.customersService.createMaintenanceContract(body, req.user?.id);
  }
}
