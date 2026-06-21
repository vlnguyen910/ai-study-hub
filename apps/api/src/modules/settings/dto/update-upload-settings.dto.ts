import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { normalizeFileExtension } from './transforms';

export class UploadFileTypeSettingDto {
  @Transform(normalizeFileExtension)
  @IsString()
  @Matches(/^[A-Z0-9]{1,10}$/, {
    message:
      'fileTypes.extension must contain 1 to 10 letters or numbers without a dot',
  })
  extension!: string;

  @IsBoolean()
  enabled!: boolean;
}

export class UpdateUploadSettingsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1024)
  maxFileSizeMb?: number;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ArrayUnique((item: UploadFileTypeSettingDto) => item.extension)
  @ValidateNested({ each: true })
  @Type(() => UploadFileTypeSettingDto)
  fileTypes?: UploadFileTypeSettingDto[];

  @IsOptional()
  @IsBoolean()
  allowMobileUpload?: boolean;
}
