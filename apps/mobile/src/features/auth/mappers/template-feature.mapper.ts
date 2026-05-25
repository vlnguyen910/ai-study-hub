import type { TemplateFeatureItem } from "../types/auth.types";

let generatedId = 0;

const toStringValue = (value: unknown, fallback: string): string => {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : fallback;
};

export const mapTemplateFeatureItem = (
  payload: unknown,
): TemplateFeatureItem => {
  const source =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};

  return {
    id: toStringValue(source.id, `local-${++generatedId}`),
    title: toStringValue(source.title, "Untitled"),
    description: toStringValue(source.description, "No description"),
    updatedAt: toStringValue(source.updatedAt, new Date().toISOString()),
  };
};
