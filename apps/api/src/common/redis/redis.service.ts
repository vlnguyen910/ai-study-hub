import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import Redis from 'ioredis';
import { redisConfiguration } from '../../config';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(
    @Inject(redisConfiguration.KEY)
    redisConfig: ConfigType<typeof redisConfiguration>,
  ) {
    this.client = new Redis(redisConfig.url, {
      keyPrefix: `${redisConfig.keyPrefix}:`,
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  get(key: string) {
    return this.client.get(key);
  }

  set(key: string, value: string, ttlSeconds?: number) {
    if (ttlSeconds === undefined) {
      return this.client.set(key, value);
    }

    return this.client.set(key, value, 'EX', ttlSeconds);
  }

  del(key: string) {
    return this.client.del(key);
  }

  ttl(key: string) {
    return this.client.ttl(key);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.get(key);

    return raw ? (JSON.parse(raw) as T) : null;
  }

  async setJson<T>(key: string, value: T, ttlSeconds?: number) {
    return this.set(key, JSON.stringify(value), ttlSeconds);
  }
}
