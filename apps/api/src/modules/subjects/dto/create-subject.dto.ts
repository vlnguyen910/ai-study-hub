import { IsString } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsString()
  schoolId!: string;
}
