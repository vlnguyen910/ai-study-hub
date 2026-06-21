import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AccountsModule } from './modules/accounts/accounts.module';
import { AuthModule } from './modules/auth/auth.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { AdminModule } from './modules/admin/admin.module';
import { DocumentProcessingModule } from './modules/document-processing/document-processing.module';
import { SettingsModule } from './modules/settings';
import { AIModule } from './modules/ai/ai.module';
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
    PrismaModule,
    AccountsModule,
    AuthModule,
    DocumentsModule,
    SubjectsModule,
    AdminModule,
    DocumentProcessingModule,
    SettingsModule,
    AIModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
