import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OptionalJwtGuard } from './optional-jwt.guard';

describe('OptionalJwtGuard', () => {
  let guard: OptionalJwtGuard;
  const jwtService = { verifyAsync: jest.fn() } as unknown as JwtService;
  const configService = { getOrThrow: jest.fn() } as unknown as ConfigService;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new OptionalJwtGuard(jwtService, configService);
  });

  function mockContext(
    headers: Record<string, string | undefined>,
    cookies: Record<string, string | undefined> = {},
  ) {
    const req: any = { headers, cookies };
    const ctx: any = {
      switchToHttp: () => ({ getRequest: () => req }),
    } as ExecutionContext;

    return { ctx, req };
  }

  it('allows guest requests when authorization header is missing', async () => {
    const { ctx, req } = mockContext({});

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(req.user).toBeUndefined();
  });

  it('throws when authorization header is malformed', async () => {
    const { ctx } = mockContext({ authorization: 'Token abc' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('verifies bearer token and attaches user', async () => {
    const token = 'valid-token';
    const payload = { sub: 'u1', email: 'a@b', role: 'USER' };
    jest.spyOn(configService, 'getOrThrow').mockReturnValue('secret');
    jwtService.verifyAsync = jest.fn().mockResolvedValue(payload);

    const { ctx, req } = mockContext({ authorization: `Bearer ${token}` });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, {
      secret: 'secret',
    });
    expect(req.user).toEqual(payload);
  });

  it('verifies access token cookie and attaches user', async () => {
    const token = 'cookie-token';
    const payload = { sub: 'u1', email: 'a@b', role: 'USER' };
    jest.spyOn(configService, 'getOrThrow').mockReturnValue('secret');
    jwtService.verifyAsync = jest.fn().mockResolvedValue(payload);

    const { ctx, req } = mockContext({}, { accessToken: token });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, {
      secret: 'secret',
    });
    expect(req.user).toEqual(payload);
  });

  it('throws when bearer token is invalid', async () => {
    jest.spyOn(configService, 'getOrThrow').mockReturnValue('secret');
    jwtService.verifyAsync = jest.fn().mockRejectedValue(new Error('invalid'));

    const { ctx } = mockContext({ authorization: 'Bearer bad-token' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });
});
