/** @type {import('tailwindcss').Config} */
const { hairlineWidth, platformSelect } = require("nativewind/theme");

module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  darkMode: "class", // Enable manual toggling of dark mode
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/features/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // NativeWindUI Colors
        border: withOpacity("border"),
        input: withOpacity("input"),
        ring: withOpacity("ring"),
        background: withOpacity("background"),
        foreground: withOpacity("foreground"),
        primary: {
          DEFAULT: withOpacity("primary"),
          foreground: withOpacity("primary-foreground"),
        },
        secondary: {
          DEFAULT: withOpacity("secondary"),
          foreground: withOpacity("secondary-foreground"),
        },
        destructive: {
          DEFAULT: withOpacity("destructive"),
          foreground: withOpacity("destructive-foreground"),
        },
        muted: {
          DEFAULT: withOpacity("muted"),
          foreground: withOpacity("muted-foreground"),
        },
        accent: {
          DEFAULT: withOpacity("accent"),
          foreground: withOpacity("accent-foreground"),
        },
        popover: {
          DEFAULT: withOpacity("popover"),
          foreground: withOpacity("popover-foreground"),
        },
        card: {
          DEFAULT: withOpacity("card"),
          foreground: withOpacity("card-foreground"),
        },

        // Existing Material 3 Theme Colors (using CSS variables)
        surface: "var(--color-surface)",
        "surface-container-high": "var(--color-surface-container-high)",
        "surface-variant": "var(--color-surface-variant)",
        outline: "var(--color-outline)",
        "on-background": "var(--color-on-background)",
        "on-tertiary-fixed": "var(--color-on-tertiary-fixed)",
        error: "var(--color-error)",
        "primary-fixed-dim": "var(--color-primary-fixed-dim)",
        "on-secondary-fixed": "var(--color-on-secondary-fixed)",
        "error-container": "var(--color-error-container)",
        "on-primary-fixed": "var(--color-on-primary-fixed)",
        "surface-container-lowest": "var(--color-surface-container-lowest)",
        "on-tertiary": "var(--color-on-tertiary)",
        "primary-container": "var(--color-primary-container)",
        "outline-variant": "var(--color-outline-variant)",
        "on-primary-fixed-variant": "var(--color-on-primary-fixed-variant)",
        "inverse-primary": "var(--color-inverse-primary)",
        "on-tertiary-container": "var(--color-on-tertiary-container)",
        "surface-dim": "var(--color-surface-dim)",
        "on-secondary-container": "var(--color-on-secondary-container)",
        "tertiary-fixed": "var(--color-tertiary-fixed)",
        "surface-tint": "var(--color-surface-tint)",
        "surface-container-highest": "var(--color-surface-container-highest)",
        "secondary-container": "var(--color-secondary-container)",
        "on-surface-variant": "var(--color-on-surface-variant)",
        "on-primary-container": "var(--color-on-primary-container)",
        tertiary: "var(--color-tertiary)",
        "on-error": "var(--color-on-error)",
        "on-tertiary-fixed-variant": "var(--color-on-tertiary-fixed-variant)",
        "surface-container-low": "var(--color-surface-container-low)",
        "inverse-on-surface": "var(--color-inverse-on-surface)",
        "primary-fixed": "var(--color-primary-fixed)",
        "on-primary": "var(--color-on-primary)",
        "surface-bright": "var(--color-surface-bright)",
        "on-secondary": "var(--color-on-secondary)",
        "secondary-fixed-dim": "var(--color-secondary-fixed-dim)",
        "on-surface": "var(--color-on-surface)",
        "inverse-surface": "var(--color-inverse-surface)",
        "secondary-fixed": "var(--color-secondary-fixed)",
        "on-error-container": "var(--color-on-error-container)",
        "on-secondary-fixed-variant": "var(--color-on-secondary-fixed-variant)",
        "tertiary-container": "var(--color-tertiary-container)",
        "tertiary-fixed-dim": "var(--color-tertiary-fixed-dim)",
        "surface-container": "var(--color-surface-container)",
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
    },
  },
  plugins: [],
};

function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return platformSelect({
        ios: `rgb(var(--${variableName}) / ${opacityValue})`,
        android: `rgb(var(--android-${variableName}) / ${opacityValue})`,
      });
    }
    return platformSelect({
      ios: `rgb(var(--${variableName}))`,
      android: `rgb(var(--android-${variableName}))`,
    });
  };
}
