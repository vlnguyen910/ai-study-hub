import Link from "next/link";

import { buttonVariants } from "@/components/ui/Button";
import { ROUTE_PATHS } from "@/routes/router.const";

interface EmptyProps {
  readonly isSearching: boolean;
}

export function DocumentCollectionEmpty({
  isSearching,
}: EmptyProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-outline-variant bg-surface-container-lowest py-14 text-center">
      <span className="material-symbols-outlined mb-2 text-4xl text-on-surface-variant/40">
        {isSearching ? "search_off" : "folder_open"}
      </span>
      <div className="space-y-3">
        <p className="text-sm text-on-surface-variant">
          {isSearching
            ? "Không tìm thấy kết quả phù hợp."
            : "Trống trải quá, upload thêm tài liệu đi!"}
        </p>
        {!isSearching ? (
          <Link
            href={ROUTE_PATHS.PROTECTED_ROUTES.UPLOADS}
            className={buttonVariants({ variant: "primary" })}
          >
            Tải lên tài liệu
          </Link>
        ) : null}
      </div>
    </div>
  );
}

interface ErrorProps {
  readonly message: string;
}

export function DocumentCollectionError({
  message,
}: ErrorProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-error/30 bg-error-container/30 py-14 text-center">
      <span className="material-symbols-outlined mb-2 text-4xl text-error">
        error_outline
      </span>
      <p className="text-sm text-error">{message}</p>
    </div>
  );
}
