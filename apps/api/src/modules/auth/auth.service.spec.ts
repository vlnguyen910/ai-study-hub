import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import argon2 from 'argon2';
import { DeviceType, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { jwtConfiguration } from '../../config';
import { AccountsService } from '../accounts/accounts.service';
import { AuthService } from './auth.service';
import { JwtTokenType } from '../../common/enums/jwt.enum';
import { TokenPayload } from '../../common/interfaces/auth.interface';

describe('AuthService', () => {
  let service: AuthService;

  const prismaMock = {
    sessions: {
      upsert: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const accountsServiceMock = {
    create: jest.fn(),
    findAccountByEmail: jest.fn(),
    findOne: jest.fn(),
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
    });

    expect(accountsServiceMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'new-user@example.com',
        name: 'New User',
        password: expect.any(String),
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

    expect(prismaMock.sessions.upsert).not.toHaveBeenCalled();
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

  //TODO: uncomment and fix this test later =))
  // it('should sign in successfully with valid credentials', async () => {
  //   const hashedPassword = await argon2.hash('Password123!');

  //   accountsServiceMock.findAccountByEmail.mockResolvedValue({
  //     id: 'user-1',
  //     email: 'new-user@example.com',
  //     name: 'New User',
  //     password: hashedPassword,
  //     role: UserRole.USER,
  //     status: UserStatus.ACTIVE,
  //   });
  //   jwtMock.signAsync
  //     .mockResolvedValueOnce('access-token')
  //     .mockResolvedValueOnce('refresh-token');
  //   prismaMock.sessions.upsert.mockResolvedValue({ id: 'session-1' });

  //   const result = await service.signin(
  //     {
  //       email: 'new-user@example.com',
  //       password: 'Password123!',
  //       deviceId: 'device-1',
  //     },
  //     DeviceType.MOBILE,
  //   );

  //   expect(result.data.accessToken).toBe('access-token');
  //   expect(result.data.refreshToken).toBe('refresh-token');
  //   expect(jwtMock.signAsync).toHaveBeenNthCalledWith(
  //     1,
  //     expect.objectContaining({
  //       sub: 'user-1',
  //       email: 'new-user@example.com',
  //       name: 'New User',
  //       role: UserRole.USER,
  //       status: UserStatus.ACTIVE,
  //       type: JwtTokenType.AccessToken,
  //       deviceId: 'device-1',
  //     }),
  //     { expiresIn: jwtConfigMock.accessTokenExpiresIn },
  //   );
  //   expect(jwtMock.signAsync).toHaveBeenNthCalledWith(
  //     2,
  //     expect.objectContaining({
  //       type: JwtTokenType.RefreshToken,
  //       deviceId: 'device-1',
  //     }),
  //     { expiresIn: jwtConfigMock.refreshTokenExpiresIn },
  //   );
  //   expect(prismaMock.sessions.upsert).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       where: {
  //         userId_deviceId: {
  //           userId: 'user-1',
  //           deviceId: 'device-1',
  //         },
  //       },
  //       update: expect.objectContaining({
  //         refreshToken: expect.any(String),
  //         expiresAt: expect.any(Date),
  //         isRevoked: false,
  //       }),
  //       create: expect.objectContaining({
  //         userId: 'user-1',
  //         refreshToken: expect.any(String),
  //         deviceId: 'device-1',
  //         deviceType: DeviceType.MOBILE,
  //         expiresAt: expect.any(Date),
  //       }),
  //     }),
  //   );

  //   const sessionUpsertPayload = prismaMock.sessions.upsert.mock
  //     .calls[0][0] as {
  //     create: { refreshToken: string };
  //   };
  //   expect(
  //     await argon2.verify(
  //       sessionUpsertPayload.create.refreshToken,
  //       'refresh-token',
  //     ),
  //   ).toBe(true);
  // });

  it('should throw unauthorized exception for missing signin account', async () => {
    accountsServiceMock.findAccountByEmail.mockResolvedValue(null);

    await expect(
      service.signin(
        {
          email: 'missing@example.com',
          password: 'Password123!',
          deviceId: 'device-1',
        },
        DeviceType.WEB,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
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
      service.signin(
        {
          email: 'new-user@example.com',
          password: 'WrongPassword!',
          deviceId: 'device-1',
        },
        DeviceType.WEB,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should revoke the current device session on logout', async () => {
    accountsServiceMock.findOne.mockResolvedValue({ id: 'user-1' });
    prismaMock.sessions.updateMany.mockResolvedValue({ count: 1 });

    await expect(service.logout('user-1', 'device-1')).resolves.toEqual({
      message: 'Logout successful',
      data: null,
    });

    expect(prismaMock.sessions.updateMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        deviceId: 'device-1',
        isRevoked: false,
      },
      data: {
        isRevoked: true,
      },
    });
  });

  it('should throw unauthorized exception on logout when user is missing', async () => {
    accountsServiceMock.findOne.mockResolvedValue(null);

    await expect(
      service.logout('missing-user', 'device-1'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  //TODO: uncomment and fix this test later =))
  // it('should refresh an access token from refresh token payload', async () => {
  //   const payload: TokenPayload = {
  //     sub: 'user-1',
  //     role: UserRole.USER,
  //     status: UserStatus.ACTIVE,
  //     type: JwtTokenType.RefreshToken,
  //     deviceId: 'device-1',
  //   };
  //   jwtMock.signAsync.mockResolvedValue('new-access-token');

  //   await expect(service.refreshToken(payload)).resolves.toEqual({
  //     message: 'Token refreshed successfully',
  //     data: {
  //       accessToken: 'new-access-token',
  //     },
  //   });
  //   expect(jwtMock.signAsync).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       sub: 'user-1',
  //       type: JwtTokenType.AccessToken,
  //       deviceId: 'device-1',
  //     }),
  //     { expiresIn: jwtConfigMock.accessTokenExpiresIn },
  //   );
  // });

  it('getExpiryDate handles supported duration formats', () => {
    const privateService = service as unknown as {
      getExpiryDate: (expiresIn: string) => Date;
    };
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);

    expect(privateService.getExpiryDate('45s').getTime()).toBe(now + 45 * 1000);
    expect(privateService.getExpiryDate('5m').getTime()).toBe(
      now + 5 * 60 * 1000,
    );
    expect(privateService.getExpiryDate('2h').getTime()).toBe(
      now + 2 * 60 * 60 * 1000,
    );
    expect(privateService.getExpiryDate('3d').getTime()).toBe(
      now + 3 * 24 * 60 * 60 * 1000,
    );
    expect(() => privateService.getExpiryDate('xyz')).toThrow(
      'Unsupported token expiry format: xyz',
    );
  });
});
