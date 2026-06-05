import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Resend } from 'resend';
import { resendConfiguration } from '../../../config';

type SendVerificationCodeInput = {
  email: string;
  name: string;
  code: string;
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;

  constructor(
    @Inject(resendConfiguration.KEY)
    private readonly resendConfig: ConfigType<typeof resendConfiguration>,
  ) {
    this.resend = resendConfig.apiKey ? new Resend(resendConfig.apiKey) : null;
  }

  async sendVerificationCode(input: SendVerificationCodeInput) {
    if (!this.resend) {
      //this only for development when resend api key is not provided, in production this should never happen
      this.logger.log(
        `Email verification code for ${input.email}: ${input.code}`,
      );
      return;
    }

    const from = `${this.resendConfig.fromName} <${this.resendConfig.fromEmail}>`;

    await this.resend.emails.send({
      from,
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
}
