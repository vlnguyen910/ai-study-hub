"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useThemeStore } from "@/stores";

/**
 * Nút bật/tắt Dark Mode được tối ưu hóa.
 * Chống lỗi Hydration Mismatch trong Next.js SSR và tích hợp chuyển động mượt mà.
 */
export function ThemeToggle(): React.JSX.Element {
  const { theme, toggleTheme, hasHydrated } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Tránh Hydration Mismatch bằng cách hiển thị một placeholder với kích thước giống hệt
  if (!mounted || !hasHydrated) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        aria-label="Đang tải giao diện"
        className="relative size-8 flex items-center justify-center text-on-surface-variant/40"
      >
        <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Chuyển đổi giao diện sáng/tối"
      className="relative size-8 flex items-center justify-center"
    >
      <div className="relative size-5 flex items-center justify-center">
        <Sun
          className={`absolute size-5 transition-all duration-300 ${
            theme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          }`}
        />
        <Moon
          className={`absolute size-5 transition-all duration-300 ${
            theme === "light"
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0"
          }`}
        />
      </div>
    </Button>
  );
}
