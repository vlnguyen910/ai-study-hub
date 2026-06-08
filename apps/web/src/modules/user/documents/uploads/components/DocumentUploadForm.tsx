"use client";

/**
 * DocumentUploadForm
 *
 * Handles the metadata form and the full two-phase submit:
 *   Phase 1 – Upload the file to Cloudinary (unsigned preset).
 *   Phase 2 – POST /api/v1/documents with Cloudinary result + form values.
 *
 * Both phases run inside a single loading state triggered by one button,
 * so the user experiences a single action: fill → click → done.
 *
 * Props:
 *  - selectedFile  — the File held by the parent (UploadPage); required
 *                    before the submit buttons become active.
 *  - isSubmitting  — forwarded from this component back to the parent so
 *                    FileUploadBox can disable itself during upload.
 *  - onSubmittingChange — callback so the parent can mirror the loading state.
 *  - onSuccess     — called after the document record is created; the parent
 *                    shows the success banner and resets shared state.
 *
 * Subjects come from GET /api/v1/subjects (real API, not mock data).
 * "Trường học" is read-only — it is derived from the subject on the backend.
 */

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { fetchSubjects, createDocument } from "@/apis/document.api";
import type { Subject } from "@/types/document.type";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "ddxstobvd";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

// ── Internal Cloudinary helper ────────────────────────────────────────────────

interface CloudinaryResult {
  url: string;
  publicId: string;
  bytes: number;
  format: string;
  resourceType: string;
}

async function uploadToCloudinary(file: File): Promise<CloudinaryResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    { method: "POST", body: formData },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Cloudinary upload thất bại (${res.status}): ${body}`);
  }

  const data = await res.json();
  return {
    url: data.secure_url as string,
    publicId: data.public_id as string,
    bytes: data.bytes as number,
    format: data.format as string,
    resourceType: data.resource_type as string,
  };
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  /** File selected in FileUploadBox, managed by the parent. */
  selectedFile: File | null;
  /** Lift the submitting state up so FileUploadBox can disable itself. */
  onSubmittingChange: (isSubmitting: boolean) => void;
  /** Called after the document is saved successfully. */
  onSuccess: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DocumentUploadForm({
  selectedFile,
  onSubmittingChange,
  onSuccess,
}: Props): React.JSX.Element {
  // Form values
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [description, setDescription] = useState("");

  // Subjects from API
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);

  useEffect(() => {
    fetchSubjects(100)
      .then((res) => setSubjects(res.subjects))
      .catch(() => {
        /* non-critical — dropdown degrades gracefully to empty */
      })
      .finally(() => setSubjectsLoading(false));
  }, []);

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Submit handler ────────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    async (isPublic: boolean) => {
      // Client-side guards
      if (!selectedFile) {
        setSubmitError("Vui lòng chọn tệp tài liệu trước.");
        return;
      }
      if (!title.trim()) {
        setSubmitError("Vui lòng nhập tên tài liệu.");
        return;
      }
      if (!UPLOAD_PRESET) {
        setSubmitError(
          "Chưa cấu hình Cloudinary preset. Liên hệ quản trị viên.",
        );
        return;
      }

      setIsSubmitting(true);
      onSubmittingChange(true);
      setSubmitError(null);

      try {
        // Phase 1 — upload file to Cloudinary
        const cloudResult = await uploadToCloudinary(selectedFile);

        // Phase 2 — create document record in the API
        await createDocument({
          title: title.trim(),
          description: description.trim() || undefined,
          fileUrl: cloudResult.url,
          publicId: cloudResult.publicId,
          sizeInBytes: cloudResult.bytes,
          format: cloudResult.format,
          resourceType: cloudResult.resourceType,
          subjectId: subjectId || undefined,
          isPublic,
        });

        // Reset form on success
        setTitle("");
        setSubjectId("");
        setDescription("");
        onSuccess();
      } catch (err) {
        setSubmitError(
          err instanceof Error
            ? err.message
            : "Đã xảy ra lỗi. Vui lòng thử lại.",
        );
      } finally {
        setIsSubmitting(false);
        onSubmittingChange(false);
      }
    },
    [
      selectedFile,
      title,
      description,
      subjectId,
      onSubmittingChange,
      onSuccess,
    ],
  );

  // ── Render ────────────────────────────────────────────────────────────────

  const canSubmit = Boolean(selectedFile) && !isSubmitting;

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-5" noValidate>
      {/* Title */}
      <InputField
        label="Tên tài liệu"
        placeholder="Ví dụ: Đề cương Giải tích 1 - K65"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        disabled={isSubmitting}
      />

      {/* Subject + School */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Subject — populated from GET /api/v1/subjects */}
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-on-surface-variant">
            Môn học
          </span>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            disabled={subjectsLoading || isSubmitting}
            className="
              w-full rounded-xl border border-outline bg-surface
              py-2 pl-3 pr-8 text-sm text-on-surface
              focus:border-2 focus:border-primary focus:outline-none
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            <option value="">Chọn môn học</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        {/*
         * "Trường học" is not part of CreateDocumentDto — the backend
         * derives it from the chosen subject. Shown as read-only context.
         */}
        <InputField
          label="Trường học"
          value="ĐH FPT (mặc định)"
          readOnly
          className="cursor-not-allowed opacity-60"
        />
      </div>

      {/* Description */}
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-on-surface-variant">
          Mô tả chi tiết
        </span>
        <textarea
          placeholder="Tóm tắt nội dung tài liệu để người khác dễ tìm thấy..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          disabled={isSubmitting}
          className="
            w-full resize-none rounded-xl border border-outline bg-surface
            p-3 text-sm text-on-surface placeholder:text-on-surface-variant/60
            focus:border-2 focus:border-primary focus:outline-none
            disabled:cursor-not-allowed disabled:opacity-50
          "
        />
      </label>

      {/* No-file hint */}
      {!selectedFile ? (
        <p className="flex items-center gap-1 text-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px]">info</span>
          Chọn tệp bên trái trước, sau đó nhấn lưu.
        </p>
      ) : null}

      {/* Submit error */}
      {submitError ? (
        <div className="flex items-start gap-2 rounded-xl border border-error/40 bg-error-container/30 p-3 text-sm text-error">
          <span className="material-symbols-outlined shrink-0 text-[18px]">
            error
          </span>
          {submitError}
        </div>
      ) : null}

      {/* Action buttons */}
      <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
        {/* Draft — isPublic: false → saved as ACTIVE (private) */}
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          disabled={!canSubmit}
          onClick={() => handleSubmit(false)}
        >
          {isSubmitting ? "Đang lưu..." : "Lưu nháp"}
        </Button>

        {/* Publish — isPublic: true → PENDING (awaiting moderation) */}
        <Button
          type="button"
          variant="primary"
          className="w-full sm:w-auto"
          disabled={!canSubmit}
          onClick={() => handleSubmit(true)}
        >
          {isSubmitting ? "Đang tải lên..." : "Công khai tài liệu"}
        </Button>
      </div>
    </form>
  );
}
