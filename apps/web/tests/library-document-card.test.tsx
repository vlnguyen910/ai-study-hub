import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DocumentCard } from "../src/modules/library/components/DocumentCard";
import { MyDocumentCard } from "../src/modules/user/my-document/components/MyDocumentCard";
import type { LibraryDocument } from "../src/types/document.type";

const document: LibraryDocument = {
  id: "document-1",
  title: "Tài liệu có ảnh",
  fileUrl:
    "https://res.cloudinary.com/ddxstobvd/image/upload/v1/documents/cover.png",
  publicId: "documents/cover.png",
  status: "ACTIVE",
  isPublic: true,
  createdAt: "2026-06-22T00:00:00.000Z",
  updatedAt: "2026-06-22T00:00:00.000Z",
  author: {
    id: "author-1",
    name: "Nguyễn Văn A",
    avatarUrl: null,
  },
  subject: {
    id: "subject-1",
    name: "Kiến trúc phần mềm",
    code: "SWA",
  },
};

describe("library document card", () => {
  it("uses the fileUrl returned by the documents API as its image source", () => {
    render(<DocumentCard document={document} />);

    expect(screen.getByRole("img", { name: document.title })).toHaveAttribute(
      "src",
      document.fileUrl,
    );
  });

  it("uses fileUrl for the card view on the my-documents page", () => {
    render(
      <MyDocumentCard
        document={document}
        isMenuOpen={false}
        isBusy={false}
        onMenuToggle={vi.fn()}
        onMenuClose={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onViewReason={vi.fn()}
      />,
    );

    expect(screen.getByRole("img", { name: document.title })).toHaveAttribute(
      "src",
      document.fileUrl,
    );
  });
});
