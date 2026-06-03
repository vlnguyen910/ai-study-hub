import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { RefreshTokenGuard } from './refresh-token.guard';

describe('RefreshTokenGuard', () => {
  let guard: RefreshTokenGuard;

  beforeEach(() => {
    jest.restoreAllMocks();
    guard = new RefreshTokenGuard();
  });

  function mockContext(body: Record<string, unknown> = {}) {
    const req = { body };
    return {
      switchToHttp: () => ({ getRequest: () => req }),
    } as ExecutionContext;
  }

  it('throws bad request when refreshToken is missing from body', () => {
    expect(() => guard.canActivate(mockContext())).toThrow(BadRequestException);
  });

  it('throws bad request when refreshToken is blank', () => {
    expect(() =>
      guard.canActivate(mockContext({ refreshToken: '   ' })),
    ).toThrow(BadRequestException);
  });

  it('throws bad request when refreshToken is not a string', () => {
    expect(() => guard.canActivate(mockContext({ refreshToken: 123 }))).toThrow(
      BadRequestException,
    );
  });

  it('delegates to passport guard when refreshToken is present', () => {
    const passportCanActivate = jest
      .spyOn(Object.getPrototypeOf(RefreshTokenGuard.prototype), 'canActivate')
      .mockReturnValue(true);
    const ctx = mockContext({ refreshToken: 'refresh-token' });

    expect(guard.canActivate(ctx)).toBe(true);
    expect(passportCanActivate).toHaveBeenCalledWith(ctx);
  });
});
