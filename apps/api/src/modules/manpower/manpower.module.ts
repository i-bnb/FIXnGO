import { Module } from '@nestjs/common';
import { ManpowerService } from './manpower.service';
import { ManpowerController } from './manpower.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [ManpowerController],
  providers: [ManpowerService],
  exports: [ManpowerService],
})
export class ManpowerModule {}
