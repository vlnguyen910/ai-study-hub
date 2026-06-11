import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyEmailDto {
  @IsNotEmpty()
  @IsString()
  token!: string;
}
