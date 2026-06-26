import { registerAs } from '@nestjs/config';

export const mailConfiguration = registerAs('mail', () => ({
  apiKey: process.env.RESEND_API_KEY || '',
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: +(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  fromEmail:
    process.env.RESEND_FROM_EMAIL ||
    process.env.SMTP_USER ||
    'noreply@ai-study-hub.local',
  fromName: process.env.RESEND_FROM_NAME || 'AI Study Hub',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
}));
