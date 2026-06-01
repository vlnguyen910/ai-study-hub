import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from './auth.service';
import { DeviceInfo } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;

  const prismaMock = {
    accounts: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    sessions: {
      create: jest.fn(),
    },
  };

  const jwtMock = {
    signAsync: jest.fn(),
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
          provide: JwtService,
          useValue: jwtMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should sign up a new account and return tokens', async () => {
    prismaMock.accounts.findUnique.mockResolvedValue(null);
    prismaMock.accounts.create.mockResolvedValue({
      id: 'user-1',
      email: 'new-user@example.com',
      name: 'New User',
    });
    jwtMock.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');
    prismaMock.sessions.create.mockResolvedValue({ id: 'session-1' });

    const result = await service.signup({
      email: 'new-user@example.com',
      name: 'New User',
      password: 'Password123!',
      deviceInfo: 'WEB',
    });

    expect(prismaMock.accounts.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'new-user@example.com',
          name: 'New User',
          password: expect.any(String),
        }),
      }),
    );

    const createPayload = prismaMock.accounts.create.mock.calls[0][0] as {
      data: { password: string };
    };
    const passwordMatched = await bcrypt.compare(
      'Password123!',
      createPayload.data.password,
    );
    expect(passwordMatched).toBe(true);

    expect(prismaMock.sessions.create).not.toHaveBeenCalled();
    expect(result).toEqual({
      message: 'Signup successful',
      data: null,
    });
  });

  it('should throw conflict exception when email exists on signup', async () => {
    prismaMock.accounts.findUnique.mockResolvedValue({ id: 'existing-user' });

    await expect(
      service.signup({
        email: 'existing-user@example.com',
        name: 'Existing User',
        password: 'Password123!',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should sign in successfully with valid credentials', async () => {
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    prismaMock.accounts.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'new-user@example.com',
      name: 'New User',
      password: hashedPassword,
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
    expect(prismaMock.sessions.create).toHaveBeenCalled();
    const sessionCreatePayload = prismaMock.sessions.create.mock
      .calls[0][0] as {
      data: { refreshToken: string };
    };
    expect(
      await bcrypt.compare(
        'refresh-token',
        sessionCreatePayload.data.refreshToken,
      ),
    ).toBe(true);
  });

  it('should throw unauthorized exception for invalid signin password', async () => {
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    prismaMock.accounts.findUnique.mockResolvedValue({
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

  it('parseExpiresIn handles various formats and fallbacks', () => {
    const p: any = service as any;
    // undefined -> fallback
    expect(p.parseExpiresIn(undefined, 10)).toBe(10);
    // numeric string
    expect(p.parseExpiresIn('60', 10)).toBe(60);
    // minutes
    expect(p.parseExpiresIn('5m', 10)).toBe(300);
    // hours
    expect(p.parseExpiresIn('2h', 10)).toBe(7200);
    // days
    expect(p.parseExpiresIn('3d', 10)).toBe(259200);
    // seconds
    expect(p.parseExpiresIn('45s', 10)).toBe(45);
    // invalid -> fallback
    expect(p.parseExpiresIn('xyz', 10)).toBe(10);
  });
});
