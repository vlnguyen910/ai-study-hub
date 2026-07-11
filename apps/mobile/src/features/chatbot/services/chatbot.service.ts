import type { AxiosInstance } from "axios";

import { API_ENDPOINTS } from "@/constants/endpoints";
import { apiClient } from "@/services/api-client";

type ApiEnvelope<T> = {
  message?: string;
  data?: T;
};

export type ChatbotApiClient = Pick<AxiosInstance, "post" | "get">;

const unwrap = <T>(response: { data: ApiEnvelope<T> | T }): T => {
  const data = response.data as ApiEnvelope<T>;
  return data && typeof data === "object" && "data" in data
    ? (data.data as T)
    : (response.data as T);
};

export const createDocumentChatSession = async (
  documentId: string,
  client: ChatbotApiClient = apiClient,
): Promise<{ id: string }> => {
  const response = await client.post(
    API_ENDPOINTS.CHAT.DOCUMENT_SESSIONS(documentId),
    { title: "Hỏi về tài liệu" },
  );
  return unwrap<{ id: string }>(response);
};

export const sendDocumentChatMessage = async (
  sessionId: string,
  content: string,
  client: ChatbotApiClient = apiClient,
): Promise<{
  session: { id: string };
  userMessage: { content: string };
  message: { content: string };
}> => {
  const response = await client.post(
    API_ENDPOINTS.CHAT.SESSION_MESSAGES(sessionId),
    { content },
  );

  return unwrap<{
    session: { id: string };
    userMessage: { content: string };
    message: { content: string };
  }>(response);
};
