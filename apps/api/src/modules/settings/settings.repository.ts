import { Injectable } from '@nestjs/common';
import type { system_settings, upload_file_types } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export const GLOBAL_SETTINGS_KEY = 'GLOBAL';
export const DEFAULT_UPLOAD_FILE_TYPES = [
  { extension: 'PDF', enabled: true },
  { extension: 'DOCX', enabled: true },
  { extension: 'PPTX', enabled: true },
  { extension: 'DOC', enabled: false },
  { extension: 'XLS', enabled: false },
  { extension: 'XLSX', enabled: false },
  { extension: 'TXT', enabled: false },
  { extension: 'CSV', enabled: false },
] as const;

export class SettingsVersionConflictError extends Error {
  constructor() {
    super('System settings were changed by another request');
    this.name = SettingsVersionConflictError.name;
  }
}

export type SettingsMutation = Partial<
  Omit<system_settings, 'id' | 'key' | 'version' | 'createdAt' | 'updatedAt'>
>;

@Injectable()
export class SettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findOrCreate(): Promise<system_settings> {
    return this.prisma.system_settings.upsert({
      where: { key: GLOBAL_SETTINGS_KEY },
      update: {},
      create: { key: GLOBAL_SETTINGS_KEY },
    });
  }

  async update(
    data: SettingsMutation,
    expectedVersion?: number,
  ): Promise<system_settings> {
    if (expectedVersion !== undefined) {
      const result = await this.prisma.system_settings.updateMany({
        where: {
          key: GLOBAL_SETTINGS_KEY,
          version: expectedVersion,
        },
        data: {
          ...data,
          version: { increment: 1 },
        },
      });

      if (result.count !== 1) {
        throw new SettingsVersionConflictError();
      }

      const updated = await this.prisma.system_settings.findUnique({
        where: { key: GLOBAL_SETTINGS_KEY },
      });

      if (!updated) {
        throw new SettingsVersionConflictError();
      }

      return updated;
    }

    return this.prisma.system_settings.upsert({
      where: { key: GLOBAL_SETTINGS_KEY },
      update: {
        ...data,
        version: { increment: 1 },
      },
      create: {
        key: GLOBAL_SETTINGS_KEY,
        ...data,
      },
    });
  }

  async findUploadFileTypes(): Promise<upload_file_types[]> {
    const count = await this.prisma.upload_file_types.count();

    if (count === 0) {
      await Promise.all(
        DEFAULT_UPLOAD_FILE_TYPES.map((fileType) =>
          this.prisma.upload_file_types.upsert({
            where: { extension: fileType.extension },
            update: {},
            create: fileType,
          }),
        ),
      );
    }

    return this.prisma.upload_file_types.findMany({
      orderBy: { extension: 'asc' },
    });
  }

  async upsertUploadFileTypes(
    fileTypes: ReadonlyArray<{ extension: string; enabled: boolean }>,
  ): Promise<upload_file_types[]> {
    await Promise.all(
      fileTypes.map((fileType) =>
        this.prisma.upload_file_types.upsert({
          where: { extension: fileType.extension },
          update: { enabled: fileType.enabled },
          create: fileType,
        }),
      ),
    );

    return this.findUploadFileTypes();
  }

  async schoolExists(code: string): Promise<boolean> {
    const school = await this.prisma.schools.findUnique({
      where: { code },
      select: { id: true },
    });

    return school !== null;
  }
}
