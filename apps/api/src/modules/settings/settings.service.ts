import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { system_settings } from '@prisma/client';
import {
  UpdateAccountSettingsDto,
  UpdateAiSettingsDto,
  UpdateDocumentVisibilitySettingsDto,
  UpdateGeneralSettingsDto,
  UpdateMobileSettingsDto,
  UpdateModerationSettingsDto,
  UpdateUploadSettingsDto,
} from './dto';
import { SettingsMutation, SettingsRepository } from './settings.repository';

@Injectable()
export class SettingsService {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  async findAll() {
    const settings = await this.settingsRepository.findOrCreate();

    return {
      message: 'System settings fetched successfully',
      data: this.toResponse(settings),
    };
  }

  updateGeneral(dto: UpdateGeneralSettingsDto) {
    return this.updateGroup('general', dto, async () => {
      if (
        dto.defaultSchoolCode &&
        !(await this.settingsRepository.schoolExists(dto.defaultSchoolCode))
      ) {
        throw new UnprocessableEntityException(
          `School with code ${dto.defaultSchoolCode} does not exist`,
        );
      }
    });
  }

  updateUpload(dto: UpdateUploadSettingsDto) {
    return this.updateGroup('upload', dto);
  }

  updateDocumentVisibility(dto: UpdateDocumentVisibilitySettingsDto) {
    return this.updateGroup('document visibility and review', dto);
  }

  async updateAi(dto: UpdateAiSettingsDto) {
    this.ensureNotEmpty(dto);
    const current = await this.settingsRepository.findOrCreate();
    const maxQuizQuestions = dto.maxQuizQuestions ?? current.maxQuizQuestions;
    const defaultQuizQuestions =
      dto.defaultQuizQuestions ?? current.defaultQuizQuestions;

    if (defaultQuizQuestions > maxQuizQuestions) {
      throw new UnprocessableEntityException(
        'defaultQuizQuestions must be less than or equal to maxQuizQuestions',
      );
    }

    return this.persist('AI', dto);
  }

  updateModeration(dto: UpdateModerationSettingsDto) {
    return this.updateGroup('moderation', dto);
  }

  updateAccount(dto: UpdateAccountSettingsDto) {
    return this.updateGroup('account', dto);
  }

  updateMobile(dto: UpdateMobileSettingsDto) {
    return this.updateGroup('mobile', dto);
  }

  private async updateGroup<T extends object>(
    groupName: string,
    dto: T,
    validate?: () => Promise<void>,
  ) {
    this.ensureNotEmpty(dto);
    await validate?.();
    return this.persist(groupName, dto);
  }

  private async persist(groupName: string, dto: object) {
    const settings = await this.settingsRepository.update(
      dto as SettingsMutation,
    );

    return {
      message: `${this.capitalize(groupName)} settings updated successfully`,
      data: this.toResponse(settings),
    };
  }

  private ensureNotEmpty(dto: object): void {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'Request body must contain at least one supported setting',
      );
    }
  }

  private capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private toResponse(settings: system_settings) {
    return {
      general: {
        systemName: settings.systemName,
        maintenanceMode: settings.maintenanceMode,
        defaultSchoolCode: settings.defaultSchoolCode,
        supportEmail: settings.supportEmail,
      },
      upload: {
        maxFileSizeMb: settings.maxFileSizeMb,
        allowedFileTypes: settings.allowedFileTypes,
        allowMobileUpload: settings.allowMobileUpload,
      },
      documentVisibility: {
        requireModerationForPublicDocuments:
          settings.requireModerationForPublicDocuments,
        allowPrivateDocuments: settings.allowPrivateDocuments,
        allowSharedLink: settings.allowSharedLink,
        privateToPublicRequiresReview: settings.privateToPublicRequiresReview,
        replaceFileRequiresReview: settings.replaceFileRequiresReview,
      },
      ai: {
        enableAiFeatures: settings.enableAiFeatures,
        enableAiSummary: settings.enableAiSummary,
        enableAiQuiz: settings.enableAiQuiz,
        enableAiSearch: settings.enableAiSearch,
        enableAiChat: settings.enableAiChat,
        enableAiModeratorAssistant: settings.enableAiModeratorAssistant,
        maxAiRequestsPerUserPerDay: settings.maxAiRequestsPerUserPerDay,
        maxQuizQuestions: settings.maxQuizQuestions,
        defaultQuizQuestions: settings.defaultQuizQuestions,
      },
      moderation: {
        autoFlagDuplicateDocuments: settings.autoFlagDuplicateDocuments,
        duplicateSimilarityThreshold: settings.duplicateSimilarityThreshold,
        requireRejectionReason: settings.requireRejectionReason,
        allowModeratorToApproveAiFlaggedDocument:
          settings.allowModeratorToApproveAiFlaggedDocument,
      },
      account: {
        allowGmailRegistration: settings.allowGmailRegistration,
        requireEmailVerification: settings.requireEmailVerification,
        allowUnverifiedLoginWithLimitedAccess:
          settings.allowUnverifiedLoginWithLimitedAccess,
        defaultRoleAfterSignup: settings.defaultRoleAfterSignup,
      },
      mobile: {
        enableMobileAppAccess: settings.enableMobileAppAccess,
        enableMobileUpload: settings.enableMobileUpload,
        enableMobileAiFeatures: settings.enableMobileAiFeatures,
      },
      version: settings.version,
      updatedAt: settings.updatedAt,
    };
  }
}
