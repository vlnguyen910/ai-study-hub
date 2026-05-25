import { Card } from "@/components/ui/Card";
import { DocumentHero } from "../components/DocumentHero";
import { DocumentPreview } from "../components/DocumentPreview";
import { documentDetailMock } from "../../../../mockdata/documents.detail";
import { Button } from "@/components/ui/Button";
import { FileInfoCard } from "../components/FileInfoCard";
import { RelatedDocumentCard } from "../components/RelatedDocumentCard";
import { AuthorCard } from "../components/AuthorCard";

export default function DocumentDetailPage(): React.JSX.Element {
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
      <DocumentHero data={documentDetailMock} />

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
          <DocumentPreview preview={documentDetailMock.preview} />

          {/* Description */}
          <Card className="space-y-5 p-6">
            <h2 className="text-xl font-semibold">Mô tả tài liệu</h2>

            <p className="leading-7 text-on-surface-variant">
              {documentDetailMock.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {documentDetailMock.tags.map((tag) => (
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

            <textarea
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
              "
            />

            <div className="flex justify-end">
              <Button>Gửi bình luận</Button>
            </div>

            <div className="space-y-5">
              {documentDetailMock.comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <div
                    className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        bg-slate-300
                        text-sm
                        font-medium
                      "
                  >
                    {comment.author.charAt(0)}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">{comment.author}</h4>

                    <p className="text-sm text-on-surface-variant">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right */}
        <aside className="space-y-6">
          <FileInfoCard data={documentDetailMock.fileInfo} />

          <Card className="space-y-4 p-5">
            <h3 className="text-lg font-semibold">Tài liệu liên quan</h3>

            <div className="space-y-4">
              {documentDetailMock.relatedDocuments.map((document) => (
                <RelatedDocumentCard key={document.id} document={document} />
              ))}
            </div>

            <Button variant="ghost" className="w-full">
              Xem thêm tài liệu tương tự
            </Button>
          </Card>

          <AuthorCard author={documentDetailMock.author} />
        </aside>
      </div>
    </main>
  );
}
