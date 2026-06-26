import { Logger } from '@nestjs/common';
import type { accounts } from '@prisma/client';
import { Resend } from 'resend';
import * as nodemailer from 'nodemailer';
import { MailService } from './mail.service';

const mockSend = jest.fn();
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: mockSend,
      },
    })),
  };
});

const mockSendMail = jest.fn();
jest.mock('nodemailer', () => {
  return {
    createTransport: jest.fn().mockImplementation(() => ({
      sendMail: mockSendMail,
    })),
  };
});

describe('MailService', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('sends verification code through Resend when configured', async () => {
    mockSend.mockResolvedValue({ data: { id: 'email-1' }, error: null });
    const service = new MailService({
      apiKey: 're_123456789',
      fromEmail: 'noreply@example.com',
      fromName: 'AI Study Hub',
      frontendUrl: 'http://localhost:3000',
    } as any);

    await service.sendVerificationCode(
      {
        email: 'new-user@example.com',
        name: 'New User',
      } as accounts,
      '123456',
    );

    expect(Resend).toHaveBeenCalledWith('re_123456789');
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: '"AI Study Hub" <noreply@example.com>',
        to: 'new-user@example.com',
        subject: 'Verify your AI Study Hub email',
        html: expect.stringContaining(
          'http://localhost:3000/verify-email/123456',
        ),
        text: expect.stringContaining(
          'http://localhost:3000/verify-email/123456',
        ),
      }),
    );
  });

  it('logs verification link in development when Resend API key is not configured', async () => {
    process.env.NODE_ENV = 'development';
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const service = new MailService({
      apiKey: '',
      fromEmail: 'noreply@example.com',
      fromName: 'AI Study Hub',
      frontendUrl: 'http://localhost:3000',
    } as any);

    await service.sendVerificationCode(
      {
        email: 'new-user@example.com',
        name: 'New User',
      } as accounts,
      '123456',
    );

    expect(mockSend).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      'Email verification link for new-user@example.com: http://localhost:3000/verify-email/123456',
    );

    logSpy.mockRestore();
  });

  it('logs skipped delivery outside development when Resend API key is not configured', async () => {
    process.env.NODE_ENV = 'test';
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const service = new MailService({
      apiKey: '',
      fromEmail: 'noreply@example.com',
      fromName: 'AI Study Hub',
      frontendUrl: 'http://localhost:3000',
    } as any);

    await service.sendVerificationCode(
      {
        email: 'new-user@example.com',
        name: 'New User',
      } as accounts,
      '123456',
    );

    expect(mockSend).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      'Neither Resend nor SMTP is configured. Skipping sending verification email.',
    );

    logSpy.mockRestore();
  });

  it('sends password reset link through Resend when configured', async () => {
    mockSend.mockResolvedValue({ data: { id: 'email-1' }, error: null });
    const service = new MailService({
      apiKey: 're_123456789',
      fromEmail: 'noreply@example.com',
      fromName: 'AI Study Hub',
      frontendUrl: 'http://localhost:3000',
    } as any);

    await service.sendPasswordResetLink(
      {
        email: 'new-user@example.com',
        name: 'New User',
      } as accounts,
      'reset-token',
      600,
    );

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: '"AI Study Hub" <noreply@example.com>',
        to: 'new-user@example.com',
        subject: 'Reset your AI Study Hub password',
        html: expect.stringContaining(
          'http://localhost:3000/reset-password/reset-token',
        ),
        text: expect.stringContaining(
          'http://localhost:3000/reset-password/reset-token',
        ),
      }),
    );
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining(
          'This link expires in 10 minutes and can only be used once.',
        ),
        text: expect.stringContaining(
          'This link expires in 10 minutes and can only be used once.',
        ),
      }),
    );
  });

  it('logs password reset link in development when Resend API key is not configured', async () => {
    process.env.NODE_ENV = 'development';
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const service = new MailService({
      apiKey: '',
      fromEmail: 'noreply@example.com',
      fromName: 'AI Study Hub',
      frontendUrl: 'http://localhost:3000',
    } as any);

    await service.sendPasswordResetLink(
      {
        email: 'new-user@example.com',
        name: 'New User',
      } as accounts,
      'reset-token',
      600,
    );

    expect(mockSend).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      'Password reset link for new-user@example.com: http://localhost:3000/reset-password/reset-token',
    );

    logSpy.mockRestore();
  });

  it('logs skipped password reset delivery outside development when Resend API key is not configured', async () => {
    process.env.NODE_ENV = 'test';
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const service = new MailService({
      apiKey: '',
      fromEmail: 'noreply@example.com',
      fromName: 'AI Study Hub',
      frontendUrl: 'http://localhost:3000',
    } as any);

    await service.sendPasswordResetLink(
      {
        email: 'new-user@example.com',
        name: 'New User',
      } as accounts,
      'reset-token',
      600,
    );

    expect(mockSend).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      'Neither Resend nor SMTP is configured. Skipping sending password reset email.',
    );

    logSpy.mockRestore();
  });

  it('sends verification code through SMTP when SMTP credentials are provided and Resend API key is missing', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'smtp-1' });
    const service = new MailService({
      apiKey: '',
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: 'user@gmail.com',
      smtpPass: 'password123',
      fromEmail: 'user@gmail.com',
      fromName: 'AI Study Hub',
      frontendUrl: 'http://localhost:3000',
    } as any);

    await service.sendVerificationCode(
      {
        email: 'new-user@example.com',
        name: 'New User',
      } as accounts,
      '123456',
    );

    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'user@gmail.com',
          pass: 'password123',
        },
        lookup: expect.any(Function),
      }),
    );
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: '"AI Study Hub" <user@gmail.com>',
        to: 'new-user@example.com',
        subject: 'Verify your AI Study Hub email',
        html: expect.stringContaining(
          'http://localhost:3000/verify-email/123456',
        ),
      }),
    );
  });

  it('sends password reset link through SMTP when SMTP credentials are provided and Resend API key is missing', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'smtp-2' });
    const service = new MailService({
      apiKey: '',
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: 'user@gmail.com',
      smtpPass: 'password123',
      fromEmail: 'user@gmail.com',
      fromName: 'AI Study Hub',
      frontendUrl: 'http://localhost:3000',
    } as any);

    await service.sendPasswordResetLink(
      {
        email: 'new-user@example.com',
        name: 'New User',
      } as accounts,
      'reset-token',
      600,
    );

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: '"AI Study Hub" <user@gmail.com>',
        to: 'new-user@example.com',
        subject: 'Reset your AI Study Hub password',
        html: expect.stringContaining(
          'http://localhost:3000/reset-password/reset-token',
        ),
      }),
    );
  });
});
