import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { FilesController } from './storage.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FilesController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
