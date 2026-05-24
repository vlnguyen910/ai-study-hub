import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountsModule } from './modules/accounts/accounts.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [AccountsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
