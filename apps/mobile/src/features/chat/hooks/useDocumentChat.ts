import { isAxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";

import {
  createDocumentChatSession,
  fetchChatMessages,
  fetchDocumentChatSessions,
  sendChatMessage,
} from "../services/chat.service";
import type { ChatMessage, ChatSession } from "../types/chat.types";

const errorMessage = (error: unknown): string => {
  if (!isAxiosError(error)) return "Đã xảy ra lỗi. Vui lòng thử lại.";
  switch (error.response?.status) {
    case 400:
      return "Tài liệu đang được xử lý AI. Vui lòng thử lại sau.";
    case 403:
      return "Bạn chưa thể dùng AI Coach hoặc đã hết lượt hôm nay.";
    case 404:
      return "Không tìm thấy cuộc trò chuyện này.";
    case 503:
      return "Dịch vụ AI hiện chưa sẵn sàng.";
    default:
      return "Không thể kết nối AI Coach. Vui lòng thử lại.";
  }
};

const sessionTitle = (content: string) =>
  content.length > 80 ? `${content.slice(0, 77).trim()}...` : content;

export function useDocumentChat(documentId: string, enabled: boolean) {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!documentId || !enabled) {
      setSession(null);
      setMessages([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchDocumentChatSessions(documentId);
      const latest = result.sessions[0] ?? null;
      setSession(latest);
      setMessages(latest ? (await fetchChatMessages(latest.id)).messages : []);
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [documentId, enabled]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const send = useCallback(
    async (rawContent: string) => {
      const content = rawContent.trim();
      if (!content || isSending || !enabled) return false;
      setIsSending(true);
      setError(null);
      try {
        const activeSession =
          session ??
          (await createDocumentChatSession(documentId, sessionTitle(content)));
        setSession(activeSession);
        const result = await sendChatMessage(activeSession.id, content);
        setSession(result.session);
        setMessages((current) => [
          ...current,
          result.userMessage,
          result.message,
        ]);
        return true;
      } catch (sendError) {
        setError(errorMessage(sendError));
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [documentId, enabled, isSending, session],
  );

  return { messages, isLoading, isSending, error, send, reload };
}
