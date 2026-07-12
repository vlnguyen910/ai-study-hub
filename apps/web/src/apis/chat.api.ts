import { apiClient } from "@/lib/axios";
import { API_ENDPOINTS } from "@/shared/constants";

export interface ChatCitation {
  chunkId: string;
  chunkIndex: number;
  pageStart?: number | null;
  pageEnd?: number | null;
  score: number;
  preview: string;
}

export interface ChatSession {
  id: string;
  documentId: string;
  userId: string;
  title: string;
  status: string;
  model: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  citations?: ChatCitation[] | null;
  tokensUsed?: number | null;
  status?: string | null;
  createdAt: string;
}

export const fetchDocumentChatSessions = async (
  documentId: string,
): Promise<{ sessions: ChatSession[] }> => {
  return apiClient.get<unknown, { sessions: ChatSession[] }>(
    API_ENDPOINTS.CHAT.DOCUMENT_SESSIONS(documentId),
  );
};

export const createDocumentChatSession = async (
  documentId: string,
  payload?: { title?: string },
): Promise<ChatSession> => {
  return apiClient.post<unknown, ChatSession>(
    API_ENDPOINTS.CHAT.DOCUMENT_SESSIONS(documentId),
    payload ?? {},
  );
};

export const fetchChatMessages = async (
  sessionId: string,
): Promise<{ messages: ChatMessage[] }> => {
  return apiClient.get<unknown, { messages: ChatMessage[] }>(
    API_ENDPOINTS.CHAT.SESSION_MESSAGES(sessionId),
  );
};

export const sendChatMessage = async (
  sessionId: string,
  content: string,
): Promise<{
  session: ChatSession;
  userMessage: ChatMessage;
  message: ChatMessage;
}> => {
  return apiClient.post<
    unknown,
    { session: ChatSession; userMessage: ChatMessage; message: ChatMessage }
  >(
    API_ENDPOINTS.CHAT.SESSION_MESSAGES(sessionId),
    { content },
    { timeout: 120_000 },
  );
};

export const deleteChatSession = async (sessionId: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.CHAT.SESSION(sessionId));
};
