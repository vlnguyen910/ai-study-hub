import Link from "next/link";
import type { FC } from "react";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/utils";
import type { LibraryDocument } from "@/types/document.type";

interface DocumentCardProps {
  document: LibraryDocument;
}

/**
 * File-type icon name (Material Symbols) inferred from Cloudinary publicId extension.
 * Falls back to a generic document icon when format is unknown.
 */
const getFileIcon = (publicId: string): string => {
  const lower = publicId.toLowerCase();
  if (lower.endsWith(".pdf") || lower.includes("pdf")) return "picture_as_pdf";
  if (
    lower.endsWith(".docx") ||
    lower.endsWith(".doc") ||
    lower.includes("docx")
  )
    return "description";
  return "draft";
};

/**
 * Deterministic pastel gradient for the card thumbnail area.
 * Based on subject code so the same subject always gets the same colour.
 */
const subjectGradients = [
  "from-[#667eea]/20 to-[#764ba2]/20",
  "from-[#f093fb]/20 to-[#f5576c]/20",
  "from-[#4facfe]/20 to-[#00f2fe]/20",
  "from-[#43e97b]/20 to-[#38f9d7]/20",
  "from-[#fa709a]/20 to-[#fee140]/20",
  "from-[#a18cd1]/20 to-[#fbc2eb]/20",
];

const getGradient = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0xffff;
  }
  // Modulo guarantees an in-bounds index, so the value is always defined.
  return subjectGradients[hash % subjectGradients.length] as string;
};

export const DocumentCard: FC<DocumentCardProps> = ({ document }) => {
  const gradient = getGradient(document.subject?.code ?? document.id);
  const fileIcon = getFileIcon(document.publicId);

  return (
    <Link
      href={`/documents/${document.id}`}
      className="group block focus:outline-none"
    >
      <article
        className="
          relative flex flex-col overflow-hidden
          rounded-2xl
          border border-outline-variant/60
          bg-surface/80 backdrop-blur-md
          shadow-sm shadow-black/5
          transition-all duration-200
          hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/10
          hover:border-primary/30
          focus-within:ring-2 focus-within:ring-primary/40
        "
      >
        {/* ── Thumbnail area ── */}
        <div
          className={`relative flex h-28 items-center justify-center bg-linear-to-br ${gradient} border-b border-outline-variant/40`}
        >
          <span className="material-symbols-outlined text-5xl text-on-surface/30">
            {fileIcon}
          </span>

          {/* Subject badge — top left */}
          {document.subject ? (
            <span className="absolute left-3 top-3">
              <Badge tone="neutral" className="text-[11px]">
                {document.subject.code}
              </Badge>
            </span>
          ) : null}

          {/* Status badge — top right (only shown for non-ACTIVE docs) */}
          {document.status !== "ACTIVE" ? (
            <span className="absolute right-3 top-3">
              <Badge
                tone={document.status === "PENDING" ? "warning" : "error"}
                className="text-[11px]"
              >
                {document.status === "PENDING" ? "Chờ duyệt" : document.status}
              </Badge>
            </span>
          ) : null}
        </div>

        {/* ── Content area ── */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          {/* Title */}
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-on-surface group-hover:text-primary transition-colors">
            {document.title}
          </h3>

          {/* Author row */}
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            {/* Avatar placeholder */}
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary uppercase">
              {document.author.name.charAt(0)}
            </span>
            <span className="truncate">{document.author.name}</span>
          </div>

          {/* Subject full name */}
          {document.subject ? (
            <p className="truncate text-xs text-on-surface-variant">
              {document.subject.name}
            </p>
          ) : null}

          {/* Footer — date */}
          <div className="mt-auto flex items-center justify-between pt-2 border-t border-outline-variant/40">
            <span className="text-[11px] text-on-surface-variant">
              {formatDate(document.createdAt)}
            </span>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant/60 transition-colors group-hover:text-primary">
              arrow_forward
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};
