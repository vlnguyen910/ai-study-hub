import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { DocumentDetail } from "@/types/document.type";
import { formatDate } from "@/utils";
import { useAuthStore } from "@/stores/auth/store";
import { toast } from "sonner";

import {
  buildCloudinaryDownloadUrl,
  buildDownloadFileName,
} from "../utils/document-download";

interface Props {
  readonly document: DocumentDetail;
}

/**
 * Page hero for the document detail view.
 * Renders the document title, author row, subject badge, upload date,
 * and action buttons (Open document / Download / Save).
 */
export function DocumentHero({ document }: Props): React.JSX.Element {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const authorHref =
    currentUserId === document.author.id
      ? "/my-documents"
      : `/documents/author/${document.author.id}`;
  const downloadUrl = buildCloudinaryDownloadUrl(document.fileUrl);
  const downloadFileName = buildDownloadFileName(
    document.title,
    document.format,
  );

  const avatarContent = document.author.avatarUrl ? (
    <Image
      src={document.author.avatarUrl}
      alt={document.author.name}
      className="rounded-full object-cover"
      height={40}
      width={40}
    />
  ) : (
    <span className="text-sm font-semibold text-white">
      {document.author.name.charAt(0).toUpperCase()}
    </span>
  );

  return (
    <section className="rounded-2xl border border-outline-variant bg-surface p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <h1 className="max-w-3xl text-3xl font-bold leading-tight text-on-surface">
            {document.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface-variant">
            <Link
              href={authorHref}
              className="group/author flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label={`Xem tài liệu của ${document.author.name}`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
                {avatarContent}
              </div>
              <div>
                <p className="font-medium text-on-surface transition-colors group-hover/author:text-primary">
                  {document.author.name}
                </p>
                <p className="text-xs">{document.author.email}</p>
              </div>
            </Link>

            {document.subject ? (
              <Badge tone="neutral">{document.subject.name}</Badge>
            ) : null}

            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">
                calendar_today
              </span>
              {formatDate(document.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-3">
          <a href={document.fileUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">
                  open_in_new
                </span>
                Mở tài liệu
              </span>
            </Button>
          </a>

          <a href={downloadUrl} download={downloadFileName}>
            <Button variant="primary" className="text-white hover:text-white">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">
                  download
                </span>
                Tải xuống
              </span>
            </Button>
          </a>

          <Button
            variant="outline"
            onClick={() => {
              if (!isAuthenticated) {
                toast.error("Vui lòng đăng nhập để lưu tài liệu.");
              } else {
                toast.info("Tính năng lưu tài liệu đang được phát triển.");
              }
            }}
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                bookmark
              </span>
              Lưu lại
            </span>
          </Button>
        </div>
      </div>
    </section>
  );
}
