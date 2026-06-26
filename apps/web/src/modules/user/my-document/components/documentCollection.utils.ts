import type { DocumentStatus } from "@/types/document.type";

interface StatusDisplay {
  readonly label: string;
  readonly tone: "success" | "warning" | "error" | "neutral";
}

export function getDocumentStatusDisplay(
  status: DocumentStatus,
  isPublic: boolean,
): StatusDisplay {
  if (status === "ACTIVE") {
    return isPublic
      ? { label: "Đã duyệt", tone: "success" }
      : { label: "Riêng tư", tone: "neutral" };
  }
  if (status === "PENDING") {
    return { label: "Chờ duyệt", tone: "warning" };
  }
  if (status === "REJECTED") {
    return { label: "Bị từ chối", tone: "error" };
  }
  return { label: "Đã xóa", tone: "neutral" };
}

export function getDocumentFileIcon(publicId: string): string {
  const lower = publicId.toLowerCase();
  if (lower.includes("pdf")) return "picture_as_pdf";
  if (lower.includes("docx") || lower.includes("doc")) return "description";
  if (lower.includes("pptx") || lower.includes("ppt")) return "slideshow";
  return "draft";
}
