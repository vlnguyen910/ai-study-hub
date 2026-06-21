import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateDocumentVisibilitySettingsDto {
  @IsOptional()
  @IsBoolean()
  requireModerationForPublicDocuments?: boolean;

  @IsOptional()
  @IsBoolean()
  allowPrivateDocuments?: boolean;

  @IsOptional()
  @IsBoolean()
  allowSharedLink?: boolean;

  @IsOptional()
  @IsBoolean()
  privateToPublicRequiresReview?: boolean;

  @IsOptional()
  @IsBoolean()
  replaceFileRequiresReview?: boolean;
}
