"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { fetchDocuments } from "@/apis/document.api";
import { usePendingDocumentsStore } from "@/stores/pendingDocuments/store";
import type { LibraryDocument } from "@/types/document.type";
import { formatDate } from "@/utils";

import {
  EmptyState,
  IconButton,
  MaterialIcon,
  ModeratorBadge,
  ModeratorCard,
} from "../components/ModeratorPrimitives";

const PENDING_PREVIEW_LIMIT = 6;

const formatCount = (value: number) => value.toLocaleString("vi-VN");

function PendingDocumentSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          className="flex animate-pulse items-center gap-4 border-b border-outline-variant px-1 py-4 last:border-0"
          key={index}
        >
          <div className="h-11 w-11 rounded bg-surface-container-high" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/3 rounded bg-surface-container-high" />
            <div className="h-3 w-1/3 rounded bg-surface-container-high" />
          </div>
          <div className="h-8 w-8 rounded bg-surface-container-high" />
        </div>
      ))}
    </div>
  );
}

function PendingDocumentRow({
  document,
}: {
  readonly document: LibraryDocument;
}): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3 border-b border-outline-variant px-1 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-primary-fixed text-primary">
          <MaterialIcon name="article" />
        </div>
        <div className="min-w-0">
          <p className="line-clamp-1 font-label-md text-label-md text-on-surface">
            {document.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
            <span>{document.author.name}</span>
            <span aria-hidden="true">•</span>
            <span>{formatDate(document.createdAt)}</span>
            {document.subject ? (
              <>
                <span aria-hidden="true">•</span>
                <ModeratorBadge tone="secondary">
                  {document.subject.name}
                </ModeratorBadge>
              </>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
        <ModeratorBadge tone="tertiary">Chờ duyệt</ModeratorBadge>
        <IconButton
          href={`/moderator/documents/${document.id}`}
          icon="visibility"
          label={`Xem chi tiết ${document.title}`}
        />
      </div>
    </div>
  );
}

export default function ModeratorDashboardPage(): React.JSX.Element {
  const [pendingDocuments, setPendingDocuments] = useState<LibraryDocument[]>(
    [],
  );
  const [pendingTotal, setPendingTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setCount } = usePendingDocumentsStore();

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchDocuments({
        page: 1,
        limit: PENDING_PREVIEW_LIMIT,
        status: "PENDING",
      });

      setPendingDocuments(response.documents);
      setPendingTotal(response.pagination.total);
      setCount(response.pagination.total);
    } catch {
      setPendingDocuments([]);
      setPendingTotal(0);
      setError("Không thể tải số liệu kiểm duyệt từ API.");
    } finally {
      setIsLoading(false);
    }
  }, [setCount]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return (
    <div className="space-y-gutter">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="mb-2 font-headline-lg text-headline-lg text-on-surface">
            Tổng quan kiểm duyệt
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Dashboard hiện chỉ hiển thị dữ liệu thật từ hàng đợi tài liệu chờ
            duyệt.
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 border border-outline-variant px-4 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-high"
          disabled={isLoading}
          onClick={() => void loadDashboard()}
          type="button"
        >
          <MaterialIcon
            className={isLoading ? "animate-spin" : ""}
            name={isLoading ? "progress_activity" : "refresh"}
          />
          Làm mới
        </button>
      </div>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <ModeratorCard className="flex min-h-[220px] flex-col justify-between p-6 lg:col-span-4">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded bg-primary-fixed p-2 text-on-primary-fixed-variant">
                <MaterialIcon name="pending_actions" />
              </span>
              <ModeratorBadge tone="primary">Chờ xử lí</ModeratorBadge>
            </div>
            <p className="font-label-md text-label-md text-on-surface-variant">
              Tài liệu chờ duyệt
            </p>
          </div>
          <div>
            <p className="mt-4 font-display text-display text-on-surface">
              {isLoading ? "..." : formatCount(pendingTotal)}
            </p>
          </div>
        </ModeratorCard>

        <section className="relative flex min-h-[220px] flex-col justify-between overflow-hidden bg-primary-container p-8 text-on-primary-container lg:col-span-8">
          <div className="relative z-10">
            <h2 className="mb-2 font-headline-md text-headline-md">
              Hàng đợi kiểm duyệt tài liệu
            </h2>
            <p className="max-w-2xl font-body-md text-body-md opacity-90">
              Có {isLoading ? "..." : formatCount(pendingTotal)} tài liệu đang
              chờ moderator xem xét. Mở hàng đợi để duyệt, từ chối hoặc chạy hỗ
              trợ phân tích bằng AI.
            </p>
          </div>
          <div className="relative z-10 mt-8">
            <Link
              className="inline-flex bg-surface px-8 py-3 font-label-md text-label-md text-primary transition-opacity hover:opacity-90"
              href="/moderator/documents"
            >
              Đi tới hàng đợi
            </Link>
          </div>
        </section>

        <ModeratorCard className="p-6 lg:col-span-12">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-label-md text-label-md text-on-surface">
                Tài liệu mới chờ duyệt
              </h2>
              <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">
                Hiển thị tối đa {PENDING_PREVIEW_LIMIT} tài liệu mới nhất từ
                API.
              </p>
            </div>
            <Link
              className="inline-flex items-center gap-2 font-label-md text-label-md text-primary hover:underline"
              href="/moderator/documents"
            >
              Xem tất cả
              <MaterialIcon name="arrow_forward" />
            </Link>
          </div>

          {isLoading ? (
            <PendingDocumentSkeleton />
          ) : error ? (
            <EmptyState description={error} title="Không thể tải dashboard" />
          ) : pendingDocuments.length === 0 ? (
            <EmptyState
              description="Hiện không có tài liệu nào đang chờ duyệt."
              title="Hàng đợi đang trống"
            />
          ) : (
            <div>
              {pendingDocuments.map((document) => (
                <PendingDocumentRow document={document} key={document.id} />
              ))}
            </div>
          )}
        </ModeratorCard>
      </div>
    </div>
  );
}
