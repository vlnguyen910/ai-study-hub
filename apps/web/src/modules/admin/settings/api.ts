import { apiClient } from "@/lib/axios";
import type { AdminSettings } from "../types";

export async function fetchSystemSettings(): Promise<AdminSettings> {
  return apiClient.get("/api/v1/admin/settings") as unknown as AdminSettings;
}

export async function updateSystemSettings(
  payload: Partial<AdminSettings>,
): Promise<AdminSettings> {
  return apiClient.patch(
    "/api/v1/admin/settings",
    payload,
  ) as unknown as AdminSettings;
}
