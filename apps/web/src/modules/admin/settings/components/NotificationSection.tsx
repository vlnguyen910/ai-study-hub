"use client";

import { AdminSelect } from "../../components/AdminPrimitives";
import type { AdminSettings } from "../../types";
import { SectionPanel } from "./SectionPanel";
import { ToggleRow } from "./ToggleRow";

const ALERT_FREQUENCY_OPTIONS = [
  { label: "Ngay lập tức", value: "Ngay lập tức" },
  { label: "Mỗi giờ", value: "Mỗi giờ" },
  { label: "Hằng ngày", value: "Hằng ngày" },
] as const;

type FrequencyValue = (typeof ALERT_FREQUENCY_OPTIONS)[number]["value"];

interface NotificationSectionProps {
  readonly data: AdminSettings["notifications"];
  readonly onChange: <K extends keyof AdminSettings["notifications"]>(
    key: K,
    value: AdminSettings["notifications"][K],
  ) => void;
}

export function NotificationSection({
  data,
  onChange,
}: NotificationSectionProps): React.JSX.Element {
  return (
    <SectionPanel icon="notifications" title="Thông báo">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ToggleRow
          label="Cảnh báo qua email"
          checked={data.emailAlerts}
          onChange={(v) => onChange("emailAlerts", v)}
        />
        <ToggleRow
          label="Cảnh báo hệ thống"
          checked={data.systemAlerts}
          onChange={(v) => onChange("systemAlerts", v)}
        />
        <div className="sm:col-span-2">
          <AdminSelect
            label="Tần suất cảnh báo"
            options={ALERT_FREQUENCY_OPTIONS}
            value={(data.alertFrequency as FrequencyValue) ?? "Ngay lập tức"}
            onChange={(v) => onChange("alertFrequency", v)}
          />
        </div>
      </div>
    </SectionPanel>
  );
}
