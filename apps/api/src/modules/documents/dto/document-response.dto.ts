import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDate,
} from 'class-validator';

export class DocumentAuthorDto {
  @IsString()
  id!: string;

  @IsString()
  name!: string;

  @IsString()
  email!: string;

  @IsString()
  avatarUrl!: string;
}

export class DocumentSubjectDto {
  @IsString()
  id!: string;

  @IsString()
  name!: string;

  @IsString()
  code!: string;
}

export class DocumentReviewerDto {
  @IsString()
  id!: string;

  @IsString()
  name!: string;

  @IsString()
  email!: string;
}

export class PublicDocumentsResponseDto {
  @IsString()
  id!: string;

  @IsString()
  title!: string;

  @IsString()
  publicId!: string;

  @IsOptional()
  @IsString()
  subjectId?: string;

  @IsString()
  authorId!: string;

  @IsDate()
  createdAt!: Date;

  @IsOptional()
  @Type(() => DocumentAuthorDto)
  author?: DocumentAuthorDto;

  @IsOptional()
  @Type(() => DocumentSubjectDto)
  subject?: DocumentSubjectDto;
}
