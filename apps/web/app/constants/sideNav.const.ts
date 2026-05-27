import { SideNavItem } from "../types/sideNav";

export const sideNavItems: readonly SideNavItem[] = [
  {
    label: "Feed",
    icon: "dynamic_feed",
    href: "/feed",
    section: "main",
    active: true,
  },
  {
    label: "My Courses",
    icon: "school",
    href: "/courses",
    section: "main",
  },
  {
    label: "Saved Documents",
    icon: "bookmark",
    href: "/saved-documents",
    section: "main",
  },
  {
    label: "Contributions",
    icon: "upload",
    href: "/upload",
    section: "main",
  },
  {
    label: "Settings",
    icon: "settings",
    href: "/settings",
    section: "secondary",
  },
];
