import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

import { DocumentHero } from "../components/DocumentHero";
import { DocumentPreview } from "../components/DocumentPreview";
import { FileInfoCard } from "../components/FileInfoCard";
import { RelatedDocumentCard } from "../components/RelatedDocumentCard";
import { AuthorCard } from "../components/AuthorCard";
import { fetchDocumentById, fetchDocuments } from "../../api";

interface DocumentDetailPageProps {
  readonly params: Promise<{
    readonly id: string;
  }>;
}

export default async function DocumentDetailPage({
  params,
}: DocumentDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const [document, relatedResponse] = await Promise.all([
    fetchDocumentById(id),
    fetchDocuments({ page: 1, limit: 5 }),
  ]);
  const relatedDocuments = (relatedResponse.documents ?? []).filter(
    (item) => item.id !== id,
  );
  const description = document.description ?? "";
  const descriptionBlocks = description
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const previewType = document.format?.toLowerCase() ?? "pdf";
  const preview = {
    type:
      previewType === "doc" || previewType === "docx"
        ? "docx"
        : previewType === "txt"
          ? "txt"
          : previewType === "png" ||
              previewType === "jpg" ||
              previewType === "jpeg"
            ? "image"
            : "pdf",
    fileUrl: document.fileUrl ?? undefined,
  } as const;
  const heroData = {
    id: document.id,
    title: document.title,
    author: {
      avatar:
        document.author?.name?.slice(0, 2).toUpperCase() ??
        document.subject?.code?.slice(0, 2).toUpperCase() ??
        "AH",
      name: document.author?.name ?? "Tác giả ẩn danh",
      role: document.subject?.name ?? "Tài liệu học tập",
    },
    stats: {
      views: "N/A",
      downloads: "N/A",
      likes: "N/A",
    },
  };

  return (
    <main
      className="
        mx-auto
        max-w-7xl
        space-y-6
        px-6
        py-8
      "
    >
      <DocumentHero data={heroData} />

      <div
        className="
          grid
          grid-cols-1
          gap-6
          lg:grid-cols-[1fr_320px]
        "
      >
        {/* Left */}
        <div className="space-y-6">
          <DocumentPreview preview={preview} />

          <Card className="space-y-5 p-6">
            <h2 className="text-xl font-semibold">Mô tả tài liệu</h2>

            <div className="space-y-4 leading-7 text-on-surface-variant">
              {descriptionBlocks.length > 0 ? (
                descriptionBlocks.map((block) => <p key={block}>{block}</p>)
              ) : (
                <p>Chưa có mô tả cho tài liệu này.</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {(document.subject?.name
                ? [document.subject.name, document.subject.code]
                : ["Tài liệu học tập"]
              ).map((tag) => (
                <span
                  key={tag}
                  className="
                    rounded-full
                    bg-surface-variant
                    px-3
                    py-1
                    text-xs
                  "
                >
                  {tag}
                </span>
              ))}
            </div>
          </Card>

          {/* Discussion */}
          <Card className="space-y-6 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Thảo luận (24)</h2>

              <Button variant="ghost">Mới nhất</Button>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Bình luận của bạn</span>

              <textarea
                id="document-comment"
                placeholder="Viết bình luận của bạn..."
                className="
                  min-h-[120px]
                  w-full
                  rounded-xl
                  border
                 border-outline
                 bg-surface
                  p-4
                  outline-none
                  transition-colors
                  focus:border-2
                 focus:border-primary
              "
              />
            </label>

            <div className="flex justify-end">
              <Button>Gửi bình luận</Button>
            </div>

            <div className="space-y-5">
              <p className="text-sm text-on-surface-variant">
                Bình luận đang được đồng bộ từ API ở bước tiếp theo.
              </p>
            </div>
          </Card>
        </div>

        {/* Right */}
        <aside className="space-y-6">
          <FileInfoCard
            data={{
              format: document.format?.toUpperCase() ?? "N/A",
              size: document.sizeInBytes
                ? `${(document.sizeInBytes / (1024 * 1024)).toFixed(1)} MB`
                : "N/A",
              pages: 1,
              language: document.subject?.name ?? "Tiếng Việt",
            }}
          />

          <Card className="space-y-4 p-5">
            <h3 className="text-lg font-semibold">Tài liệu liên quan</h3>

            <div className="space-y-4">
              {relatedDocuments.map((relatedDocument) => (
                <RelatedDocumentCard
                  key={relatedDocument.id}
                  document={{
                    title: relatedDocument.title,
                    author: relatedDocument.author?.name ?? "Ẩn danh",
                    rating: relatedDocument.subject?.name ?? "Tài liệu",
                  }}
                />
              ))}
            </div>

            <Button variant="ghost" className="w-full">
              Xem thêm tài liệu tương tự
            </Button>
          </Card>

          <AuthorCard
            author={{
              avatar: document.author?.name?.slice(0, 2).toUpperCase() ?? "AH",
              name: document.author?.name ?? "Tác giả ẩn danh",
              role: document.subject?.name ?? "Tài liệu học tập",
            }}
          />
        </aside>
      </div>
    </main>
  );
}
