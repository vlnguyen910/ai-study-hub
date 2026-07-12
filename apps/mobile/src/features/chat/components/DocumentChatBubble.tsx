import { Icon } from "@/components/nativewindui/Icon";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useDocumentChat } from "../hooks/useDocumentChat";
import type { ChatMessage } from "../types/chat.types";

interface Props {
  readonly documentId: string;
  readonly documentTitle: string;
  readonly isAuthenticated: boolean;
}

export function DocumentChatBubble({
  documentId,
  documentTitle,
  isAuthenticated,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState("");
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const chat = useDocumentChat(documentId, isAuthenticated);

  useEffect(() => {
    if (visible && chat.messages.length > 0) {
      requestAnimationFrame(() =>
        listRef.current?.scrollToEnd({ animated: true }),
      );
    }
  }, [chat.messages.length, visible]);

  const submit = async () => {
    const content = input.trim();
    if (!content) return;
    const sent = await chat.send(content);
    if (sent) setInput("");
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Mở AI Coach cho tài liệu"
        android_ripple={{ color: "rgba(255,255,255,0.22)", borderless: true }}
        onPress={() => setVisible(true)}
        style={styles.bubbleButton}
        testID="document-chat-bubble"
      >
        <Icon
          materialCommunityIcon={{ name: "robot-outline" }}
          size={30}
          color="#ffffff"
        />
      </Pressable>

      <Modal
        animationType="slide"
        onRequestClose={() => setVisible(false)}
        presentationStyle="pageSheet"
        visible={visible}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 bg-background"
        >
          <View className="flex-row items-center border-b border-outline-variant px-4 py-4">
            <View className="mr-3 rounded-full bg-primary/10 p-2">
              <Icon
                materialCommunityIcon={{ name: "robot-outline" }}
                size={24}
                color="#004ac6"
              />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-base font-bold text-on-surface">
                AI Coach
              </Text>
              <Text
                className="text-xs text-on-surface-variant"
                numberOfLines={1}
              >
                Đang trả lời theo: {documentTitle}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Đóng AI Coach"
              className="rounded-full p-2"
              onPress={() => setVisible(false)}
            >
              <Icon name="xmark" size={24} color="#434655" />
            </Pressable>
          </View>

          {!isAuthenticated ? (
            <View className="flex-1 items-center justify-center px-8">
              <Icon
                materialCommunityIcon={{ name: "lock-outline" }}
                size={42}
                color="#434655"
              />
              <Text className="mt-4 text-center text-base font-semibold text-on-surface">
                Vui lòng đăng nhập để hỏi AI về tài liệu này.
              </Text>
            </View>
          ) : chat.isLoading ? (
            <View className="flex-1 items-center justify-center gap-3">
              <ActivityIndicator />
              <Text className="text-sm text-on-surface-variant">
                Đang tải cuộc trò chuyện...
              </Text>
            </View>
          ) : (
            <>
              <FlatList
                ref={listRef}
                className="flex-1"
                contentContainerStyle={{ padding: 16, flexGrow: 1 }}
                data={chat.messages}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                  <View className="flex-1 items-center justify-center px-5">
                    <Text className="text-center text-lg font-bold text-on-surface">
                      Bạn muốn tìm hiểu gì trong tài liệu này?
                    </Text>
                    <Text className="mt-2 text-center text-sm leading-6 text-on-surface-variant">
                      Câu trả lời được truy xuất từ nội dung tài liệu hiện tại
                      bằng RAG.
                    </Text>
                  </View>
                }
                renderItem={({ item }) => (
                  <View
                    className={`mb-3 max-w-[88%] rounded-2xl px-4 py-3 ${
                      item.role === "user"
                        ? "self-end bg-primary"
                        : "self-start bg-surface-container-high"
                    }`}
                  >
                    <Text
                      className={`text-sm leading-6 ${
                        item.role === "user" ? "text-white" : "text-on-surface"
                      }`}
                    >
                      {item.content}
                    </Text>
                    {item.role === "assistant" && item.citations?.length ? (
                      <Text className="mt-2 text-xs text-on-surface-variant">
                        Nguồn: {item.citations.length} đoạn trong tài liệu
                      </Text>
                    ) : null}
                  </View>
                )}
              />

              {chat.error ? (
                <Pressable
                  className="px-4 pb-2"
                  onPress={() => void chat.reload()}
                >
                  <Text className="text-center text-sm text-error">
                    {chat.error} Nhấn để thử lại.
                  </Text>
                </Pressable>
              ) : null}

              <View className="flex-row items-end gap-2 border-t border-outline-variant bg-surface-container-lowest p-3">
                <TextInput
                  accessibilityLabel="Câu hỏi cho AI Coach"
                  className="max-h-28 min-h-12 flex-1 rounded-2xl border border-outline-variant bg-background px-4 py-3 text-on-surface"
                  editable={!chat.isSending}
                  maxLength={2000}
                  multiline
                  onChangeText={setInput}
                  onSubmitEditing={() => void submit()}
                  placeholder="Hỏi về tài liệu..."
                  placeholderTextColor="#747786"
                  value={input}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Gửi câu hỏi"
                  className="h-12 w-12 items-center justify-center rounded-full bg-primary disabled:opacity-50"
                  disabled={!input.trim() || chat.isSending}
                  onPress={() => void submit()}
                >
                  {chat.isSending ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Icon name="paperplane.fill" size={21} color="#ffffff" />
                  )}
                </Pressable>
              </View>
            </>
          )}
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bubbleButton: {
    width: 60,
    height: 60,
    minWidth: 60,
    maxWidth: 60,
    minHeight: 60,
    maxHeight: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#006ffd",
    elevation: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 8,
  },
});
