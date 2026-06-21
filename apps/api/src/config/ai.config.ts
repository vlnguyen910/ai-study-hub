import { registerAs } from '@nestjs/config';

export const aiConfiguration = registerAs('ai', () => ({
  apiKey: process.env.GEMINI_API_KEY ?? '',
}));
