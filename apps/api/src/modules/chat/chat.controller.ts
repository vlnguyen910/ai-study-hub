import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  Version,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { User } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { VerifiedAccountGuard } from '../../common/guards/verified-account.guard';
import { ParseMongoIdPipe } from '../../common/pipes/parse-mongoid.pipe';
import type { TokenPayload } from '../../common/interfaces/auth.interface';
import { ChatService } from './chat.service';
import { CreateChatSessionDto, SendChatMessageDto } from './dto';

@Controller()
@UseGuards(JwtAuthGuard, VerifiedAccountGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Version('1')
  @Post('documents/:documentId/chat/sessions')
  createDocumentSession(
    @Param('documentId', new ParseMongoIdPipe()) documentId: string,
    @Body() createChatSessionDto: CreateChatSessionDto,
    @User() user: TokenPayload,
  ) {
    return this.chatService.createDocumentSession(
      documentId,
      createChatSessionDto,
      user,
    );
  }

  @Version('1')
  @Get('documents/:documentId/chat/sessions')
  findDocumentSessions(
    @Param('documentId', new ParseMongoIdPipe()) documentId: string,
    @User() user: TokenPayload,
  ) {
    return this.chatService.findDocumentSessions(documentId, user);
  }

  @Version('1')
  @Get('chat/sessions/:sessionId/messages')
  findSessionMessages(
    @Param('sessionId', new ParseMongoIdPipe()) sessionId: string,
    @User() user: TokenPayload,
  ) {
    return this.chatService.findSessionMessages(sessionId, user);
  }

  @Version('1')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('chat/sessions/:sessionId/messages')
  sendMessage(
    @Param('sessionId', new ParseMongoIdPipe()) sessionId: string,
    @Body() sendChatMessageDto: SendChatMessageDto,
    @User() user: TokenPayload,
  ) {
    return this.chatService.sendMessage(sessionId, sendChatMessageDto, user);
  }

  @Version('1')
  @Delete('chat/sessions/:sessionId')
  deleteSession(
    @Param('sessionId', new ParseMongoIdPipe()) sessionId: string,
    @User() user: TokenPayload,
  ) {
    return this.chatService.deleteSession(sessionId, user);
  }
}
