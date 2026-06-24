"use client";

import Image from "next/image";
import Link from "next/link";
import type { FC } from "react";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { QuickSavePopover } from "@/modules/collections/components/QuickSavePopover";
import type { LibraryDocument } from "@/types/document.type";
import { formatDate } from "@/utils";

interface DocumentCardProps {
  document: LibraryDocument;
}

const getFileIcon = (publicId: string): string => {
  const lower = publicId.toLowerCase();
  if (lower.endsWith(".pdf") || lower.includes("pdf")) return "picture_as_pdf";
  if (
    lower.endsWith(".docx") ||
    lower.endsWith(".doc") ||
    lower.includes("docx")
  ) {
    return "description";
  }
  if (lower.includes("ppt")) return "slideshow";
  return "draft";
};

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
  return subjectGradients[hash % subjectGradients.length] as string;
};

const formatBytes = (bytes?: number): string => {
  if (!bytes) return "";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export const DocumentCard: FC<DocumentCardProps> = ({ document }) => {
  const gradient = getGradient(document.subject?.code ?? document.id);
  const fileIcon = getFileIcon(document.publicId);
  const [imageFailed, setImageFailed] = useState(false);

  const getThumbnailUrl = (url: string | undefined): string | null => {
    if (!url) return null;
    const lower = url.toLowerCase();

    if (lower.includes("cloudinary.com") && lower.endsWith(".pdf")) {
      return url.slice(0, -4) + ".jpg";
    }

    if (
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg") ||
      lower.endsWith(".png") ||
      lower.endsWith(".webp") ||
      lower.endsWith(".gif")
    ) {
      return url;
    }

    return null;
  };

  const thumbnailUrl = imageFailed ? null : getThumbnailUrl(document.fileUrl);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface/80 shadow-sm shadow-black/5 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-black/10 focus-within:ring-2 focus-within:ring-primary/40">
      <Link
        href={`/documents/${document.id}`}
        className="block focus:outline-none"
      >
        <div
          className={`relative flex h-48 items-center justify-center overflow-hidden border-b border-outline-variant/40 bg-linear-to-br ${gradient}`}
        >
          {thumbnailUrl ? (
            <Image
              alt={document.title}
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              fill
              onError={() => setImageFailed(true)}
              sizes="(max-width: 768px) 100vw, 320px"
              src={thumbnailUrl}
            />
          ) : (
            <span className="material-symbols-outlined text-5xl text-on-surface/30">
              {fileIcon}
            </span>
          )}

          <div className="absolute inset-0 bg-black/5" />

          {document.subject ? (
            <span className="absolute left-3 top-3">
              <Badge tone="neutral" className="text-[11px]">
                {document.subject.code}
              </Badge>
            </span>
          ) : null}

          {document.aiScore !== undefined ? (
            <span className="absolute right-3 top-3">
              <Badge
                tone="neutral"
                className="flex items-center gap-0.5 border-none bg-linear-to-r from-cyan-500 to-blue-500 text-[11px] font-extrabold text-white shadow-xs"
              >
                <span className="material-symbols-outlined text-[10px] !text-white">
                  bolt
                </span>
                <span>{document.aiScore}% Match</span>
              </Badge>
            </span>
          ) : document.status !== "ACTIVE" ? (
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

        <div className="flex flex-1 flex-col gap-2 p-4 pb-2">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-on-surface transition-colors group-hover:text-primary">
            {document.title}
          </h3>

          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold uppercase text-primary">
              {document.author.name.charAt(0)}
            </span>
            <span className="truncate">{document.author.name}</span>
          </div>

          {document.subject ? (
            <p className="truncate text-xs text-on-surface-variant">
              {document.subject.name}
            </p>
          ) : null}

          {document.description ? (
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-on-surface-variant/75">
              {document.description}
            </p>
          ) : null}
        </div>
      </Link>

      <div className="mx-4 mt-auto flex items-center justify-between gap-3 border-t border-outline-variant/40 py-2">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-on-surface-variant">
          <span>{formatDate(document.createdAt)}</span>
          {document.format ? (
            <>
              <span className="text-outline-variant/40">•</span>
              <span className="font-semibold uppercase text-primary">
                {document.format}
              </span>
            </>
          ) : null}
          {document.sizeInBytes !== undefined && document.sizeInBytes > 0 ? (
            <>
              <span className="text-outline-variant/40">•</span>
              <span>{formatBytes(document.sizeInBytes)}</span>
            </>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <QuickSavePopover
            documentId={document.id}
            documentTitle={document.title}
          />
          <Link
            href={`/documents/${document.id}`}
            aria-label={`Mở ${document.title}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant/60 transition-colors hover:bg-surface-container hover:text-primary"
          >
            <span className="material-symbols-outlined text-[16px]">
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
};
