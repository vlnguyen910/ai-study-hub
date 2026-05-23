import "@/global.css";

import { Platform } from "react-native";

const lightColors = {
  surface: "#faf8ff",
  surfaceContainerHigh: "#e7e7f3",
  primary: "#004ac6",
  surfaceVariant: "#e1e2ed",
  outline: "#737686",
  onBackground: "#191b23",
  onTertiaryFixed: "#360f00",
  error: "#ba1a1a",
  primaryFixedDim: "#b4c5ff",
  onSecondaryFixed: "#001d35",
  errorContainer: "#ffdad6",
  onPrimaryFixed: "#00174b",
  surfaceContainerLowest: "#ffffff",
  onTertiary: "#ffffff",
  background: "#faf8ff",
  primaryContainer: "#2563eb",
  outlineVariant: "#c3c6d7",
  onPrimaryFixedVariant: "#003ea8",
  inversePrimary: "#b4c5ff",
  onTertiaryContainer: "#ffede6",
  surfaceDim: "#d9d9e5",
  onSecondaryContainer: "#145283",
  tertiaryFixed: "#ffdbcd",
  surfaceTint: "#0053db",
  surfaceContainerHighest: "#e1e2ed",
  secondaryContainer: "#93c5fd",
  onSurfaceVariant: "#434655",
  onPrimaryContainer: "#eeefff",
  tertiary: "#943700",
  onError: "#ffffff",
  onTertiaryFixedVariant: "#7d2d00",
  surfaceContainerLow: "#f3f3fe",
  secondary: "#2b6193",
  inverseOnSurface: "#f0f0fb",
  primaryFixed: "#dbe1ff",
  onPrimary: "#ffffff",
  surfaceBright: "#faf8ff",
  onSecondary: "#ffffff",
  secondaryFixedDim: "#9ccaff",
  onSurface: "#191b23",
  inverseSurface: "#2e3039",
  secondaryFixed: "#d0e4ff",
  onErrorContainer: "#93000a",
  onSecondaryFixedVariant: "#03497a",
  tertiaryContainer: "#bc4800",
  tertiaryFixedDim: "#ffb596",
  surfaceContainer: "#ededf9",
} as const;

const darkColors = lightColors;

export const Colors = {
  light: lightColors,
  dark: darkColors,
} as const;

export type ThemeColor = keyof typeof lightColors;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "Inter",
    serif: "Inter",
    rounded: "Inter",
    mono: "Inter",
  },
});

export const Spacing = {
  marginMobile: 16,
  containerMax: 1280,
  base: 8,
  gutter: 24,
  marginDesktop: 40,
} as const;

export const Radius = {
  lg: 4,
  xl: 8,
  xxl: 16,
  full: 12,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
