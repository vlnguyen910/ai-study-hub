export type SettingsTab = "account" | "security" | "theme" | "moderator";

export interface SettingsNavItem {
  readonly key: SettingsTab;
  readonly label: string;
  readonly icon: string;
}
