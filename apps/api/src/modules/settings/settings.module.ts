import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import {
  AdminSettingsController,
  PublicSettingsController,
} from './settings.controller';
import { SettingsRepository } from './settings.repository';
import { SettingsService } from './settings.service';
import { AuditLogModule } from '../audit-logs';

@Module({
  imports: [PrismaModule, AuditLogModule],
  controllers: [PublicSettingsController, AdminSettingsController],
  providers: [SettingsRepository, SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
