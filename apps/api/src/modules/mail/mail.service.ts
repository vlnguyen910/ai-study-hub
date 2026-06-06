import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';
import { mailConfiguration } from '../../config';

type SendVerificationCodeInput = {
  email: string;
  name: string;
  code: string;
};

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

  async sendVerificationCode(input: SendVerificationCodeInput) {
    if (!this.transporter) {
      this.logger.log(
        `Email verification code for ${input.email}: ${input.code}`,
      );
      return;
    }

    await this.transporter.sendMail({
      from: `"${this.mailConfig.fromName}" <${this.mailConfig.fromEmail}>`,
      to: input.email,
      subject: 'Verify your AI Study Hub email',
      text: [
        `Hi ${input.name},`,
        '',
        `Your AI Study Hub verification code is ${input.code}.`,
        'This code expires soon. If you did not create an account, ignore this email.',
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
