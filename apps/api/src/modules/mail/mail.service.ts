import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Resend } from 'resend';
import { mailConfiguration } from '../../config';
import { accounts } from '@prisma/client';
import { NodeEnv } from '../../common/enums';

type VerificationEmailAccount = Pick<accounts, 'email' | 'name'>;
type PasswordResetEmailAccount = Pick<accounts, 'email' | 'name'>;

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;

  constructor(
    @Inject(mailConfiguration.KEY)
    private readonly mailConfig: ConfigType<typeof mailConfiguration>,
  ) {
    this.resend = this.mailConfig.apiKey
      ? new Resend(this.mailConfig.apiKey)
      : null;
  }

  async sendVerificationCode(account: VerificationEmailAccount, token: string) {
    const verificationUrl = this.buildVerificationUrl(token);

    if (!this.resend) {
      this.logger.log(
        process.env.NODE_ENV === NodeEnv.Development
          ? `Email verification link for ${account.email}: ${verificationUrl}`
          : 'Resend API key is not configured. Skipping sending verification email.',
      );
      return;
    }

    try {
      const { error } = await this.resend.emails.send({
        from: `"${this.mailConfig.fromName}" <${this.mailConfig.fromEmail}>`,
        to: account.email,
        subject: 'Verify your AI Study Hub email',
        html: this.getVerificationHtml(account.name, verificationUrl),
        text: [
          `Hi ${account.name},`,
          '',
          `Click the link below to verify your email address and complete your registration:`,
          verificationUrl,
          '',
          'If you did not create an account, please ignore this email.',
          '',
          'Best regards,',
          'The AI Study Hub Team',
        ].join('\n'),
      });

      if (error) {
        this.logger.error(
          `Failed to send verification email: ${error.message}`,
        );
        throw error;
      }
    } catch (err) {
      this.logger.error(
        `Error sending verification email to ${account.email}:`,
        err,
      );
      throw err;
    }
  }

  async sendPasswordResetLink(
    account: PasswordResetEmailAccount,
    token: string,
    ttlSeconds: number,
  ) {
    const resetUrl = this.buildPasswordResetUrl(token);
    const ttlMinutes = Math.max(1, Math.ceil(ttlSeconds / 60));

    if (!this.resend) {
      this.logger.log(
        process.env.NODE_ENV === NodeEnv.Development
          ? `Password reset link for ${account.email}: ${resetUrl}`
          : 'Resend API key is not configured. Skipping sending password reset email.',
      );
      return;
    }

    try {
      const { error } = await this.resend.emails.send({
        from: `"${this.mailConfig.fromName}" <${this.mailConfig.fromEmail}>`,
        to: account.email,
        subject: 'Reset your AI Study Hub password',
        html: this.getPasswordResetHtml(account.name, resetUrl, ttlMinutes),
        text: [
          `Hi ${account.name},`,
          '',
          'Click the link below to reset your AI Study Hub password:',
          resetUrl,
          '',
          `This link expires in ${ttlMinutes} minutes and can only be used once.`,
          '',
          'If you did not request a password reset, please ignore this email.',
          '',
          'Best regards,',
          'The AI Study Hub Team',
        ].join('\n'),
      });

      if (error) {
        this.logger.error(
          `Failed to send password reset email: ${error.message}`,
        );
        throw error;
      }
    } catch (err) {
      this.logger.error(
        `Error sending password reset email to ${account.email}:`,
        err,
      );
      throw err;
    }
  }

  private buildVerificationUrl(token: string) {
    return new URL(`/verify-email/${token}`, this.mailConfig.frontendUrl)
      .toString()
      .replace(/\/$/, '');
  }

  private buildPasswordResetUrl(token: string) {
    return new URL(`/reset-password/${token}`, this.mailConfig.frontendUrl)
      .toString()
      .replace(/\/$/, '');
  }

  private getVerificationHtml(name: string, url: string): string {
    const currentYear = new Date().getFullYear();
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your AI Study Hub email</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f9fafb;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f9fafb;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
      overflow: hidden;
    }
    .header {
      background-color: #4f46e5;
      padding: 32px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 40px 32px;
      color: #1f2937;
      line-height: 1.6;
    }
    .content h2 {
      font-size: 20px;
      font-weight: 600;
      margin-top: 0;
      margin-bottom: 16px;
      color: #111827;
    }
    .content p {
      margin-top: 0;
      margin-bottom: 24px;
      font-size: 16px;
      color: #4b5563;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      display: inline-block;
      background-color: #4f46e5;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 30px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1);
    }
    .btn:hover {
      background-color: #4338ca;
    }
    .divider {
      border-top: 1px solid #e5e7eb;
      margin: 32px 0;
    }
    .footer {
      padding: 0 32px 40px;
      text-align: center;
      font-size: 13px;
      color: #9ca3af;
    }
    .footer a {
      color: #4f46e5;
      text-decoration: none;
    }
    .link-fallback {
      word-break: break-all;
      font-size: 12px;
      color: #9ca3af;
      background-color: #f3f4f6;
      padding: 12px;
      border-radius: 6px;
      margin-top: 16px;
    }
    .link-fallback a {
      color: #4f46e5;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>AI Study Hub</h1>
      </div>
      <div class="content">
        <h2>Verify your email address</h2>
        <p>Hi ${name},</p>
        <p>Thank you for signing up for AI Study Hub! To complete your registration and activate your account, please click the button below:</p>
        <div class="btn-container">
          <a href="${url}" class="btn" target="_blank">Verify Email Address</a>
        </div>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <div class="link-fallback">
          <a href="${url}" target="_blank">${url}</a>
        </div>
        <div class="divider"></div>
        <p style="font-size: 14px; margin-bottom: 0; color: #9ca3af;">If you did not create this account, you can safely ignore this email.</p>
      </div>
      <div class="footer">
        <p>&copy; ${currentYear} AI Study Hub. All rights reserved.</p>
        <p>Need help? Contact our support at <a href="mailto:support@aistudyhub.local">support@aistudyhub.local</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`;
  }

  private getPasswordResetHtml(
    name: string,
    url: string,
    ttlMinutes: number,
  ): string {
    const currentYear = new Date().getFullYear();
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your AI Study Hub password</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f9fafb;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f9fafb;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
      overflow: hidden;
    }
    .header {
      background-color: #4f46e5;
      padding: 32px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 40px 32px;
      color: #1f2937;
      line-height: 1.6;
    }
    .content h2 {
      font-size: 20px;
      font-weight: 600;
      margin-top: 0;
      margin-bottom: 16px;
      color: #111827;
    }
    .content p {
      margin-top: 0;
      margin-bottom: 24px;
      font-size: 16px;
      color: #4b5563;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      display: inline-block;
      background-color: #4f46e5;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 30px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1);
    }
    .btn:hover {
      background-color: #4338ca;
    }
    .divider {
      border-top: 1px solid #e5e7eb;
      margin: 32px 0;
    }
    .footer {
      padding: 0 32px 40px;
      text-align: center;
      font-size: 13px;
      color: #9ca3af;
    }
    .footer a {
      color: #4f46e5;
      text-decoration: none;
    }
    .link-fallback {
      word-break: break-all;
      font-size: 12px;
      color: #9ca3af;
      background-color: #f3f4f6;
      padding: 12px;
      border-radius: 6px;
      margin-top: 16px;
    }
    .link-fallback a {
      color: #4f46e5;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>AI Study Hub</h1>
      </div>
      <div class="content">
        <h2>Reset your password</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset the password for your AI Study Hub account. To reset your password, please click the button below:</p>
        <div class="btn-container">
          <a href="${url}" class="btn" target="_blank">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #ef4444; margin-top: 16px; margin-bottom: 24px;">This link expires in ${ttlMinutes} minutes and can only be used once.</p>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <div class="link-fallback">
          <a href="${url}" target="_blank">${url}</a>
        </div>
        <div class="divider"></div>
        <p style="font-size: 14px; margin-bottom: 0; color: #9ca3af;">If you did not request a password reset, you can safely ignore this email.</p>
      </div>
      <div class="footer">
        <p>&copy; ${currentYear} AI Study Hub. All rights reserved.</p>
        <p>Need help? Contact our support at <a href="mailto:support@aistudyhub.local">support@aistudyhub.local</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`;
  }
}
