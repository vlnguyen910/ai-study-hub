"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  fetchDocumentDetail,
  fetchDocuments,
  generateDocumentSummary,
} from "@/apis/document.api";
import { toast } from "sonner";
import type { DocumentDetail, LibraryDocument } from "@/types/document.type";

import { DocumentHero } from "../components/DocumentHero";
import { DocumentPreview } from "../components/DocumentPreview";
import { FileInfoCard } from "../components/FileInfoCard";
import { RelatedDocumentCard } from "../components/RelatedDocumentCard";
import { AuthorCard } from "../components/AuthorCard";
import { loadDocumentPreview } from "../utils/document-preview";
import type { DocumentPreviewData } from "../type";

function DetailPageSkeleton(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-8 animate-pulse">
      <div className="h-36 rounded-2xl bg-surface-variant" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="h-80 rounded-2xl bg-surface-variant" />
          <div className="h-40 rounded-2xl bg-surface-variant" />
        </div>
        <div className="space-y-6">
          <div className="h-28 rounded-2xl bg-surface-variant" />
          <div className="h-40 rounded-2xl bg-surface-variant" />
          <div className="h-32 rounded-2xl bg-surface-variant" />
        </div>
      </div>
    </main>
  );
}

function NotFoundState({ message }: { message: string }): React.JSX.Element {
  return (
    <main className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-32 text-center">
      <span className="material-symbols-outlined mb-4 text-6xl text-on-surface-variant/40">
        search_off
      </span>
      <h2 className="text-xl font-semibold text-on-surface">{message}</h2>
      <p className="mt-2 text-sm text-on-surface-variant">
        Tài liệu có thể đã bị xóa, chưa được duyệt, hoặc bạn không có quyền xem.
      </p>
    </main>
  );
}

export default function DocumentDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();

  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [preview, setPreview] = useState<DocumentPreviewData | null>(null);
  const [relatedDocuments, setRelatedDocuments] = useState<LibraryDocument[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const doc = await fetchDocumentDetail(id);
        setDocument(doc);
        setRelatedDocuments([]);

        if (doc.subject?.id) {
          try {
            const relatedResponse = await fetchDocuments({
              subjectId: doc.subject.id,
              limit: 4,
            });

            const filtered = relatedResponse.documents
              .filter((d) => d.id !== id)
              .slice(0, 3);

            setRelatedDocuments(filtered);
          } catch (relatedError) {
            console.error("Could not load related documents", relatedError);
          }
        }

        try {
          setPreview(await loadDocumentPreview(doc));
        } catch (previewError) {
          console.error("Could not load document preview", previewError);
          setPreview(null);
        }
      } catch {
        setError("Không thể tải tài liệu. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const handleGenerateSummary = async () => {
    if (!document) return;
    setIsGeneratingSummary(true);
    try {
      const summaryText = await generateDocumentSummary(document.id);
      setDocument({
        ...document,
        aiSummary: summaryText,
      });
      toast.success("Đã tạo bản tóm tắt tài liệu bằng AI thành công!");
    } catch (err: any) {
      console.error("Failed to generate summary", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Không thể tạo tóm tắt bằng AI. Vui lòng thử lại sau.",
      );
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const renderSummary = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let processed = line;
      const isBullet =
        line.trim().startsWith("-") || line.trim().startsWith("*");
      if (isBullet) {
        processed = line.trim().replace(/^[-*]\s*/, "");
      }

      const parts = processed.split(/\*\*([^*]+)\*\*/g);
      const content = parts.map((part, i) => {
        if (i % 2 === 1) {
          return (
            <strong
              key={i}
              className="font-semibold text-purple-700 dark:text-purple-300"
            >
              {part}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <div
            key={idx}
            className="ml-4 flex gap-2 text-sm leading-relaxed text-on-surface-variant"
          >
            <span className="text-purple-500">•</span>
            <span>{content}</span>
          </div>
        );
      }

      return (
        <p
          key={idx}
          className="text-sm leading-relaxed text-on-surface-variant min-h-[1rem]"
        >
          {content}
        </p>
      );
    });
  };

  if (isLoading) return <DetailPageSkeleton />;

  if (error || !document) {
    return <NotFoundState message={error ?? "Tài liệu không tồn tại."} />;
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <DocumentHero document={document} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <DocumentPreview preview={preview ?? { type: "unsupported" }} />

          {/* AI Summary Card */}
          <Card className="relative overflow-hidden border-purple-500/20 bg-gradient-to-br from-purple-50/50 to-indigo-50/30 p-6 dark:from-purple-950/10 dark:to-indigo-950/5">
            {/* Ambient background glow */}
            <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl" />

            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-purple-600 dark:text-purple-400 animate-pulse">
                auto_awesome
              </span>
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-indigo-400">
                Tóm tắt tài liệu bằng AI
              </h2>
              {document.aiSummary && (
                <Badge
                  tone="neutral"
                  className="ml-auto bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                >
                  AI Generated
                </Badge>
              )}
            </div>

            <div className="mt-4">
              {document.aiSummary ? (
                <div className="space-y-3">
                  {renderSummary(document.aiSummary)}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="mb-4 text-sm text-on-surface-variant max-w-md">
                    Tài liệu này chưa có bản tóm tắt AI. Hãy tạo một bản tóm tắt
                    cấu trúc để nhanh chóng hiểu nội dung tài liệu.
                  </p>
                  <Button
                    onClick={handleGenerateSummary}
                    disabled={isGeneratingSummary}
                    className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-md transition-all duration-300 disabled:opacity-75"
                  >
                    {isGeneratingSummary ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="h-4 w-4 animate-spin text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Đang tạo tóm tắt...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">
                          auto_awesome
                        </span>
                        Tạo tóm tắt bằng AI
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {document.description ? (
            <Card className="space-y-5 p-6">
              <h2 className="text-xl font-semibold">Mô tả tài liệu</h2>
              <p className="whitespace-pre-line leading-7 text-on-surface-variant">
                {document.description}
              </p>
              {document.subject ? (
                <div className="flex flex-wrap gap-2">
                  <Badge tone="neutral">#{document.subject.code}</Badge>
                  <Badge tone="neutral">
                    #{document.subject.name.replace(/\s+/g, "")}
                  </Badge>
                </div>
              ) : null}
            </Card>
          ) : null}

          <Card className="space-y-6 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Thảo luận</h2>
              <Badge tone="neutral">Sắp ra mắt</Badge>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Bình luận của bạn</span>
              <textarea
                placeholder="Viết bình luận của bạn..."
                disabled
                className="
                  min-h-30 w-full rounded-xl border border-outline
                  bg-surface p-4 outline-none transition-colors
                  disabled:cursor-not-allowed disabled:opacity-50
                "
              />
            </label>

            <div className="flex justify-end">
              <Button disabled>Gửi bình luận</Button>
            </div>

            <p className="text-center text-sm text-on-surface-variant">
              Chức năng bình luận đang được phát triển.
            </p>
          </Card>
        </div>

        <aside className="space-y-6">
          <FileInfoCard
            format={document.format}
            sizeInBytes={document.sizeInBytes}
          />

          <Card className="space-y-4 p-5">
            <h3 className="text-lg font-semibold">Tài liệu liên quan</h3>

            {relatedDocuments.length > 0 ? (
              <div className="space-y-3">
                {relatedDocuments.map((relatedDoc) => (
                  <RelatedDocumentCard
                    key={relatedDoc.id}
                    document={relatedDoc}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">
                {document.subject
                  ? "Chưa có tài liệu liên quan trong cùng môn học."
                  : "Tài liệu này chưa được gắn môn học."}
              </p>
            )}

            {relatedDocuments.length > 0 ? (
              <Button variant="ghost" className="w-full" type="button">
                Xem thêm tài liệu tương tự
              </Button>
            ) : null}
          </Card>

          <AuthorCard author={document.author} />
        </aside>
      </div>
    </main>
  );
}
