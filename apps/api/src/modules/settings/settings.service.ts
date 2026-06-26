import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { system_settings, upload_file_types } from '@prisma/client';
import {
  UpdateAccountSettingsDto,
  UpdateAiSettingsDto,
  UpdateDocumentVisibilitySettingsDto,
  UpdateGeneralSettingsDto,
  UpdateMobileSettingsDto,
  UpdateModerationSettingsDto,
  UpdateUploadSettingsDto,
} from './dto';
import {
  SettingsMutation,
  SettingsRepository,
  SettingsVersionConflictError,
} from './settings.repository';

const MAX_OPTIMISTIC_LOCK_RETRIES = 5;

@Injectable()
export class SettingsService {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  async findAll() {
    const [settings, fileTypes] = await Promise.all([
      this.settingsRepository.findOrCreate(),
      this.settingsRepository.findUploadFileTypes(),
    ]);

    return {
      message: 'System settings fetched successfully',
      data: this.toResponse(settings, fileTypes),
    };
  }

  async validateDocumentUpload(format: string, sizeInBytes: number) {
    const normalizedExtension = format.trim().replace(/^\.+/, '').toUpperCase();
    const [settings, fileTypes] = await Promise.all([
      this.settingsRepository.findOrCreate(),
      this.settingsRepository.findUploadFileTypes(),
    ]);
    const configuredType = fileTypes.find(
      (fileType) => fileType.extension === normalizedExtension,
    );

    if (!configuredType?.enabled) {
      throw new UnprocessableEntityException(
        `File type ${normalizedExtension || format} is not enabled for upload`,
      );
    }

    const maxSizeInBytes = settings.maxFileSizeMb * 1024 * 1024;
    if (sizeInBytes > maxSizeInBytes) {
      throw new UnprocessableEntityException(
        `File size exceeds the configured ${settings.maxFileSizeMb}MB limit`,
      );
    }
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

  async updateUpload(dto: UpdateUploadSettingsDto) {
    this.ensureNotEmpty(dto);
    const { fileTypes, ...settingsDto } = dto;

    if (fileTypes) {
      const currentFileTypes =
        await this.settingsRepository.findUploadFileTypes();
      const effectiveFileTypes = new Map(
        currentFileTypes.map((fileType) => [
          fileType.extension,
          fileType.enabled,
        ]),
      );

      fileTypes.forEach((fileType) => {
        effectiveFileTypes.set(fileType.extension, fileType.enabled);
      });

      if (![...effectiveFileTypes.values()].some(Boolean)) {
        throw new UnprocessableEntityException(
          'At least one upload file type must remain enabled',
        );
      }
    }

    const settings =
      Object.keys(settingsDto).length > 0
        ? await this.settingsRepository.update(settingsDto)
        : await this.settingsRepository.findOrCreate();
    const persistedFileTypes = fileTypes
      ? await this.settingsRepository.upsertUploadFileTypes(fileTypes)
      : await this.settingsRepository.findUploadFileTypes();

    return this.successResponse('upload', settings, persistedFileTypes);
  }

  updateDocumentVisibility(dto: UpdateDocumentVisibilitySettingsDto) {
    return this.updateGroup('document visibility and review', dto);
  }

  async updateAi(dto: UpdateAiSettingsDto) {
    this.ensureNotEmpty(dto);

    for (let attempt = 0; attempt < MAX_OPTIMISTIC_LOCK_RETRIES; attempt += 1) {
      const current = await this.settingsRepository.findOrCreate();
      const maxQuizQuestions = dto.maxQuizQuestions ?? current.maxQuizQuestions;
      const defaultQuizQuestions =
        dto.defaultQuizQuestions ?? current.defaultQuizQuestions;

      if (defaultQuizQuestions > maxQuizQuestions) {
        throw new UnprocessableEntityException(
          'defaultQuizQuestions must be less than or equal to maxQuizQuestions',
        );
      }

      try {
        return await this.persist('AI', dto, current.version);
      } catch (error) {
        if (!(error instanceof SettingsVersionConflictError)) {
          throw error;
        }
      }
    }

    throw new InternalServerErrorException(
      'System settings changed too frequently; please retry the request',
    );
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

  private async persist(
    groupName: string,
    dto: object,
    expectedVersion?: number,
  ) {
    const settings =
      expectedVersion === undefined
        ? await this.settingsRepository.update(dto as SettingsMutation)
        : await this.settingsRepository.update(
            dto as SettingsMutation,
            expectedVersion,
          );
    const fileTypes = await this.settingsRepository.findUploadFileTypes();

    return this.successResponse(groupName, settings, fileTypes);
  }

  private successResponse(
    groupName: string,
    settings: system_settings,
    fileTypes: upload_file_types[],
  ) {
    return {
      message: `${this.capitalize(groupName)} settings updated successfully`,
      data: this.toResponse(settings, fileTypes),
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

  private toResponse(
    settings: system_settings,
    fileTypes: upload_file_types[],
  ) {
    const normalizedFileTypes = fileTypes.map((fileType) => ({
      extension: fileType.extension,
      enabled: fileType.enabled,
    }));

    return {
      general: {
        systemName: settings.systemName,
        maintenanceMode: settings.maintenanceMode,
        defaultSchoolCode: settings.defaultSchoolCode,
        supportEmail: settings.supportEmail,
      },
      upload: {
        maxFileSizeMb: settings.maxFileSizeMb,
        allowedFileTypes: normalizedFileTypes
          .filter((fileType) => fileType.enabled)
          .map((fileType) => fileType.extension),
        fileTypes: normalizedFileTypes,
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
