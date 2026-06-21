import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { trimString, uppercaseString } from './transforms';

export class UpdateGeneralSettingsDto {
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  systemName?: string;

  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @IsOptional()
  @Transform(uppercaseString)
  @IsString()
  @Matches(/^[A-Z0-9_-]{2,20}$/)
  defaultSchoolCode?: string;

  @IsOptional()
  @Transform(trimString)
  @IsEmail()
  @MaxLength(254)
  supportEmail?: string;
}
