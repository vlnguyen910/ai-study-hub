"use client";

/**
 * UploadPage (/uploads)
 *
 * Layout coordinator — owns the shared selectedFile state and wires the
 * two columns together. No form logic, no Cloudinary calls here.
 *
 * Layout: single card, sidebar (1/3) + main form (2/3).
 *   Left sidebar  – FileUploadBox in compact mode + integrity notice.
 *   Right main    – DocumentUploadForm with all metadata fields.
 *   A vertical divider (divide-x) separates both panels — no individual borders.
 *
 * Single-step flow:
 *   1. User selects / drops a file in the sidebar FileUploadBox.
 *   2. User fills metadata in the right-side DocumentUploadForm.
 *   3. "Công khai" or "Riêng tư" triggers Cloudinary upload + API create
 *      in one loading state — no intermediate "Upload File" button.
 */

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import FileUploadBox from "../components/FileUploadBox";
import { DocumentUploadForm } from "../components/DocumentUploadForm";
import { useUploadConfig } from "../hooks/useUploadConfig";

export default function UploadPage(): React.JSX.Element {
  /** File picked by FileUploadBox; passed to DocumentUploadForm for submission. */
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const uploadConfig = useUploadConfig();

  /**
   * Mirrors DocumentUploadForm's submitting state so FileUploadBox can
   * disable drag-and-drop while the upload is in progress.
   */
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isSuccess, setIsSuccess] = useState(false);

  const handleSuccess = () => {
    setSelectedFile(null);
    setIsSuccess(true);
  };

  // ── Success banner ────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="min-w-0 flex flex-col items-center justify-center py-24 text-center space-y-4">
        <span className="material-symbols-outlined text-6xl text-primary">
          task_alt
        </span>
        <h2 className="text-2xl font-bold text-on-surface">
          Tải lên thành công!
        </h2>
        <p className="text-on-surface-variant">
          Tài liệu đang chờ kiểm duyệt (nếu công khai) hoặc đã được lưu riêng
          tư.
        </p>
        <Button
          type="button"
          variant="primary"
          onClick={() => setIsSuccess(false)}
        >
          Tải lên tài liệu khác
        </Button>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">
          Tải lên tài liệu mới
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Chia sẻ kiến thức của bạn với cộng đồng học thuật AcademiShare.
        </p>
      </div>

      {/*
       * Unified card — sidebar (1 col) + main form (2 cols).
       * On mobile: stacked. On lg+: side-by-side with a divide-x separator.
       * No individual borders on child panels — the outer rounded card owns
       * the visual container; divide-* handles the internal separation.
       */}
      <div className="overflow-hidden rounded-3xl border border-outline-variant/50 shadow-sm">
        <div className="grid grid-cols-1 divide-y divide-outline-variant/40 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          {/* ── Sidebar: file selection ────────────────────────────────── */}
          <aside className="flex flex-col gap-4 bg-surface-container-low/50 p-6">
            {/* Section micro-label */}
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant/50">
              Tài liệu
            </p>

            <FileUploadBox
              config={uploadConfig}
              selectedFile={selectedFile}
              onFileChange={setSelectedFile}
              isSubmitting={isSubmitting}
              compact
            />
          </aside>

          {/* ── Main: metadata form ────────────────────────────────────── */}
          <div className="flex flex-col gap-4 bg-surface p-6 lg:col-span-2">
            {/* Section micro-label + no-file nudge */}
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant/50">
                Thông tin
              </p>
              {!selectedFile && (
                <span className="flex items-center gap-1 text-xs italic text-on-surface-variant/45">
                  <span className="material-symbols-outlined text-[13px]">
                    arrow_back
                  </span>
                  Chọn tệp trước
                </span>
              )}
            </div>

            <DocumentUploadForm
              selectedFile={selectedFile}
              onSubmittingChange={setIsSubmitting}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
