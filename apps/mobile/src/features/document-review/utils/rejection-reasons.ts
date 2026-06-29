export const REJECTION_REASON_OPTIONS = [
  "Nội dung trùng lặp",
  "Sai định dạng / file lỗi",
  "Vi phạm bản quyền",
  "Nội dung không phù hợp",
  "Khác",
] as const;

export type RejectionReasonOption = (typeof REJECTION_REASON_OPTIONS)[number];

export const OTHER_REJECTION_REASON: RejectionReasonOption = "Khác";

export const resolveRejectionReason = (
  selectedReason: RejectionReasonOption | "",
  customReason: string,
): string => {
  if (!selectedReason) return "";
  return selectedReason === OTHER_REJECTION_REASON
    ? customReason.trim()
    : selectedReason;
};
