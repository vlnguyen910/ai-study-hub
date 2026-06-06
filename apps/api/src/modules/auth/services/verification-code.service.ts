import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import argon2 from 'argon2';
import { randomInt } from 'crypto';
import { emailVerificationConfiguration } from '../../../config';
import { RedisService } from '../../../common/redis/redis.service';

type VerificationState = {
  accountId: string;
  email: string;
  hashedCode: string;
  attempts: number;
  resendAvailableAt: number;
};

type IssueCodeInput = {
  accountId: string;
  email: string;
  enforceCooldown?: boolean;
};

@Injectable()
export class VerificationCodeService {
  constructor(
    private readonly redis: RedisService,
    @Inject(emailVerificationConfiguration.KEY)
    private readonly verificationConfig: ConfigType<
      typeof emailVerificationConfiguration
    >,
  ) {}

  async issueCode(input: IssueCodeInput) {
    const key = this.getKey(input.email);
    const existing = await this.getState(key);

    if (
      input.enforceCooldown &&
      existing &&
      existing.resendAvailableAt > Date.now()
    ) {
      throw this.tooManyRequests('Please wait before requesting a code');
    }

    const code = this.generateCode();
    const state: VerificationState = {
      accountId: input.accountId,
      email: this.normalizeEmail(input.email),
      hashedCode: await argon2.hash(code),
      attempts: 0,
      resendAvailableAt:
        Date.now() + this.verificationConfig.resendCooldownSeconds * 1000,
    };

    await this.setState(key, state);

    return code;
  }

  async verifyCode(email: string, code: string) {
    const key = this.getKey(email);
    const state = await this.getState(key);

    if (!state) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    if (state.attempts >= this.verificationConfig.maxAttempts) {
      throw this.tooManyRequests('Too many verification attempts');
    }

    const isValid = await argon2.verify(state.hashedCode, code);

    if (!isValid) {
      await this.incrementAttempts(key, state);
      throw new BadRequestException('Invalid or expired verification code');
    }

    await this.redis.del(key);

    return state.accountId;
  }

  async invalidate(email: string) {
    await this.redis.del(this.getKey(email));
  }

  private async getState(key: string): Promise<VerificationState | null> {
    try {
      return await this.redis.getJson<VerificationState>(key);
    } catch {
      throw new ServiceUnavailableException(
        'Verification service is unavailable',
      );
    }
  }

  private async setState(key: string, state: VerificationState) {
    try {
      await this.redis.setJson(key, state, this.verificationConfig.ttlSeconds);
    } catch {
      throw new ServiceUnavailableException(
        'Verification service is unavailable',
      );
    }
  }

  private async incrementAttempts(key: string, state: VerificationState) {
    const ttl = await this.redis.ttl(key);

    if (ttl <= 0) {
      return;
    }

    await this.redis.setJson(
      key,
      {
        ...state,
        attempts: state.attempts + 1,
      },
      ttl,
    );
  }

  private generateCode() {
    const length = this.verificationConfig.codeLength;
    const min = 10 ** (length - 1);
    const max = 10 ** length;

    return String(randomInt(min, max));
  }

  private getKey(email: string) {
    return `email-verification:${this.normalizeEmail(email)}`;
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private tooManyRequests(message: string) {
    return new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
  }
}
