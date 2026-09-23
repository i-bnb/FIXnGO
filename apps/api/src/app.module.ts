import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { StorageModule } from './modules/storage/storage.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { TechniciansModule } from './modules/technicians/technicians.module';
import { WorkOrdersModule } from './modules/work-orders/work-orders.module';
import { DispatchModule } from './modules/dispatch/dispatch.module';
import { ManpowerModule } from './modules/manpower/manpower.module';
import { EquipmentModule } from './modules/equipment/equipment.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { BillingModule } from './modules/billing/billing.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ServiceCatalogModule } from './modules/service-catalog/service-catalog.module';
import { FinanceModule } from './modules/finance/finance.module';
import { ReportsModule } from './modules/reports/reports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AutomationModule } from './modules/automation/automation.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { AssistantModule } from './modules/assistant/assistant.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env', '../.env'] }),
    PrismaModule,
    StorageModule,
    RealtimeModule,
    AuditModule,
    AuthModule,
    TechniciansModule,
    WorkOrdersModule,
    DispatchModule,
    ManpowerModule,
    EquipmentModule,
    InventoryModule,
    BillingModule,
    CustomersModule,
    ServiceCatalogModule,
    FinanceModule,
    ReportsModule,
    NotificationsModule,
    AutomationModule,
    ApprovalsModule,
    AssistantModule,
  ],
})
export class AppModule {}
