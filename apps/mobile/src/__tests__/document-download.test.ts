import {
  buildCloudinaryDownloadUrl,
  buildDownloadFileName,
} from "@/features/documents/utils/document-download";

describe("buildCloudinaryDownloadUrl", () => {
  it("adds Cloudinary's attachment transformation to delivery URLs", () => {
    expect(
      buildCloudinaryDownloadUrl(
        "https://res.cloudinary.com/demo/raw/upload/v123/study/notes.pdf",
      ),
    ).toBe(
      "https://res.cloudinary.com/demo/raw/upload/fl_attachment/v123/study/notes.pdf",
    );
  });

  it("does not duplicate an existing attachment transformation", () => {
    const url =
      "https://res.cloudinary.com/demo/raw/upload/fl_attachment/v123/notes.pdf";
    expect(buildCloudinaryDownloadUrl(url)).toBe(url);
  });

  it("leaves non-Cloudinary and invalid URLs unchanged", () => {
    expect(buildCloudinaryDownloadUrl("https://example.com/notes.pdf")).toBe(
      "https://example.com/notes.pdf",
    );
    expect(buildCloudinaryDownloadUrl("not-a-url")).toBe("not-a-url");
  });

  it("builds a safe download filename with the document extension", () => {
    expect(buildDownloadFileName("Giáo trình Cấu trúc dữ liệu", "PDF")).toBe(
      "Giao-trinh-Cau-truc-du-lieu.pdf",
    );
    expect(buildDownloadFileName("notes.docx", "docx")).toBe("notes.docx");
  });
});
