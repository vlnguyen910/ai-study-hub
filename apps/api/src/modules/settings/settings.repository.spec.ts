import type { PrismaService } from '../../prisma/prisma.service';
import {
  SettingsRepository,
  SettingsVersionConflictError,
} from './settings.repository';

describe('SettingsRepository', () => {
  const prisma = {
    system_settings: {
      updateMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    upload_file_types: {
      count: jest.fn(),
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
  };
  let repository: SettingsRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new SettingsRepository(prisma as unknown as PrismaService);
  });

  it('updates settings only when the expected version still matches', async () => {
    const updated = { key: 'GLOBAL', version: 4 };
    prisma.system_settings.updateMany.mockResolvedValue({ count: 1 });
    prisma.system_settings.findUnique.mockResolvedValue(updated);

    await expect(repository.update({ maxQuizQuestions: 30 }, 3)).resolves.toBe(
      updated,
    );

    expect(prisma.system_settings.updateMany).toHaveBeenCalledWith({
      where: { key: 'GLOBAL', version: 3 },
      data: {
        maxQuizQuestions: 30,
        version: { increment: 1 },
      },
    });
  });

  it('reports an optimistic lock conflict when no version matched', async () => {
    prisma.system_settings.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      repository.update({ defaultQuizQuestions: 12 }, 3),
    ).rejects.toBeInstanceOf(SettingsVersionConflictError);
    expect(prisma.system_settings.findUnique).not.toHaveBeenCalled();
  });

  it('returns dynamic file types without recreating defaults when configured', async () => {
    const configured = [{ extension: 'EPUB', enabled: true }];
    prisma.upload_file_types.count.mockResolvedValue(1);
    prisma.upload_file_types.findMany.mockResolvedValue(configured);

    await expect(repository.findUploadFileTypes()).resolves.toBe(configured);
    expect(prisma.upload_file_types.upsert).not.toHaveBeenCalled();
    expect(prisma.upload_file_types.findMany).toHaveBeenCalledWith({
      orderBy: { extension: 'asc' },
    });
  });
});
