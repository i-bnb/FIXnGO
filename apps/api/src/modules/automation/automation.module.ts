import { Module } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { AutomationController } from './automation.controller';
import { RealtimeModule } from '../realtime/realtime.module';
import { DispatchModule } from '../dispatch/dispatch.module';

@Module({
  imports: [RealtimeModule, DispatchModule],
  controllers: [AutomationController],
  providers: [AutomationService],
  exports: [AutomationService],
})
export class AutomationModule {}
