import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  UseGuards,
  Version,
  UseInterceptors,
} from '@nestjs/common';
import { UserRole, AuditAction } from '@prisma/client';
import { Roles } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuditLogInterceptor, AuditLogAction } from '../audit-logs';
import {
  UpdateAccountSettingsDto,
  UpdateAiSettingsDto,
  UpdateDocumentVisibilitySettingsDto,
  UpdateGeneralSettingsDto,
  UpdateMobileSettingsDto,
  UpdateModerationSettingsDto,
  UpdateUploadSettingsDto,
} from './dto';
import { SettingsService } from './settings.service';

@Controller('settings')
export class PublicSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Version('1')
  @Get()
  findAll() {
    return this.settingsService.findAll();
  }
}

@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditLogInterceptor)
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Version('1')
  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Version('1')
  @AuditLogAction(AuditAction.UPDATE_SYSTEM_SETTINGS)
  @Patch('general')
  @HttpCode(200)
  updateGeneral(@Body() dto: UpdateGeneralSettingsDto) {
    return this.settingsService.updateGeneral(dto);
  }

  @Version('1')
  @AuditLogAction(AuditAction.UPDATE_SYSTEM_SETTINGS)
  @Patch('upload')
  @HttpCode(200)
  updateUpload(@Body() dto: UpdateUploadSettingsDto) {
    return this.settingsService.updateUpload(dto);
  }

  @Version('1')
  @AuditLogAction(AuditAction.UPDATE_SYSTEM_SETTINGS)
  @Patch('document-visibility')
  @HttpCode(200)
  updateDocumentVisibility(@Body() dto: UpdateDocumentVisibilitySettingsDto) {
    return this.settingsService.updateDocumentVisibility(dto);
  }

  @Version('1')
  @AuditLogAction(AuditAction.UPDATE_SYSTEM_SETTINGS)
  @Patch('ai')
  @HttpCode(200)
  updateAi(@Body() dto: UpdateAiSettingsDto) {
    return this.settingsService.updateAi(dto);
  }

  @Version('1')
  @AuditLogAction(AuditAction.UPDATE_SYSTEM_SETTINGS)
  @Patch('moderation')
  @HttpCode(200)
  updateModeration(@Body() dto: UpdateModerationSettingsDto) {
    return this.settingsService.updateModeration(dto);
  }

  @Version('1')
  @AuditLogAction(AuditAction.UPDATE_SYSTEM_SETTINGS)
  @Patch('account')
  @HttpCode(200)
  updateAccount(@Body() dto: UpdateAccountSettingsDto) {
    return this.settingsService.updateAccount(dto);
  }

  @Version('1')
  @AuditLogAction(AuditAction.UPDATE_SYSTEM_SETTINGS)
  @Patch('mobile')
  @HttpCode(200)
  updateMobile(@Body() dto: UpdateMobileSettingsDto) {
    return this.settingsService.updateMobile(dto);
  }
}
