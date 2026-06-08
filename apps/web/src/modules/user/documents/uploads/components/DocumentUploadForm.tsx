"use client";

import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { Card } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { Toast } from "@/components/ui/Toast";
import { DEFAULT_UPLOAD_CONFIG } from "@/constants/upload.const";
import { apiClient } from "@/lib/axios";

import FileUploadBox, { type CloudinaryUploadResult } from "./FileUploadBox";

type UploadFormValues = {
  title: string;
  description: string;
  isPublic: boolean;
  uploadedFiles: CloudinaryUploadResult[];
};

type CloudinaryResult = {
  secure_url: string;
  public_id: string;
  bytes: number;
  format: string;
  resource_type: string;
};

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "ddxstobvd";
const UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
  "YOUR_UNSIGNED_PRESET_NAME";

async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {
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

  const result = (await response.json()) as CloudinaryResult;
  return {
    url: result.secure_url,
    publicId: result.public_id,
    bytes: result.bytes,
    format: result.format,
    resourceType: result.resource_type,
  };
}

export function DocumentUploadForm(): React.JSX.Element {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UploadFormValues>({
    defaultValues: {
      title: "",
      description: "",
      isPublic: true,
      uploadedFiles: [],
    },
  });

  const uploadedFiles = watch("uploadedFiles");
  const isPublic = watch("isPublic");
  const uploadedCount = uploadedFiles?.length ?? 0;

  const fileCountText = useMemo(() => {
    return `Đã tải lên thành công ${uploadedCount}/5 tài liệu`;
  }, [uploadedCount]);

  const handleSelectFiles = (files: FileList | null) => {
    const nextFiles = Array.from(files || []).slice(
      0,
      DEFAULT_UPLOAD_CONFIG.maxFiles,
    );
    setSelectedFiles(nextFiles);
    setUploadError("");
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setUploadError("Vui lòng chọn tài liệu để upload.");
      setToastMessage("Chưa có file nào được chọn.");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setToastMessage("Đang upload ...");

    try {
      const results = await Promise.all(
        selectedFiles.map((file) => uploadToCloudinary(file)),
      );

      setValue("uploadedFiles", results, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setSelectedFiles([]);
      setToastMessage(
        `Upload thành công ${results.length}/${DEFAULT_UPLOAD_CONFIG.maxFiles} tài liệu.`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Lỗi upload không xác định.";
      setUploadError(message);
      setToastMessage(message);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: UploadFormValues) => {
    const payloads = values.uploadedFiles.map((file) => ({
      title: values.title,
      description: values.description,
      fileUrl: file.url,
      publicId: file.publicId,
      sizeInBytes: file.bytes,
      format: file.format,
      resourceType: file.resourceType,
      isPublic: values.isPublic,
    }));

    await Promise.all(
      payloads.map((payload) => apiClient.post("/api/v1/documents", payload)),
    );

    setValue("uploadedFiles", [], {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setToastMessage(`Đã công khai ${payloads.length} tài liệu thành công.`);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="
        w-full
        max-w-4xl
        space-y-6

      "
    >
      <Card className="space-y-5 p-5 shadow-sm shadow-black/5 lg:p-6">
        {toastMessage ? (
          <div className="mb-4">
            <Toast message={toastMessage} />
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
          <section className="w-full">
            <FileUploadBox
              config={DEFAULT_UPLOAD_CONFIG}
              selectedFiles={selectedFiles}
              uploadedFiles={uploadedFiles}
              isUploading={isUploading}
              uploadError={uploadError}
              onSelectFiles={handleSelectFiles}
              onUpload={handleUpload}
            />
          </section>

          <section className="w-full space-y-6">
            <div>
              <Controller
                control={control}
                name="title"
                rules={{ required: "Vui lòng nhập tên tài liệu" }}
                render={({ field }) => (
                  <InputField
                    label="Tên tài liệu"
                    placeholder="Ví dụ: Tổng hợp kiến thức ReactJS"
                    value={field.value}
                    onChange={field.onChange}
                    errorText={errors.title?.message}
                  />
                )}
              />
            </div>

            <div>
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <InputField
                    label="Mô tả chi tiết"
                    placeholder="Mô tả nội dung tài liệu, nguồn tham khảo hoặc thông tin hữu ích..."
                    value={field.value}
                    onChange={field.onChange}
                    errorText={errors.description?.message}
                  />
                )}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-outline-variant bg-surface px-4 py-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-on-surface">
                  Công khai tài liệu
                </p>
                <p className="text-xs text-on-surface-variant">
                  Bật để tài liệu hiển thị cho mọi người.
                </p>
              </div>

              <Controller
                control={control}
                name="isPublic"
                render={({ field }) => (
                  <Switch checked={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            <p className="text-sm text-on-surface-variant">
              Trạng thái hiển thị: {isPublic ? "Công khai" : "Riêng tư"}
            </p>

            <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
              >
                Lưu nháp
              </Button>

              <Button
                type="submit"
                variant="primary"
                className="w-full sm:w-auto"
                disabled={uploadedCount === 0 || isSubmitting}
              >
                Công khai tài liệu
              </Button>
            </div>

            <p className="text-sm text-on-surface-variant">{fileCountText}</p>
          </section>
        </div>
      </Card>
    </form>
  );
}
