"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { fetchCollectionDetail } from "@/apis/collection.api";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DocumentCard } from "@/modules/library/components/DocumentCard";
import type { CollectionDetail } from "@/types/collection.type";
import { formatDate } from "@/utils";

export default function CollectionDetailPage(): React.JSX.Element {
  const params = useParams<{ id: string }>();
  const collectionId = params.id;
  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const detail = await fetchCollectionDetail(collectionId);
        if (isMounted) {
          setCollection(detail);
        }
      } catch {
        if (isMounted) {
          setError("Không thể tải bộ sưu tập này hoặc bạn không có quyền xem.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [collectionId]);

  if (isLoading) {
    return (
      <div className="min-w-0 space-y-5">
        <div className="h-44 animate-pulse rounded-3xl bg-surface-container" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-80 animate-pulse rounded-2xl bg-surface-container"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <Card className="p-8 text-center">
        <span className="material-symbols-outlined text-5xl text-error">
          lock
        </span>
        <h1 className="mt-3 text-xl font-bold text-on-surface">
          Không thể mở bộ sưu tập
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">{error}</p>
        <Link
          href="/profile"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary transition hover:opacity-90"
        >
          Quay lại hồ sơ
        </Link>
      </Card>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <Card className="overflow-hidden p-0 shadow-sm shadow-black/5">
        <div className="bg-linear-to-br from-primary/15 via-secondary/10 to-surface-container-lowest p-6 lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge tone={collection.isPublic ? "success" : "neutral"}>
                  {collection.isPublic ? "Public" : "Private"}
                </Badge>
                <Badge tone="neutral">
                  {collection.documentCount} tài liệu
                </Badge>
              </div>

              <h1 className="text-2xl font-bold text-on-surface lg:text-3xl">
                {collection.name}
              </h1>
              {collection.description ? (
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
                  {collection.description}
                </p>
              ) : null}
            </div>

            <Link
              href="/profile"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface px-4 text-sm font-semibold text-on-surface transition hover:border-primary hover:text-primary"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
              Hồ sơ
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">
                person
              </span>
              {collection.author.name}
            </span>
            <span className="text-outline-variant">•</span>
            <span>Cập nhật {formatDate(collection.updatedAt)}</span>
          </div>
        </div>
      </Card>

      {collection.documents.length === 0 ? (
        <Card className="px-4 py-12 text-center">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/50">
            inventory_2
          </span>
          <p className="mt-3 text-sm font-medium text-on-surface">
            Bộ sưu tập chưa có tài liệu hiển thị
          </p>
          <p className="mt-1 text-sm text-on-surface-variant">
            Các tài liệu riêng tư hoặc chưa được duyệt sẽ không hiển thị với
            người không phải chủ sở hữu.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {collection.documents.map((document) => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </div>
      )}
    </div>
  );
}
