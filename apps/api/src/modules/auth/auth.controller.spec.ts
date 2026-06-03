import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { DeviceInfo } from '@prisma/client';
import type { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { cookieConfiguration } from '../../config';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-jti'),
}));

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
    signin: jest.fn(),
    logout: jest.fn(),
  };

  const createResponseMock = () =>
    ({
      cookie: jest.fn(),
      json: jest.fn(),
      clearCookie: jest.fn(),
    }) as unknown as Response;

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
      success: true,
      status_code: 201,
      message: 'Signup successful',
      data: { accessToken: 'token' },
    });

    await controller.signup({
      email: 'new-user@example.com',
      name: 'New User',
      password: 'Password123!',
      deviceInfo: 'WEB',
    });

    expect(authServiceMock.signup).toHaveBeenCalled();
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
        deviceInfo: DeviceInfo.WEB,
      },
      response,
    );

    expect(authServiceMock.signin).toHaveBeenCalledWith({
      email: 'new-user@example.com',
      password: 'Password123!',
      deviceInfo: DeviceInfo.WEB,
    });
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

  it('returns both tokens and forces mobile device info on mobile signin', async () => {
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
      deviceInfo: DeviceInfo.WEB,
    });

    expect(authServiceMock.signin).toHaveBeenCalledWith({
      email: 'new-user@example.com',
      password: 'Password123!',
      deviceInfo: DeviceInfo.MOBILE,
    });
    expect(result).toEqual({
      message: 'Signin successful',
      data: {
        accessToken: 'mobile-access-token',
        refreshToken: 'mobile-refresh-token',
      },
    });
  });

  it('should call logout service', () => {
    const response = createResponseMock();
    authServiceMock.logout.mockReturnValue({
      message: 'Logout successful',
      data: null,
    });

    controller.logout(response);

    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(response.clearCookie).toHaveBeenCalledWith('accessToken');
    expect(response.clearCookie).toHaveBeenCalledWith('refreshToken');
    expect(response.json).toHaveBeenCalledWith({
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Logout successful',
      data: null,
    });
  });
});
