import { apiClient } from "@/lib/axios";
import { API_ENDPOINTS } from "@/shared/constants";
import type {
  CollectionDetail,
  CollectionSummary,
  CollectionsListResponse,
  CreateCollectionPayload,
  DocumentSaveStatus,
  ListCollectionsQuery,
  UpdateCollectionPayload,
} from "@/types/collection.type";

export const fetchCollections = async (
  params: ListCollectionsQuery = {},
): Promise<CollectionsListResponse> => {
  const result = await apiClient.get(API_ENDPOINTS.COLLECTIONS.BASE, {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      ...(params.userId ? { userId: params.userId } : {}),
      ...(params.documentId ? { documentId: params.documentId } : {}),
      ...(params.search ? { search: params.search } : {}),
    },
  });
  return result as unknown as CollectionsListResponse;
};

export const fetchCollectionDetail = async (
  id: string,
): Promise<CollectionDetail> => {
  const result = await apiClient.get(API_ENDPOINTS.COLLECTIONS.DETAIL(id));
  return result as unknown as CollectionDetail;
};

export const fetchDocumentSaveStatus = async (
  documentId: string,
): Promise<DocumentSaveStatus> => {
  const result = await apiClient.get(
    `${API_ENDPOINTS.COLLECTIONS.BASE}/documents/${documentId}/status`,
    { skipToast: true },
  );
  return result as unknown as DocumentSaveStatus;
};

export const createCollection = async (
  payload: CreateCollectionPayload,
): Promise<CollectionSummary> => {
  const result = await apiClient.post(API_ENDPOINTS.COLLECTIONS.BASE, payload);
  return result as unknown as CollectionSummary;
};

export const updateCollection = async (
  id: string,
  payload: UpdateCollectionPayload,
): Promise<CollectionSummary> => {
  const result = await apiClient.put(
    API_ENDPOINTS.COLLECTIONS.DETAIL(id),
    payload,
  );
  return result as unknown as CollectionSummary;
};

export const deleteCollection = async (id: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.COLLECTIONS.DETAIL(id));
};

export const addDocumentToCollection = async (
  collectionId: string,
  documentId: string,
): Promise<CollectionDetail> => {
  const result = await apiClient.post(
    API_ENDPOINTS.COLLECTIONS.DOCUMENTS(collectionId),
    { documentId },
  );
  return result as unknown as CollectionDetail;
};

export const removeDocumentFromCollection = async (
  collectionId: string,
  documentId: string,
): Promise<void> => {
  await apiClient.delete(
    API_ENDPOINTS.COLLECTIONS.DOCUMENT(collectionId, documentId),
  );
};
