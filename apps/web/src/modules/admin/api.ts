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

// In-memory mock database for subjects
let mockSubjects: AdminSubject[] = [
  {
    id: "sub-1",
    name: "Mathematics",
    code: "MATH",
    schoolId: "school-fptu",
    createdAt: "2026-06-08T00:00:00.000Z",
  },
  {
    id: "sub-2",
    name: "Physics",
    code: "PHYS",
    schoolId: "school-fptu",
    createdAt: "2026-06-08T10:00:00.000Z",
  },
  {
    id: "sub-3",
    name: "Chemistry",
    code: "CHEM",
    schoolId: "school-fptu",
    createdAt: "2026-06-09T08:00:00.000Z",
  },
  {
    id: "sub-4",
    name: "Computer Science",
    code: "CS",
    schoolId: "school-fptu",
    createdAt: "2026-06-09T14:00:00.000Z",
  },
  {
    id: "sub-5",
    name: "Programming",
    code: "PROG",
    schoolId: "school-fptu",
    createdAt: "2026-06-10T09:00:00.000Z",
  },
];

export const fetchAdminSubjects = async (
  params: FetchAdminSubjectsParams = {},
): Promise<FetchAdminSubjectsResponse> => {
  const { page = 1, limit = 10, schoolId, search } = params;

  if (search) {
    console.log(`Mock API Call: GET api/v1/subject?search=${search}`);
  } else {
    console.log(`Mock API Call: GET api/v1/subjects`, params);
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filtered = [...mockSubjects];
  if (schoolId) {
    filtered = filtered.filter((s) => s.schoolId === schoolId);
  }
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (subj) =>
        subj.name.toLowerCase().includes(s) ||
        subj.code.toLowerCase().includes(s),
    );
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  return {
    subjects: paginated,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

export const fetchAdminSubjectDetail = async (
  id: string,
): Promise<AdminSubject> => {
  console.log(`Mock API Call: GET api/v1/subjects/${id}`);

  await new Promise((resolve) => setTimeout(resolve, 300));
  const subject = mockSubjects.find((s) => s.id === id);
  if (!subject) throw new Error("Subject not found");
  return subject;
};

export const createAdminSubject = async (
  payload: CreateAdminSubjectPayload,
): Promise<AdminSubject> => {
  console.log("Mock API Call: POST api/v1/subjects", payload);

  await new Promise((resolve) => setTimeout(resolve, 500));
  const newSubject: AdminSubject = {
    id: `sub-${Math.random().toString(36).substring(2, 9)}`,
    name: payload.name,
    code: payload.code.toUpperCase(),
    schoolId: payload.schoolId || "school-fptu",
    createdAt: new Date().toISOString(),
  };
  mockSubjects = [newSubject, ...mockSubjects];
  return newSubject;
};

export const updateAdminSubject = async (
  id: string,
  payload: UpdateAdminSubjectPayload,
): Promise<AdminSubject> => {
  console.log(`Mock API Call: PATCH api/v1/subjects`, { id, payload });

  await new Promise((resolve) => setTimeout(resolve, 500));
  const index = mockSubjects.findIndex((s) => s.id === id);
  if (index === -1) throw new Error("Subject not found");
  const updated = {
    ...mockSubjects[index],
    name: payload.name ?? mockSubjects[index].name,
    code: payload.code ? payload.code.toUpperCase() : mockSubjects[index].code,
    updatedAt: new Date().toISOString(),
  };
  mockSubjects[index] = updated;
  return updated;
};

export const deleteAdminSubject = async (id: string): Promise<unknown> => {
  console.log(`Mock API Call: DELETE api/v1/subject`, { id });

  await new Promise((resolve) => setTimeout(resolve, 500));
  mockSubjects = mockSubjects.filter((s) => s.id !== id);
  return { message: "Subject deleted successfully" };
};
