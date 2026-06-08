import type { AxiosInstance } from "axios";

import { API_ENDPOINTS } from "@/constants/endpoints";
import { apiClient } from "@/services/api-client";
import type {
  CreateDocumentPayload,
  DocumentDetail,
  DocumentsListResponse,
  ListDocumentsQuery,
  UpdateDocumentPayload,
} from "../types/document.types";

type ApiEnvelope<T> = {
  message?: string;
  data?: T;
};

export type DocumentsApiClient = Pick<
  AxiosInstance,
  "get" | "post" | "patch" | "delete"
>;

const unwrap = <T>(response: { data: ApiEnvelope<T> | T }): T => {
  const data = response.data as ApiEnvelope<T>;
  return data && typeof data === "object" && "data" in data
    ? (data.data as T)
    : (response.data as T);
};

const buildDocumentQuery = (query: ListDocumentsQuery = {}) => ({
  page: query.page ?? 1,
  limit: query.limit ?? 10,
  ...(query.subjectId ? { subjectId: query.subjectId } : {}),
  ...(query.authorId ? { authorId: query.authorId } : {}),
  ...(query.status ? { status: query.status } : {}),
});

export const fetchDocuments = async (
  query: ListDocumentsQuery = {},
  client: DocumentsApiClient = apiClient,
): Promise<DocumentsListResponse> => {
  const response = await client.get(API_ENDPOINTS.DOCUMENTS.BASE, {
    params: buildDocumentQuery(query),
  });
  return unwrap<DocumentsListResponse>(response);
};

export const fetchMyDocuments = async (
  query: ListDocumentsQuery = {},
  client: DocumentsApiClient = apiClient,
): Promise<DocumentsListResponse> => {
  const response = await client.get(API_ENDPOINTS.DOCUMENTS.MINE, {
    params: buildDocumentQuery(query),
  });
  return unwrap<DocumentsListResponse>(response);
};

export const fetchDocumentDetail = async (
  id: string,
  client: DocumentsApiClient = apiClient,
): Promise<DocumentDetail> => {
  const response = await client.get(API_ENDPOINTS.DOCUMENTS.DETAIL(id));
  return unwrap<DocumentDetail>(response);
};

export const createDocument = async (
  payload: CreateDocumentPayload,
  client: DocumentsApiClient = apiClient,
): Promise<DocumentDetail> => {
  const response = await client.post(API_ENDPOINTS.DOCUMENTS.BASE, payload);
  return unwrap<DocumentDetail>(response);
};

export const updateDocument = async (
  id: string,
  payload: UpdateDocumentPayload,
  client: DocumentsApiClient = apiClient,
): Promise<DocumentDetail> => {
  const response = await client.patch(
    API_ENDPOINTS.DOCUMENTS.DETAIL(id),
    payload,
  );
  return unwrap<DocumentDetail>(response);
};

export const deleteDocument = async (
  id: string,
  client: DocumentsApiClient = apiClient,
): Promise<void> => {
  await client.delete(API_ENDPOINTS.DOCUMENTS.DETAIL(id));
};
