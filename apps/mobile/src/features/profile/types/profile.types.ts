export interface ProfileState {
  fullName: string;
  email: string;
  university: string;
  faculty: string;
  major: string;
  avatarUrl: string;
}

export type ProfileFieldKey = keyof Omit<ProfileState, "email">;
