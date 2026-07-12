import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { AIService } from '../ai/ai.service';
import type { TokenPayload } from '../../common/interfaces/auth.interface';
import { CreateChatSessionDto, SendChatMessageDto } from './dto';
import { CHAT_MESSAGE_ROLE, ChatRepository } from './chat.repository';
import { DocumentProcessingService } from '../document-processing/document-processing.service';

const CHAT_MODEL = 'gemini-2.5-flash-lite';
const TOP_K_CHUNKS = 6;
const MAX_CONTEXT_CHARS = 12_000;
const MAX_RETRIEVAL_CHUNKS = 200;

type RetrievedChunk = Awaited<
  ReturnType<ChatRepository['findEmbeddedChunks']>
>[number] & {
  score: number;
};

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly aiService: AIService,
    private readonly documentProcessingService: DocumentProcessingService,
  ) {}

  async createDocumentSession(
    documentId: string,
    createChatSessionDto: CreateChatSessionDto,
    user: TokenPayload,
  ) {
    const [settings, document] = await Promise.all([
      this.chatRepository.findOrCreateSettings(),
      this.findReadableDocumentOrThrow(documentId, user),
    ]);
    this.ensureAiChatEnabled(settings);

    const title =
      createChatSessionDto.title?.trim() ||
      this.createDefaultSessionTitle(document.title);

    const session = await this.chatRepository.createSession({
      documentId,
      userId: user.sub,
      title,
      model: CHAT_MODEL,
    });

    return {
      message: 'Chat session created successfully',
      data: session,
    };
  }

  async findDocumentSessions(documentId: string, user: TokenPayload) {
    const [settings] = await Promise.all([
      this.chatRepository.findOrCreateSettings(),
      this.findReadableDocumentOrThrow(documentId, user),
    ]);
    this.ensureAiChatEnabled(settings);

    const sessions = await this.chatRepository.findSessions(
      documentId,
      user.sub,
    );

    return {
      message: 'Chat sessions fetched successfully',
      data: {
        sessions,
      },
    };
  }

  async findSessionMessages(sessionId: string, user: TokenPayload) {
    await this.findOwnedSessionOrThrow(sessionId, user);
    const messages = await this.chatRepository.findMessages(sessionId);

    return {
      message: 'Chat messages fetched successfully',
      data: {
        messages,
      },
    };
  }

  async sendMessage(
    sessionId: string,
    sendChatMessageDto: SendChatMessageDto,
    user: TokenPayload,
  ) {
    const content = sendChatMessageDto.content.trim();
    if (!content) {
      throw new BadRequestException('Message content cannot be empty');
    }

    const [settings, session] = await Promise.all([
      this.chatRepository.findOrCreateSettings(),
      this.findOwnedSessionOrThrow(sessionId, user),
    ]);

    this.ensureAiChatEnabled(settings);
    await this.findReadableDocumentOrThrow(session.documentId, user);

    const [recentMessages, initialChunks] = await Promise.all([
      this.chatRepository.findRecentMessages(sessionId),
      this.chatRepository.findEmbeddedChunks(
        session.documentId,
        MAX_RETRIEVAL_CHUNKS,
      ),
    ]);
    const isFirstExchange = recentMessages.length === 0;
    let chunks = initialChunks;

    if (chunks.length === 0) {
      try {
        await this.documentProcessingService.ensureDocumentReadyForChat(
          session.documentId,
        );
      } catch (error) {
        this.logger.error(
          `Failed to prepare document ${session.documentId} for AI Coach: ${(error as Error).message}`,
          error instanceof Error ? error.stack : undefined,
        );

        if (error instanceof HttpException) throw error;

        throw new ServiceUnavailableException(
          'Unable to process this document for AI Coach right now. Please try again later.',
        );
      }

      chunks = await this.chatRepository.findEmbeddedChunks(
        session.documentId,
        MAX_RETRIEVAL_CHUNKS,
      );
    }
    if (chunks.length === 0) {
      const totalChunks = await this.chatRepository.countDocumentChunks(
        session.documentId,
      );
      if (totalChunks > 0) {
        throw new BadRequestException(
          'Document embeddings are still processing. Please try again later.',
        );
      }
      throw new BadRequestException(
        'Document text chunks have not been processed yet. Please wait for upload processing to complete.',
      );
    }

    await this.ensureDailyQuota(user.sub, settings.maxAiRequestsPerUserPerDay);

    const queryEmbedding = await this.aiService.getEmbedding(content);
    const selectedChunks = this.retrieveTopChunks(queryEmbedding, chunks);
    if (selectedChunks.length === 0) {
      throw new BadRequestException(
        'Document embeddings are not compatible with the current AI model. Please regenerate embeddings for this document.',
      );
    }

    const prompt = this.buildPrompt({
      question: content,
      chunks: selectedChunks,
      recentMessages: recentMessages.reverse(),
      documentTitle: session.document.title,
    });

    const answer = await this.aiService.generateText(prompt, CHAT_MODEL);
    const citations = this.toCitations(selectedChunks);

    const exchange = await this.chatRepository.createExchangeAndTouchSession({
      sessionId,
      userContent: content,
      assistantContent: answer.trim(),
      citations: citations as Prisma.InputJsonValue,
      title: isFirstExchange
        ? this.createTitleFromQuestion(content)
        : undefined,
    });

    return {
      message: 'AI Coach answered successfully',
      data: {
        session: exchange.session,
        userMessage: exchange.userMessage,
        message: exchange.assistantMessage,
      },
    };
  }

  async deleteSession(sessionId: string, user: TokenPayload) {
    await this.findOwnedSessionOrThrow(sessionId, user);
    await this.chatRepository.deleteSession(sessionId);

    return {
      message: 'Chat session deleted successfully',
    };
  }

  private async findReadableDocumentOrThrow(
    documentId: string,
    user: TokenPayload,
  ) {
    const document = await this.chatRepository.findReadableDocument(
      documentId,
      user,
    );

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    return document;
  }

  private async findOwnedSessionOrThrow(sessionId: string, user: TokenPayload) {
    const session = await this.chatRepository.findOwnedSession(
      sessionId,
      user.sub,
    );

    if (!session) {
      throw new NotFoundException(
        `Chat session with ID ${sessionId} not found`,
      );
    }

    return session;
  }

  private ensureAiChatEnabled(settings: {
    enableAiFeatures: boolean;
    enableAiChat: boolean;
  }) {
    if (!settings.enableAiFeatures || !settings.enableAiChat) {
      throw new ForbiddenException('AI chat is currently disabled');
    }
  }

  private async ensureDailyQuota(userId: string, maxRequests: number) {
    if (maxRequests <= 0) {
      return;
    }

    const quotaGranted = await this.chatRepository.incrementDailyAiRequest(
      userId,
      this.getDailyQuotaDate(),
      maxRequests,
    );

    if (!quotaGranted) {
      throw new ForbiddenException(
        'Daily AI request quota exceeded. Please try again tomorrow.',
      );
    }
  }

  private getDailyQuotaDate(date = new Date()) {
    return date.toISOString().slice(0, 10);
  }

  private retrieveTopChunks(
    queryEmbedding: number[],
    chunks: Awaited<ReturnType<ChatRepository['findEmbeddedChunks']>>,
  ): RetrievedChunk[] {
    return chunks
      .map((chunk) => ({
        ...chunk,
        score: this.dotProduct(queryEmbedding, chunk.embedding),
      }))
      .filter((chunk) => Number.isFinite(chunk.score))
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_K_CHUNKS)
      .reduce<RetrievedChunk[]>((selected, chunk) => {
        const currentLength = selected.reduce(
          (sum, item) => sum + item.chunkText.length,
          0,
        );

        if (currentLength >= MAX_CONTEXT_CHARS) {
          return selected;
        }

        const remainingChars = MAX_CONTEXT_CHARS - currentLength;
        selected.push({
          ...chunk,
          chunkText:
            chunk.chunkText.length > remainingChars
              ? chunk.chunkText.slice(0, remainingChars)
              : chunk.chunkText,
        });
        return selected;
      }, []);
  }

  private dotProduct(a: number[], b: number[]) {
    if (a.length === 0 || a.length !== b.length) {
      return Number.NaN;
    }

    let sum = 0;
    for (let index = 0; index < a.length; index += 1) {
      sum += a[index] * b[index];
    }
    return sum;
  }

  private buildPrompt(params: {
    question: string;
    chunks: RetrievedChunk[];
    recentMessages: { role: string; content: string }[];
    documentTitle: string;
  }) {
    const context = params.chunks
      .map((chunk, index) => {
        const sourceLabel = `Nguồn ${index + 1}`;
        const pageLabel =
          chunk.pageStart || chunk.pageEnd
            ? ` | trang ${chunk.pageStart ?? '?'}-${chunk.pageEnd ?? '?'}`
            : '';

        return `[${sourceLabel} | chunk ${chunk.chunkIndex}${pageLabel}]\n${chunk.chunkText}`;
      })
      .join('\n\n---\n\n');

    const recentHistory = params.recentMessages
      .slice(-8)
      .map((message) => {
        const role =
          message.role === CHAT_MESSAGE_ROLE.assistant
            ? 'AI Coach'
            : 'Người dùng';
        return `${role}: ${message.content}`;
      })
      .join('\n');

    return `Bạn là AI Study Coach của hệ thống AI Study Hub.

Tài liệu đang được hỏi: "${params.documentTitle}"

QUY TẮC BẮT BUỘC:
1. Chỉ được trả lời dựa trên phần "NGUỒN TÀI LIỆU" bên dưới.
2. Nếu nguồn tài liệu không đủ thông tin để trả lời, hãy nói rõ: "Mình chưa tìm thấy thông tin này trong tài liệu được cung cấp." Sau đó gợi ý người dùng hỏi lại cụ thể hơn.
3. Không bịa thông tin, không suy diễn ngoài tài liệu, không tự thêm kiến thức bên ngoài.
4. Trả lời bằng cùng ngôn ngữ với câu hỏi của người dùng; nếu không chắc, dùng tiếng Việt.
5. Khi dùng thông tin từ nguồn, có thể nhắc nguồn theo dạng [Nguồn 1], [Nguồn 2].
6. Trả lời ngắn gọn, dễ hiểu, theo phong cách trợ lý học tập.

LỊCH SỬ GẦN ĐÂY:
${recentHistory || '(Chưa có lịch sử trò chuyện)'}

NGUỒN TÀI LIỆU:
${context}

CÂU HỎI CỦA NGƯỜI DÙNG:
${params.question}

CÂU TRẢ LỜI:`;
  }

  private toCitations(chunks: RetrievedChunk[]) {
    return chunks.map((chunk) => ({
      chunkId: chunk.id,
      chunkIndex: chunk.chunkIndex,
      pageStart: chunk.pageStart,
      pageEnd: chunk.pageEnd,
      score: Number(chunk.score.toFixed(4)),
      preview: this.normalizePreview(chunk.chunkText, 240),
    }));
  }

  private normalizePreview(value: string, maxLength: number) {
    const normalized = value.replace(/\s+/g, ' ').trim();
    return normalized.length > maxLength
      ? `${normalized.slice(0, maxLength).trim()}...`
      : normalized;
  }

  private createDefaultSessionTitle(documentTitle: string) {
    return `AI Coach - ${documentTitle.slice(0, 80)}`;
  }

  private createTitleFromQuestion(question: string) {
    const normalized = question.replace(/\s+/g, ' ').trim();
    return normalized.length > 80
      ? `${normalized.slice(0, 77).trim()}...`
      : normalized;
  }
}
