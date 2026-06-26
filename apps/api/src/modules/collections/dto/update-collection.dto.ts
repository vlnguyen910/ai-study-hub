import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateCollectionDto } from './create-collection.dto';

export class UpdateCollectionDto extends PartialType(
  OmitType(CreateCollectionDto, ['documentId'] as const),
) {}
