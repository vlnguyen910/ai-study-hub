import type { LibraryDocument, PaginationMeta } from "./document.type";

export interface CollectionAuthor {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface CollectionSummary {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  authorId: string;
  author: CollectionAuthor;
  documentCount: number;
  containsDocument?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionDetail extends CollectionSummary {
  documents: LibraryDocument[];
}

export interface CollectionsListResponse {
  collections: CollectionSummary[];
  pagination: PaginationMeta;
}

export interface ListCollectionsQuery {
  page?: number;
  limit?: number;
  userId?: string;
  documentId?: string;
  search?: string;
}

export interface CreateCollectionPayload {
  name: string;
  description?: string;
  isPublic?: boolean;
  documentId?: string;
}

export type UpdateCollectionPayload = Partial<
  Omit<CreateCollectionPayload, "documentId">
>;

export interface DocumentSaveStatus {
  documentId: string;
  isSaved: boolean;
  collectionIds: string[];
}
