"use client";

import { InputField } from "@/components/ui/InputField";
import type { AdminSettings } from "../../types";
import { SectionPanel } from "./SectionPanel";

interface EmailSectionProps {
  readonly data: AdminSettings["email"];
}

export function EmailSection({ data }: EmailSectionProps): React.JSX.Element {
  return (
    <SectionPanel icon="mail" title="Cài đặt email">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField label="Máy chủ SMTP" value={data.smtpServer} disabled />
        <InputField
          label="Cổng SMTP"
          type="number"
          value={data.smtpPort}
          disabled
        />
        <InputField label="Email gửi đi" value={data.senderEmail} disabled />
        <InputField label="Tên người gửi" value={data.senderName} disabled />
      </div>
      <p className="mt-4 rounded bg-surface-container-high px-4 py-3 font-label-sm text-label-sm text-on-surface-variant">
        Cấu hình SMTP được quản lý qua biến môi trường máy chủ. Liên hệ nhà phát
        triển để thay đổi.
      </p>
    </SectionPanel>
  );
}
