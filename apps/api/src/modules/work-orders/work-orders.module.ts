import { Module } from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { WorkOrdersController } from './work-orders.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [PrismaModule, AuditModule, RealtimeModule, StorageModule],
  controllers: [WorkOrdersController],
  providers: [WorkOrdersService],
  exports: [WorkOrdersService],
})
export class WorkOrdersModule {}
