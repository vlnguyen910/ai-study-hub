import { registerAs } from '@nestjs/config';

const PLACEHOLDER = 'PLACE_HOLDER';

export const googleAuthConfiguration = registerAs('googleAuth', () => ({
  webClientId: process.env.GOOGLE_WEB_CLIENT_ID || PLACEHOLDER,
  iosClientId: process.env.GOOGLE_IOS_CLIENT_ID || PLACEHOLDER,
  androidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID || PLACEHOLDER,
  clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || PLACEHOLDER,
  callbackUrl: process.env.GOOGLE_OAUTH_CALLBACK_URL || PLACEHOLDER,
  successRedirectUrl:
    process.env.GOOGLE_WEB_SUCCESS_REDIRECT_URL ||
    `${process.env.FRONTEND_URL || 'http://localhost:3000'}/user/login`,
  failureRedirectUrl:
    process.env.GOOGLE_WEB_FAILURE_REDIRECT_URL ||
    `${process.env.FRONTEND_URL || 'http://localhost:3000'}/user/login`,
  stateTtlSeconds: Number(process.env.GOOGLE_OAUTH_STATE_TTL_SECONDS || 600),
}));
