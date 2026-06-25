import Link from "next/link";

import { buttonVariants } from "@/components/ui/Button";
import { ROUTE_PATHS } from "@/routes/router.const";

interface DocumentContributionBannerProps {
  readonly isVisible: boolean;
}

export function DocumentContributionBanner({
  isVisible,
}: DocumentContributionBannerProps): React.JSX.Element | null {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-r from-primary/5 via-surface-container-lowest to-surface-container-lowest px-4 py-4 shadow-sm shadow-black/5 sm:px-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-on-surface">
            Có tài liệu mới muốn chia sẻ?
          </p>
          <p className="text-sm text-on-surface-variant">
            Đóng góp thêm tài liệu để làm đầy không gian học tập chung.
          </p>
        </div>

        <Link
          href={ROUTE_PATHS.PROTECTED_ROUTES.UPLOADS}
          className={buttonVariants({ variant: "outline" })}
        >
          Đóng góp ngay
        </Link>
      </div>
    </div>
  );
}
