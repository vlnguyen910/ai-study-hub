import {
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  UserRole,
  type system_settings,
  type upload_file_types,
} from '@prisma/client';
import {
  SettingsRepository,
  SettingsVersionConflictError,
} from './settings.repository';
import { SettingsService } from './settings.service';

const settings: system_settings = {
  id: '507f1f77bcf86cd799439011',
  key: 'GLOBAL',
  systemName: 'AI Study Hub',
  maintenanceMode: false,
  defaultSchoolCode: 'FPTU',
  supportEmail: 'support@aistudyhub.local',
  maxFileSizeMb: 100,
  allowMobileUpload: true,
  requireModerationForPublicDocuments: true,
  allowPrivateDocuments: true,
  allowSharedLink: true,
  privateToPublicRequiresReview: true,
  replaceFileRequiresReview: true,
  enableAiFeatures: true,
  enableAiSummary: true,
  enableAiQuiz: true,
  enableAiSearch: true,
  enableAiChat: true,
  enableAiModeratorAssistant: true,
  maxAiRequestsPerUserPerDay: 20,
  maxQuizQuestions: 20,
  defaultQuizQuestions: 10,
  autoFlagDuplicateDocuments: true,
  duplicateSimilarityThreshold: 85,
  requireRejectionReason: true,
  allowModeratorToApproveAiFlaggedDocument: true,
  allowGmailRegistration: true,
  requireEmailVerification: true,
  allowUnverifiedLoginWithLimitedAccess: true,
  defaultRoleAfterSignup: UserRole.USER,
  enableMobileAppAccess: true,
  enableMobileUpload: true,
  enableMobileAiFeatures: true,
  version: 1,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const fileTypes: upload_file_types[] = [
  {
    id: '507f1f77bcf86cd799439012',
    extension: 'DOCX',
    enabled: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: '507f1f77bcf86cd799439013',
    extension: 'PDF',
    enabled: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: '507f1f77bcf86cd799439014',
    extension: 'TXT',
    enabled: false,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
];

describe('SettingsService', () => {
  const repository = {
    findOrCreate: jest.fn(),
    update: jest.fn(),
    findUploadFileTypes: jest.fn(),
    upsertUploadFileTypes: jest.fn(),
    schoolExists: jest.fn(),
  };
  let service: SettingsService;

  beforeEach(() => {
    jest.clearAllMocks();
    repository.findOrCreate.mockResolvedValue(settings);
    repository.update.mockResolvedValue({ ...settings, version: 2 });
    repository.findUploadFileTypes.mockResolvedValue(fileTypes);
    repository.upsertUploadFileTypes.mockResolvedValue(fileTypes);
    repository.schoolExists.mockResolvedValue(true);
    service = new SettingsService(repository as unknown as SettingsRepository);
  });

  it('returns all seven settings groups without persistence metadata', async () => {
    const result = await service.findAll();

    expect(result.data.general.systemName).toBe('AI Study Hub');
    expect(result.data.upload.allowedFileTypes).toEqual(['DOCX', 'PDF']);
    expect(result.data.upload.fileTypes).toEqual([
      { extension: 'DOCX', enabled: true },
      { extension: 'PDF', enabled: true },
      { extension: 'TXT', enabled: false },
    ]);
    expect(result.data.documentVisibility.allowPrivateDocuments).toBe(true);
    expect(result.data.ai.defaultQuizQuestions).toBe(10);
    expect(result.data.moderation.duplicateSimilarityThreshold).toBe(85);
    expect(result.data.account.defaultRoleAfterSignup).toBe(UserRole.USER);
    expect(result.data.mobile.enableMobileAppAccess).toBe(true);
    expect((result.data as Record<string, unknown>).id).toBeUndefined();
  });

  it('accepts only enabled file types within the configured size limit', async () => {
    await expect(
      service.validateDocumentUpload('pdf', 10 * 1024 * 1024),
    ).resolves.toBeUndefined();

    await expect(
      service.validateDocumentUpload('.txt', 1024),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
    await expect(
      service.validateDocumentUpload('PDF', 101 * 1024 * 1024),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('rejects an empty patch document', async () => {
    await expect(service.updateUpload({})).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('rejects a default school code that is not present', async () => {
    repository.schoolExists.mockResolvedValue(false);

    await expect(
      service.updateGeneral({ defaultSchoolCode: 'UNKNOWN' }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('rejects default quiz questions above the effective maximum', async () => {
    await expect(
      service.updateAi({ maxQuizQuestions: 5 }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('re-reads and re-validates AI limits after an optimistic lock conflict', async () => {
    repository.findOrCreate
      .mockResolvedValueOnce(settings)
      .mockResolvedValueOnce({
        ...settings,
        maxQuizQuestions: 15,
        version: 2,
      });
    repository.update.mockRejectedValueOnce(new SettingsVersionConflictError());

    await expect(
      service.updateAi({ defaultQuizQuestions: 18 }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);

    expect(repository.update).toHaveBeenCalledTimes(1);
    expect(repository.update).toHaveBeenCalledWith(
      { defaultQuizQuestions: 18 },
      1,
    );
    expect(repository.findOrCreate).toHaveBeenCalledTimes(2);
  });

  it('persists dynamic upload file types and derives the enabled list', async () => {
    const configuredTypes = [
      { extension: 'PDF', enabled: true },
      { extension: 'XLSX', enabled: true },
      { extension: 'TXT', enabled: false },
    ];
    repository.upsertUploadFileTypes.mockResolvedValue(
      configuredTypes.map((fileType, index) => ({
        ...fileTypes[0],
        id: `507f1f77bcf86cd79943902${index}`,
        ...fileType,
      })),
    );

    const result = await service.updateUpload({ fileTypes: configuredTypes });

    expect(repository.upsertUploadFileTypes).toHaveBeenCalledWith(
      configuredTypes,
    );
    expect(result.data.upload.allowedFileTypes).toEqual(['PDF', 'XLSX']);
  });

  it('rejects disabling every upload file type', async () => {
    await expect(
      service.updateUpload({
        fileTypes: [
          { extension: 'PDF', enabled: false },
          { extension: 'DOCX', enabled: false },
        ],
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);

    expect(repository.upsertUploadFileTypes).not.toHaveBeenCalled();
  });

  it('allows disabling one file type when another configured type remains enabled', async () => {
    await service.updateUpload({
      fileTypes: [{ extension: 'PDF', enabled: false }],
    });

    expect(repository.upsertUploadFileTypes).toHaveBeenCalledWith([
      { extension: 'PDF', enabled: false },
    ]);
  });

  it('persists a valid partial moderation update', async () => {
    const result = await service.updateModeration({
      duplicateSimilarityThreshold: 90,
    });

    expect(repository.update).toHaveBeenCalledWith({
      duplicateSimilarityThreshold: 90,
    });
    expect(result.message).toBe('Moderation settings updated successfully');
    expect(result.data.version).toBe(2);
  });
});
