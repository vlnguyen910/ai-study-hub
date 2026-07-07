import { Injectable } from '@nestjs/common';
import { DocumentStatus, Prisma, type chat_messages } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { TokenPayload } from '../../common/interfaces/auth.interface';

export const CHAT_SESSION_STATUS = {
  active: 'ACTIVE',
} as const;

export const CHAT_MESSAGE_ROLE = {
  user: 'user',
  assistant: 'assistant',
} as const;

@Injectable()
export class ChatRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private buildReadableDocumentFilters(user: TokenPayload) {
    const visibilityFilters: Prisma.documentsWhereInput[] = [
      {
        status: DocumentStatus.ACTIVE,
        isPublic: true,
      },
      {
        status: DocumentStatus.ACTIVE,
        isPublic: false,
        authorId: user.sub,
      },
    ];

    if (user.role === 'MODERATOR') {
      visibilityFilters.push(
        { status: DocumentStatus.PENDING },
        { status: DocumentStatus.REJECTED },
      );
    }

    return visibilityFilters;
  }

  findReadableDocument(documentId: string, user: TokenPayload) {
    return this.prismaService.documents.findFirst({
      where: {
        id: documentId,
        status: {
          not: DocumentStatus.DELETED,
        },
        OR: this.buildReadableDocumentFilters(user),
      },
      select: {
        id: true,
        title: true,
        status: true,
        isPublic: true,
        authorId: true,
      },
    });
  }

  findOrCreateSettings() {
    return this.prismaService.system_settings.upsert({
      where: { key: 'GLOBAL' },
      update: {},
      create: { key: 'GLOBAL' },
    });
  }

  createSession(params: {
    documentId: string;
    userId: string;
    title: string;
    model: string;
  }) {
    return this.prismaService.chat_sessions.create({
      data: {
        documentId: params.documentId,
        userId: params.userId,
        title: params.title,
        status: CHAT_SESSION_STATUS.active,
        model: params.model,
      },
    });
  }

  findSessions(documentId: string, userId: string) {
    return this.prismaService.chat_sessions.findMany({
      where: {
        documentId,
        userId,
        status: CHAT_SESSION_STATUS.active,
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });
  }

  findOwnedSession(sessionId: string, userId: string) {
    return this.prismaService.chat_sessions.findFirst({
      where: {
        id: sessionId,
        userId,
        status: CHAT_SESSION_STATUS.active,
      },
      include: {
        document: {
          select: {
            id: true,
            title: true,
            status: true,
            isPublic: true,
            authorId: true,
          },
        },
      },
    });
  }

  findMessages(sessionId: string) {
    return this.prismaService.chat_messages.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });
  }

  findRecentMessages(sessionId: string, take = 8) {
    return this.prismaService.chat_messages.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        role: true,
        content: true,
      },
    });
  }

  createMessage(params: {
    sessionId: string;
    role: string;
    content: string;
    citations?: Prisma.InputJsonValue;
    status?: string;
  }): Promise<chat_messages> {
    return this.prismaService.chat_messages.create({
      data: {
        sessionId: params.sessionId,
        role: params.role,
        content: params.content,
        citations: params.citations,
        status: params.status,
      },
    });
  }

  async createExchangeAndTouchSession(params: {
    sessionId: string;
    userContent: string;
    assistantContent: string;
    citations: Prisma.InputJsonValue;
    title?: string;
  }) {
    return this.prismaService.$transaction(async (tx) => {
      const userMessage = await tx.chat_messages.create({
        data: {
          sessionId: params.sessionId,
          role: CHAT_MESSAGE_ROLE.user,
          content: params.userContent,
          status: 'SENT',
        },
      });

      const assistantMessage = await tx.chat_messages.create({
        data: {
          sessionId: params.sessionId,
          role: CHAT_MESSAGE_ROLE.assistant,
          content: params.assistantContent,
          citations: params.citations,
          status: 'SENT',
        },
      });

      const session = await tx.chat_sessions.update({
        where: { id: params.sessionId },
        data: {
          ...(params.title ? { title: params.title } : {}),
          lastMessageAt: new Date(),
        },
      });

      return {
        session,
        userMessage,
        assistantMessage,
      };
    });
  }

  touchSession(sessionId: string, title?: string) {
    return this.prismaService.chat_sessions.update({
      where: { id: sessionId },
      data: {
        ...(title ? { title } : {}),
        lastMessageAt: new Date(),
      },
    });
  }

  deleteSession(sessionId: string) {
    return this.prismaService.chat_sessions.delete({
      where: { id: sessionId },
    });
  }

  countDocumentChunks(documentId: string) {
    return this.prismaService.document_chunks.count({
      where: { documentId },
    });
  }

  findEmbeddedChunks(documentId: string) {
    return this.prismaService.document_chunks.findMany({
      where: {
        documentId,
        embedding: {
          isEmpty: false,
        },
      },
      orderBy: {
        chunkIndex: 'asc',
      },
      select: {
        id: true,
        chunkIndex: true,
        chunkText: true,
        tokenCount: true,
        embedding: true,
        pageStart: true,
        pageEnd: true,
      },
    });
  }

  countUserMessagesSince(userId: string, since: Date) {
    return this.prismaService.chat_messages.count({
      where: {
        role: CHAT_MESSAGE_ROLE.user,
        createdAt: {
          gte: since,
        },
        session: {
          userId,
        },
      },
    });
  }
}
