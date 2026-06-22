"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { IconButton } from "@/components/ui/IconButton";
import type { LibraryDocument } from "@/types/document.type";
import { formatDate } from "@/utils";

import {
  getDocumentFileIcon,
  getDocumentStatusDisplay,
} from "./documentCollection.utils";

const SUBJECT_GRADIENTS = [
  "from-[#667eea]/20 to-[#764ba2]/20",
  "from-[#f093fb]/20 to-[#f5576c]/20",
  "from-[#4facfe]/20 to-[#00f2fe]/20",
  "from-[#43e97b]/20 to-[#38f9d7]/20",
  "from-[#fa709a]/20 to-[#fee140]/20",
  "from-[#a18cd1]/20 to-[#fbc2eb]/20",
];

function getGradient(seed: string): string {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) & 0xffff;
  }
  return SUBJECT_GRADIENTS[hash % SUBJECT_GRADIENTS.length] as string;
}

interface Props {
  readonly document: LibraryDocument;
  readonly isMenuOpen: boolean;
  readonly isBusy: boolean;
  readonly onMenuToggle: () => void;
  readonly onMenuClose: () => void;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
  readonly onViewReason: () => void;
}

export function MyDocumentCard({
  document,
  isMenuOpen,
  isBusy,
  onMenuToggle,
  onMenuClose,
  onEdit,
  onDelete,
  onViewReason,
}: Props): React.JSX.Element {
  const [imageFailed, setImageFailed] = useState(false);
  const gradient = getGradient(document.subject?.code ?? document.id);
  const fileIcon = getDocumentFileIcon(document.publicId);
  const status = getDocumentStatusDisplay(document.status, document.isPublic);
  const thumbnailUrl = imageFailed ? null : document.fileUrl;

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface/80 shadow-sm shadow-black/5 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-black/10 focus-within:ring-2 focus-within:ring-primary/40">
      <Link
        href={`/documents/${document.id}`}
        className="block focus:outline-none"
      >
        <div
          className={`relative flex h-28 items-center justify-center overflow-hidden border-b border-outline-variant/40 bg-linear-to-br ${gradient}`}
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

          <span className="absolute right-3 top-3">
            <Badge tone={status.tone} className="text-[11px]">
              {status.label}
            </Badge>
          </span>
        </div>

        <div className="flex flex-col gap-2 p-4 pb-2">
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
        </div>
      </Link>

      <div className="relative mx-4 mt-auto flex min-h-9 items-center justify-between border-t border-outline-variant/40 py-1">
        <span className="text-[11px] text-on-surface-variant">
          {formatDate(document.createdAt)}
        </span>

        <IconButton
          type="button"
          ariaLabel={`Mở thao tác cho ${document.title}`}
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          disabled={isBusy}
          className="bg-transparent shadow-none hover:bg-surface-container"
          icon={
            <span className="material-symbols-outlined text-[20px]">
              more_vert
            </span>
          }
          onClick={onMenuToggle}
        />

        {isMenuOpen ? (
          <div
            role="menu"
            className="absolute bottom-10 right-0 z-20 w-44 overflow-hidden rounded-xl border border-outline-variant bg-surface py-1 shadow-lg shadow-black/10"
          >
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-on-surface hover:bg-surface-container"
              onClick={() => {
                onMenuClose();
                onEdit();
              }}
            >
              <span className="material-symbols-outlined text-[18px]">
                edit
              </span>
              Chỉnh sửa
            </button>
            {document.status === "REJECTED" ? (
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-on-surface hover:bg-surface-container"
                onClick={() => {
                  onMenuClose();
                  onViewReason();
                }}
              >
                <span className="material-symbols-outlined text-[18px]">
                  visibility
                </span>
                Xem lý do
              </button>
            ) : null}
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-error hover:bg-error-container"
              onClick={() => {
                onMenuClose();
                onDelete();
              }}
            >
              <span className="material-symbols-outlined text-[18px]">
                delete
              </span>
              Xóa tài liệu
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
