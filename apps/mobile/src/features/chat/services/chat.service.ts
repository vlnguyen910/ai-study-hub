import type { AxiosInstance } from "axios";

import { API_ENDPOINTS } from "@/constants/endpoints";
import { apiClient } from "@/services/api-client";
import type { ChatMessage, ChatSession } from "../types/chat.types";

type ApiEnvelope<T> = { data?: T };
type ChatApiClient = Pick<AxiosInstance, "get" | "post">;

const unwrap = <T>(response: { data: ApiEnvelope<T> | T }): T => {
  const body = response.data as ApiEnvelope<T>;
  return body && typeof body === "object" && "data" in body
    ? (body.data as T)
    : (response.data as T);
};

export const fetchDocumentChatSessions = async (
  documentId: string,
  client: ChatApiClient = apiClient,
): Promise<{ sessions: ChatSession[] }> => {
  const response = await client.get(
    API_ENDPOINTS.CHAT.DOCUMENT_SESSIONS(documentId),
  );
  return unwrap(response);
};

export const createDocumentChatSession = async (
  documentId: string,
  title: string,
  client: ChatApiClient = apiClient,
): Promise<ChatSession> => {
  const response = await client.post(
    API_ENDPOINTS.CHAT.DOCUMENT_SESSIONS(documentId),
    { title },
  );
  return unwrap(response);
};

export const fetchChatMessages = async (
  sessionId: string,
  client: ChatApiClient = apiClient,
): Promise<{ messages: ChatMessage[] }> => {
  const response = await client.get(
    API_ENDPOINTS.CHAT.SESSION_MESSAGES(sessionId),
  );
  return unwrap(response);
};

export const sendChatMessage = async (
  sessionId: string,
  content: string,
  client: ChatApiClient = apiClient,
): Promise<{
  session: ChatSession;
  userMessage: ChatMessage;
  message: ChatMessage;
}> => {
  const response = await client.post(
    API_ENDPOINTS.CHAT.SESSION_MESSAGES(sessionId),
    { content },
    { timeout: 60_000 },
  );
  return unwrap(response);
};
