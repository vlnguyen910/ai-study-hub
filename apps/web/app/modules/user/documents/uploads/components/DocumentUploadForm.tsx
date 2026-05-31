"use client";

import { useState } from "react";

import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";
import { Button } from "@/components/ui/Button";
import {
  SCHOOL_OPTIONS,
  SUBJECT_OPTIONS,
} from "../../../../../mockdata/document.form";

export function DocumentUploadForm(): React.JSX.Element {
  const [subject, setSubject] = useState<string>(SUBJECT_OPTIONS[0]);

  const [school, setSchool] = useState<string>(SCHOOL_OPTIONS[0]);

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="
        w-full
        max-w-4xl
        space-y-6

      "
    >
      {/* Row 1 */}
      <div>
        <InputField
          label="Tên tài liệu"
          placeholder="Ví dụ: Tổng hợp kiến thức ReactJS"
        />
      </div>

      {/* Row 2 */}
      <div
        className="
          grid
          grid-cols-1
          gap-4
          md:grid-cols-2
        "
      >
        <SelectField
          label="Môn học"
          options={SUBJECT_OPTIONS}
          value={subject}
          onChange={setSubject}
        />

        <SelectField
          label="Trường học"
          options={SCHOOL_OPTIONS}
          value={school}
          onChange={setSchool}
        />
      </div>

      {/* Row 3 */}
      <div>
        <InputField
          label="Mô tả chi tiết"
          placeholder="Mô tả nội dung tài liệu, nguồn tham khảo hoặc thông tin hữu ích..."
        />
      </div>

      {/* Row 4 */}
      <div>
        <InputField
          label="Thẻ tag (phân tách bằng dấu phẩy)"
          placeholder="reactjs, frontend, javascript"
          helperText="Ví dụ: reactjs, frontend, javascript"
        />
      </div>

      {/* Footer */}
      <div
        className="
          flex
          flex-col-reverse
          gap-3
          pt-4
          sm:flex-row
          sm:justify-end
        "
      >
        <Button type="button" variant="secondary" className="w-full sm:w-auto">
          Lưu nháp
        </Button>

        <Button type="submit" variant="primary" className="w-full sm:w-auto">
          Công khai tài liệu
        </Button>
      </div>
    </form>
  );
}
