"use client";

import { useEffect, useCallback, useState } from "react";

import { Button } from "@/components/ui/Button";
import { validateFile } from "@/utils/validate.file";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "ddxstobvd";
const UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
  "YOUR_UNSIGNED_PRESET_NAME";

export interface CloudinaryConfig {
  maxFiles: number;
  maxFileSize: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
}

export function useFileUpload(initialConfig: CloudinaryConfig) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedAssets, setUploadedAssets] = useState<
    Array<{ url: string; publicId: string }>
  >([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const uploadToCloudinary = useCallback(async (file: File) => {
    if (!UPLOAD_PRESET || UPLOAD_PRESET === "YOUR_UNSIGNED_PRESET_NAME") {
      throw new Error(
        "Cloudinary upload preset is missing. Please set NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.",
      );
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Upload failed (${response.status}): ${body}`);
    }

    const result = await response.json();
    return { url: result.secure_url, publicId: result.public_id };
  }, []);

  const handleSelectFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length > initialConfig.maxFiles) {
      setError(`Maximum ${initialConfig.maxFiles} files allowed`);
      setFiles([]);
      setPreviewUrls([]);
      return;
    }

    const validFiles: File[] = [];
    for (const file of selectedFiles) {
      const result = validateFile(file, initialConfig);

      if (!result.valid) {
        setError(result.error || "Invalid file");
        setFiles([]);
        setPreviewUrls([]);
        return;
      }

      validFiles.push(file);
    }

    setFiles(validFiles);
    setError("");
  };

  useEffect(() => {
    const nextPreviewUrls = files
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => URL.createObjectURL(file));

    setPreviewUrls(nextPreviewUrls);

    return () => {
      nextPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const handleUploadToCloudinary = useCallback(async () => {
    if (files.length === 0) {
      setError("Vui lòng chọn tài liệu để upload.");
      return;
    }

    setIsUploading(true);
    setError("");
    setUploadedAssets([]);

    try {
      const results = await Promise.all(
        files.map((file) => uploadToCloudinary(file)),
      );
      setUploadedAssets(results);
      setError("Upload thành công!");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi upload không xác định.");
    } finally {
      setIsUploading(false);
      setFiles([]);
      setPreviewUrls([]);
    }
  }, [files, uploadToCloudinary]);

  return {
    files,
    uploadedAssets,
    previewUrls,
    error,
    isUploading,
    handleSelectFiles,
    handleUploadToCloudinary,
    config: initialConfig,
  };
}

type FileUploadBoxProps = {
  config: CloudinaryConfig;
};

export default function FileUploadBox({
  config,
}: FileUploadBoxProps): React.JSX.Element {
  const {
    files,
    uploadedAssets,
    previewUrls,
    error,
    isUploading,
    handleSelectFiles,
    handleUploadToCloudinary,
  } = useFileUpload(config);

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
          onChange={handleSelectFiles}
          className="hidden"
          accept={config.allowedMimeTypes.join(",")}
        />
      </label>

      {previewUrls.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-on-surface">Ảnh xem trước</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {previewUrls.map((url, index) => (
              <div
                key={url}
                className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container"
              >
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="h-28 w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {files.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-on-surface">Files đã chọn</p>
          <ul className="space-y-1 text-sm text-on-surface-variant">
            {files.map((file) => (
              <li key={file.name}>{file.name}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {error ? <p className="text-sm text-error">{error}</p> : null}

      <Button
        type="button"
        onClick={handleUploadToCloudinary}
        disabled={isUploading}
        className="w-full"
      >
        {isUploading ? "Đang tải lên..." : "Upload lên Cloudinary"}
      </Button>

      {uploadedAssets.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-on-surface">Kết quả upload</p>
          <ul className="space-y-2 text-sm">
            {uploadedAssets.map((asset) => (
              <li key={asset.publicId}>
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-primary underline-offset-4 hover:underline"
                >
                  {asset.publicId}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
