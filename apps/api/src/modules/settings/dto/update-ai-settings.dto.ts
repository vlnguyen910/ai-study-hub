import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateAiSettingsDto {
  @IsOptional()
  @IsBoolean()
  enableAiFeatures?: boolean;

  @IsOptional()
  @IsBoolean()
  enableAiSummary?: boolean;

  @IsOptional()
  @IsBoolean()
  enableAiQuiz?: boolean;

  @IsOptional()
  @IsBoolean()
  enableAiSearch?: boolean;

  @IsOptional()
  @IsBoolean()
  enableAiChat?: boolean;

  @IsOptional()
  @IsBoolean()
  enableAiModeratorAssistant?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  maxAiRequestsPerUserPerDay?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  maxQuizQuestions?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  defaultQuizQuestions?: number;
}
