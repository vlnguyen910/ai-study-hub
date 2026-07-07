"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

import { DocumentCoachCard } from "./DocumentCoachCard";

const BUBBLE_SIZE = 64;
const BUBBLE_MARGIN = 16;
const POSITION_STORAGE_KEY = "ai-study-coach-bubble-position";
const LAST_DOCUMENT_STORAGE_KEY = "ai-study-coach-last-document-id";

type BubblePosition = {
  x: number;
  y: number;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  moved: boolean;
};

function getDocumentIdFromPathname(pathname: string): string | null {
  const match = /^\/documents\/([a-fA-F0-9]{24})\/?$/.exec(pathname);
  return match?.[1] ?? null;
}

function getDefaultPosition(): BubblePosition {
  return {
    x: Math.max(BUBBLE_MARGIN, window.innerWidth - BUBBLE_SIZE - 28),
    y: Math.max(BUBBLE_MARGIN, window.innerHeight - BUBBLE_SIZE - 32),
  };
}

function clampPosition(position: BubblePosition): BubblePosition {
  return {
    x: Math.min(
      Math.max(BUBBLE_MARGIN, position.x),
      Math.max(BUBBLE_MARGIN, window.innerWidth - BUBBLE_SIZE - BUBBLE_MARGIN),
    ),
    y: Math.min(
      Math.max(BUBBLE_MARGIN, position.y),
      Math.max(BUBBLE_MARGIN, window.innerHeight - BUBBLE_SIZE - BUBBLE_MARGIN),
    ),
  };
}

function readStoredPosition(): BubblePosition | null {
  try {
    const raw = window.localStorage.getItem(POSITION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BubblePosition>;
    if (typeof parsed.x !== "number" || typeof parsed.y !== "number") {
      return null;
    }
    return clampPosition({ x: parsed.x, y: parsed.y });
  } catch {
    return null;
  }
}

function storePosition(position: BubblePosition): void {
  window.localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(position));
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
          Bong bóng này sẽ đi cùng bạn giữa các trang. Khi bạn mở một trang tài
          liệu, AI Coach sẽ tự dùng tài liệu đó làm ngữ cảnh RAG.
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
  const [lastDocumentId, setLastDocumentId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<BubblePosition | null>(null);
  const dragStateRef = useRef<DragState | null>(null);

  const activeDocumentId = currentDocumentId ?? lastDocumentId;

  useEffect(() => {
    setPosition(readStoredPosition() ?? getDefaultPosition());

    const storedDocumentId = window.localStorage.getItem(
      LAST_DOCUMENT_STORAGE_KEY,
    );
    if (storedDocumentId) {
      setLastDocumentId(storedDocumentId);
    }
  }, []);

  useEffect(() => {
    if (!currentDocumentId) return;
    setLastDocumentId(currentDocumentId);
    window.localStorage.setItem(LAST_DOCUMENT_STORAGE_KEY, currentDocumentId);
  }, [currentDocumentId]);

  useEffect(() => {
    const handleResize = () => {
      setPosition((current) => {
        const next = clampPosition(current ?? getDefaultPosition());
        storePosition(next);
        return next;
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const bubbleStyle = position
    ? {
        left: position.x,
        top: position.y,
      }
    : {
        right: "1.5rem",
        bottom: "1.5rem",
      };

  return (
    <>
      {isOpen ? (
        <div className="fixed inset-x-3 bottom-24 z-[9990] sm:inset-x-auto sm:right-6 sm:w-[420px]">
          <div className="relative max-h-[calc(100vh-8rem)] overflow-y-auto rounded-3xl shadow-2xl">
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
        </div>
      ) : null}

      <button
        type="button"
        aria-label={isOpen ? "Đóng AI Coach" : "Mở AI Coach"}
        title="AI Coach - kéo để di chuyển"
        className={cn(
          "fixed z-[9991] flex size-16 touch-none select-none items-center justify-center rounded-full bg-primary text-on-primary shadow-2xl shadow-primary/30 transition hover:scale-105 active:scale-95",
          isOpen
            ? "ring-4 ring-primary/20"
            : "animate-[pulse_2.5s_ease-in-out_infinite]",
        )}
        style={bubbleStyle}
        onPointerDown={(event) => {
          if (event.button !== 0 || !position) return;

          event.currentTarget.setPointerCapture(event.pointerId);
          dragStateRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            originX: position.x,
            originY: position.y,
            moved: false,
          };
        }}
        onPointerMove={(event) => {
          const dragState = dragStateRef.current;
          if (!dragState || dragState.pointerId !== event.pointerId) return;

          const deltaX = event.clientX - dragState.startX;
          const deltaY = event.clientY - dragState.startY;

          if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
            dragState.moved = true;
          }

          setPosition(
            clampPosition({
              x: dragState.originX + deltaX,
              y: dragState.originY + deltaY,
            }),
          );
        }}
        onPointerUp={(event) => {
          const dragState = dragStateRef.current;
          if (!dragState || dragState.pointerId !== event.pointerId) return;

          try {
            event.currentTarget.releasePointerCapture(event.pointerId);
          } catch {
            // Pointer capture may already be released by the browser.
          }

          dragStateRef.current = null;

          setPosition((current) => {
            if (current) storePosition(current);
            return current;
          });

          if (!dragState.moved) {
            setIsOpen((current) => !current);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setIsOpen((current) => !current);
          }
        }}
      >
        <span className="material-symbols-outlined text-[32px]">
          {isOpen ? "close" : "support_agent"}
        </span>
        {!isOpen && activeDocumentId ? (
          <span className="absolute -right-0.5 -top-0.5 size-4 rounded-full border-2 border-background bg-success" />
        ) : null}
      </button>
    </>
  );
}
