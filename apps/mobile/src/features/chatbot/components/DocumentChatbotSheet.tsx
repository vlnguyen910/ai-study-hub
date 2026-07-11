import { Icon } from "@/components/nativewindui/Icon";
import { useEffect, useMemo, useRef, useState } from "react";
import { isAxiosError } from "axios";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { Card } from "@/components";
import {
  createDocumentChatSession,
  sendDocumentChatMessage,
} from "../services/chatbot.service";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

interface DocumentChatbotSheetProps {
  documentId: string;
  documentTitle: string;
  visible: boolean;
  onClose: () => void;
}

export function DocumentChatbotSheet({
  documentId,
  documentTitle,
  visible,
  onClose,
}: DocumentChatbotSheetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (isAxiosError(error)) {
      const responseData = error.response?.data;
      if (typeof responseData === "string" && responseData.length > 0) {
        return responseData;
      }

      if (responseData && typeof responseData === "object") {
        const responseObj = responseData as Record<string, unknown>;

        if (Array.isArray(responseObj.message)) {
          return responseObj.message.filter(Boolean).join(", ");
        }

        if (
          typeof responseObj.message === "string" &&
          responseObj.message.length > 0
        ) {
          return responseObj.message;
        }

        if (
          typeof responseObj.error === "string" &&
          responseObj.error.length > 0
        ) {
          return responseObj.error;
        }

        const nestedData = responseObj.data as
          | Record<string, unknown>
          | undefined;
        if (nestedData?.message && typeof nestedData.message === "string") {
          return nestedData.message;
        }
      }
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return fallback;
  };

  useEffect(() => {
    if (!visible) return;

    setMessages([]);
    setDraft("");
    setSessionId(null);
    setError(null);

    const initSession = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const session = await createDocumentChatSession(documentId);
        setSessionId(session.id);
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: `Xin chào! Tôi có thể giúp bạn hiểu nhanh nội dung “${documentTitle}”. Bạn có thể hỏi về điểm chính, thuật ngữ, hoặc cần tóm tắt ngắn gọn.`,
          },
        ]);
      } catch (error) {
        setError(
          getErrorMessage(error, "Không thể khởi tạo phòng chat lúc này."),
        );
      } finally {
        setIsLoading(false);
      }
    };

    void initSession();
  }, [documentId, documentTitle, visible]);

  useEffect(() => {
    if (!visible) return;
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, visible]);

  const canSend = useMemo(
    () => draft.length > 0 && !isLoading,
    [draft, isLoading],
  );

  const submitMessage = async () => {
    if (!canSend || !sessionId) return;

    const content = draft.trim();
    if (!content) {
      setError("Nội dung câu hỏi không thể để trống.");
      return;
    }

    console.log("[Chatbot] sending content:", content);
    setDraft("");
    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: "user", content },
    ]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendDocumentChatMessage(sessionId, content);
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content:
            response.message.content || "Tôi chưa có câu trả lời phù hợp.",
        },
      ]);
    } catch (error) {
      setError(
        getErrorMessage(error, "Không thể gửi câu hỏi. Vui lòng thử lại."),
      );
      setMessages((current) => current.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <View className="absolute inset-0 z-50 bg-black/30">
      <View className="absolute inset-x-0 bottom-0 top-16 rounded-t-[28px] border border-outline-variant bg-surface-container-lowest">
        <View className="flex-row items-center justify-between border-b border-outline-variant/70 px-4 py-4">
          <View className="flex-1">
            <Text className="text-base font-semibold text-on-surface">
              AI Study Assistant
            </Text>
            <Text className="text-sm text-on-surface-variant">
              Hỏi nhanh về tài liệu này
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            className="rounded-full bg-surface-container-high p-2"
            onPress={onClose}
          >
            <Icon name="xmark" size={18} color="#191b23" />
          </Pressable>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <ScrollView
            ref={scrollRef}
            className="flex-1 px-4 py-4"
            contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {isLoading && messages.length === 0 ? (
              <Card className="border border-primary/20 bg-primary/5">
                <View className="flex-row items-center gap-3">
                  <ActivityIndicator color="#004ac6" />
                  <Text className="text-sm text-on-surface-variant">
                    Đang khởi tạo trợ lý...
                  </Text>
                </View>
              </Card>
            ) : null}

            {messages.map((message) => (
              <View
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === "assistant" ? "self-start bg-surface-container-high" : "self-end bg-primary"}`}
              >
                <Text
                  className={`text-sm leading-6 ${message.role === "assistant" ? "text-on-surface" : "text-on-primary"}`}
                >
                  {message.content}
                </Text>
              </View>
            ))}

            {error ? (
              <Card className="border border-error/20 bg-error/10">
                <Text className="text-sm text-error">{error}</Text>
              </Card>
            ) : null}
          </ScrollView>

          <View className="border-t border-outline-variant/70 bg-surface-container-lowest px-3 py-3">
            <View className="flex-row items-end gap-2 rounded-2xl border border-outline-variant bg-surface-container-high px-3 py-2">
              <TextInput
                value={draft}
                onChangeText={(value) => {
                  console.log("[Chatbot] input changed:", value);
                  setDraft(value);
                }}
                placeholder="Nhập câu hỏi về tài liệu..."
                maxLength={500}
                className="flex-1 py-1 text-sm text-on-surface"
                placeholderTextColor="#6e7280"
                keyboardType="default"
                returnKeyType="send"
                blurOnSubmit={true}
                textContentType="none"
                autoComplete="off"
                spellCheck={false}
                autoCapitalize="sentences"
                autoCorrect={false}
                onSubmitEditing={() => {
                  if (canSend) {
                    void submitMessage();
                  }
                }}
              />
              <Pressable
                accessibilityRole="button"
                className={`rounded-full p-2 ${canSend ? "bg-primary" : "bg-surface-container"}`}
                onPress={() => {
                  if (canSend) {
                    void submitMessage();
                  }
                }}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Icon
                    name="paperplane.fill"
                    size={18}
                    color={canSend ? "#ffffff" : "#8e93a0"}
                  />
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}
