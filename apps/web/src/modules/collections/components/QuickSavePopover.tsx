"use client";

import { useEffect, useState } from "react";

import {
  addDocumentToCollection,
  createCollection,
  fetchCollections,
  removeDocumentFromCollection,
} from "@/apis/collection.api";
import type { CollectionSummary } from "@/types/collection.type";
import { useAuthStore } from "@/stores/auth/store";

interface QuickSavePopoverProps {
  readonly documentId: string;
  readonly documentTitle: string;
  readonly className?: string;
}

export function QuickSavePopover({
  documentId,
  documentTitle,
  className = "",
}: QuickSavePopoverProps): React.JSX.Element {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isOpen, setIsOpen] = useState(false);
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
    if (!isOpen || !isAuthenticated) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setMessage(null);

    fetchCollections({ page: 1, limit: 100, documentId })
      .then((response) => {
        if (isMounted) {
          setCollections(response.collections);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Không thể tải bộ sưu tập của bạn.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [documentId, isAuthenticated, isOpen]);

  const openPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsOpen(true);
    if (!isAuthenticated) {
      setError("Vui lòng đăng nhập để lưu tài liệu vào bộ sưu tập.");
    }
  };

  const closePopover = () => {
    setIsOpen(false);
    setShowCreateForm(false);
    setMessage(null);
    setError(null);
  };

  const toggleCollection = async (collection: CollectionSummary) => {
    if (busyCollectionId) return;

    const shouldRemove = Boolean(collection.containsDocument);
    setBusyCollectionId(collection.id);
    setError(null);
    setMessage(null);

    try {
      if (shouldRemove) {
        await removeDocumentFromCollection(collection.id, documentId);
      } else {
        await addDocumentToCollection(collection.id, documentId);
      }

      setCollections((current) =>
        current.map((item) =>
          item.id === collection.id
            ? {
                ...item,
                containsDocument: !shouldRemove,
                documentCount: Math.max(
                  0,
                  item.documentCount + (shouldRemove ? -1 : 1),
                ),
              }
            : item,
        ),
      );
      setMessage(shouldRemove ? "Đã bỏ lưu tài liệu." : "Đã lưu tài liệu.");
    } catch {
      setError("Không thể cập nhật bộ sưu tập. Vui lòng thử lại.");
    } finally {
      setBusyCollectionId(null);
    }
  };

  const createAndSave = async (event: React.FormEvent<HTMLFormElement>) => {
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
      });
      const detail = await addDocumentToCollection(created.id, documentId);

      setCollections((current) => [
        {
          ...created,
          containsDocument: true,
          documentCount: detail.documentCount,
        },
        ...current,
      ]);
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

  return (
    <>
      <button
        type="button"
        aria-label={`Lưu nhanh ${documentTitle}`}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-on-surface-variant shadow-sm shadow-black/10 backdrop-blur transition hover:bg-primary hover:text-on-primary focus:outline-none focus:ring-2 focus:ring-primary/40 ${className}`}
        onClick={openPopover}
      >
        <span className="material-symbols-outlined text-[20px]">
          bookmark_add
        </span>
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Lưu tài liệu vào bộ sưu tập"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-inverse-surface/25 px-4 py-8 backdrop-blur-sm"
          onClick={closePopover}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-outline-variant bg-surface shadow-2xl shadow-black/20"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-outline-variant px-5 py-4">
              <div className="min-w-0">
                <h2 className="text-base font-bold text-on-surface">
                  Lưu nhanh
                </h2>
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
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
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
                        onChange={(event) =>
                          setNewIsPublic(event.target.checked)
                        }
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
        </div>
      ) : null}
    </>
  );
}
