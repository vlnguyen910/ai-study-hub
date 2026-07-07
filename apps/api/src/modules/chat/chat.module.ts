import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AIModule } from '../ai/ai.module';
import { VerifiedAccountGuard } from '../../common/guards/verified-account.guard';
import { ChatController } from './chat.controller';
import { ChatRepository } from './chat.repository';
import { ChatService } from './chat.service';

@Module({
  imports: [AuthModule, AIModule],
  controllers: [ChatController],
  providers: [ChatService, ChatRepository, VerifiedAccountGuard],
  exports: [ChatService],
})
export class ChatModule {}
