import { EmailService } from './email.service';

const sendMock = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: sendMock,
    },
  })),
}));

describe('EmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends verification code through Resend when configured', async () => {
    sendMock.mockResolvedValue({ id: 'email-1' });
    const service = new EmailService({
      apiKey: 'resend-key',
      fromEmail: 'noreply@example.com',
      fromName: 'AI Study Hub',
    });

    await service.sendVerificationCode({
      email: 'new-user@example.com',
      name: 'New User',
      code: '123456',
    });

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'AI Study Hub <noreply@example.com>',
        to: 'new-user@example.com',
        subject: 'Verify your AI Study Hub email',
        text: expect.stringContaining('123456'),
      }),
    );
  });

  it('does not call Resend when API key is not configured', async () => {
    const service = new EmailService({
      apiKey: '',
      fromEmail: 'noreply@example.com',
      fromName: 'AI Study Hub',
    });

    await service.sendVerificationCode({
      email: 'new-user@example.com',
      name: 'New User',
      code: '123456',
    });

    expect(sendMock).not.toHaveBeenCalled();
  });
});
