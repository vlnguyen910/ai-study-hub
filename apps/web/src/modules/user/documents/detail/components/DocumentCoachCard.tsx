"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import type { ChatCitation, ChatMessage } from "@/apis/chat.api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth/store";

import { useDocumentCoach } from "../hooks/useDocumentCoach";

interface Props {
  readonly documentId: string;
  readonly onClose?: () => void;
}

function CitationChip({
  citation,
  index,
}: {
  readonly citation: ChatCitation;
  readonly index: number;
}): React.JSX.Element {
  const pageLabel =
    citation.pageStart || citation.pageEnd
      ? ` · trang ${citation.pageStart ?? "?"}-${citation.pageEnd ?? "?"}`
      : "";

  return (
    <span
      title={citation.preview}
      className="inline-flex max-w-full items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary"
    >
      <span className="material-symbols-outlined text-[14px]">article</span>
      <span className="truncate">
        Nguồn {index + 1} · chunk {citation.chunkIndex}
        {pageLabel}
      </span>
    </span>
  );
}

function MessageBubble({
  message,
}: {
  readonly message: ChatMessage;
}): React.JSX.Element {
  const isUser = message.role === "user";
  const citations =
    message.role === "assistant" ? (message.citations ?? []) : [];

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[92%] rounded-2xl px-3.5 py-3 text-sm leading-6 shadow-sm",
          isUser
            ? "rounded-br-md bg-primary text-on-primary"
            : "rounded-bl-md border border-outline-variant bg-surface-container-lowest text-on-surface",
        )}
      >
        <p className="whitespace-pre-line">{message.content}</p>

        {citations.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {citations.map((citation, index) => (
              <CitationChip
                key={`${citation.chunkId}-${index}`}
                citation={citation}
                index={index}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function EmptyState(): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4 text-sm leading-6 text-on-surface-variant">
      <div className="mb-2 flex items-center gap-2 font-semibold text-on-surface">
        <span className="material-symbols-outlined text-[18px] text-primary">
          tips_and_updates
        </span>
        Gợi ý câu hỏi
      </div>
      <ul className="space-y-1">
        <li>• Tài liệu này nói về nội dung chính gì?</li>
        <li>• Giải thích phần quan trọng nhất theo cách dễ hiểu.</li>
        <li>• Liệt kê các ý cần ôn tập từ tài liệu này.</li>
      </ul>
    </div>
  );
}

export function DocumentCoachCard({
  documentId,
  onClose,
}: Props): React.JSX.Element {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setLoginPromptOpen = useAuthStore((state) => state.setLoginPromptOpen);
  const [content, setContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const {
    messages,
    isLoading,
    isSending,
    error,
    sendMessage,
    startNewChat,
    reload,
  } = useDocumentCoach(documentId, isAuthenticated);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedContent = content.trim();
    if (!normalizedContent || isSending || !isAuthenticated) return;

    try {
      await sendMessage(normalizedContent);
      setContent("");
    } catch {
      // Keep the draft in the textarea; useDocumentCoach already exposes the
      // user-facing error state.
    }
  };

  return (
    <Card className="flex max-h-[calc(100dvh-7rem)] flex-col overflow-hidden border-primary/20 bg-surface-container-lowest">
      <div className="shrink-0 border-b border-primary/10 bg-primary/5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-sm">
              <span className="material-symbols-outlined text-[22px]">
                psychology
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-on-surface">
                  AI Coach
                </h3>
                <Badge tone="neutral" className="bg-white/70 text-[10px]">
                  RAG
                </Badge>
              </div>
              <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                Hỏi đáp dựa trên nội dung tài liệu này, kèm nguồn tham chiếu.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {isAuthenticated ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                title="Cuộc trò chuyện mới"
                onClick={startNewChat}
              >
                <span className="material-symbols-outlined text-[18px]">
                  add
                </span>
              </Button>
            ) : null}
            {onClose ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                title="Đóng AI Coach"
                onClick={onClose}
              >
                <span className="material-symbols-outlined text-[18px]">
                  close
                </span>
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {!isAuthenticated ? (
        <div className="space-y-4 p-5">
          <p className="text-sm leading-6 text-on-surface-variant">
            Đăng nhập để sử dụng AI Coach và lưu lại lịch sử hỏi đáp cho tài
            liệu này.
          </p>
          <Button
            type="button"
            className="w-full"
            onClick={() => setLoginPromptOpen(true)}
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            Đăng nhập để hỏi AI
          </Button>
        </div>
      ) : (
        <>
          <div className="min-h-[240px] flex-1 space-y-3 overflow-y-auto bg-surface-container-lowest px-5 py-4">
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-16 animate-pulse rounded-2xl bg-surface-variant" />
                <div className="ml-auto h-12 w-4/5 animate-pulse rounded-2xl bg-primary/20" />
                <div className="h-20 animate-pulse rounded-2xl bg-surface-variant" />
              </div>
            ) : messages.length > 0 ? (
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            ) : (
              <EmptyState />
            )}

            {isSending ? (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container-lowest px-3.5 py-3 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined animate-spin text-[18px] text-primary">
                    progress_activity
                  </span>
                  AI Coach đang đọc tài liệu...
                </div>
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>

          {error ? (
            <div className="mx-5 mb-3 shrink-0 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-xs leading-5 text-on-surface-variant">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined mt-0.5 text-[16px] text-warning">
                  info
                </span>
                <div className="flex-1">
                  {error}
                  <button
                    type="button"
                    className="ml-1 font-medium text-primary underline-offset-2 hover:underline"
                    onClick={() => void reload()}
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <form
            className="shrink-0 border-t border-primary/10 bg-surface-container-lowest p-4"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <label className="sr-only" htmlFor="document-coach-input">
              Hỏi AI về tài liệu này
            </label>
            <div className="flex items-end gap-2 rounded-2xl border border-outline-variant bg-surface-container-lowest p-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <textarea
                id="document-coach-input"
                value={content}
                rows={2}
                maxLength={2000}
                disabled={isSending}
                placeholder="Hỏi AI về tài liệu này..."
                className="min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-5 text-on-surface outline-none placeholder:text-on-surface-variant disabled:opacity-60"
                onChange={(event) => setContent(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
              />
              <Button
                type="submit"
                size="icon-sm"
                disabled={!content.trim() || isSending}
                title="Gửi câu hỏi"
              >
                <span className="material-symbols-outlined text-[18px]">
                  send
                </span>
              </Button>
            </div>
            <p className="mt-2 text-[11px] leading-4 text-on-surface-variant">
              AI Coach chỉ dùng nội dung được trích xuất từ tài liệu này.
            </p>
          </form>
        </>
      )}
    </Card>
  );
}
