import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  UseGuards,
  Version,
  Req,
} from '@nestjs/common';
import { UserRole, AuditAction, AuditTargetType } from '@prisma/client';
import { Roles } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuditLogService } from '../audit-logs';
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
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Version('1')
  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  private async logSettingsChange(
    request: any,
    groupName: string,
    dto: any,
    oldSettingsData: any,
  ) {
    try {
      const actorId = request.user?.sub;
      const actorRole = request.user?.role;
      const ipAddress =
        request.ip ||
        request.headers['x-forwarded-for'] ||
        request.socket.remoteAddress;

      const groupOld = oldSettingsData[groupName] || {};
      for (const key of Object.keys(dto)) {
        if (dto[key] !== undefined && dto[key] !== groupOld[key]) {
          await this.auditLogService.log({
            actorId,
            actorRole,
            action: AuditAction.UPDATE_SYSTEM_SETTINGS,
            targetType: AuditTargetType.SYSTEM_SETTING,
            targetId: 'GLOBAL',
            metadata: {
              setting: key,
              oldValue: groupOld[key],
              newValue: dto[key],
            },
            ipAddress: ipAddress ? String(ipAddress) : undefined,
          });
        }
      }
    } catch (err) {
      console.error('Failed to log settings change:', err);
    }
  }

  @Version('1')
  @Patch('general')
  @HttpCode(200)
  async updateGeneral(
    @Body() dto: UpdateGeneralSettingsDto,
    @Req() request: any,
  ) {
    const oldSettings = await this.settingsService.findAll();
    const result = await this.settingsService.updateGeneral(dto);
    await this.logSettingsChange(request, 'general', dto, oldSettings.data);
    return result;
  }

  @Version('1')
  @Patch('upload')
  @HttpCode(200)
  async updateUpload(
    @Body() dto: UpdateUploadSettingsDto,
    @Req() request: any,
  ) {
    const oldSettings = await this.settingsService.findAll();
    const result = await this.settingsService.updateUpload(dto);
    // Standardize fileTypes for metadata diff tracking or ignore it, but log key fields
    const { fileTypes, ...dtoFields } = dto;
    await this.logSettingsChange(
      request,
      'upload',
      dtoFields,
      oldSettings.data,
    );
    if (fileTypes) {
      // Log fileTypes change if modified
      const oldFileTypes = oldSettings.data.upload.fileTypes || [];
      for (const ft of fileTypes) {
        const matchingOld = oldFileTypes.find(
          (o: any) => o.extension === ft.extension,
        );
        if (!matchingOld || matchingOld.enabled !== ft.enabled) {
          await this.auditLogService.log({
            actorId: request.user?.sub,
            actorRole: request.user?.role,
            action: AuditAction.UPDATE_SYSTEM_SETTINGS,
            targetType: AuditTargetType.SYSTEM_SETTING,
            targetId: 'GLOBAL',
            metadata: {
              setting: `FILE_TYPE_${ft.extension}`,
              oldValue: matchingOld ? matchingOld.enabled : false,
              newValue: ft.enabled,
            },
            ipAddress:
              request.ip ||
              request.headers['x-forwarded-for'] ||
              request.socket.remoteAddress,
          });
        }
      }
    }
    return result;
  }

  @Version('1')
  @Patch('document-visibility')
  @HttpCode(200)
  async updateDocumentVisibility(
    @Body() dto: UpdateDocumentVisibilitySettingsDto,
    @Req() request: any,
  ) {
    const oldSettings = await this.settingsService.findAll();
    const result = await this.settingsService.updateDocumentVisibility(dto);
    await this.logSettingsChange(
      request,
      'documentVisibility',
      dto,
      oldSettings.data,
    );
    return result;
  }

  @Version('1')
  @Patch('ai')
  @HttpCode(200)
  async updateAi(@Body() dto: UpdateAiSettingsDto, @Req() request: any) {
    const oldSettings = await this.settingsService.findAll();
    const result = await this.settingsService.updateAi(dto);
    await this.logSettingsChange(request, 'ai', dto, oldSettings.data);
    return result;
  }

  @Version('1')
  @Patch('moderation')
  @HttpCode(200)
  async updateModeration(
    @Body() dto: UpdateModerationSettingsDto,
    @Req() request: any,
  ) {
    const oldSettings = await this.settingsService.findAll();
    const result = await this.settingsService.updateModeration(dto);
    await this.logSettingsChange(request, 'moderation', dto, oldSettings.data);
    return result;
  }

  @Version('1')
  @Patch('account')
  @HttpCode(200)
  async updateAccount(
    @Body() dto: UpdateAccountSettingsDto,
    @Req() request: any,
  ) {
    const oldSettings = await this.settingsService.findAll();
    const result = await this.settingsService.updateAccount(dto);
    await this.logSettingsChange(request, 'account', dto, oldSettings.data);
    return result;
  }

  @Version('1')
  @Patch('mobile')
  @HttpCode(200)
  async updateMobile(
    @Body() dto: UpdateMobileSettingsDto,
    @Req() request: any,
  ) {
    const oldSettings = await this.settingsService.findAll();
    const result = await this.settingsService.updateMobile(dto);
    await this.logSettingsChange(request, 'mobile', dto, oldSettings.data);
    return result;
  }
}
