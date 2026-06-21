import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateMobileSettingsDto {
  @IsOptional()
  @IsBoolean()
  enableMobileAppAccess?: boolean;

  @IsOptional()
  @IsBoolean()
  enableMobileUpload?: boolean;

  @IsOptional()
  @IsBoolean()
  enableMobileAiFeatures?: boolean;
}
