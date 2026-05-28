import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountsModule } from './modules/accounts/accounts.module';
import { AuthModule } from './modules/auth/auth.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { SubjectsModule } from './modules/subjects/subjects.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: (config) => {
        const requiredKeys = [
          'JWT_ACCESS_SECRET',
          'JWT_REFRESH_SECRET',
          'JWT_ACCESS_EXPIRES_IN',
          'JWT_REFRESH_EXPIRES_IN',
        ];

        for (const key of requiredKeys) {
          if (!config[key]) {
            throw new Error(`Missing required environment variable: ${key}`);
          }
        }

        return config;
      },
    }),
    AccountsModule,
    AuthModule,
    DocumentsModule,
    SubjectsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
