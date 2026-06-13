"use client";

import { InputField } from "@/components/ui/InputField";
import type { AdminSettings } from "../../types";
import { SectionPanel } from "./SectionPanel";
import { ToggleRow } from "./ToggleRow";

interface SecuritySectionProps {
  readonly data: AdminSettings["security"];
  readonly onChange: <K extends keyof AdminSettings["security"]>(
    key: K,
    value: AdminSettings["security"][K],
  ) => void;
}

export function SecuritySection({
  data,
  onChange,
}: SecuritySectionProps): React.JSX.Element {
  return (
    <SectionPanel icon="security" title="Cài đặt bảo mật">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          label="Độ dài mật khẩu tối thiểu"
          type="number"
          min={6}
          value={data.passwordMinLength}
          onChange={(e) =>
            onChange("passwordMinLength", Number(e.target.value))
          }
        />
        <InputField
          label="Chu kỳ đổi mật khẩu (ngày)"
          type="number"
          min={0}
          value={data.passwordExpiry}
          onChange={(e) => onChange("passwordExpiry", Number(e.target.value))}
        />
        <InputField
          label="Thời gian hết phiên (phút)"
          type="number"
          min={5}
          value={data.sessionTimeout}
          onChange={(e) => onChange("sessionTimeout", Number(e.target.value))}
        />
        <ToggleRow
          label="Yêu cầu 2FA cho admin"
          checked={data.twoFAEnabled}
          onChange={(v) => onChange("twoFAEnabled", v)}
        />
      </div>
    </SectionPanel>
  );
}
