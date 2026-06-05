import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { DeviceType, UserRole, UserStatus } from '@prisma/client';
import type { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { cookieConfiguration } from '../../config';
import { JwtTokenType } from '../../common/enums/jwt.enum';
import { TokenPayload } from '../../common/interfaces/auth.interface';

describe('AuthController', () => {
  let controller: AuthController;

  const cookieConfigMock = {
    accessTokenMaxAge: 1000 * 60 * 60,
    refreshTokenMaxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: false,
    sameSite: 'lax' as const,
  };

  const authServiceMock = {
    signup: jest.fn(),
    verifyEmail: jest.fn(),
    resendVerificationCode: jest.fn(),
    signin: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
  };

  const createResponseMock = () =>
    ({
      cookie: jest.fn(),
      json: jest.fn(),
      clearCookie: jest.fn(),
    }) as unknown as Response;

  const userPayload: TokenPayload = {
    sub: 'user-1',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    type: JwtTokenType.AccessToken,
    deviceId: 'device-1',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: cookieConfiguration.KEY,
          useValue: cookieConfigMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call signup service', async () => {
    authServiceMock.signup.mockResolvedValue({
      message: 'Signup successful',
      data: null,
    });

    await controller.signup({
      email: 'new-user@example.com',
      name: 'New User',
      password: 'Password123!',
    });

    expect(authServiceMock.signup).toHaveBeenCalledWith({
      email: 'new-user@example.com',
      name: 'New User',
      password: 'Password123!',
    });
  });

  it('should call verify email service', async () => {
    authServiceMock.verifyEmail.mockResolvedValue({
      message: 'Email verified successfully',
      data: null,
    });

    await expect(
      controller.verifyEmail({
        email: 'new-user@example.com',
        code: '123456',
      }),
    ).resolves.toEqual({
      message: 'Email verified successfully',
      data: null,
    });
    expect(authServiceMock.verifyEmail).toHaveBeenCalledWith({
      email: 'new-user@example.com',
      code: '123456',
    });
  });

  it('should call resend verification code service', async () => {
    authServiceMock.resendVerificationCode.mockResolvedValue({
      message: 'Verification code sent',
      data: null,
    });

    await expect(
      controller.resendVerificationCode({
        email: 'new-user@example.com',
      }),
    ).resolves.toEqual({
      message: 'Verification code sent',
      data: null,
    });
    expect(authServiceMock.resendVerificationCode).toHaveBeenCalledWith({
      email: 'new-user@example.com',
    });
  });

  it('sets access token cookie and returns refresh token on web signin', async () => {
    const response = createResponseMock();
    authServiceMock.signin.mockResolvedValue({
      message: 'Signin successful',
      data: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      },
    });

    await controller.signin(
      {
        email: 'new-user@example.com',
        password: 'Password123!',
        deviceId: 'device-1',
      },
      response,
    );

    expect(authServiceMock.signin).toHaveBeenCalledWith(
      {
        email: 'new-user@example.com',
        password: 'Password123!',
        deviceId: 'device-1',
      },
      DeviceType.WEB,
    );
    expect(response.cookie).toHaveBeenCalledWith(
      'accessToken',
      'access-token',
      {
        httpOnly: cookieConfigMock.httpOnly,
        secure: cookieConfigMock.secure,
        sameSite: cookieConfigMock.sameSite,
        maxAge: cookieConfigMock.accessTokenMaxAge,
      },
    );
    expect(response.json).toHaveBeenCalledWith({
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Signin successful',
      data: {
        refreshToken: 'refresh-token',
      },
    });
    expect(
      (response.json as jest.Mock).mock.calls[0][0].data,
    ).not.toHaveProperty('accessToken');
  });

  it('returns both tokens and forces mobile device type on mobile signin', async () => {
    authServiceMock.signin.mockResolvedValue({
      message: 'Signin successful',
      data: {
        accessToken: 'mobile-access-token',
        refreshToken: 'mobile-refresh-token',
      },
    });

    const result = await controller.mobileSignin({
      email: 'new-user@example.com',
      password: 'Password123!',
      deviceId: 'device-1',
    });

    expect(authServiceMock.signin).toHaveBeenCalledWith(
      {
        email: 'new-user@example.com',
        password: 'Password123!',
        deviceId: 'device-1',
      },
      DeviceType.MOBILE,
    );
    expect(result).toEqual({
      message: 'Signin successful',
      data: {
        accessToken: 'mobile-access-token',
        refreshToken: 'mobile-refresh-token',
      },
    });
  });

  it('should call logout service and clear token cookies', () => {
    const response = createResponseMock();
    authServiceMock.logout.mockReturnValue({
      message: 'Logout successful',
      data: null,
    });

    const result = controller.logout(userPayload, response);

    expect(authServiceMock.logout).toHaveBeenCalledWith('user-1', 'device-1');
    expect(response.clearCookie).toHaveBeenCalledWith('accessToken');
    expect(response.clearCookie).toHaveBeenCalledWith('refreshToken');
    expect(result).toEqual({
      message: 'Logout successful',
      data: null,
    });
  });

  //TODO: uncomment and fix this test later =))
  // it('should refresh token using authenticated refresh payload', async () => {
  //   const refreshPayload = {
  //     ...userPayload,
  //     type: JwtTokenType.RefreshToken,
  //   };
  //   authServiceMock.refreshToken.mockResolvedValue({
  //     message: 'Token refreshed successfully',
  //     data: {
  //       accessToken: 'new-access-token',
  //     },
  //   });

  //   await expect(controller.refreshToken(refreshPayload)).resolves.toEqual({
  //     message: 'Token refreshed successfully',
  //     data: {
  //       accessToken: 'new-access-token',
  //     },
  //   });
  //   expect(authServiceMock.refreshToken).toHaveBeenCalledWith(refreshPayload);
  // });
});
