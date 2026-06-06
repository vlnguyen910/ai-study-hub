import { Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { MailService } from './mail.service';

jest.mock('nodemailer', () => {
  const mockSendMail = jest.fn();

  return {
    __esModule: true,
    default: {
      createTransport: jest.fn().mockImplementation(() => ({
        sendMail: mockSendMail,
      })),
    },
    mockSendMail,
  };
});

describe('MailService', () => {
  const mockSendMail = jest.requireMock('nodemailer').mockSendMail as jest.Mock;
  const mockCreateTransport = nodemailer.createTransport as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends verification code through Mailtrap SMTP when configured', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'email-1' });
    const service = new MailService({
      smtpHost: 'sandbox.smtp.mailtrap.io',
      smtpPort: 2525,
      smtpUsername: 'smtp-user',
      smtpPassword: 'smtp-password',
      smtpSecure: false,
      fromEmail: 'noreply@example.com',
      fromName: 'AI Study Hub',
    });

    await service.sendVerificationCode({
      email: 'new-user@example.com',
      name: 'New User',
      code: '123456',
    });

    expect(mockCreateTransport).toHaveBeenCalledWith({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      secure: false,
      auth: {
        user: 'smtp-user',
        pass: 'smtp-password',
      },
    });
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: '"AI Study Hub" <noreply@example.com>',
        to: 'new-user@example.com',
        subject: 'Verify your AI Study Hub email',
        text: expect.stringContaining('123456'),
      }),
    );
  });

  it('logs verification code when Mailtrap SMTP credentials are not configured', async () => {
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const service = new MailService({
      smtpHost: 'sandbox.smtp.mailtrap.io',
      smtpPort: 2525,
      smtpUsername: '',
      smtpPassword: '',
      smtpSecure: false,
      fromEmail: 'noreply@example.com',
      fromName: 'AI Study Hub',
    });

    await service.sendVerificationCode({
      email: 'new-user@example.com',
      name: 'New User',
      code: '123456',
    });

    expect(mockCreateTransport).not.toHaveBeenCalled();
    expect(mockSendMail).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      'Email verification code for new-user@example.com: 123456',
    );

    logSpy.mockRestore();
  });
});
