export type AuthDeviceInfo = 'WEB' | 'MOBILE';

export class SignupDto {
  email!: string;
  name!: string;
  password!: string;
  avatarUrl?: string;
  deviceInfo?: AuthDeviceInfo;
}
