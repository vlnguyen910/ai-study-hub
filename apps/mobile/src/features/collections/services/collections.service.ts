import type { AxiosInstance } from "axios";

import { API_ENDPOINTS } from "@/constants/endpoints";
import { apiClient } from "@/services/api-client";
import type {
  CollectionDetail,
  CollectionSummary,
  CollectionsListResponse,
  CreateCollectionPayload,
  DocumentSaveStatus,
  ListCollectionsQuery,
  UpdateCollectionPayload,
} from "../types/collection.types";

type ApiEnvelope<T> = {
  message?: string;
  data?: T;
};

export type CollectionsApiClient = Pick<
  AxiosInstance,
  "get" | "post" | "put" | "delete"
>;

const unwrap = <T>(response: { data: ApiEnvelope<T> | T }): T => {
  const data = response.data as ApiEnvelope<T>;
  return data && typeof data === "object" && "data" in data
    ? (data.data as T)
    : (response.data as T);
};

const buildCollectionsQuery = (query: ListCollectionsQuery = {}) => ({
  page: query.page ?? 1,
  limit: query.limit ?? 20,
  ...(query.userId ? { userId: query.userId } : {}),
  ...(query.documentId ? { documentId: query.documentId } : {}),
  ...(query.search ? { search: query.search } : {}),
});

export const fetchCollections = async (
  query: ListCollectionsQuery = {},
  client: CollectionsApiClient = apiClient,
): Promise<CollectionsListResponse> => {
  const response = await client.get(API_ENDPOINTS.COLLECTIONS.BASE, {
    params: buildCollectionsQuery(query),
  });
  return unwrap<CollectionsListResponse>(response);
};

export const fetchCollectionDetail = async (
  id: string,
  client: CollectionsApiClient = apiClient,
): Promise<CollectionDetail> => {
  const response = await client.get(API_ENDPOINTS.COLLECTIONS.DETAIL(id));
  return unwrap<CollectionDetail>(response);
};

export const fetchDocumentSaveStatus = async (
  documentId: string,
  client: CollectionsApiClient = apiClient,
): Promise<DocumentSaveStatus> => {
  const response = await client.get(
    API_ENDPOINTS.COLLECTIONS.DOCUMENT_STATUS(documentId),
  );
  return unwrap<DocumentSaveStatus>(response);
};

export const createCollection = async (
  payload: CreateCollectionPayload,
  client: CollectionsApiClient = apiClient,
): Promise<CollectionSummary> => {
  const response = await client.post(API_ENDPOINTS.COLLECTIONS.BASE, payload);
  return unwrap<CollectionSummary>(response);
};

export const updateCollection = async (
  id: string,
  payload: UpdateCollectionPayload,
  client: CollectionsApiClient = apiClient,
): Promise<CollectionSummary> => {
  const response = await client.put(
    API_ENDPOINTS.COLLECTIONS.DETAIL(id),
    payload,
  );
  return unwrap<CollectionSummary>(response);
};

export const deleteCollection = async (
  id: string,
  client: CollectionsApiClient = apiClient,
): Promise<void> => {
  await client.delete(API_ENDPOINTS.COLLECTIONS.DETAIL(id));
};

export const addDocumentToCollection = async (
  collectionId: string,
  documentId: string,
  client: CollectionsApiClient = apiClient,
): Promise<CollectionDetail> => {
  const response = await client.post(
    API_ENDPOINTS.COLLECTIONS.DOCUMENTS(collectionId),
    { documentId },
  );
  return unwrap<CollectionDetail>(response);
};

export const removeDocumentFromCollection = async (
  collectionId: string,
  documentId: string,
  client: CollectionsApiClient = apiClient,
): Promise<void> => {
  await client.delete(
    API_ENDPOINTS.COLLECTIONS.DOCUMENT(collectionId, documentId),
  );
};
