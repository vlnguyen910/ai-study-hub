"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { createCollection, fetchCollections } from "@/apis/collection.api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { CollectionSummary } from "@/types/collection.type";
import { formatDate } from "@/utils";

interface CollectionsTabProps {
  readonly userId: string;
  readonly isOwnProfile: boolean;
}

export function CollectionsTab({
  userId,
  isOwnProfile,
}: CollectionsTabProps): React.JSX.Element {
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCollections = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchCollections({
        userId,
        page: 1,
        limit: 24,
      });
      setCollections(response.collections);
    } catch {
      setError("Không thể tải danh sách bộ sưu tập. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadCollections();
  }, [loadCollections]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || isCreating) return;

    setIsCreating(true);
    setError(null);
    try {
      const collection = await createCollection({
        name: trimmedName,
        isPublic,
      });
      setCollections((current) => [collection, ...current]);
      setName("");
      setIsPublic(false);
      setShowCreateForm(false);
    } catch {
      setError("Tạo bộ sưu tập thất bại. Vui lòng thử lại.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="p-5 shadow-sm shadow-black/5 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-on-surface">
            Bộ sưu tập tài liệu
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            {isOwnProfile
              ? "Quản lý các bộ sưu tập public/private của bạn."
              : "Chỉ hiển thị các bộ sưu tập công khai của người dùng này."}
          </p>
        </div>

        {isOwnProfile ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCreateForm((current) => !current)}
          >
            <span className="material-symbols-outlined text-[18px]">
              add_circle
            </span>
            Tạo bộ sưu tập
          </Button>
        ) : null}
      </div>

      {showCreateForm ? (
        <form
          className="mt-5 grid gap-3 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4"
          onSubmit={handleCreate}
        >
          <label className="grid gap-1 text-sm font-medium text-on-surface">
            Tên bộ sưu tập
            <input
              value={name}
              maxLength={80}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ví dụ: Ôn thi SWD"
              className="h-10 rounded-xl border border-outline-variant bg-surface px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <label className="flex items-center justify-between rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface">
            <span>
              Công khai
              <span className="ml-2 text-xs text-on-surface-variant">
                Người khác có thể xem bộ sưu tập này
              </span>
            </span>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(event) => setIsPublic(event.target.checked)}
              className="h-4 w-4 accent-primary"
            />
          </label>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateForm(false)}
              disabled={isCreating}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!name.trim() || isCreating}
            >
              {isCreating ? "Đang tạo..." : "Tạo"}
            </Button>
          </div>
        </form>
      ) : null}

      {error ? (
        <div className="mt-5 rounded-xl border border-error/30 bg-error-container/30 px-4 py-3 text-sm text-error">
          {error}
        </div>
      ) : null}

      {error ? null : isLoading ? (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-2xl bg-surface-container"
            />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest px-4 py-10 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">
            collections_bookmark
          </span>
          <p className="mt-2 text-sm font-medium text-on-surface">
            Chưa có bộ sưu tập nào
          </p>
          <p className="mt-1 text-sm text-on-surface-variant">
            {isOwnProfile
              ? "Hãy lưu nhanh tài liệu vào một bộ sưu tập để xem lại dễ hơn."
              : "Người dùng này chưa có bộ sưu tập công khai."}
          </p>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.id}`}
              className="group rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm shadow-black/5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-sm font-semibold text-on-surface group-hover:text-primary">
                    {collection.name}
                  </h3>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    {collection.documentCount} tài liệu
                  </p>
                </div>
                <Badge
                  tone={collection.isPublic ? "success" : "neutral"}
                  className="shrink-0 text-[11px]"
                >
                  {collection.isPublic ? "Public" : "Private"}
                </Badge>
              </div>

              {collection.description ? (
                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-on-surface-variant">
                  {collection.description}
                </p>
              ) : null}

              <div className="mt-4 flex items-center justify-between border-t border-outline-variant/50 pt-3 text-[11px] text-on-surface-variant">
                <span>Cập nhật {formatDate(collection.updatedAt)}</span>
                <span className="material-symbols-outlined text-[16px] transition group-hover:text-primary">
                  arrow_forward
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
