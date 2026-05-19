---
name: Ethereal Study
colors:
  surface: "#111318"
  surface-dim: "#111318"
  surface-bright: "#37393e"
  surface-container-lowest: "#0c0e13"
  surface-container-low: "#191c20"
  surface-container: "#1d2025"
  surface-container-high: "#282a2f"
  surface-container-highest: "#33353a"
  on-surface: "#e2e2e9"
  on-surface-variant: "#c9c4d7"
  inverse-surface: "#e2e2e9"
  inverse-on-surface: "#2e3036"
  outline: "#938ea1"
  outline-variant: "#484555"
  surface-tint: "#cabeff"
  primary: "#cabeff"
  on-primary: "#32009a"
  primary-container: "#947dff"
  on-primary-container: "#2b0088"
  inverse-primary: "#613ede"
  secondary: "#ccc2db"
  on-secondary: "#332d41"
  secondary-container: "#4c465a"
  on-secondary-container: "#bdb4cd"
  tertiary: "#c9c4d2"
  on-tertiary: "#312f39"
  tertiary-container: "#928f9b"
  on-tertiary-container: "#2a2833"
  error: "#ffb4ab"
  on-error: "#690005"
  error-container: "#93000a"
  on-error-container: "#ffdad6"
  primary-fixed: "#e6deff"
  primary-fixed-dim: "#cabeff"
  on-primary-fixed: "#1c0062"
  on-primary-fixed-variant: "#481bc6"
  secondary-fixed: "#e8def8"
  secondary-fixed-dim: "#ccc2db"
  on-secondary-fixed: "#1e192b"
  on-secondary-fixed-variant: "#4a4458"
  tertiary-fixed: "#e5e0ee"
  tertiary-fixed-dim: "#c9c4d2"
  on-tertiary-fixed: "#1c1a24"
  on-tertiary-fixed-variant: "#474550"
  background: "#111318"
  on-background: "#e2e2e9"
  surface-variant: "#33353a"
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: "700"
    lineHeight: 36px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: "700"
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: "600"
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: "600"
    lineHeight: 16px
    letterSpacing: 0.5px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-mobile: 1rem
  gutter-md: 1rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 1.5rem
---

## Brand & Style

This design system is built for a focused, high-productivity learning environment. It targets students and educators who require a low-distraction, yet modern interface for managing academic resources and AI interactions.

## Token Source Of Truth

Shared design tokens live in `packages/tokens`.

- Use that package for primitives and semantic aliases shared by web and mobile.
- Keep app-local files focused on platform adapters, not duplicate token definitions.
- Mobile-specific adaptation happens in `apps/mobile/src/constants/theme.ts`.
- Web token exposure happens in `apps/web/app/layout.tsx` and `apps/web/app/globals.css`.
- For import examples, see [SHARED_TOKENS.md](SHARED_TOKENS.md).

The visual style is **Corporate Modern with Glassmorphic influences**. It balances a deep, immersive dark theme with vibrant accents to maintain high energy without causing eye strain. The interface should feel intelligent, premium, and seamless, utilizing subtle transparency and soft glow effects to guide the user's attention toward active tasks.

## Colors

The color palette is dominated by "Deep Space" tones to provide maximum contrast for white typography and vibrant action elements.

- **Primary:** A vibrant electric purple used for primary buttons, active states, and highlights.
- **Secondary:** A rich navy-purple used for card surfaces and navigation elements to differentiate them from the background.
- **Background:** A near-black navy that serves as the foundation for the dark mode experience.
- **Success/Neutral:** Pure white for high-readability text, with soft greys for secondary information.

Use gradients sparingly, primarily for large surface areas or specific "AI" states, moving from the primary purple into deeper violet tones.

## Typography

The design system utilizes **Plus Jakarta Sans** to maintain a friendly, contemporary, and highly legible feel across all mobile touchpoints.

Headlines are bold and authoritative, using tighter tracking. Body text maintains a generous line height to ensure readability during long study sessions. Labels use uppercase or semi-bold weights to clearly distinguish metadata from primary content. On mobile, headlines scale down slightly to ensure headers do not consume excessive vertical real estate.

## Layout & Spacing

This design system uses a **Fluid Grid** model optimized for mobile constraints.

- **Margins:** Standard 16px (1rem) side margins for all screen edges.
- **Rhythm:** A 4px/8px incremental system governs all vertical stacks.
- **Safe Areas:** Ensure interactive elements (buttons, inputs) are at least 44px in height for touch accessibility.
- **Mobile Reflow:** For the transition from desktop to mobile, the sidebar navigation collapses into a bottom navigation bar or a condensed "hamburger" menu. Content cards occupy the full width of the available space minus the standard margins.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and subtle **Backdrop Blurs**.

1.  **Level 0 (Background):** The deepest navy (`#0C0B14`).
2.  **Level 1 (Surfaces):** Cards and navigation bars use a slightly lighter navy (`#1E192B`) with a very thin (1px) low-opacity border to define edges.
3.  **Level 2 (Overlays/Modals):** These use glassmorphism—80% opacity of the surface color with a 15px backdrop blur.
4.  **Shadows:** Shadows are avoided in favor of tonal separation. When used, they are "Ambient Glows" where the shadow color matches the primary purple but at 10-15% opacity to simulate a light-emitting element.

## Shapes

The design system utilizes a **Rounded** shape language to feel approachable and modern.

- **Standard Elements:** Buttons and input fields use a 0.5rem (8px) radius.
- **Containers:** Cards and modal containers use a 1rem (16px) radius to create a distinct soft frame.
- **Interactive Indicators:** Small indicators (like active state pills) may use a fully rounded "pill" shape (2rem+) to stand out.

## Components

- **Buttons:** Primary buttons are solid purple (`#7C5DFA`) with white text. Secondary buttons use a ghost style with a purple outline or a subtle grey-purple fill.
- **Input Fields:** Dark-filled backgrounds (`#16121F`) with a 1px border that glows purple on focus. Labels sit clearly above the field in a smaller, semi-bold font.
- **Cards:** Used for document previews and AI chat bubbles. These feature high-contrast icons and 16px internal padding.
- **Chips:** Small, low-profile badges for tagging subjects or file types, using a subtle background tint and high-contrast text.
- **Lists:** Clean rows with 16px vertical padding, separated by 1px dark dividers or simple spacing.
- **AI Chat Interface:** User bubbles should be distinct from the background (using a deep violet surface), while the AI responses utilize the secondary surface color to signify "system" status.
