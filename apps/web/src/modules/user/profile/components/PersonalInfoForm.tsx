"use client";

/**
 * PersonalInfoForm
 *
 * Displays and edits the user's personal information.
 *
 * API behaviour:
 *  - On save, calls PATCH /api/v1/accounts/:id with { name }.
 *  - Only `name` is persisted — the backend currently supports name + avatarUrl.
 *  - "Trường đại học", "Khoa", "Chuyên ngành": kept in local state only.
 *    The accounts schema does not expose these fields yet; they will sync to
 *    the API once the backend adds them.
 *  - Avatar: local FileReader preview works for display; a production flow
 *    would upload to Cloudinary before saving the URL. For now, avatar
 *    changes are shown locally but not persisted to the API.
 *
 * Auth store update:
 *  After a successful save, the store's user.name is updated immediately so
 *  the SideNav and other surfaces reflect the change without a page reload.
 */

import { useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InputField } from "@/components/ui/InputField";

import { updateProfile } from "@/apis/account.api";
import { useAuthStore } from "@/stores/auth/store";
import type { User } from "@/types";

// ── Validation schema ─────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().trim().min(1, "Họ tên không được để trống"),
  university: z.string().trim(),
  faculty: z.string().trim(),
  major: z.string().trim(),
});

type FormValues = z.infer<typeof schema>;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Derive up-to-2-character initials from a display name. */
function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  /** Authenticated user object from the auth store. */
  user: User;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PersonalInfoForm({ user }: Props): React.JSX.Element {
  const setUser = useAuthStore((state) => state.setUser);

  // ── Edit mode ────────────────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // ── Avatar (local preview only — not persisted to API) ───────────────────────
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(user.avatar ?? "");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // ── React Hook Form ──────────────────────────────────────────────────────────
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name,
      university: "",
      faculty: "",
      major: "",
    },
  });

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const beginEditing = () => {
    reset({ name: user.name, university: "", faculty: "", major: "" });
    setAvatarPreview(user.avatar ?? "");
    setStatusMessage(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    reset({ name: user.name, university: "", faculty: "", major: "" });
    setAvatarPreview(user.avatar ?? "");
    setIsEditing(false);
    setStatusMessage("Đã hủy chỉnh sửa hồ sơ.");
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      // Persist name to the API (the only currently supported mutable field)
      await updateProfile(user.id, { name: values.name });

      // Update the auth store so the SideNav reflects the change immediately
      setUser({
        ...user,
        name: values.name,
      });

      setIsEditing(false);
      setStatusMessage("Cập nhật hồ sơ thành công.");
    } catch (err) {
      setStatusMessage(
        err instanceof Error
          ? err.message
          : "Cập nhật thất bại. Vui lòng thử lại.",
      );
    }
  });

  // ── Render ────────────────────────────────────────────────────────────────────

  const initials = getInitials(user.name);
  const readonlyCls = "bg-surface-container-low text-on-surface-variant";

  return (
    <Card className="p-6 shadow-sm shadow-black/5 lg:p-8">
      {/* ── Section header ── */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-on-surface">Thông tin cá nhân</h2>

        {/* Toggle edit / save actions */}
        {!isEditing ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={beginEditing}
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">
                edit
              </span>
              Chỉnh sửa
            </span>
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={cancelEditing}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              form="personal-info-form"
              variant="primary"
              size="sm"
              disabled={isSubmitting || !isDirty}
            >
              {isSubmitting ? "Đang lưu..." : "Lưu hồ sơ"}
            </Button>
          </div>
        )}
      </div>

      {/* ── Avatar row ── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar
          imageUrl={avatarPreview}
          initials={initials}
          size="lg"
          className="h-20 w-20 shrink-0 border-4 border-surface-container object-cover"
        />
        <div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={!isEditing}
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">
                  upload
                </span>
                Tải ảnh mới
              </span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!isEditing}
              className="text-error hover:bg-error-container hover:text-error"
              onClick={() => setAvatarPreview("")}
            >
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">
                  delete
                </span>
                Xóa ảnh
              </span>
            </Button>
          </div>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleAvatarChange}
          />
          <p className="mt-1.5 text-xs text-on-surface-variant">
            JPG, GIF hoặc PNG. Kích thước tối đa 2MB.
          </p>
        </div>
      </div>

      {/* ── Form ── */}
      <form id="personal-info-form" onSubmit={onSubmit} noValidate>
        <div className="grid gap-5 md:grid-cols-2">
          {/* Name — persisted to API */}
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <InputField
                {...field}
                label="Họ tên"
                placeholder="Nhập họ tên của bạn"
                disabled={!isEditing}
                errorText={errors.name?.message}
                className={!isEditing ? readonlyCls : ""}
              />
            )}
          />

          {/* Email — read-only; cannot be changed from this form */}
          <InputField
            label="Email"
            value={user.email}
            disabled
            className={readonlyCls}
            helperText="Email không thể chỉnh sửa từ trang này"
          />

          {/* University — local state only; API does not support this field yet */}
          <Controller
            name="university"
            control={control}
            render={({ field }) => (
              <InputField
                {...field}
                label="Trường đại học"
                placeholder="Tên trường đại học"
                disabled={!isEditing}
                errorText={errors.university?.message}
                className={!isEditing ? readonlyCls : ""}
              />
            )}
          />

          {/* Faculty — local state only */}
          <Controller
            name="faculty"
            control={control}
            render={({ field }) => (
              <InputField
                {...field}
                label="Khoa"
                placeholder="Khoa của bạn"
                disabled={!isEditing}
                errorText={errors.faculty?.message}
                className={!isEditing ? readonlyCls : ""}
              />
            )}
          />

          {/* Major — local state only */}
          <Controller
            name="major"
            control={control}
            render={({ field }) => (
              <InputField
                {...field}
                label="Chuyên ngành"
                placeholder="Chuyên ngành học"
                disabled={!isEditing}
                errorText={errors.major?.message}
                className={!isEditing ? readonlyCls : ""}
              />
            )}
          />
        </div>
      </form>

      {/* Status message (success or error feedback) */}
      {statusMessage ? (
        <p className="mt-4 rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
          {statusMessage}
        </p>
      ) : null}
    </Card>
  );
}
