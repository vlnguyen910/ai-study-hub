import type { AxiosInstance } from "axios";

import { API_ENDPOINTS } from "@/constants/endpoints";
import { apiClient } from "@/services/api-client";
import type {
  AccountProfile,
  UpdateAccountProfilePayload,
} from "../types/profile.types";

type ApiEnvelope<T> = {
  message?: string;
  data?: T;
};

export type ProfileApiClient = Pick<AxiosInstance, "get" | "patch">;

const unwrap = <T>(response: { data: ApiEnvelope<T> | T }): T => {
  const data = response.data as ApiEnvelope<T>;
  return data && typeof data === "object" && "data" in data
    ? (data.data as T)
    : (response.data as T);
};

export const fetchMyProfile = async (
  client: ProfileApiClient = apiClient,
): Promise<AccountProfile> => {
  const response = await client.get(API_ENDPOINTS.ACCOUNTS.ME);
  return unwrap<AccountProfile>(response);
};

export const updateProfile = async (
  id: string,
  payload: UpdateAccountProfilePayload,
  client: ProfileApiClient = apiClient,
): Promise<AccountProfile> => {
  const response = await client.patch(
    API_ENDPOINTS.ACCOUNTS.DETAIL(id),
    payload,
  );
  return unwrap<AccountProfile>(response);
};
