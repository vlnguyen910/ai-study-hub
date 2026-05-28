import { Type } from 'class-transformer';
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

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

export class DocumentResponseDto {
  @IsString()
  id!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  fileUrl!: string;

  @IsString()
  publicId!: string;

  @IsNumber()
  sizeInBytes!: number;

  @IsString()
  format!: string;

  @IsString()
  resourceType!: string;

  @IsOptional()
  @IsString()
  subjectId?: string;

  @IsString()
  status!: 'ACTIVE' | 'REJECTED' | 'DELETED';

  @IsBoolean()
  isPublic!: boolean;

  @IsOptional()
  @IsString()
  reviewedById?: string;

  @IsOptional()
  reviewedAt?: Date;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsString()
  authorId!: string;

  createdAt!: Date;
  updatedAt!: Date;

  @IsOptional()
  deletedAt?: Date;

  @IsOptional()
  @Type(() => DocumentAuthorDto)
  author?: DocumentAuthorDto;

  @IsOptional()
  @Type(() => DocumentSubjectDto)
  subject?: DocumentSubjectDto;

  @IsOptional()
  @Type(() => DocumentReviewerDto)
  reviewer?: DocumentReviewerDto;
}
