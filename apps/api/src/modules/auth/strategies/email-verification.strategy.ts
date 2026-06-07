import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { ConfigType } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { UserStatus } from '@prisma/client';
import { TokenPayload } from '../../../common/interfaces/auth.interface';
import { JwtTokenType } from '../../../common/enums/jwt.enum';
import { jwtConfiguration } from '../../../config';

@Injectable()
export class EmailVerificationStrategy extends PassportStrategy(
  Strategy,
  'jwt-email-verification',
) {
  constructor(
    @Inject(jwtConfiguration.KEY)
    private readonly jwtConfig: ConfigType<typeof jwtConfiguration>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.['accessToken'],
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  async validate(payload: TokenPayload): Promise<TokenPayload> {
    if (payload.type !== JwtTokenType.EmailVerification) {
      throw new UnauthorizedException('Invalid token type');
    }

    if (payload.status !== UserStatus.UNVERIFIED) {
      throw new UnauthorizedException('Invalid verification session');
    }

    return {
      sub: payload.sub,
      role: payload.role,
      status: payload.status,
      type: payload.type,
      deviceId: payload.deviceId,
    };
  }
}
