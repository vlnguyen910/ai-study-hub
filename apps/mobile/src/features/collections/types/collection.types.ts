import type {
  LibraryDocument,
  PaginationMeta,
} from "@/features/documents/types/document.types";

export interface CollectionAuthor {
  readonly id: string;
  readonly name: string;
  readonly avatarUrl: string | null;
}

export interface CollectionSummary {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly isPublic: boolean;
  readonly authorId: string;
  readonly author: CollectionAuthor;
  readonly documentCount: number;
  readonly containsDocument?: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CollectionDetail extends CollectionSummary {
  readonly documents: readonly LibraryDocument[];
}

export interface CollectionsListResponse {
  readonly collections: readonly CollectionSummary[];
  readonly pagination: PaginationMeta;
}

export interface ListCollectionsQuery {
  readonly page?: number;
  readonly limit?: number;
  readonly userId?: string;
  readonly documentId?: string;
  readonly search?: string;
}

export interface CreateCollectionPayload {
  readonly name: string;
  readonly description?: string;
  readonly isPublic?: boolean;
  readonly documentId?: string;
}

export type UpdateCollectionPayload = Partial<
  Omit<CreateCollectionPayload, "documentId">
>;

export interface DocumentSaveStatus {
  readonly documentId: string;
  readonly isSaved: boolean;
  readonly collectionIds: readonly string[];
}
