import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { AppController } from './app.controller';
import { AccountsModule } from './modules/accounts/accounts.module';
import { AuthModule } from './modules/auth/auth.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { AdminModule } from './modules/admin/admin.module';
import { DocumentProcessingModule } from './modules/document-processing/document-processing.module';
import { SettingsModule } from './modules/settings';
import { AIModule } from './modules/ai/ai.module';
import { CollectionsModule } from './modules/collections';
import { AuditLogModule } from './modules/audit-logs';
import { jwtConfiguration } from './config/jwt.config';
import { PrismaModule } from './prisma/prisma.module';
import { cookieConfiguration } from './config/cookies.config';
import {
  aiConfiguration,
  emailVerificationConfiguration,
  googleAuthConfiguration,
  mailConfiguration,
  passwordRecoveryConfiguration,
  redisConfiguration,
} from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [
        jwtConfiguration,
        cookieConfiguration,
        redisConfiguration,
        mailConfiguration,
        emailVerificationConfiguration,
        passwordRecoveryConfiguration,
        googleAuthConfiguration,
        aiConfiguration,
      ],
    }),
    ThrottlerModule.forRootAsync({
      inject: [redisConfiguration.KEY],
      useFactory: (redisConfig: ConfigType<typeof redisConfiguration>) => ({
        throttlers: [
          {
            name: 'default',
            ttl: 60000,
            limit: 20,
          },
        ],
        skipIf: () => process.env.NODE_ENV !== 'production',
        storage: new ThrottlerStorageRedisService(redisConfig.url),
      }),
    }),
    PrismaModule,
    AccountsModule,
    AuthModule,
    DocumentsModule,
    SubjectsModule,
    AdminModule,
    DocumentProcessingModule,
    SettingsModule,
    AIModule,
    CollectionsModule,
    AuditLogModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
