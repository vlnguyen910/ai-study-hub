import { Injectable } from '@nestjs/common';
import type { system_settings } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export const GLOBAL_SETTINGS_KEY = 'GLOBAL';

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

  update(data: SettingsMutation): Promise<system_settings> {
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

  async schoolExists(code: string): Promise<boolean> {
    const school = await this.prisma.schools.findUnique({
      where: { code },
      select: { id: true },
    });

    return school !== null;
  }
}
