import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { uppercaseStringArray } from './transforms';

export const ALLOWED_DOCUMENT_FILE_TYPES = ['PDF', 'DOCX', 'PPTX'] as const;

export class UpdateUploadSettingsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1024)
  maxFileSizeMb?: number;

  @IsOptional()
  @Transform(uppercaseStringArray)
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(ALLOWED_DOCUMENT_FILE_TYPES.length)
  @ArrayUnique()
  @IsIn(ALLOWED_DOCUMENT_FILE_TYPES, { each: true })
  allowedFileTypes?: string[];

  @IsOptional()
  @IsBoolean()
  allowMobileUpload?: boolean;
}
