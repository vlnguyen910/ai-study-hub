import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { DocumentSubject, LibraryDocument } from "@/types/document.type";

import { RelatedDocumentCard } from "./RelatedDocumentCard";

interface Props {
  readonly documents: LibraryDocument[];
  readonly subject: DocumentSubject | null;
}

export function RelatedDocumentsSection({
  documents,
  subject,
}: Props): React.JSX.Element {
  const viewMoreHref = subject
    ? `/home?subjectId=${encodeURIComponent(subject.id)}`
    : "/home";

  return (
    <Card className="space-y-4 p-5">
      <h3 className="text-lg font-semibold">Tài liệu liên quan</h3>

      {documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map((document) => (
            <RelatedDocumentCard key={document.id} document={document} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-on-surface-variant">
          {subject
            ? "Chưa có tài liệu công khai khác trong cùng môn học."
            : "Chưa tìm thấy tài liệu liên quan."}
        </p>
      )}

      <Button
        variant="ghost"
        className="w-full"
        type="button"
        render={<Link href={viewMoreHref} />}
      >
        Xem thêm tài liệu tương tự
      </Button>
    </Card>
  );
}
