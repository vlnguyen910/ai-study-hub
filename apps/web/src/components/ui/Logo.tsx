import type { FC } from "react";

export const Logo: FC = () => (
  <div className="inline-flex items-center gap-3">
    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-primary/15 ring-1 ring-black/5">
      {/* Static brand asset. Use a plain img here to avoid Next image optimizer issues in a tiny badge. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/ai-study-hub-logo.png"
        alt="AI Study Hub logo"
        className="h-full w-full object-contain p-1"
        loading="eager"
        decoding="async"
      />
    </div>
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-primary">
        AcademiShare
      </p>
      <p className="truncate text-[12px] text-on-surface-variant">
        AI Study Hub
      </p>
    </div>
  </div>
);
