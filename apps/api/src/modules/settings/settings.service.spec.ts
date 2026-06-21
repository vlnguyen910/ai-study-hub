import {
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UserRole, type system_settings } from '@prisma/client';
import { SettingsRepository } from './settings.repository';
import { SettingsService } from './settings.service';

const settings: system_settings = {
  id: '507f1f77bcf86cd799439011',
  key: 'GLOBAL',
  systemName: 'AI Study Hub',
  maintenanceMode: false,
  defaultSchoolCode: 'FPTU',
  supportEmail: 'support@aistudyhub.local',
  maxFileSizeMb: 100,
  allowedFileTypes: ['PDF', 'DOCX', 'PPTX'],
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

describe('SettingsService', () => {
  const repository = {
    findOrCreate: jest.fn(),
    update: jest.fn(),
    schoolExists: jest.fn(),
  };
  let service: SettingsService;

  beforeEach(() => {
    jest.clearAllMocks();
    repository.findOrCreate.mockResolvedValue(settings);
    repository.update.mockResolvedValue({ ...settings, version: 2 });
    repository.schoolExists.mockResolvedValue(true);
    service = new SettingsService(repository as unknown as SettingsRepository);
  });

  it('returns all seven settings groups without persistence metadata', async () => {
    const result = await service.findAll();

    expect(result.data.general.systemName).toBe('AI Study Hub');
    expect(result.data.upload.allowedFileTypes).toEqual([
      'PDF',
      'DOCX',
      'PPTX',
    ]);
    expect(result.data.documentVisibility.allowPrivateDocuments).toBe(true);
    expect(result.data.ai.defaultQuizQuestions).toBe(10);
    expect(result.data.moderation.duplicateSimilarityThreshold).toBe(85);
    expect(result.data.account.defaultRoleAfterSignup).toBe(UserRole.USER);
    expect(result.data.mobile.enableMobileAppAccess).toBe(true);
    expect((result.data as Record<string, unknown>).id).toBeUndefined();
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
