import { IsString, MinLength, ValidateIf } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;

  @ValidateIf((dto: ChangePasswordDto) => dto.confirmPassword !== undefined)
  @IsString()
  @MinLength(8)
  confirmPassword?: string;
}
