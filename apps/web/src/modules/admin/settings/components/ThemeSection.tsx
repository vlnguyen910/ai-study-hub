"use client";

import { useTheme } from "@/hooks/useTheme";
import { SectionPanel } from "./SectionPanel";
import { ToggleRow } from "./ToggleRow";

export function ThemeSection(): React.JSX.Element {
  const { isDark, toggle } = useTheme();

  return (
    <SectionPanel icon="contrast" title="Giao diện">
      <ToggleRow label="Chế độ tối" checked={isDark} onChange={toggle} />
    </SectionPanel>
  );
}
