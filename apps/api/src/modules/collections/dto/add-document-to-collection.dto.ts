import { IsMongoId } from 'class-validator';

export class AddDocumentToCollectionDto {
  @IsMongoId()
  documentId!: string;
}
