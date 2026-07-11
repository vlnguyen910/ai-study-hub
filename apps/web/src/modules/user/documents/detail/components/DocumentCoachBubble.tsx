"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";

import { DocumentCoachCard } from "./DocumentCoachCard";

const LAST_DOCUMENT_STORAGE_KEY = "ai-study-coach-last-document-id";

function getDocumentIdFromPathname(pathname: string): string | null {
  const match = /^\/documents\/([a-fA-F0-9]{24})\/?$/.exec(pathname);
  return match?.[1] ?? null;
}

function EmptyCoachPanel({
  onClose,
}: {
  readonly onClose: () => void;
}): React.JSX.Element {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-3xl border border-primary/20 bg-surface-container-lowest shadow-2xl">
      <div className="flex items-start justify-between gap-3 border-b border-outline-variant p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-sm">
            <span className="material-symbols-outlined text-[24px]">
              psychology
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-on-surface">AI Coach</h3>
            <p className="mt-1 text-sm leading-5 text-on-surface-variant">
              Mở một tài liệu để AI Coach trả lời dựa trên nội dung tài liệu đó.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Đóng AI Coach"
          onClick={onClose}
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </Button>
      </div>

      <div className="space-y-4 p-5">
        <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4 text-sm leading-6 text-on-surface-variant">
          AI Coach sẽ ghi nhớ tài liệu gần nhất khi bạn di chuyển giữa các
          trang. Mở một tài liệu khác để đổi ngữ cảnh RAG.
        </div>
        <Button
          type="button"
          className="w-full"
          onClick={() => {
            onClose();
            router.push("/home");
          }}
        >
          <span className="material-symbols-outlined text-[18px]">
            travel_explore
          </span>
          Mở thư viện tài liệu
        </Button>
      </div>
    </div>
  );
}

export function DocumentCoachBubble(): React.JSX.Element {
  const pathname = usePathname();
  const currentDocumentId = useMemo(
    () => getDocumentIdFromPathname(pathname),
    [pathname],
  );
  const [isMounted, setIsMounted] = useState(false);
  const [lastDocumentId, setLastDocumentId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const activeDocumentId = currentDocumentId ?? lastDocumentId;

  useEffect(() => {
    setIsMounted(true);
    setLastDocumentId(window.localStorage.getItem(LAST_DOCUMENT_STORAGE_KEY));
  }, []);

  useEffect(() => {
    if (!currentDocumentId) return;

    setLastDocumentId(currentDocumentId);
    window.localStorage.setItem(LAST_DOCUMENT_STORAGE_KEY, currentDocumentId);
  }, [currentDocumentId]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isMounted) return <></>;

  return createPortal(
    <>
      {isOpen ? (
        <aside
          aria-label="AI Coach"
          className="fixed bottom-24 right-4 z-[2147483000] w-[calc(100vw-2rem)] max-w-[420px] sm:right-6"
        >
          <div className="max-h-[calc(100dvh-7rem)] overflow-hidden rounded-3xl bg-surface-container-lowest shadow-2xl ring-1 ring-black/5">
            {activeDocumentId ? (
              <DocumentCoachCard
                key={activeDocumentId}
                documentId={activeDocumentId}
                onClose={() => setIsOpen(false)}
              />
            ) : (
              <EmptyCoachPanel onClose={() => setIsOpen(false)} />
            )}
          </div>
        </aside>
      ) : null}

      <button
        type="button"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Đóng AI Coach" : "Mở AI Coach"}
        title={isOpen ? "Đóng AI Coach" : "Mở AI Coach"}
        className="fixed bottom-4 right-4 z-[2147483001] flex size-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-2xl shadow-primary/30 transition hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="material-symbols-outlined text-[32px]">
          {isOpen ? "close" : "support_agent"}
        </span>
        {!isOpen && activeDocumentId ? (
          <span className="absolute -right-0.5 -top-0.5 size-4 rounded-full border-2 border-background bg-success" />
        ) : null}
      </button>
    </>,
    document.body,
  );
}
