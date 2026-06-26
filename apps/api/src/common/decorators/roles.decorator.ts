import { SetMetadata, type CustomDecorator } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export type Role = 'USER' | 'ADMIN' | 'MODERATOR';

export const Roles = (...roles: Role[]): CustomDecorator<string> =>
  SetMetadata(ROLES_KEY, roles);
