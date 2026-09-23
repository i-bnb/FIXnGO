import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ServiceCatalogService } from './service-catalog.service';

@ApiTags('Service Catalog & Requests')
@Controller('api/service-catalog')
export class ServiceCatalogController {
  constructor(private serviceCatalogService: ServiceCatalogService) {}

  @Get('categories')
  @ApiOperation({ summary: 'List service categories (HVAC, Electrical, Plumbing)' })
  async getCategories() {
    return this.serviceCatalogService.findAllCategories();
  }

  @Get('services')
  @ApiOperation({ summary: 'List services with UAE AED pricing and standard durations' })
  async getServices(@Query('search') search?: string, @Query('categoryId') categoryId?: string) {
    return this.serviceCatalogService.findAllServices({ search, categoryId });
  }

  @Get('price-lists')
  @ApiOperation({ summary: 'List price lists and pricing matrices' })
  async getPriceLists() {
    return this.serviceCatalogService.findPriceLists();
  }

  @Get('requests')
  @ApiOperation({ summary: 'List customer service requests' })
  async getServiceRequests(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.serviceCatalogService.findAllServiceRequests({ search, status, customerId });
  }

  @Post('requests')
  @ApiOperation({ summary: 'Submit a new customer service request' })
  async createServiceRequest(@Body() body: any) {
    return this.serviceCatalogService.createServiceRequest(body);
  }

  @Get('complaints')
  @ApiOperation({ summary: 'List logged customer complaints' })
  async getComplaints(@Query('customerId') customerId?: string, @Query('status') status?: string) {
    return this.serviceCatalogService.findAllComplaints({ customerId, status });
  }

  @Post('complaints')
  @ApiOperation({ summary: 'Lodge a customer service complaint' })
  async createComplaint(@Body() body: any) {
    return this.serviceCatalogService.createComplaint(body);
  }
}
