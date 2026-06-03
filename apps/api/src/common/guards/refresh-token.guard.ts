import {
  BadRequestException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

type RefreshTokenRequest = Request & {
  body?: {
    refreshToken?: unknown;
  };
};

@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RefreshTokenRequest>();
    const refreshToken = request.body?.refreshToken;

    if (typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
      throw new BadRequestException('refreshToken is required');
    }

    return super.canActivate(context);
  }
}
