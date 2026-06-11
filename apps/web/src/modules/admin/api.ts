import { apiClient } from "@/lib/axios";
import { API_ENDPOINTS } from "@/shared/constants";

export type AdminAccountRole = "ADMIN" | "MODERATOR" | "USER";
export type AdminAccountStatus = "UNVERIFIED" | "ACTIVE" | "BANNED" | "DELETED";

export interface AdminAccount {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly avatarUrl?: string | null;
  readonly role: AdminAccountRole;
  readonly status: AdminAccountStatus;
  readonly createdAt: string;
  readonly updatedAt?: string;
}

export interface FetchAdminAccountsParams {
  readonly createdFrom?: string;
  readonly createdTo?: string;
}

export interface CreateAdminAccountPayload {
  readonly email: string;
  readonly name: string;
  readonly password: string;
  readonly avatarUrl?: string;
  readonly role?: AdminAccountRole;
  readonly status?: AdminAccountStatus;
}

export const fetchAdminAccounts = async (
  params: FetchAdminAccountsParams = {},
): Promise<AdminAccount[]> => {
  return apiClient.get<unknown, AdminAccount[]>(API_ENDPOINTS.ACCOUNTS.BASE, {
    params: {
      ...(params.createdFrom ? { createdFrom: params.createdFrom } : {}),
      ...(params.createdTo ? { createdTo: params.createdTo } : {}),
    },
  });
};

export const fetchAdminAccountDetail = async (
  id: string,
): Promise<AdminAccount> => {
  return apiClient.get<unknown, AdminAccount>(
    API_ENDPOINTS.ACCOUNTS.DETAIL(id),
  );
};

export const createAdminAccount = async (
  payload: CreateAdminAccountPayload,
): Promise<unknown> => {
  return apiClient.post(API_ENDPOINTS.ACCOUNTS.BASE, payload);
};

export const banAdminAccount = async (id: string): Promise<unknown> => {
  return apiClient.patch(API_ENDPOINTS.ACCOUNTS.BAN(id));
};
