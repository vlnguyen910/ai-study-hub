import { IsOptional, IsString, MinLength } from 'class-validator';

export class GoogleCallbackQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  code?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  state?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  error?: string;

  // Additional optional parameters returned by Google OAuth that we need to allow
  @IsOptional()
  @IsString()
  @MinLength(1)
  iss?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  scope?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  authuser?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  prompt?: string;
}
