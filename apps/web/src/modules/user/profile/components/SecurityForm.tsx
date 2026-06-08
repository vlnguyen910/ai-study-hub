"use client";

/**
 * SecurityForm
 *
 * Password-change section.
 *
 * Note: the backend does not yet expose a change-password endpoint separate
 * from the accounts update route. This form is UI-complete and validates
 * client-side; the submit handler will be wired to the API once the endpoint
 * is available (see APP_CONFIG.features.enableComments for a parallel pattern).
 *
 * The "Hủy bỏ" button resets both fields to empty.
 * The "Lưu thay đổi" button submits the form.
 */

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InputField } from "@/components/ui/InputField";

// ── Validation schema ─────────────────────────────────────────────────────────

const schema = z
  .object({
    newPassword: z
      .string()
      .trim()
      .min(8, "Mật khẩu mới phải có ít nhất 8 ký tự"),
    confirmPassword: z.string().trim().min(8, "Vui lòng nhập lại mật khẩu mới"),
  })
  .refine(
    ({ newPassword, confirmPassword }) => newPassword === confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Mật khẩu xác nhận không khớp",
    },
  );

type FormValues = z.infer<typeof schema>;

// ── Component ─────────────────────────────────────────────────────────────────

export function SecurityForm(): React.JSX.Element {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Show/hide password toggles
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async () => {
    /*
     * TODO: wire to PATCH /api/v1/accounts/:id (or a dedicated
     *       change-password endpoint) once the backend supports it.
     */
    setStatusMessage("Chức năng đổi mật khẩu đang được phát triển.");
  });

  const handleCancel = () => {
    reset({ newPassword: "", confirmPassword: "" });
    setStatusMessage(null);
  };

  return (
    <Card className="p-6 shadow-sm shadow-black/5 lg:p-8">
      {/* Section header */}
      <div className="mb-6 flex items-center gap-3">
        <span className="material-symbols-outlined text-secondary">lock</span>
        <div>
          <h2 className="text-lg font-bold text-on-surface">Bảo mật</h2>
          <p className="text-sm text-on-surface-variant">
            Đặt mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          {/* New password */}
          <Controller
            name="newPassword"
            control={control}
            render={({ field }) => (
              <InputField
                {...field}
                label="Mật khẩu mới"
                placeholder="••••••••"
                type={showNew ? "text" : "password"}
                errorText={errors.newPassword?.message}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="text-on-surface-variant"
                    aria-label={showNew ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showNew ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                }
              />
            )}
          />

          {/* Confirm password */}
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <InputField
                {...field}
                label="Xác nhận mật khẩu"
                placeholder="••••••••"
                type={showConfirm ? "text" : "password"}
                errorText={errors.confirmPassword?.message}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="text-on-surface-variant"
                    aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showConfirm ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                }
              />
            )}
          />
        </div>

        {/* Status message */}
        {statusMessage ? (
          <p className="rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
            {statusMessage}
          </p>
        ) : null}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={!isDirty}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || !isDirty}
          >
            {isSubmitting ? "Đang cập nhật..." : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
