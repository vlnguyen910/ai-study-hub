import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SideNav } from "../src/components/layout/SideNav";
import { DocumentContributionBanner } from "../src/modules/user/my-document/components/DocumentContributionBanner";
import { DocumentCardView } from "../src/modules/user/my-document/components/DocumentCardView";
import { DocumentCollection } from "../src/modules/user/my-document/components/DocumentCollection";
import { DocumentTableView } from "../src/modules/user/my-document/components/DocumentTableView";
import { DocumentStatsBar } from "../src/modules/user/my-document/components/DocumentStatsBar";
import type { LibraryDocument } from "../src/types/document.type";
import { navigationMocks } from "./setup";

const document: LibraryDocument = {
  id: "document-1",
  title: "Bài giảng xác suất thống kê",
  fileUrl:
    "https://res.cloudinary.com/demo/raw/upload/v1/documents/probability.pdf",
  publicId: "documents/probability.pdf",
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
    name: "Toán ứng dụng",
    code: "MATH101",
  },
};

describe("my documents ui", () => {
  beforeEach(() => {
    navigationMocks.pathname.mockReturnValue("/");
  });

  it("defaults to card view when my documents page loads", () => {
    render(
      <DocumentCollection
        documents={[document]}
        pagination={null}
        isLoading={false}
        error={null}
        skeletonCount={4}
        onPageChange={vi.fn()}
        onRequestDelete={vi.fn()}
        onEdit={vi.fn()}
        deletingId={null}
        savingId={null}
      />,
    );

    expect(screen.getByRole("button", { pressed: true }).textContent).toContain(
      "Thẻ",
    );
  });

  it("shows upload CTA in the empty table view", () => {
    render(
      <DocumentTableView
        documents={[]}
        isLoading={false}
        isSearching={false}
        skeletonCount={4}
        deletingId={null}
        savingId={null}
        onEdit={vi.fn()}
        onRequestDelete={vi.fn()}
        onViewReason={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Trống trải quá, upload thêm tài liệu đi!"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Tải lên tài liệu" }),
    ).toHaveAttribute("href", "/uploads");
  });

  it("shows upload CTA in the empty card view", () => {
    render(
      <DocumentCardView
        documents={[]}
        isLoading={false}
        isSearching={false}
        skeletonCount={4}
        deletingId={null}
        savingId={null}
        onEdit={vi.fn()}
        onRequestDelete={vi.fn()}
        onViewReason={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Trống trải quá, upload thêm tài liệu đi!"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Tải lên tài liệu" }),
    ).toHaveAttribute("href", "/uploads");
  });

  it("links the sidebar logo to the home page", () => {
    render(<SideNav title="AI Study Hub" items={[]} />);

    const links = screen.getAllByRole("link", { name: /AI Study Hub home/i });
    expect(links.length).toBeGreaterThan(0);

    for (const link of links) {
      expect(link).toHaveAttribute("href", "/");
    }
  });

  it("renders the stats bar values", () => {
    render(
      <DocumentStatsBar
        total={12}
        approved={7}
        pending={3}
        isLoading={false}
      />,
    );

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders the contribution banner and links to uploads", () => {
    render(<DocumentContributionBanner isVisible />);

    expect(
      screen.getByText(/Có tài liệu mới muốn chia sẻ/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Đóng góp ngay/i }),
    ).toHaveAttribute("href", "/uploads");
  });

  it("shows the contribution banner below the collection when documents exist", () => {
    render(
      <DocumentCollection
        documents={[document]}
        pagination={{
          page: 1,
          limit: 4,
          total: 1,
          totalPages: 1,
        }}
        isLoading={false}
        error={null}
        skeletonCount={4}
        onPageChange={vi.fn()}
        onRequestDelete={vi.fn()}
        onEdit={vi.fn()}
        deletingId={null}
        savingId={null}
      />,
    );

    expect(
      screen.getByText(/Có tài liệu mới muốn chia sẻ/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Đóng góp ngay/i }),
    ).toHaveAttribute("href", "/uploads");
  });
});
