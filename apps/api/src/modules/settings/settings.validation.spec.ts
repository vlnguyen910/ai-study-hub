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
      fileTypes: [
        { extension: '.pdf', enabled: true },
        { extension: ' xlsx ', enabled: false },
      ],
    });

    await expect(validate(general)).resolves.toHaveLength(0);
    await expect(validate(upload)).resolves.toHaveLength(0);
    expect(general.defaultSchoolCode).toBe('FPTU');
    expect(upload.fileTypes).toEqual([
      { extension: 'PDF', enabled: true },
      { extension: 'XLSX', enabled: false },
    ]);
  });

  it.each([
    [UpdateModerationSettingsDto, { duplicateSimilarityThreshold: 101 }],
    [UpdateUploadSettingsDto, { maxFileSizeMb: 0 }],
    [
      UpdateUploadSettingsDto,
      { fileTypes: [{ extension: 'PDF!', enabled: true }] },
    ],
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
