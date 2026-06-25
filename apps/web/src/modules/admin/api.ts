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

export interface AdminDashboardStats {
  readonly accounts: {
    readonly total: number;
    readonly active: number;
    readonly banned: number;
    readonly unverified: number;
  };
  readonly subjects: {
    readonly total: number;
  };
  readonly documents: {
    readonly total: number;
    readonly active: number;
    readonly pending: number;
    readonly rejected: number;
  };
}

export const fetchAdminDashboardStats =
  async (): Promise<AdminDashboardStats> => {
    return apiClient.get<unknown, AdminDashboardStats>(
      API_ENDPOINTS.ADMIN.DASHBOARD,
    );
  };

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

export interface AdminSubject {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly schoolId: string;
  readonly createdAt: string;
  readonly updatedAt?: string;
}

export interface FetchAdminSubjectsParams {
  readonly page?: number;
  readonly limit?: number;
  readonly schoolId?: string;
  readonly search?: string;
}

export interface FetchAdminSubjectsResponse {
  readonly subjects: readonly AdminSubject[];
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
  };
}

export interface CreateAdminSubjectPayload {
  readonly name: string;
  readonly code: string;
  readonly schoolId?: string;
}

export interface UpdateAdminSubjectPayload {
  readonly name?: string;
  readonly code?: string;
}

export const fetchAdminSubjects = async (
  params: FetchAdminSubjectsParams = {},
): Promise<FetchAdminSubjectsResponse> => {
  return apiClient.get<unknown, FetchAdminSubjectsResponse>(
    API_ENDPOINTS.SUBJECTS.BASE,
    {
      params: {
        page: params.page,
        limit: params.limit,
        schoolId: params.schoolId,
        search: params.search,
      },
    },
  );
};

export const fetchAdminSubjectDetail = async (
  id: string,
): Promise<AdminSubject> => {
  return apiClient.get<unknown, AdminSubject>(
    API_ENDPOINTS.SUBJECTS.DETAIL(id),
  );
};

export const createAdminSubject = async (
  payload: CreateAdminSubjectPayload,
): Promise<AdminSubject> => {
  return apiClient.post<unknown, AdminSubject>(
    API_ENDPOINTS.SUBJECTS.BASE,
    payload,
  );
};

export const updateAdminSubject = async (
  id: string,
  payload: UpdateAdminSubjectPayload,
): Promise<AdminSubject> => {
  return apiClient.patch<unknown, AdminSubject>(
    API_ENDPOINTS.SUBJECTS.DETAIL(id),
    payload,
  );
};

export const deleteAdminSubject = async (id: string): Promise<unknown> => {
  return apiClient.delete(API_ENDPOINTS.SUBJECTS.DETAIL(id));
};

export type AuditAction =
  | "BAN_USER"
  | "UNBAN_USER"
  | "APPROVE_DOCUMENT"
  | "REJECT_DOCUMENT"
  | "DELETE_DOCUMENT"
  | "UPDATE_SYSTEM_SETTINGS"
  | "UPDATE_DOCUMENT_VISIBILITY"
  | "CREATE_SUBJECT"
  | "UPDATE_SUBJECT"
  | "DELETE_SUBJECT";

export type AuditTargetType =
  | "USER"
  | "DOCUMENT"
  | "SYSTEM_SETTING"
  | "SUBJECT";

export interface AuditLogActor {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly avatarUrl?: string | null;
}

export interface AuditLog {
  readonly id: string;
  readonly actorId?: string | null;
  readonly actor?: AuditLogActor | null;
  readonly actorRole?: AdminAccountRole | null;
  readonly action: AuditAction;
  readonly targetType?: AuditTargetType | null;
  readonly targetId?: string | null;
  readonly targetName?: string | null;
  readonly createdAt: string;
}

export interface FetchAuditLogsParams {
  readonly page?: number;
  readonly limit?: number;
  readonly actorId?: string;
  readonly actorName?: string;
  readonly action?: AuditAction;
  readonly targetType?: AuditTargetType;
  readonly from?: string;
  readonly to?: string;
  readonly startDate?: string;
  readonly endDate?: string;
}

export interface FetchAuditLogsResponse {
  readonly logs: readonly AuditLog[];
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
  };
}

export const fetchAuditLogs = async (
  params: FetchAuditLogsParams = {},
): Promise<FetchAuditLogsResponse> => {
  return apiClient.get<unknown, FetchAuditLogsResponse>(
    API_ENDPOINTS.ADMIN.AUDIT_LOGS,
    {
      params,
    },
  );
};
