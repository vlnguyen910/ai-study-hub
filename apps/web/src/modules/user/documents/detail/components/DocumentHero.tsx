import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/utils";
import type { DocumentDetail } from "@/types/document.type";

interface Props {
  readonly document: DocumentDetail;
}

/**
 * Page hero for the document detail view.
 * Renders the document title, author row, subject badge, upload date,
 * and action buttons (Download / Save).
 *
 * Stats (views, downloads, likes) are intentionally absent — the current
 * API's list/detail endpoints do not return engagement counters.
 */
export function DocumentHero({ document }: Props): React.JSX.Element {
  /**
   * Avatar rendering strategy:
   *  1. If the author has an avatarUrl from Cloudinary → show the image.
   *  2. Otherwise → show the first character of their name as an initial.
   */
  const avatarContent = document.author.avatarUrl ? (
    <img
      src={document.author.avatarUrl}
      alt={document.author.name}
      className="h-full w-full rounded-full object-cover"
    />
  ) : (
    <span className="text-sm font-semibold text-white">
      {document.author.name.charAt(0).toUpperCase()}
    </span>
  );

  return (
    <section className="rounded-2xl border border-outline-variant bg-surface p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        {/* ── Left: title + metadata ── */}
        <div className="space-y-4">
          <h1 className="max-w-3xl text-3xl font-bold leading-tight text-on-surface">
            {document.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface-variant">
            {/* Author avatar + name */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
                {avatarContent}
              </div>
              <div>
                <p className="font-medium text-on-surface">
                  {document.author.name}
                </p>
                <p className="text-xs">{document.author.email}</p>
              </div>
            </div>

            {/* Subject badge — shown only when the document belongs to a subject */}
            {document.subject ? (
              <Badge tone="neutral">{document.subject.name}</Badge>
            ) : null}

            {/* Upload date */}
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">
                calendar_today
              </span>
              {formatDate(document.createdAt)}
            </span>
          </div>
        </div>

        {/* ── Right: action buttons ── */}
        <div className="flex shrink-0 gap-3">
          {/*
           * Download opens the Cloudinary fileUrl directly in a new tab.
           * Cloudinary serves the original file with the appropriate Content-Type,
           * so the browser will trigger a download for non-previewable formats.
           */}
          <a href={document.fileUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="primary">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">
                  download
                </span>
                Tải xuống
              </span>
            </Button>
          </a>

          <Button variant="outline">
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
