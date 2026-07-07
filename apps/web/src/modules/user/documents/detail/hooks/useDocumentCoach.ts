"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createDocumentChatSession,
  fetchChatMessages,
  fetchDocumentChatSessions,
  sendChatMessage,
  type ChatMessage,
  type ChatSession,
} from "@/apis/chat.api";
import { getErrorMessage } from "@/utils/error";

type UseDocumentCoachResult = {
  session: ChatSession | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  startNewChat: () => void;
  reload: () => Promise<void>;
};

const createOptimisticUserMessage = (
  sessionId: string,
  content: string,
): ChatMessage => ({
  id: `optimistic-${Date.now()}`,
  sessionId,
  role: "user",
  content,
  citations: null,
  tokensUsed: null,
  status: "SENDING",
  createdAt: new Date().toISOString(),
});

const createSessionTitle = (content: string): string => {
  const normalized = content.replace(/\s+/g, " ").trim();
  return normalized.length > 80
    ? `${normalized.slice(0, 77).trim()}...`
    : normalized;
};

const loadErrorMessages = {
  400: "AI Coach chưa sẵn sàng cho tài liệu này.",
  403: "Bạn chưa thể sử dụng AI Coach cho tài liệu này.",
  404: "Không tìm thấy cuộc trò chuyện AI Coach.",
  503: "Dịch vụ AI chưa sẵn sàng. Vui lòng kiểm tra GEMINI_API_KEY ở API server.",
} satisfies Partial<Record<number, string>>;

const sendErrorMessages = {
  400: "Tài liệu này đang được xử lý AI. Vui lòng thử lại sau.",
  403: "Bạn đã hết lượt dùng AI hôm nay hoặc tính năng đang bị tắt.",
  404: "Không tìm thấy cuộc trò chuyện AI Coach.",
  503: "Dịch vụ AI chưa sẵn sàng. Vui lòng kiểm tra GEMINI_API_KEY ở API server.",
} satisfies Partial<Record<number, string>>;

export function useDocumentCoach(
  documentId: string,
  enabled: boolean,
): UseDocumentCoachResult {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setSession(null);
    setMessages([]);
    setError(null);
  }, []);

  const loadMessages = useCallback(async (targetSession: ChatSession) => {
    const response = await fetchChatMessages(targetSession.id);
    setMessages(response.messages);
  }, []);

  const reload = useCallback(async () => {
    if (!documentId || !enabled) {
      reset();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchDocumentChatSessions(documentId);
      const latestSession = response.sessions[0] ?? null;
      setSession(latestSession);

      if (latestSession) {
        await loadMessages(latestSession);
      } else {
        setMessages([]);
      }
    } catch (err) {
      setError(getErrorMessage(err, loadErrorMessages));
    } finally {
      setIsLoading(false);
    }
  }, [documentId, enabled, loadMessages, reset]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const ensureSession = useCallback(
    async (content: string) => {
      if (session) return session;

      const created = await createDocumentChatSession(documentId, {
        title: createSessionTitle(content),
      });
      setSession(created);
      return created;
    },
    [documentId, session],
  );

  const handleSendMessage = useCallback(
    async (content: string) => {
      const normalizedContent = content.trim();
      if (!normalizedContent || isSending) return;

      setIsSending(true);
      setError(null);

      let optimisticId: string | null = null;

      try {
        const activeSession = await ensureSession(normalizedContent);
        const optimisticMessage = createOptimisticUserMessage(
          activeSession.id,
          normalizedContent,
        );
        optimisticId = optimisticMessage.id;
        setMessages((current) => [...current, optimisticMessage]);

        const response = await sendChatMessage(
          activeSession.id,
          normalizedContent,
        );

        setSession(response.session);
        setMessages((current) => [
          ...current.filter((message) => message.id !== optimisticId),
          response.userMessage,
          response.message,
        ]);
      } catch (err) {
        if (optimisticId) {
          setMessages((current) =>
            current.filter((message) => message.id !== optimisticId),
          );
        }
        setError(getErrorMessage(err, sendErrorMessages));
      } finally {
        setIsSending(false);
      }
    },
    [ensureSession, isSending],
  );

  const startNewChat = useCallback(() => {
    reset();
  }, [reset]);

  return useMemo(
    () => ({
      session,
      messages,
      isLoading,
      isSending,
      error,
      sendMessage: handleSendMessage,
      startNewChat,
      reload,
    }),
    [
      session,
      messages,
      isLoading,
      isSending,
      error,
      handleSendMessage,
      startNewChat,
      reload,
    ],
  );
}
