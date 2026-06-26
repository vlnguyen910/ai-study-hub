import axios, { type AxiosInstance } from "axios";
import { parseTemplateFeatureResponse } from "@/features/template-feature/validators/template-feature.validator";
import type { TemplateFeatureItem } from "@/features/template-feature/types/template.types";
import { apiClient } from "@/services";

export class TemplateFeatureServiceError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "TemplateFeatureServiceError";
    this.status = status;
  }
}

export type ApiClient = Pick<AxiosInstance, "get">;

export const fetchTemplateFeatureItems = async (
  client: ApiClient = apiClient,
): Promise<TemplateFeatureItem[]> => {
  try {
    const response = await client.get("/template-feature");
    const parsed = parseTemplateFeatureResponse(response.data);
    return parsed.items;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new TemplateFeatureServiceError(
        "Không thể tải dữ liệu template feature",
        error.response?.status,
      );
    }

    if (error instanceof Error) {
      throw new TemplateFeatureServiceError(error.message);
    }

    throw new TemplateFeatureServiceError(
      "Không thể tải dữ liệu template feature",
    );
  }
};
