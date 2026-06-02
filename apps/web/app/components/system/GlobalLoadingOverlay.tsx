"use client";

import { Spinner } from "@/components/ui/Spinner";
import { useGlobalLoadingStore } from "@/stores/ui/global-loading.store";

export default function GlobalLoadingOverlay(): React.JSX.Element | null {
  const isVisible = useGlobalLoadingStore((state) => state.isVisible);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      role="status"
    >
      <div className="flex items-center gap-3 rounded-lg bg-surface px-5 py-4 shadow-lg">
        <Spinner size="md" />
        <div className="text-sm font-medium text-on-surface">
          Loading data...
        </div>
      </div>
    </div>
  );
}
