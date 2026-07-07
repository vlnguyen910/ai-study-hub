import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import { JwtTokenType } from '../../common/enums/jwt.enum';
import type { TokenPayload } from '../../common/interfaces/auth.interface';
import { AIService } from '../ai/ai.service';
import { ChatRepository } from './chat.repository';
import { ChatService } from './chat.service';

const user: TokenPayload = {
  sub: 'user-1',
  role: UserRole.USER,
  status: UserStatus.ACTIVE,
  type: JwtTokenType.AccessToken,
  deviceId: 'device-1',
};

describe('ChatService', () => {
  let service: ChatService;
  let repository: jest.Mocked<Partial<ChatRepository>>;
  let aiService: jest.Mocked<Partial<AIService>>;

  beforeEach(() => {
    repository = {
      findReadableDocument: jest.fn().mockResolvedValue({
        id: 'doc-1',
        title: 'Intro to AI',
        status: 'ACTIVE',
        isPublic: true,
        authorId: 'author-1',
      }),
      findOrCreateSettings: jest.fn().mockResolvedValue({
        enableAiFeatures: true,
        enableAiChat: true,
        maxAiRequestsPerUserPerDay: 20,
      }),
      findOwnedSession: jest.fn().mockResolvedValue({
        id: 'session-1',
        documentId: 'doc-1',
        userId: 'user-1',
        title: 'AI Coach - Intro to AI',
        document: {
          id: 'doc-1',
          title: 'Intro to AI',
          status: 'ACTIVE',
          isPublic: true,
          authorId: 'author-1',
        },
      }),
      countUserMessagesSince: jest.fn().mockResolvedValue(0),
      findRecentMessages: jest.fn().mockResolvedValue([]),
      findEmbeddedChunks: jest.fn().mockResolvedValue([
        {
          id: 'chunk-1',
          chunkIndex: 0,
          chunkText: 'Machine learning is a subfield of AI.',
          tokenCount: 10,
          embedding: [1, 0],
          pageStart: 1,
          pageEnd: 1,
        },
      ]),
      countDocumentChunks: jest.fn().mockResolvedValue(1),
      createExchangeAndTouchSession: jest.fn().mockResolvedValue({
        session: { id: 'session-1', title: 'What is ML?' },
        userMessage: {
          id: 'message-user-1',
          role: 'user',
          content: 'What is ML?',
        },
        assistantMessage: {
          id: 'message-ai-1',
          role: 'assistant',
          content: 'Machine learning is a subfield of AI.',
          citations: [],
        },
      }),
    };

    aiService = {
      getEmbedding: jest.fn().mockResolvedValue([1, 0]),
      generateText: jest
        .fn()
        .mockResolvedValue('Machine learning is a subfield of AI.'),
    };

    service = new ChatService(
      repository as ChatRepository,
      aiService as AIService,
    );
  });

  it('answers a document-scoped question using retrieved chunks', async () => {
    const result = await service.sendMessage(
      'session-1',
      { content: 'What is ML?' },
      user,
    );

    expect(aiService.getEmbedding).toHaveBeenCalledWith('What is ML?');
    expect(aiService.generateText).toHaveBeenCalledWith(
      expect.stringContaining('Machine learning is a subfield of AI.'),
      'gemini-2.5-flash-lite',
    );
    expect(repository.createExchangeAndTouchSession).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: 'session-1',
        userContent: 'What is ML?',
        assistantContent: 'Machine learning is a subfield of AI.',
      }),
    );
    expect(result.message).toBe('AI Coach answered successfully');
    expect(result.data.message.content).toBe(
      'Machine learning is a subfield of AI.',
    );
  });

  it('blocks chat when AI chat is disabled', async () => {
    (repository.findOrCreateSettings as jest.Mock).mockResolvedValue({
      enableAiFeatures: true,
      enableAiChat: false,
      maxAiRequestsPerUserPerDay: 20,
    } as any);

    await expect(
      service.sendMessage('session-1', { content: 'Hello' }, user),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects when document embeddings are not ready', async () => {
    (repository.findEmbeddedChunks as jest.Mock).mockResolvedValue([]);
    (repository.countDocumentChunks as jest.Mock).mockResolvedValue(1);

    await expect(
      service.sendMessage('session-1', { content: 'Hello' }, user),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
