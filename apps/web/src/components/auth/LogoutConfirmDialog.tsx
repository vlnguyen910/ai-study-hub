"use client";

interface LogoutConfirmDialogProps {
  readonly open: boolean;
  readonly isSubmitting?: boolean;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}

export function LogoutConfirmDialog({
  open,
  isSubmitting = false,
  onCancel,
  onConfirm,
}: LogoutConfirmDialogProps): React.JSX.Element | null {
  if (!open) return null;

  return (
    <div
      aria-labelledby="logout-confirm-title"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/25 px-4 backdrop-blur-sm"
      role="dialog"
    >
      <div className="w-full max-w-sm rounded-2xl border border-outline-variant bg-surface p-6 shadow-xl">
        <div className="mb-5 flex items-start gap-4">
          <div
            aria-hidden="true"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-error/10 text-error"
          >
            <span className="material-symbols-outlined block text-[26px] leading-none">
              logout
            </span>
          </div>
          <div className="min-w-0">
            <h2
              className="font-headline-sm text-headline-sm font-semibold text-on-surface"
              id="logout-confirm-title"
            >
              Xác nhận đăng xuất
            </h2>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">
              Bạn có chắc chắn muốn đăng xuất khỏi phiên làm việc hiện tại
              không?
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="rounded-xl border border-outline-variant px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-variant disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            onClick={onCancel}
            type="button"
          >
            Hủy
          </button>
          <button
            className="rounded-xl bg-error px-4 py-2 text-sm font-medium text-on-error transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            onClick={onConfirm}
            type="button"
          >
            {isSubmitting ? "Đang đăng xuất..." : "Đăng xuất"}
          </button>
        </div>
      </div>
    </div>
  );
}
