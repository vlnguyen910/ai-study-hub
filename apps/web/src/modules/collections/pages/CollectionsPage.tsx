"use client";

import { CollectionsTab } from "@/modules/collections/components/CollectionsTab";
import { useAuthStore } from "@/stores/auth/store";

export default function CollectionsPage(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <div className="min-w-0 flex items-center justify-center py-24 text-center">
        <p className="text-sm text-on-surface-variant">
          Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <section className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm shadow-black/5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Document Collections
            </p>
            <h1 className="mt-2 text-2xl font-bold text-on-surface">
              Bộ sưu tập của tôi
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
              Gom các tài liệu theo chủ đề để lưu nhanh, ôn tập và mở lại dễ
              hơn.
            </p>
          </div>

          <span className="material-symbols-outlined hidden rounded-3xl bg-primary/10 p-4 text-[40px] text-primary sm:inline-flex">
            collections_bookmark
          </span>
        </div>
      </section>

      <CollectionsTab userId={user.id} isOwnProfile />
    </div>
  );
}
