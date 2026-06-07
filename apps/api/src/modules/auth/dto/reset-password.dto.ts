import { IsNotEmpty, IsString, MinLength, ValidateIf } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  token!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @ValidateIf((dto: ResetPasswordDto) => dto.confirmPassword !== undefined)
  @IsString()
  @MinLength(8)
  confirmPassword?: string;
}
