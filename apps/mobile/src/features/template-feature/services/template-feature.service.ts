import { parseTemplateFeatureResponse } from "@/features/template-feature/validators/template-feature.validator";
import type { TemplateFeatureItem } from "@/features/template-feature/types/template.types";

const DEFAULT_API_BASE_URL = "http://localhost:8080";

export class TemplateFeatureServiceError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "TemplateFeatureServiceError";
    this.status = status;
  }
}

export const getApiBaseUrl = (): string => {
  return process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL;
};

export const fetchTemplateFeatureItems = async (
  fetchImpl: typeof fetch = fetch,
): Promise<TemplateFeatureItem[]> => {
  const response = await fetchImpl(`${getApiBaseUrl()}/template-feature`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new TemplateFeatureServiceError(
      "Không thể tải dữ liệu template feature",
      response.status,
    );
  }

  const json = await response.json();
  const parsed = parseTemplateFeatureResponse(json);
  return parsed.items;
};
