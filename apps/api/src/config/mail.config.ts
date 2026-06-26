import { registerAs } from '@nestjs/config';

export const mailConfiguration = registerAs('mail', () => ({
  apiKey: process.env.RESEND_API_KEY || '',
  fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@ai-study-hub.local',
  fromName: process.env.RESEND_FROM_NAME || 'AI Study Hub',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
}));
