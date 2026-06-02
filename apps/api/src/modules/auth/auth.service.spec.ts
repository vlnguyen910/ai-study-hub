import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import argon2 from 'argon2';
import { DeviceInfo, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { jwtConfiguration } from '../../config';
import { AccountsService } from '../accounts/accounts.service';
import { AuthService } from './auth.service';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-jti'),
}));

describe('AuthService', () => {
  let service: AuthService;

  const prismaMock = {
    sessions: {
      create: jest.fn(),
    },
  };

  const accountsServiceMock = {
    create: jest.fn(),
    findAccountByEmail: jest.fn(),
  };

  const jwtMock = {
    signAsync: jest.fn(),
  };

  const jwtConfigMock = {
    secret: 'test-secret',
    accessTokenExpiresIn: '15m',
    refreshTokenExpiresIn: '7d',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: AccountsService,
          useValue: accountsServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtMock,
        },
        {
          provide: jwtConfiguration.KEY,
          useValue: jwtConfigMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should sign up a new account without creating a session', async () => {
    accountsServiceMock.findAccountByEmail.mockResolvedValue(null);
    accountsServiceMock.create.mockResolvedValue({
      message: 'Account created successfully',
    });

    const result = await service.signup({
      email: 'new-user@example.com',
      name: 'New User',
      password: 'Password123!',
      deviceInfo: 'WEB',
    });

    expect(accountsServiceMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'new-user@example.com',
        name: 'New User',
        hashedPassword: expect.any(String),
        avatarUrl: undefined,
        role: UserRole.USER,
      }),
    );

    const createPayload = accountsServiceMock.create.mock.calls[0][0] as {
      hashedPassword: string;
    };
    const passwordMatched = await argon2.verify(
      createPayload.hashedPassword,
      'Password123!',
    );
    expect(passwordMatched).toBe(true);

    expect(prismaMock.sessions.create).not.toHaveBeenCalled();
    expect(result).toEqual({
      message: 'Signup successful',
      data: null,
    });
  });

  it('should throw conflict exception when email exists on signup', async () => {
    accountsServiceMock.findAccountByEmail.mockResolvedValue({
      id: 'existing-user',
    });

    await expect(
      service.signup({
        email: 'existing-user@example.com',
        name: 'Existing User',
        password: 'Password123!',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should sign in successfully with valid credentials', async () => {
    const hashedPassword = await argon2.hash('Password123!');

    accountsServiceMock.findAccountByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'new-user@example.com',
      name: 'New User',
      password: hashedPassword,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
    });
    jwtMock.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');
    prismaMock.sessions.create.mockResolvedValue({ id: 'session-1' });

    const result = await service.signin({
      email: 'new-user@example.com',
      password: 'Password123!',
      deviceInfo: 'MOBILE',
    });

    expect(result.data.accessToken).toBe('access-token');
    expect(result.data.refreshToken).toBe('refresh-token');
    expect(jwtMock.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: 'user-1',
        email: 'new-user@example.com',
        name: 'New User',
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        jti: 'test-jti',
      }),
      { expiresIn: jwtConfigMock.accessTokenExpiresIn },
    );
    expect(prismaMock.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          refreshToken: expect.any(String),
          deviceInfo: DeviceInfo.MOBILE,
          expiresAt: expect.any(Date),
        }),
      }),
    );
    const sessionCreatePayload = prismaMock.sessions.create.mock
      .calls[0][0] as {
      data: { refreshToken: string };
    };
    expect(
      await argon2.verify(
        sessionCreatePayload.data.refreshToken,
        'refresh-token',
      ),
    ).toBe(true);
  });

  it('should throw unauthorized exception for invalid signin password', async () => {
    const hashedPassword = await argon2.hash('Password123!');

    accountsServiceMock.findAccountByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'new-user@example.com',
      name: 'New User',
      password: hashedPassword,
    });

    await expect(
      service.signin({
        email: 'new-user@example.com',
        password: 'WrongPassword!',
        deviceInfo: DeviceInfo.WEB,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should return logout message', () => {
    expect(service.logout()).toEqual({
      message: 'Logout successful',
      data: null,
    });
  });

  it('getExpiryDate handles supported duration formats', () => {
    const p: any = service as any;
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);

    expect(p.getExpiryDate('45s').getTime()).toBe(now + 45 * 1000);
    expect(p.getExpiryDate('5m').getTime()).toBe(now + 5 * 60 * 1000);
    expect(p.getExpiryDate('2h').getTime()).toBe(now + 2 * 60 * 60 * 1000);
    expect(p.getExpiryDate('3d').getTime()).toBe(now + 3 * 24 * 60 * 60 * 1000);
    expect(() => p.getExpiryDate('xyz')).toThrow(
      'Unsupported token expiry format: xyz',
    );
  });
});
