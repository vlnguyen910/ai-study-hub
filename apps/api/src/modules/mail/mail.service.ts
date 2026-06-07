import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';
import { mailConfiguration } from '../../config';
import { accounts } from '@prisma/client';

type VerificationEmailAccount = Pick<accounts, 'email' | 'name'>;

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;

  constructor(
    @Inject(mailConfiguration.KEY)
    private readonly mailConfig: ConfigType<typeof mailConfiguration>,
  ) {
    this.transporter = this.createTransporter();
  }

  async sendVerificationCode(account: VerificationEmailAccount, token: string) {
    if (!this.transporter) {
      this.logger.log(`Email verification code for ${account.email}: ${token}`);
      return;
    }

    await this.transporter.sendMail({
      from: `"${this.mailConfig.fromName}" <${this.mailConfig.fromEmail}>`,
      to: account.email,
      subject: 'Verify your AI Study Hub email',
      text: [
        `Hi ${account.name},`,
        '',
        `Click the link below to verify your email address and complete your registration:`,
        `${this.mailConfig.frontendUrl}/${token}`,
        '',
        'If you did not create an account, please ignore this email.',
        '',
        'Best regards,',
        'The AI Study Hub Team',
      ].join('\n'),
    });
  }

  private createTransporter() {
    if (!this.mailConfig.smtpUsername || !this.mailConfig.smtpPassword) {
      return null;
    }

    return nodemailer.createTransport({
      host: this.mailConfig.smtpHost,
      port: this.mailConfig.smtpPort,
      secure: this.mailConfig.smtpSecure,
      auth: {
        user: this.mailConfig.smtpUsername,
        pass: this.mailConfig.smtpPassword,
      },
    });
  }
}
