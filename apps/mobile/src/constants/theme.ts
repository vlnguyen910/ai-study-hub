import "@/global.css";

import { Platform } from "react-native";

import {
  fontFamilies,
  radius,
  semanticColors,
  spacing,
  type ThemeColorName,
} from "@repo/tokens";

export const Colors = {
  light: semanticColors.light,
  dark: semanticColors.dark,
} as const;

export type ThemeColor = ThemeColorName;

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
    sans: fontFamilies.display,
    serif: fontFamilies.serif,
    rounded: fontFamilies.body,
    mono: fontFamilies.mono,
  },
});

export const Spacing = spacing;

export const Radius = radius;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
