import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  UpdateAccountSettingsDto,
  UpdateAiSettingsDto,
  UpdateGeneralSettingsDto,
  UpdateModerationSettingsDto,
  UpdateUploadSettingsDto,
} from './dto';

describe('Settings request validation', () => {
  it('normalizes valid school codes and file types', async () => {
    const general = plainToInstance(UpdateGeneralSettingsDto, {
      defaultSchoolCode: ' fptu ',
    });
    const upload = plainToInstance(UpdateUploadSettingsDto, {
      allowedFileTypes: ['pdf', 'DOCX'],
    });

    await expect(validate(general)).resolves.toHaveLength(0);
    await expect(validate(upload)).resolves.toHaveLength(0);
    expect(general.defaultSchoolCode).toBe('FPTU');
    expect(upload.allowedFileTypes).toEqual(['PDF', 'DOCX']);
  });

  it.each([
    [UpdateModerationSettingsDto, { duplicateSimilarityThreshold: 101 }],
    [UpdateUploadSettingsDto, { maxFileSizeMb: 0 }],
    [UpdateAiSettingsDto, { maxAiRequestsPerUserPerDay: 10001 }],
    [UpdateAccountSettingsDto, { defaultRoleAfterSignup: 'ADMIN' }],
    [UpdateGeneralSettingsDto, { supportEmail: 'not-an-email' }],
  ])('rejects invalid %p input', async (DtoClass, payload) => {
    const dto = plainToInstance(
      DtoClass as new () => object,
      payload as Record<string, unknown>,
    );
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});
