"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

import { DocumentCard } from "../components/DocumentCard";
import { DocumentCarousel } from "../components/DocumentCarousel";
import { DocumentCardSkeleton } from "../components/DocumentSkeleton";
import { CommentCard } from "../components/CommentCard";

import { MOCK_DOCUMENTS } from "../../../../mockdata/documentMock";
import { MOCK_COMMENTS } from "../../../../mockdata/commentMock";

export default function HomePage(): React.JSX.Element {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-w-0 bg-gray-50">
      {/* ================= SECTION 1 ================= */}
      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Tài liệu gần đây</h2>

          <Button variant="ghost">Xem thêm</Button>
        </div>

        {loading && (
          <div className="mb-4 flex items-center gap-2">
            <Spinner size="sm" />

            <span className="text-sm text-on-surface-variant">
              Loading documents...
            </span>
          </div>
        )}

        <DocumentCarousel>
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <DocumentCardSkeleton key={index} />
              ))
            : MOCK_DOCUMENTS.map((doc) => (
                <DocumentCard
                  id={doc.id}
                  key={doc.id}
                  title={doc.title}
                  subtitle={doc.subtitle}
                  coverImage={doc.coverImage}
                  pageCount={doc.pageCount}
                />
              ))}
        </DocumentCarousel>
      </section>
      {/* ================= SECTION 2 ================= */}
      <section>
        <div className="grid grid-cols-3 gap-6">
          {/* LEFT: DISCUSSIONS */}
          <div className="col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Thảo luận gần đây</h2>

              <Button variant="ghost">Xem tất cả</Button>
            </div>

            <div className="space-y-4">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-32 bg-surface-variant animate-pulse rounded-lg"
                    />
                  ))
                : MOCK_COMMENTS.map((comment) => (
                    <CommentCard key={comment.id} data={comment} />
                  ))}
            </div>
          </div>

          {/* RIGHT: TRENDING */}
          <div className="col-span-1">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Xu hướng</h2>

              <Button variant="ghost">Xem thêm</Button>
            </div>

            <div className="space-y-4">
              {MOCK_DOCUMENTS.slice(0, 2).map((doc) => (
                <DocumentCard
                  id={doc.id}
                  key={doc.id}
                  title={doc.title}
                  subtitle={doc.subtitle}
                  coverImage={doc.coverImage}
                  pageCount={doc.pageCount}
                  className="max-w-full"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
