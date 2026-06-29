import {
  buildEmbeddedPreviewUrl,
  getDocumentPreviewType,
  shouldFetchRawTextPreview,
} from "@/features/documents/utils/document-preview";

describe("document preview", () => {
  it("maps supported file formats to their preview renderer", () => {
    expect(getDocumentPreviewType("PDF")).toBe("pdf");
    expect(getDocumentPreviewType("docx")).toBe("text");
    expect(getDocumentPreviewType("doc")).toBe("text");
    expect(getDocumentPreviewType("txt")).toBe("text");
    expect(getDocumentPreviewType("jpeg")).toBe("image");
    expect(getDocumentPreviewType("zip")).toBe("unsupported");
  });

  it("builds an embedded viewer URL only for document formats", () => {
    const fileUrl = "https://res.cloudinary.com/demo/raw/upload/notes.pdf";

    expect(buildEmbeddedPreviewUrl(fileUrl, "pdf")).toBe(
      `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(fileUrl)}`,
    );
    expect(buildEmbeddedPreviewUrl(fileUrl, "image")).toBe(fileUrl);
  });

  it("only fetches raw text for plain text files without extracted text", () => {
    expect(shouldFetchRawTextPreview("txt", "")).toBe(true);
    expect(shouldFetchRawTextPreview("docx", "")).toBe(false);
    expect(shouldFetchRawTextPreview("txt", "Already extracted")).toBe(false);
  });
});
