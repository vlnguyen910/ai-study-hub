import Link from "next/link";
import type { ReactElement } from "react";

import { ROUTE_PATHS } from "@/routes/router.const";

export default function NotFound(): ReactElement {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-on-surface">
      <section className="w-full max-w-3xl rounded-lg border border-outline-variant bg-surface-container-lowest p-8 shadow-sm">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-primary-fixed text-primary">
          <span className="material-symbols-outlined text-3xl" aria-hidden>
            travel_explore
          </span>
        </div>

        <p className="font-label-sm text-label-sm uppercase tracking-wider text-primary">
          404
        </p>
        <h1 className="mt-2 font-headline-lg text-headline-lg text-on-surface">
          Không tìm thấy trang
        </h1>
        <p className="mt-3 max-w-xl font-body-md text-body-md text-on-surface-variant">
          Đường dẫn này không tồn tại hoặc đã được gỡ khỏi hệ thống.
        </p>
      </section>
    </main>
  );
}
