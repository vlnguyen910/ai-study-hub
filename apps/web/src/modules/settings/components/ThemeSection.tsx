"use client";

import { Card } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { useTheme } from "@/hooks/useTheme";

export function ThemeSection(): React.JSX.Element {
  const { theme, isDark, toggle } = useTheme();

  return (
    <Card className="p-6 shadow-sm shadow-black/5 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="material-symbols-outlined text-secondary">
          contrast
        </span>
        <div>
          <h2 className="text-lg font-bold text-on-surface">Giao diện</h2>
          <p className="text-sm text-on-surface-variant">
            Chọn chế độ hiển thị ưa thích.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Dark mode toggle */}
        <div className="flex items-center justify-between gap-4 rounded-xl border border-outline-variant bg-surface p-4">
          <div>
            <p className="font-label-md text-label-md tracking-normal">
              Chế độ tối
            </p>
            <p className="font-label-sm text-label-sm tracking-normal text-on-surface-variant">
              {isDark ? "Đang bật" : "Đang tắt"}
            </p>
          </div>
          <Switch checked={isDark} onChange={toggle} />
        </div>

        {/* Current theme indicator */}
        <div className="flex items-center gap-3 rounded-xl border border-outline-variant bg-surface p-4">
          <span
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${
              isDark
                ? "bg-inverse-surface text-inverse-on-surface"
                : "bg-primary-fixed text-primary"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isDark ? "dark_mode" : "light_mode"}
            </span>
          </span>
          <div>
            <p className="font-label-md text-label-md tracking-normal">
              {theme === "dark" ? "Chế độ tối" : "Chế độ sáng"}
            </p>
            <p className="font-label-sm text-label-sm tracking-normal text-on-surface-variant">
              Hiện đang áp dụng
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
