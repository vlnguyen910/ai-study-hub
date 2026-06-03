import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConfiguration } from '../../config';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [jwtConfiguration.KEY],
      useFactory: (jwtConfig: ConfigType<typeof jwtConfiguration>) => ({
        secret: jwtConfig.secret,
      }),
    }),
    AccountsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
