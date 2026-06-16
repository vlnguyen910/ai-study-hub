export interface ProfileState {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
}

export type ProfileFieldKey = Exclude<keyof ProfileState, "id" | "email">;

export interface AccountProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateAccountProfilePayload {
  name?: string;
  avatarUrl?: string;
}
