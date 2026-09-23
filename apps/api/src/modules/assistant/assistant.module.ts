import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { ReportsModule } from '../reports/reports.module';
import { AssistantService } from './assistant.service';
import { AssistantToolsService } from './tools/assistant-tools.service';
import { AssistantController } from './assistant.controller';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    ReportsModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET || 'fieldops-jwt-super-secret-key-2026-demo',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AssistantController],
  providers: [AssistantService, AssistantToolsService],
  exports: [AssistantService, AssistantToolsService],
})
export class AssistantModule {}
