import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateChatSessionDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  title?: string;
}
