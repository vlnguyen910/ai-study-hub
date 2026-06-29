import {
  REJECTION_REASON_OPTIONS,
  resolveRejectionReason,
} from "@/features/document-review/utils/rejection-reasons";

describe("rejection reasons", () => {
  it("matches the web quick reason list", () => {
    expect(REJECTION_REASON_OPTIONS).toEqual([
      "Nội dung trùng lặp",
      "Sai định dạng / file lỗi",
      "Vi phạm bản quyền",
      "Nội dung không phù hợp",
      "Khác",
    ]);
  });

  it("uses a preset reason unless the custom option is selected", () => {
    expect(resolveRejectionReason("Vi phạm bản quyền", "custom")).toBe(
      "Vi phạm bản quyền",
    );
    expect(resolveRejectionReason("Khác", "  Cần bổ sung nguồn.  ")).toBe(
      "Cần bổ sung nguồn.",
    );
    expect(resolveRejectionReason("", "ignored")).toBe("");
  });
});
