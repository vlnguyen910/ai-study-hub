import { apiClient } from "@/lib";
import { useGlobalLoadingStore } from "@/stores/ui/global-loading.store";

const DOCUMENTS_BASE_PATH = "/api/v1/documents";
const VERIFY_DOCUMENT_PATH = "/api/v1/verify-document";
const MIN_LOADING_MS = 1000;

export interface DocumentsQueryParams {
  page?: number;
  limit?: number;
  subjectId?: string;
  status?: string;
  authorId?: string;
}

export interface CreateDocumentPayload {
  title: string;
  description?: string;
  fileUrl: string;
  publicId: string;
  sizeInBytes: number;
  format: string;
  resourceType: string;
  subjectId: string;
  isPublic?: boolean;
}

export interface UpdateDocumentPayload {
  title?: string;
  description?: string;
  subjectId?: string;
  isPublic?: boolean;
}

export interface VerifyDocumentPayload {
  status?:
    | "pending"
    | "priority"
    | "approved"
    | "rejected"
    | "changes_requested"
    | "flagged";
  note?: string;
}

export interface DocumentDto {
  id: string;
  title: string;
  description?: string;
  fileUrl?: string;
  sizeInBytes?: number;
  format?: string;
  subjectId?: string;
  authorId?: string;
  isPublic?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

async function withGlobalLoading<T>(request: () => Promise<T>): Promise<T> {
  const { startLoading, stopLoading } = useGlobalLoadingStore.getState();

  startLoading();
  const startTime = Date.now();

  try {
    return await request();
  } finally {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, MIN_LOADING_MS - elapsed);

    if (remaining > 0) {
      await sleep(remaining);
    }

    stopLoading();
  }
}

function normalizeDocumentId(document: unknown): string {
  const record = (document ?? {}) as Record<string, unknown>;
  return String(
    record.id ?? record.documentId ?? record._id ?? record.uuid ?? "",
  );
}

function normalizeDocument(document: unknown): DocumentDto {
  const record = (document ?? {}) as Record<string, unknown>;

  return {
    id: normalizeDocumentId(record),
    title: String(record.title ?? "Untitled document"),
    description: record.description ? String(record.description) : undefined,
    fileUrl: record.fileUrl ? String(record.fileUrl) : undefined,
    sizeInBytes:
      typeof record.sizeInBytes === "number" ? record.sizeInBytes : undefined,
    format: record.format ? String(record.format) : undefined,
    subjectId: record.subjectId ? String(record.subjectId) : undefined,
    authorId: record.authorId ? String(record.authorId) : undefined,
    isPublic:
      typeof record.isPublic === "boolean" ? record.isPublic : undefined,
    status: record.status ? String(record.status) : undefined,
    createdAt: record.createdAt ? String(record.createdAt) : undefined,
    updatedAt: record.updatedAt ? String(record.updatedAt) : undefined,
    ...record,
  };
}

function extractDocumentArray(payload: unknown): DocumentDto[] {
  if (Array.isArray(payload)) {
    return payload
      .map((item) => normalizeDocument(item))
      .filter((item) => item.id);
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const asRecord = payload as Record<string, unknown>;
  const nestedList = ["items", "results", "data", "documents"]
    .map((key) => asRecord[key])
    .find((value) => Array.isArray(value));

  if (Array.isArray(nestedList)) {
    return nestedList
      .map((item) => normalizeDocument(item))
      .filter((item) => item.id);
  }

  return [];
}

export async function getDocuments(
  query?: DocumentsQueryParams,
): Promise<DocumentDto[]> {
  return withGlobalLoading(async () => {
    const response = await apiClient.get(DOCUMENTS_BASE_PATH, {
      params: query,
    });
    return extractDocumentArray(response);
  });
}

export async function getDocumentById(
  documentId: string,
): Promise<DocumentDto> {
  return withGlobalLoading(async () => {
    const response = await apiClient.get(
      `${DOCUMENTS_BASE_PATH}/${documentId}`,
    );
    return normalizeDocument(response);
  });
}

export async function createDocument(
  payload: CreateDocumentPayload,
): Promise<DocumentDto> {
  return withGlobalLoading(async () => {
    const response = await apiClient.post(DOCUMENTS_BASE_PATH, payload);
    return normalizeDocument(response);
  });
}

export async function updateDocument(
  documentId: string,
  payload: UpdateDocumentPayload,
): Promise<DocumentDto> {
  return withGlobalLoading(async () => {
    const response = await apiClient.patch(
      `${DOCUMENTS_BASE_PATH}/${documentId}`,
      payload,
    );
    return normalizeDocument(response);
  });
}

export async function deleteDocument(documentId: string): Promise<void> {
  return withGlobalLoading(async () => {
    await apiClient.delete(`${DOCUMENTS_BASE_PATH}/${documentId}`);
  });
}

export async function verifyDocument(
  documentId: string,
  payload?: VerifyDocumentPayload,
): Promise<void> {
  return withGlobalLoading(async () => {
    await apiClient.post(
      `${VERIFY_DOCUMENT_PATH}/${documentId}`,
      payload ?? {},
    );
  });
}
