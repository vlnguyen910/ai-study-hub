import type { FC } from "react";

/** Pulse skeleton that mirrors the exact dimensions of DocumentCard */
export const DocumentCardSkeleton: FC = () => {
  return (
    <div
      className="
        flex flex-col overflow-hidden
        rounded-2xl
        border border-outline-variant/60
        bg-surface/80
        shadow-sm shadow-black/5
        animate-pulse
      "
    >
      {/* Thumbnail placeholder */}
      <div className="h-48 bg-surface-variant" />

      {/* Content placeholder */}
      <div className="flex flex-col gap-3 p-4">
        {/* Title — two lines */}
        <div className="space-y-1.5">
          <div className="h-3.5 w-full rounded bg-surface-variant" />
          <div className="h-3.5 w-3/4 rounded bg-surface-variant" />
        </div>

        {/* Author row */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-surface-variant" />
          <div className="h-3 w-1/2 rounded bg-surface-variant" />
        </div>

        {/* Subject */}
        <div className="h-3 w-2/3 rounded bg-surface-variant" />

        {/* Description placeholder */}
        <div className="space-y-1 mt-0.5">
          <div className="h-2.5 w-full rounded bg-surface-variant/60" />
          <div className="h-2.5 w-5/6 rounded bg-surface-variant/60" />
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-outline-variant/40 pt-2">
          <div className="h-3 w-1/3 rounded bg-surface-variant" />
          <div className="h-3 w-3 rounded bg-surface-variant" />
        </div>
      </div>
    </div>
  );
};
