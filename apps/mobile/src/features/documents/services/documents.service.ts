import { apiClient } from "@/services/api-client";

export interface CreateDocumentPayload {
  readonly title: string;
  readonly description?: string;
  readonly fileUrl: string;
  readonly publicId: string;
  readonly sizeInBytes: number;
  readonly format: string;
  readonly resourceType: string;
  readonly subjectId?: string;
}

type ApiEnvelope<T> = {
  message?: string;
  data?: T;
};

const unwrap = <T>(response: { data: ApiEnvelope<T> | T }): T => {
  const data = response.data as ApiEnvelope<T>;
  return data && typeof data === "object" && "data" in data
    ? (data.data as T)
    : (response.data as T);
};

export const createDocument = async (payload: CreateDocumentPayload) => {
  const response = await apiClient.post("/api/v1/documents", payload);
  return unwrap(response as never);
};
