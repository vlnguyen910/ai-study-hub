export type DocumentPreviewType =
  | "pdf"
  | "office"
  | "text"
  | "image"
  | "unsupported";

const IMAGE_FORMATS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "bmp",
  "svg",
]);

export function getDocumentPreviewType(format: string): DocumentPreviewType {
  const normalizedFormat = format.trim().toLowerCase().replace(/^\.+/, "");

  if (normalizedFormat === "pdf") return "pdf";
  if (normalizedFormat === "doc" || normalizedFormat === "docx") {
    return "office";
  }
  if (normalizedFormat === "txt") return "text";
  if (IMAGE_FORMATS.has(normalizedFormat)) return "image";
  return "unsupported";
}

export function buildEmbeddedPreviewUrl(
  fileUrl: string,
  previewType: DocumentPreviewType,
): string {
  if (previewType !== "pdf" && previewType !== "office") {
    return fileUrl;
  }

  return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(fileUrl)}`;
}
