import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  OnModuleDestroy,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import argon2 from 'argon2';
import { randomInt } from 'crypto';
import Redis from 'ioredis';
import {
  emailVerificationConfiguration,
  redisConfiguration,
} from '../../../config';

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
export class VerificationCodeService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor(
    @Inject(redisConfiguration.KEY)
    private readonly redisConfig: ConfigType<typeof redisConfiguration>,
    @Inject(emailVerificationConfiguration.KEY)
    private readonly verificationConfig: ConfigType<
      typeof emailVerificationConfiguration
    >,
  ) {
    this.redis = new Redis(redisConfig.url, {
      keyPrefix: `${redisConfig.keyPrefix}:`,
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

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
      const raw = await this.redis.get(key);

      return raw ? (JSON.parse(raw) as VerificationState) : null;
    } catch {
      throw new ServiceUnavailableException(
        'Verification service is unavailable',
      );
    }
  }

  private async setState(key: string, state: VerificationState) {
    try {
      await this.redis.set(
        key,
        JSON.stringify(state),
        'EX',
        this.verificationConfig.ttlSeconds,
      );
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

    await this.redis.set(
      key,
      JSON.stringify({
        ...state,
        attempts: state.attempts + 1,
      }),
      'EX',
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
