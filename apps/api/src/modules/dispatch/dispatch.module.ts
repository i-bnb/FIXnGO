import { Module } from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { DispatchController } from './dispatch.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [PrismaModule, RealtimeModule],
  controllers: [DispatchController],
  providers: [DispatchService],
  exports: [DispatchService],
})
export class DispatchModule {}
