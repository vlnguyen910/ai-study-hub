import type { AuthDeviceInfo } from './signup.dto';

export class SigninDto {
  email!: string;
  password!: string;
  deviceInfo?: AuthDeviceInfo;
}
