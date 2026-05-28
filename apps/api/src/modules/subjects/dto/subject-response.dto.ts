import { IsString, IsOptional } from 'class-validator';

export class SubjectResponseDto {
  @IsString()
  id!: string;

  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsString()
  schoolId!: string;

  @IsOptional()
  createdAt?: Date;
}
