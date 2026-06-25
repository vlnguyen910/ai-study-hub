"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { fetchDocumentDetail, fetchDocuments } from "@/apis/document.api";
import { BackButton } from "@/components/ui/BackButton";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { DocumentDetail, LibraryDocument } from "@/types/document.type";

import { DocumentHero } from "../components/DocumentHero";
import { DocumentPreview } from "../components/DocumentPreview";
import { DocumentSummaryCard } from "../components/DocumentSummaryCard";
import { FileInfoCard } from "../components/FileInfoCard";
import { RelatedDocumentsSection } from "../components/RelatedDocumentsSection";
import type { DocumentPreviewData } from "../type";
import { loadDocumentPreview } from "../utils/document-preview";

function DetailPageSkeleton(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-[1500px] animate-pulse space-y-6 px-6 py-8">
      <div className="h-10 w-28 rounded-full bg-surface-variant" />
      <div className="h-36 rounded-2xl bg-surface-variant" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <div className="h-80 rounded-2xl bg-surface-variant" />
          <div className="h-40 rounded-2xl bg-surface-variant" />
        </div>
        <div className="space-y-6">
          <div className="h-48 rounded-2xl bg-surface-variant" />
          <div className="h-28 rounded-2xl bg-surface-variant" />
          <div className="h-40 rounded-2xl bg-surface-variant" />
        </div>
      </div>
    </main>
  );
}

function NotFoundState({ message }: { message: string }): React.JSX.Element {
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <BackButton fallbackHref="/home" />
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <span className="material-symbols-outlined mb-4 text-6xl text-on-surface-variant/40">
          search_off
        </span>
        <h2 className="text-xl font-semibold text-on-surface">{message}</h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Tài liệu có thể đã bị xóa, chưa được duyệt hoặc bạn không có quyền
          xem.
        </p>
      </div>
    </main>
  );
}

function isPublicDocument(document: LibraryDocument): boolean {
  return document.status === "ACTIVE" && document.isPublic;
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
        const detail = await fetchDocumentDetail(id);
        setDocument(detail);

        try {
          const relatedResponse = await fetchDocuments({
            subjectId: detail.subject?.id,
            status: "ACTIVE",
            limit: 4,
          });
          setRelatedDocuments(
            relatedResponse.documents
              .filter(
                (relatedDocument) =>
                  relatedDocument.id !== id &&
                  isPublicDocument(relatedDocument),
              )
              .slice(0, 3),
          );
        } catch (relatedError) {
          console.error("Could not load related documents", relatedError);
          setRelatedDocuments([]);
        }

        try {
          setPreview(await loadDocumentPreview(detail));
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

    void loadData();
  }, [id]);

  if (isLoading) return <DetailPageSkeleton />;

  if (error || !document) {
    return <NotFoundState message={error ?? "Tài liệu không tồn tại."} />;
  }

  return (
    <main className="mx-auto max-w-[1500px] space-y-6 px-6 py-8">
      <BackButton fallbackHref="/home" />
      <DocumentHero document={document} />

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6 xl:pr-2">
          <DocumentPreview preview={preview ?? { type: "unsupported" }} />

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
        </div>

        <aside className="space-y-6 xl:sticky xl:top-6">
          <DocumentSummaryCard
            documentId={document.id}
            initialSummary={document.aiSummary}
          />
          <FileInfoCard
            format={document.format}
            sizeInBytes={document.sizeInBytes}
          />
          <RelatedDocumentsSection
            documents={relatedDocuments}
            subject={document.subject}
          />
        </aside>
      </div>
    </main>
  );
}
