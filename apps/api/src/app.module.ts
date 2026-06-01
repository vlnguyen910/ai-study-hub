import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AccountsModule } from './modules/accounts/accounts.module';
import { AuthModule } from './modules/auth/auth.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { jwtConfiguration } from './config/jwt.config';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [jwtConfiguration],
    }),
    AccountsModule,
    AuthModule,
    DocumentsModule,
    SubjectsModule,
  ],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
