import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateModerationSettingsDto {
  @IsOptional()
  @IsBoolean()
  autoFlagDuplicateDocuments?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  duplicateSimilarityThreshold?: number;

  @IsOptional()
  @IsBoolean()
  requireRejectionReason?: boolean;

  @IsOptional()
  @IsBoolean()
  allowModeratorToApproveAiFlaggedDocument?: boolean;
}
