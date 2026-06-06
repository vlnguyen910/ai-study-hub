import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AccountsModule } from './modules/accounts/accounts.module';
import { AuthModule } from './modules/auth/auth.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { jwtConfiguration } from './config/jwt.config';
import { PrismaModule } from './prisma/prisma.module';
import { cookieConfiguration } from './config/cookies.config';
import {
  emailVerificationConfiguration,
  mailConfiguration,
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
      ],
    }),
    PrismaModule,
    AccountsModule,
    AuthModule,
    DocumentsModule,
    SubjectsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
