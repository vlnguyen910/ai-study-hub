import { registerAs } from '@nestjs/config';

export const resendConfiguration = registerAs('resend', () => ({
  apiKey: process.env.RESEND_API_KEY || '',
  fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@ai-study-hub.local',
  fromName: process.env.RESEND_FROM_NAME || 'AI Study Hub',
}));
