"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { AdminCard, MaterialIcon } from "../components/AdminPrimitives";

type ConfigDraft = {
  systemName: string;
  supportEmail: string;
  maxUploadSizeMb: string;
  maxDocumentsPerPage: string;
  moderationLimit: string;
  allowedFileTypes: string;
};

const defaultConfig: ConfigDraft = {
  systemName: "AcademiShare",
  supportEmail: "support@academishare.vn",
  maxUploadSizeMb: "50",
  maxDocumentsPerPage: "12",
  moderationLimit: "10",
  allowedFileTypes: "pdf, docx, pptx, txt",
};

export default function AdminConfigPage(): React.JSX.Element {
  const [draft, setDraft] = useState(defaultConfig);
  const [savedConfig, setSavedConfig] = useState(defaultConfig);

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(savedConfig),
    [draft, savedConfig],
  );

  const updateField =
    (field: keyof ConfigDraft) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setDraft((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavedConfig(draft);
    toast.success("Đã lưu cấu hình hệ thống");
  };

  return (
    <div className="space-y-gutter">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="mb-1 font-headline-lg text-headline-lg text-on-surface">
            Cấu Hình Hệ Thống
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Thiết lập các giá trị vận hành chính cho nền tảng.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 text-on-surface-variant">
          <MaterialIcon name="settings_suggest" />
          <span className="font-label-md text-label-md">Admin config</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <AdminCard className="overflow-hidden">
          <div className="border-b border-outline-variant bg-surface-container-low px-6 py-4">
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Giá trị cấu hình
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
            <InputField
              label="Tên hệ thống"
              name="systemName"
              onChange={updateField("systemName")}
              value={draft.systemName}
            />
            <InputField
              label="Email hỗ trợ"
              name="supportEmail"
              onChange={updateField("supportEmail")}
              type="email"
              value={draft.supportEmail}
            />
            <InputField
              label="Dung lượng tải lên tối đa (MB)"
              min={1}
              name="maxUploadSizeMb"
              onChange={updateField("maxUploadSizeMb")}
              type="number"
              value={draft.maxUploadSizeMb}
            />
            <InputField
              label="Số tài liệu mỗi trang"
              min={1}
              name="maxDocumentsPerPage"
              onChange={updateField("maxDocumentsPerPage")}
              type="number"
              value={draft.maxDocumentsPerPage}
            />
            <InputField
              label="Số mục chờ duyệt mỗi trang"
              min={1}
              name="moderationLimit"
              onChange={updateField("moderationLimit")}
              type="number"
              value={draft.moderationLimit}
            />
            <InputField
              label="Định dạng tài liệu cho phép"
              name="allowedFileTypes"
              onChange={updateField("allowedFileTypes")}
              value={draft.allowedFileTypes}
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-outline-variant bg-surface-container-lowest px-6 py-4 sm:flex-row sm:justify-end">
            <Button
              disabled={!isDirty}
              onClick={() => setDraft(savedConfig)}
              type="button"
              variant="secondary"
            >
              Hoàn tác
            </Button>
            <Button disabled={!isDirty} type="submit">
              Lưu cấu hình
            </Button>
          </div>
        </AdminCard>
      </form>
    </div>
  );
}
