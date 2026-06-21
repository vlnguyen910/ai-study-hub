import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { UserRole } from '@prisma/client';
import { uppercaseString } from './transforms';

export class UpdateAccountSettingsDto {
  @IsOptional()
  @IsBoolean()
  allowGmailRegistration?: boolean;

  @IsOptional()
  @IsBoolean()
  requireEmailVerification?: boolean;

  @IsOptional()
  @IsBoolean()
  allowUnverifiedLoginWithLimitedAccess?: boolean;

  // MVP signups must never acquire a privileged role through configuration.
  @IsOptional()
  @Transform(uppercaseString)
  @IsIn([UserRole.USER])
  defaultRoleAfterSignup?: UserRole;
}
