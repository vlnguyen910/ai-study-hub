"use client";

import { useLayoutEffect, useEffect, type ReactNode } from "react";
import { useThemeStore } from "@/stores";

// Safely toggle between useLayoutEffect on the client and useEffect on the server to avoid hydration warnings
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  const theme = useThemeStore((state) => state.theme);
  const hasHydrated = useThemeStore((state) => state.hasHydrated);

  useIsomorphicLayoutEffect(() => {
    if (!hasHydrated) return;

    const root = document.documentElement;

    // Check before editing DOM to prevent redundant layout reflows
    if (!root.classList.contains(theme)) {
      root.classList.remove("light", "dark");
      root.classList.add(theme);
    }

    if (root.style.colorScheme !== theme) {
      root.style.colorScheme = theme;
    }
  }, [theme, hasHydrated]);

  return <>{children}</>;
}
