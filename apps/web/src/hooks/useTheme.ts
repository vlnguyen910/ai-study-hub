"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "ai-study-hub-theme";

function applyTheme(theme: Theme): void {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function useTheme(): {
  theme: Theme;
  isDark: boolean;
  toggle: () => void;
} {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const resolved: Theme = stored ?? (prefersDark ? "dark" : "light");
    applyTheme(resolved);
    setTheme(resolved);
  }, []);

  function toggle(): void {
    const next: Theme = theme === "light" ? "dark" : "light";
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    setTheme(next);
  }

  return { theme, isDark: theme === "dark", toggle };
}
