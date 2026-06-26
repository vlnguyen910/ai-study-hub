import { Button } from "@/components/ui/Button";

import { DocumentCard } from "../components/DocumentCard";
import { DocumentCarousel } from "../components/DocumentCarousel";
import { DocumentCardSkeleton } from "../components/DocumentSkeleton";
import { fetchDocuments } from "../../documents/api";

export default async function HomePage(): Promise<React.JSX.Element> {
  let documents: Awaited<ReturnType<typeof fetchDocuments>>["documents"] = [];

  try {
    const documentsResponse = await fetchDocuments({ page: 1, limit: 10 });
    documents = documentsResponse.documents ?? [];
  } catch {
    documents = [];
  }

  return (
    <div className="min-w-0 bg-background">
      {/* ================= SECTION 1 ================= */}
      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Tài liệu gần đây</h2>

          <Button variant="ghost">Xem thêm</Button>
        </div>

        <DocumentCarousel>
          {documents.length === 0
            ? Array.from({ length: 4 }).map((_, index) => (
                <DocumentCardSkeleton key={index} />
              ))
            : documents.map((doc) => (
                <DocumentCard
                  id={doc.id}
                  key={doc.id}
                  title={doc.title}
                  subtitle={
                    doc.subject?.name
                      ? `Môn học: ${doc.subject.name}`
                      : doc.author?.name
                        ? `Tác giả: ${doc.author.name}`
                        : "Tài liệu học tập mới"
                  }
                  coverImage={
                    doc.fileUrl ||
                    "https://images.unsplash.com/photo-1551288049-bebda4e38f71"
                  }
                  pageCount={1}
                />
              ))}
        </DocumentCarousel>
      </section>
    </div>
  );
}
