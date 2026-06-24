"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";

import {
  addDocumentToCollection,
  createCollection,
  fetchCollections,
  fetchDocumentSaveStatus,
  removeDocumentFromCollection,
} from "@/apis/collection.api";
import { useAuthStore } from "@/stores/auth/store";
import type { CollectionSummary } from "@/types/collection.type";

export interface QuickSaveMembershipChange {
  readonly collectionId: string;
  readonly documentId: string;
  readonly containsDocument: boolean;
  readonly documentCount: number;
}

interface QuickSavePopoverProps {
  readonly documentId: string;
  readonly documentTitle: string;
  readonly className?: string;
  readonly onMembershipChange?: (change: QuickSaveMembershipChange) => void;
}

interface PopoverPosition {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly maxHeight: number;
  readonly placement: "top" | "bottom";
}

const POPOVER_WIDTH = 380;
const POPOVER_MAX_HEIGHT = 520;
const POPOVER_MIN_HEIGHT = 220;
const VIEWPORT_PADDING = 12;
const TRIGGER_GAP = 10;
const saveStatusCache = new Map<string, boolean>();

const initialPosition: PopoverPosition = {
  top: VIEWPORT_PADDING,
  left: VIEWPORT_PADDING,
  width: POPOVER_WIDTH,
  maxHeight: POPOVER_MAX_HEIGHT,
  placement: "bottom",
};

export function QuickSavePopover({
  documentId,
  documentTitle,
  className = "",
  onMembershipChange,
}: QuickSavePopoverProps): React.JSX.Element {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [position, setPosition] = useState<PopoverPosition>(initialPosition);
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [busyCollectionId, setBusyCollectionId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIsPublic, setNewIsPublic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updatePopoverPosition = useCallback(() => {
    if (typeof window === "undefined" || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const width = Math.min(
      POPOVER_WIDTH,
      Math.max(280, viewportWidth - VIEWPORT_PADDING * 2),
    );
    const left = Math.min(
      Math.max(VIEWPORT_PADDING, rect.right - width),
      viewportWidth - VIEWPORT_PADDING - width,
    );
    const availableBelow =
      viewportHeight - rect.bottom - TRIGGER_GAP - VIEWPORT_PADDING;
    const availableAbove = rect.top - TRIGGER_GAP - VIEWPORT_PADDING;
    const shouldOpenAbove =
      availableBelow < POPOVER_MIN_HEIGHT && availableAbove > availableBelow;
    const availableHeight = shouldOpenAbove ? availableAbove : availableBelow;
    const viewportMaxHeight = Math.max(
      120,
      viewportHeight - VIEWPORT_PADDING * 2,
    );
    const minHeight = Math.min(POPOVER_MIN_HEIGHT, viewportMaxHeight);
    const maxHeight = Math.max(
      minHeight,
      Math.min(POPOVER_MAX_HEIGHT, Math.max(availableHeight, minHeight)),
    );
    const top = shouldOpenAbove
      ? Math.max(VIEWPORT_PADDING, rect.top - TRIGGER_GAP - maxHeight)
      : Math.min(
          rect.bottom + TRIGGER_GAP,
          viewportHeight - VIEWPORT_PADDING - maxHeight,
        );

    setPosition({
      top: Math.max(VIEWPORT_PADDING, top),
      left,
      width,
      maxHeight,
      placement: shouldOpenAbove ? "top" : "bottom",
    });
  }, []);

  const closePopover = useCallback(() => {
    setIsOpen(false);
    setShowCreateForm(false);
    setMessage(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsSaved(false);
      saveStatusCache.delete(documentId);
      return;
    }

    const cachedStatus = saveStatusCache.get(documentId);
    if (cachedStatus !== undefined) {
      setIsSaved(cachedStatus);
      return;
    }

    let isCurrent = true;

    fetchDocumentSaveStatus(documentId)
      .then((status) => {
        if (!isCurrent) return;
        saveStatusCache.set(documentId, status.isSaved);
        setIsSaved(status.isSaved);
      })
      .catch(() => {
        if (!isCurrent) return;
        setIsSaved(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [documentId, isAuthenticated]);

  useEffect(() => {
    if (!isOpen) return;

    updatePopoverPosition();

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      closePopover();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePopover();
      }
    };

    const handleViewportChange = () => updatePopoverPosition();

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [closePopover, isOpen, updatePopoverPosition]);

  useEffect(() => {
    if (!isOpen) return;

    const frame = window.requestAnimationFrame(updatePopoverPosition);
    return () => window.cancelAnimationFrame(frame);
  }, [
    collections.length,
    error,
    isLoading,
    isOpen,
    message,
    showCreateForm,
    updatePopoverPosition,
  ]);

  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;

    let isCurrent = true;
    setCollections([]);
    setIsLoading(true);
    setError(null);
    setMessage(null);

    fetchCollections({ page: 1, limit: 100, documentId })
      .then((response) => {
        if (!isCurrent) return;
        setCollections(response.collections);
        const nextIsSaved = response.collections.some(
          (collection) => collection.containsDocument,
        );
        saveStatusCache.set(documentId, nextIsSaved);
        setIsSaved(nextIsSaved);
      })
      .catch(() => {
        if (!isCurrent) return;
        setCollections([]);
        setError("Không thể tải bộ sưu tập của bạn.");
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [documentId, isAuthenticated, isOpen]);

  const openPopover = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (isOpen) {
      closePopover();
      return;
    }

    updatePopoverPosition();
    setIsOpen(true);

    if (!isAuthenticated) {
      setCollections([]);
      setMessage(null);
      setError("Vui lòng đăng nhập để lưu tài liệu vào bộ sưu tập.");
    }
  };

  const applyCollectionsState = (nextCollections: CollectionSummary[]) => {
    setCollections(nextCollections);
    const nextIsSaved = nextCollections.some(
      (collection) => collection.containsDocument,
    );
    saveStatusCache.set(documentId, nextIsSaved);
    setIsSaved(nextIsSaved);
  };

  const toggleCollection = async (collection: CollectionSummary) => {
    if (busyCollectionId) return;

    const shouldRemove = Boolean(collection.containsDocument);
    const nextContainsDocument = !shouldRemove;
    const nextDocumentCount = Math.max(
      0,
      collection.documentCount + (shouldRemove ? -1 : 1),
    );

    setBusyCollectionId(collection.id);
    setError(null);
    setMessage(null);

    try {
      if (shouldRemove) {
        await removeDocumentFromCollection(collection.id, documentId);
      } else {
        await addDocumentToCollection(collection.id, documentId);
      }

      const nextCollections = collections.map((item) =>
        item.id === collection.id
          ? {
              ...item,
              containsDocument: nextContainsDocument,
              documentCount: nextDocumentCount,
            }
          : item,
      );
      applyCollectionsState(nextCollections);
      onMembershipChange?.({
        collectionId: collection.id,
        documentId,
        containsDocument: nextContainsDocument,
        documentCount: nextDocumentCount,
      });
      setMessage(shouldRemove ? "Đã bỏ lưu tài liệu." : "Đã lưu tài liệu.");
    } catch {
      setError("Không thể cập nhật bộ sưu tập. Vui lòng thử lại.");
    } finally {
      setBusyCollectionId(null);
    }
  };

  const createAndSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = newName.trim();
    if (!trimmedName || isCreating) return;

    setIsCreating(true);
    setError(null);
    setMessage(null);

    try {
      const created = await createCollection({
        name: trimmedName,
        isPublic: newIsPublic,
        documentId,
      });
      const savedCollection = {
        ...created,
        containsDocument: true,
      };

      applyCollectionsState([savedCollection, ...collections]);
      onMembershipChange?.({
        collectionId: created.id,
        documentId,
        containsDocument: true,
        documentCount: created.documentCount,
      });
      setNewName("");
      setNewIsPublic(false);
      setShowCreateForm(false);
      setMessage("Đã tạo bộ sưu tập và lưu tài liệu.");
    } catch {
      setError("Không thể tạo bộ sưu tập mới. Vui lòng thử lại.");
    } finally {
      setIsCreating(false);
    }
  };

  const popover = (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Lưu tài liệu vào bộ sưu tập"
      className="fixed z-[9999] overflow-y-auto overscroll-contain rounded-2xl border border-outline-variant bg-surface shadow-2xl shadow-black/20"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
        maxHeight: position.maxHeight,
      }}
    >
      <span
        aria-hidden="true"
        className={`absolute h-3 w-3 rotate-45 border-outline-variant bg-surface ${
          position.placement === "bottom"
            ? "-top-1.5 right-6 border-l border-t"
            : "-bottom-1.5 right-6 border-b border-r"
        }`}
      />

      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-outline-variant bg-surface px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-on-surface">Lưu nhanh</h2>
          <p className="mt-1 line-clamp-1 text-xs text-on-surface-variant">
            {documentTitle}
          </p>
        </div>
        <button
          type="button"
          aria-label="Đóng lưu nhanh"
          className="rounded-full p-1 text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface"
          onClick={closePopover}
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <div className="px-5 py-4">
        {!isAuthenticated ? (
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-5 text-center text-sm text-on-surface-variant">
            Vui lòng đăng nhập để lưu tài liệu vào bộ sưu tập.
          </div>
        ) : isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded-2xl bg-surface-container"
              />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest px-4 py-6 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">
              collections_bookmark
            </span>
            <p className="mt-2 text-sm font-medium text-on-surface">
              Chưa có bộ sưu tập
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">
              Tạo bộ sưu tập đầu tiên để lưu tài liệu này.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {collections.map((collection) => (
              <button
                key={collection.id}
                type="button"
                disabled={busyCollectionId !== null}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-left transition hover:border-primary/40 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-70"
                onClick={() => void toggleCollection(collection)}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-on-surface">
                    {collection.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-on-surface-variant">
                    {collection.documentCount} tài liệu •{" "}
                    {collection.isPublic ? "Public" : "Private"}
                  </span>
                </span>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${
                    collection.containsDocument
                      ? "border-primary bg-primary text-on-primary"
                      : "border-outline-variant text-transparent"
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px]">
                    check
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}

        {message ? (
          <p className="mt-3 rounded-xl bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="mt-3 rounded-xl bg-error-container px-3 py-2 text-xs font-medium text-error">
            {error}
          </p>
        ) : null}
      </div>

      {isAuthenticated ? (
        <div className="border-t border-outline-variant px-5 py-4">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-2xl px-2 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
            onClick={() => setShowCreateForm((current) => !current)}
          >
            <span className="inline-flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">
                add_circle
              </span>
              Tạo mới bộ sưu tập
            </span>
            <span className="material-symbols-outlined text-[18px]">
              {showCreateForm ? "expand_less" : "expand_more"}
            </span>
          </button>

          {showCreateForm ? (
            <form className="mt-3 grid gap-3" onSubmit={createAndSave}>
              <input
                value={newName}
                maxLength={80}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Tên bộ sưu tập"
                className="h-10 rounded-xl border border-outline-variant bg-surface px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <label className="flex items-center justify-between rounded-xl border border-outline-variant px-3 py-2 text-xs text-on-surface-variant">
                Công khai bộ sưu tập
                <input
                  type="checkbox"
                  checked={newIsPublic}
                  onChange={(event) => setNewIsPublic(event.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
              </label>
              <button
                type="submit"
                disabled={!newName.trim() || isCreating}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreating ? "Đang tạo..." : "Tạo và lưu"}
              </button>
            </form>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={
          isSaved
            ? `Tài liệu ${documentTitle} đã được lưu`
            : `Lưu nhanh ${documentTitle}`
        }
        title={isSaved ? "Đã lưu vào bộ sưu tập" : "Lưu nhanh"}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full shadow-sm shadow-black/10 backdrop-blur transition focus:outline-none focus:ring-2 focus:ring-primary/40 ${
          isSaved
            ? "bg-primary text-on-primary hover:bg-primary/90"
            : "bg-surface/90 text-on-surface-variant hover:bg-primary hover:text-on-primary"
        } ${className}`}
        onClick={openPopover}
      >
        <span className="material-symbols-outlined text-[20px]">
          {isSaved ? "bookmark_added" : "bookmark_add"}
        </span>
      </button>

      {isOpen && isMounted ? createPortal(popover, document.body) : null}
    </>
  );
}
