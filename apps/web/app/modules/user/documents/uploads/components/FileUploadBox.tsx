"use client";

import { Button } from "@/components/ui/Button";

export interface CloudinaryUploadResult {
  readonly url: string;
  readonly publicId: string;
  readonly bytes: number;
  readonly format: string;
  readonly resourceType: string;
}

export interface FileUploadBoxProps {
  readonly config: {
    readonly maxFiles: number;
    readonly maxFileSize: number;
    readonly allowedMimeTypes: readonly string[];
    readonly allowedExtensions: readonly string[];
  };
  readonly selectedFiles: readonly File[];
  readonly uploadedFiles: readonly CloudinaryUploadResult[];
  readonly isUploading: boolean;
  readonly uploadError?: string;
  readonly onSelectFiles: (files: FileList | null) => void;
  readonly onUpload: () => void;
}

export default function FileUploadBox({
  config,
  selectedFiles,
  uploadedFiles,
  isUploading,
  uploadError,
  onSelectFiles,
  onUpload,
}: FileUploadBoxProps): React.JSX.Element {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-on-surface">
          Tải tài liệu lên
        </h3>
        <p className="text-sm text-on-surface-variant">
          Chọn tối đa {config.maxFiles} file. Hỗ trợ PDF, ảnh và DOCX.
        </p>
      </div>

      <label className="block cursor-pointer rounded-lg border border-dashed border-border p-4 transition-colors hover:bg-surface-variant/40">
        <div className="flex min-h-40 flex-col items-center justify-center text-center">
          <span className="text-sm font-medium text-on-surface">
            Chọn file từ máy tính
          </span>
          <span className="mt-1 text-xs text-on-surface-variant">
            Hoặc kéo thả nếu trình duyệt hỗ trợ
          </span>
          <span className="mt-2 text-xs text-on-surface-variant">
            Ảnh sẽ được xem trước ngay bên dưới
          </span>
        </div>
        <input
          type="file"
          multiple
          onChange={(event) => onSelectFiles(event.target.files)}
          className="hidden"
          accept={config.allowedMimeTypes.join(",")}
        />
      </label>

      {selectedFiles.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-on-surface">Files đã chọn</p>
          <ul className="space-y-1 text-sm text-on-surface-variant">
            {selectedFiles.map((file) => (
              <li key={file.name}>{file.name}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {uploadError ? <p className="text-sm text-error">{uploadError}</p> : null}

      <Button
        type="button"
        onClick={onUpload}
        disabled={isUploading || selectedFiles.length === 0}
        className="w-full"
      >
        {isUploading ? "Đang tải lên..." : "Tải lên"}
      </Button>

      <p className="text-sm text-on-surface-variant">
        Đã tải lên thành công {uploadedFiles.length}/{config.maxFiles} tài liệu
      </p>
    </div>
  );
}
