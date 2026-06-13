"use client";

import { InputField } from "@/components/ui/InputField";
import { AdminSelect } from "../../components/AdminPrimitives";
import type { AdminSettings } from "../../types";
import { SectionPanel } from "./SectionPanel";

const TIMEZONE_OPTIONS = [
  { label: "Việt Nam (Asia/Ho_Chi_Minh)", value: "Asia/Ho_Chi_Minh" },
  { label: "Bangkok (Asia/Bangkok)", value: "Asia/Bangkok" },
  { label: "UTC", value: "UTC" },
] as const;

type TimezoneValue = (typeof TIMEZONE_OPTIONS)[number]["value"];

interface GeneralSectionProps {
  readonly data: AdminSettings["general"];
  readonly onChange: <K extends keyof AdminSettings["general"]>(
    key: K,
    value: AdminSettings["general"][K],
  ) => void;
}

export function GeneralSection({
  data,
  onChange,
}: GeneralSectionProps): React.JSX.Element {
  return (
    <SectionPanel icon="tune" title="Cấu hình chung">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          label="Tên hệ thống"
          value={data.systemName}
          onChange={(e) => onChange("systemName", e.target.value)}
        />
        <InputField
          label="Ký hiệu logo"
          value={data.systemLogo}
          onChange={(e) => onChange("systemLogo", e.target.value)}
        />

        <label className="block sm:col-span-2">
          <span className="mb-1 block font-label-sm text-label-sm tracking-normal text-on-surface-variant">
            Mô tả hệ thống
          </span>
          <textarea
            className="min-h-28 w-full resize-y rounded border border-outline bg-surface px-3 py-2 font-body-md text-body-md outline-none focus:border-2 focus:border-primary focus:px-[11px] focus:py-[7px]"
            value={data.systemDescription}
            onChange={(e) => onChange("systemDescription", e.target.value)}
          />
        </label>

        <AdminSelect
          label="Múi giờ"
          options={TIMEZONE_OPTIONS}
          value={(data.timezone as TimezoneValue) ?? "Asia/Ho_Chi_Minh"}
          onChange={(value) => onChange("timezone", value)}
        />

        {/* Logo preview */}
        <div className="flex items-center gap-4 rounded border border-outline-variant bg-surface p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded bg-primary-fixed text-xl font-bold text-on-primary-fixed-variant">
            {data.systemLogo}
          </div>
          <div>
            <p className="font-label-md text-label-md tracking-normal">
              Biểu trưng
            </p>
            <p className="font-label-sm text-label-sm tracking-normal text-on-surface-variant">
              {data.systemName}
            </p>
          </div>
        </div>
      </div>
    </SectionPanel>
  );
}
