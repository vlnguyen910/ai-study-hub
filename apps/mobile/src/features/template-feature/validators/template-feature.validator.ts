import { mapTemplateFeatureItem } from "../mappers/template-feature.mapper";
import type { TemplateFeatureResponse } from "../types/template.types";

export const parseTemplateFeatureResponse = (
  payload: unknown,
): TemplateFeatureResponse => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Dữ liệu trả về không hợp lệ");
  }

  const source = payload as { items?: unknown };
  if (!Array.isArray(source.items)) {
    throw new Error("Response không có danh sách items");
  }

  return {
    items: source.items.map((item) => mapTemplateFeatureItem(item)),
  };
};
