import axios from "axios";
import { APP_CONFIG } from "@/config";

type ApiEnvelope<T> = {
  message?: string;
  data?: T;
};

const client = axios.create({
  baseURL: APP_CONFIG.api.baseUrl,
  timeout: APP_CONFIG.api.timeout,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

if (client.interceptors) {
  client.interceptors.response.use(
    (response) => {
      if (typeof window !== "undefined") {
        console.log(
          `%c[API Success (Docs)] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`,
          "color: #10b981; font-weight: bold;",
        );
      }
      return response;
    },
    (error) => {
      const originalRequest = error.config ?? {};
      const is401 = error.response?.status === 401;
      if (typeof window !== "undefined") {
        if (is401) {
          console.warn(
            `%c[API Docs Status] Request unauthorized (Status: 401 for ${originalRequest.url})`,
            "color: #f59e0b; font-weight: bold;",
          );
        } else {
          console.error(
            `%c[API Error (Docs)] ${originalRequest.method?.toUpperCase()} ${originalRequest.url} - Status: ${error.response?.status || "Network Error"} - Msg: ${error.response?.data?.message || error.message}`,
            "color: #ef4444; font-weight: bold;",
          );
        }
      }
      return Promise.reject(error);
    },
  );
}

const unwrap = <T>(response: { data: ApiEnvelope<T> | T }): T => {
  const data = response.data as ApiEnvelope<T>;
  return data && typeof data === "object" && "data" in data
    ? (data.data as T)
    : (response.data as T);
};

export interface DocumentListItem {
  readonly id: string;
  readonly title: string;
  readonly fileUrl: string;
  readonly publicId?: string;
  readonly status?: string;
  readonly isPublic?: boolean;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly author?: {
    readonly id?: string;
    readonly name?: string;
    readonly avatarUrl?: string | null;
  };
  readonly subject?: {
    readonly id?: string;
    readonly name?: string;
    readonly code?: string;
  };
}

export interface DocumentDetail {
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly fileUrl?: string | null;
  readonly pdfPreviewUrl?: string | null;
  readonly publicId?: string | null;
  readonly format?: string | null;
  readonly sizeInBytes?: number | null;
  readonly createdAt?: string;
  readonly author?: {
    readonly id?: string;
    readonly name?: string | null;
    readonly email?: string | null;
    readonly avatarUrl?: string | null;
  };
  readonly subject?: {
    readonly id?: string;
    readonly name?: string | null;
    readonly code?: string | null;
  };
}

export interface DocumentsListResponse {
  readonly documents: readonly DocumentListItem[];
  readonly pagination?: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
  };
}

export const fetchDocuments = async (query?: {
  page?: number;
  limit?: number;
  subjectId?: string;
  status?: string;
  authorId?: string;
}): Promise<DocumentsListResponse> => {
  const response = await client.get("/api/v1/documents", { params: query });
  return unwrap<DocumentsListResponse>(response as never);
};

export const fetchDocumentById = async (
  id: string,
): Promise<DocumentDetail> => {
  const response = await client.get(`/api/v1/documents/${id}`);
  return unwrap<DocumentDetail>(response as never);
};
