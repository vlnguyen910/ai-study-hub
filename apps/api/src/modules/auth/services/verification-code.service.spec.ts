import { BadRequestException, HttpStatus } from '@nestjs/common';
import { RedisService } from '../../../common/redis/redis.service';
import { VerificationCodeService } from './verification-code.service';

const redisMock = {
  getJson: jest.fn(),
  setJson: jest.fn(),
  del: jest.fn(),
  ttl: jest.fn(),
};

describe('VerificationCodeService', () => {
  let service: VerificationCodeService;

  const verificationConfig = {
    codeLength: 6,
    ttlSeconds: 600,
    resendCooldownSeconds: 60,
    maxAttempts: 2,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new VerificationCodeService(
      redisMock as unknown as RedisService,
      verificationConfig,
    );
  });

  it('issues a hashed verification code with TTL', async () => {
    redisMock.getJson.mockResolvedValue(null);
    redisMock.setJson.mockResolvedValue('OK');

    const code = await service.issueCode({
      accountId: 'user-1',
      email: 'New-User@Example.com',
    });

    expect(code).toMatch(/^\d{6}$/);
    expect(redisMock.setJson).toHaveBeenCalledWith(
      'email-verification:new-user@example.com',
      expect.any(Object),
      600,
    );

    const state = redisMock.setJson.mock.calls[0][1] as {
      accountId: string;
      email: string;
      hashedCode: string;
      attempts: number;
    };
    expect(state.accountId).toBe('user-1');
    expect(state.email).toBe('new-user@example.com');
    expect(state.hashedCode).not.toBe(code);
    expect(state.attempts).toBe(0);
  });

  it('rejects resend while cooldown is active', async () => {
    redisMock.getJson.mockResolvedValue({
      accountId: 'user-1',
      email: 'new-user@example.com',
      hashedCode: 'hash',
      attempts: 0,
      resendAvailableAt: Date.now() + 60_000,
    });

    await expect(
      service.issueCode({
        accountId: 'user-1',
        email: 'new-user@example.com',
        enforceCooldown: true,
      }),
    ).rejects.toMatchObject({ status: HttpStatus.TOO_MANY_REQUESTS });
    expect(redisMock.setJson).not.toHaveBeenCalled();
  });

  it('verifies a valid code and consumes Redis state', async () => {
    redisMock.getJson.mockResolvedValueOnce(null);
    redisMock.setJson.mockResolvedValue('OK');
    const code = await service.issueCode({
      accountId: 'user-1',
      email: 'new-user@example.com',
    });
    const storedState = redisMock.setJson.mock.calls[0][1];

    jest.clearAllMocks();
    redisMock.getJson.mockResolvedValue(storedState);
    redisMock.del.mockResolvedValue(1);

    await expect(
      service.verifyCode('new-user@example.com', code),
    ).resolves.toBe('user-1');
    expect(redisMock.del).toHaveBeenCalledWith(
      'email-verification:new-user@example.com',
    );
  });

  it('increments attempts and rejects an invalid code', async () => {
    redisMock.getJson.mockResolvedValueOnce(null);
    redisMock.setJson.mockResolvedValue('OK');
    const code = await service.issueCode({
      accountId: 'user-1',
      email: 'new-user@example.com',
    });
    expect(code).toBeDefined();
    const storedState = redisMock.setJson.mock.calls[0][1];

    jest.clearAllMocks();
    redisMock.getJson.mockResolvedValue(storedState);
    redisMock.ttl.mockResolvedValue(300);
    redisMock.setJson.mockResolvedValue('OK');

    await expect(
      service.verifyCode('new-user@example.com', '000000'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(redisMock.setJson).toHaveBeenCalledWith(
      'email-verification:new-user@example.com',
      expect.objectContaining({ attempts: 1 }),
      300,
    );
  });

  it('rejects verification after the attempt limit', async () => {
    redisMock.getJson.mockResolvedValue({
      accountId: 'user-1',
      email: 'new-user@example.com',
      hashedCode: 'hash',
      attempts: 2,
      resendAvailableAt: Date.now() - 1,
    });

    await expect(
      service.verifyCode('new-user@example.com', '123456'),
    ).rejects.toMatchObject({ status: HttpStatus.TOO_MANY_REQUESTS });
  });

  it('rejects missing or expired codes', async () => {
    redisMock.getJson.mockResolvedValue(null);

    await expect(
      service.verifyCode('new-user@example.com', '123456'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
