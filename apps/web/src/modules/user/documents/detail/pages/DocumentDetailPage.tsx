"use client";

/**
 * DocumentDetailPage
 *
 * Converted from a server component to a client component so it can use
 * the shared `apiClient` (which auto-attaches JWT and auto-unwraps responses).
 * Server components cannot use the Zustand-backed axios instance because
 * the persist middleware accesses localStorage at initialisation time.
 *
 * Data strategy:
 *  - Primary document  → fetchDocumentDetail(id)
 *  - Related documents → fetchDocuments({ subjectId }) using the same subject
 *    as the current document (real API call, not mock data).
 *  - Comments          → UI placeholder; the API does not expose a comments
 *                        endpoint yet (APP_CONFIG.features.enableComments = false).
 */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

import { fetchDocumentDetail, fetchDocuments } from "@/apis/document.api";
import type { DocumentDetail, LibraryDocument } from "@/types/document.type";
import type { DocumentPreviewData } from "../type";

import { DocumentHero } from "../components/DocumentHero";
import { DocumentPreview } from "../components/DocumentPreview";
import { FileInfoCard } from "../components/FileInfoCard";
import { RelatedDocumentCard } from "../components/RelatedDocumentCard";
import { AuthorCard } from "../components/AuthorCard";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maps the backend `format` string (Cloudinary file extension) to the union
 * type expected by DocumentPreview.
 *
 * - "pdf"        → full PDF renderer (react-pdf)
 * - "docx"/"doc" → docx renderer needs a Blob; without one it falls back to
 *                  UnsupportedPreview, which still shows the file icon and
 *                  lets the user download via the hero button.
 * - others       → UnsupportedPreview (e.g. ZIP, PPTX, images)
 */
function buildPreviewData(
  format: string,
  fileUrl: string,
): DocumentPreviewData {
  switch (format.toLowerCase()) {
    case "pdf":
      return { type: "pdf", fileUrl };
    case "docx":
    case "doc":
      // Docx preview requires a Blob fetched client-side; skipped for now.
      return { type: "docx" };
    case "txt":
      // Text content would need a separate fetch; skipped for now.
      return { type: "txt" };
    default:
      // Unsupported format → the preview component renders a download prompt.
      return { type: "pdf" }; // type is required; fileUrl omitted → UnsupportedPreview branch
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────────────────────────

function DetailPageSkeleton(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-8 animate-pulse">
      {/* Hero skeleton */}
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

// ─────────────────────────────────────────────────────────────────────────────
// Error / not-found state
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function DocumentDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();

  const [document, setDocument] = useState<DocumentDetail | null>(null);
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
        // ── 1. Fetch the primary document ──────────────────────────────────
        const doc = await fetchDocumentDetail(id);
        setDocument(doc);

        // ── 2. Fetch related documents (same subject, excluding current) ───
        // Only runs when the document belongs to a subject; falls back to
        // empty array so the sidebar degrades gracefully.
        if (doc.subject?.id) {
          const relatedResponse = await fetchDocuments({
            subjectId: doc.subject.id,
            limit: 4,
          });

          const filtered = relatedResponse.documents
            .filter((d) => d.id !== id) // exclude the current document
            .slice(0, 3); // cap at 3 items in the sidebar

          setRelatedDocuments(filtered);
        }
      } catch {
        setError("Không thể tải tài liệu. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) return <DetailPageSkeleton />;

  // ── Error / not found ─────────────────────────────────────────────────────
  if (error || !document) {
    return <NotFoundState message={error ?? "Tài liệu không tồn tại."} />;
  }

  // ── Build preview data from format + fileUrl ──────────────────────────────
  const preview = buildPreviewData(document.format, document.fileUrl);

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      {/* ── Hero: title, author, actions ── */}
      <DocumentHero document={document} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* ══════════════ LEFT COLUMN ══════════════ */}
        <div className="space-y-6">
          {/* Preview panel (PDF / DOCX / TXT / image depending on format) */}
          <DocumentPreview preview={preview} />

          {/* Description — omitted entirely when the author left it blank */}
          {document.description ? (
            <Card className="space-y-5 p-6">
              <h2 className="text-xl font-semibold">Mô tả tài liệu</h2>

              <p className="whitespace-pre-line leading-7 text-on-surface-variant">
                {document.description}
              </p>

              {/*
               * The current API has no tags field.
               * We surface the subject name as a single metadata chip so
               * the section is never completely empty.
               */}
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

          {/* ── Discussion ────────────────────────────────────────────────
           *  Comment posting and listing are not yet implemented in the API
           *  (APP_CONFIG.features.enableComments = false).
           *  The UI renders the form so the design is complete; the submit
           *  button is non-functional until the feature is enabled.
           */}
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

        {/* ══════════════ RIGHT SIDEBAR ══════════════ */}
        <aside className="space-y-6">
          {/* File metadata: format + size from real API */}
          <FileInfoCard
            format={document.format}
            sizeInBytes={document.sizeInBytes}
          />

          {/* Related documents ───────────────────────────────────────────
           *  Fetched from the same subject via fetchDocuments({ subjectId }).
           *  Shows an "updating" placeholder when the document has no subject
           *  or when the subject has no other public documents.
           */}
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

          {/* Author profile */}
          <AuthorCard author={document.author} />
        </aside>
      </div>
    </main>
  );
}
