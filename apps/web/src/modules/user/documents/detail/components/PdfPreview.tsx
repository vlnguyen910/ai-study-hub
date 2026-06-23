"use client";

import { useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

interface Props {
  readonly fileUrl: string;
}

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs",
).toString();

export function PdfPreview({ fileUrl }: Props): React.JSX.Element {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-4 rounded-2xl bg-surface p-6 w-full">
        <span className="material-symbols-outlined text-6xl text-error">
          error
        </span>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-on-surface">
            Không thể hiển thị PDF
          </h3>
          <p className="mt-2 text-sm text-on-surface-variant max-w-sm">
            Tài liệu này không tồn tại hoặc đường dẫn tải lên đã bị thay đổi
            (Lỗi 404).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full">
      <Document
        file={fileUrl}
        onLoadError={(error: Error) => setError(error.message)}
        loading={
          <div className="text-white/70 animate-pulse text-sm font-medium py-10">
            Đang tải tài liệu PDF...
          </div>
        }
        error={
          <div className="flex min-h-[500px] flex-col items-center justify-center gap-4 rounded-2xl bg-surface p-6 w-full">
            <span className="material-symbols-outlined text-6xl text-error">
              error
            </span>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-on-surface">
                Không thể hiển thị PDF
              </h3>
              <p className="mt-2 text-sm text-on-surface-variant max-w-sm">
                Tài liệu này không tồn tại hoặc đường dẫn tải lên đã bị thay đổi
                (Lỗi 404).
              </p>
            </div>
          </div>
        }
      >
        <Page pageNumber={1} />
      </Document>
    </div>
  );
}
