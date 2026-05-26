import type { AuthDeviceInfo } from './signup.dto';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class SigninDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsIn(['WEB', 'MOBILE'])
  deviceInfo?: AuthDeviceInfo;
}
