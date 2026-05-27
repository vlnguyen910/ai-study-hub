export const sideNavItems = [
  { label: "Feed", icon: "newsmode", href: "/feed", section: "main" },
  {
    label: "My Courses",
    icon: "school",
    href: "/courses",
    section: "main",
    active: true,
  },
  { label: "Saved Documents", icon: "docs", href: "/saved", section: "main" },
  { label: "Contributions", icon: "upload", href: "/upload", section: "main" },
  {
    label: "Settings",
    icon: "settings",
    href: "/settings",
    section: "secondary",
  },
] as const;
