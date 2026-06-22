import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { WarningFlag } from '@prisma/client';
import { aiConfiguration } from '../../config/ai.config';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly genAI: GoogleGenerativeAI;

  constructor(
    @Inject(aiConfiguration.KEY)
    private readonly aiConfig: ConfigType<typeof aiConfiguration>,
  ) {
    const apiKey = this.aiConfig.apiKey;
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY environment variable is missing.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Generates text content based on a text prompt.
   * Defaults to 'gemini-2.5-flash' for cost efficiency.
   */
  async generateText(
    prompt: string,
    modelName = 'gemini-2.5-flash',
  ): Promise<string> {
    let lastError: any;
    const maxAttempts = 3;
    let delay = 1000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        this.logger.log(
          `Calling Gemini API (model: ${modelName}) to generate content... Attempt ${attempt}/${maxAttempts}`,
        );
        const model = this.genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `Error on attempt ${attempt} generating text from Gemini API: ${(error as Error).message}`,
        );

        if (attempt < maxAttempts && this.isRetryableError(error)) {
          this.logger.log(
            `Retryable error detected. Retrying in ${delay}ms...`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
        } else {
          break;
        }
      }
    }

    this.logger.error(
      `Failed to generate text from Gemini API after ${maxAttempts} attempts. Final error: ${lastError?.message || lastError}`,
      lastError?.stack,
    );

    throw new ServiceUnavailableException(
      'Dịch vụ AI hiện không khả dụng. Vui lòng thử lại sau.',
    );
  }

  private isRetryableError(error: any): boolean {
    if (!error) return false;
    const msg = String(error.message || error).toLowerCase();
    const status = error.status || error.statusCode;

    // Check HTTP status code
    if (status === 503 || status === 429) {
      return true;
    }

    // Check message content
    if (
      msg.includes('503') ||
      msg.includes('429') ||
      msg.includes('service unavailable') ||
      msg.includes('quota') ||
      msg.includes('rate limit') ||
      msg.includes('rate-limit') ||
      msg.includes('resource_exhausted') ||
      msg.includes('unavailable')
    ) {
      return true;
    }

    return false;
  }

  /**
   * Generates high-dimensional embedding float array (Float[]) for a text string.
   * Defaults to 'gemini-embedding-2' (3072 dimensions).
   */
  async getEmbedding(
    text: string,
    modelName = 'gemini-embedding-2',
  ): Promise<number[]> {
    try {
      this.logger.log(
        `Calling Gemini API (model: ${modelName}) to generate embeddings...`,
      );
      const model = this.genAI.getGenerativeModel({ model: modelName });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      this.logger.error(
        `Error generating embedding from Gemini API: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * Generates a concise 2-4 sentences description in Vietnamese based on the document text.
   */
  async generateDescription(documentText: string): Promise<string> {
    const sampleText = documentText.slice(0, 8000);
    const prompt = `Bạn là một trợ lý học tập thông minh. Dưới đây là nội dung của một tài liệu học tập:
     
-----
Nội dung:
${sampleText}
-----

Nhiệm vụ: Hãy viết một đoạn mô tả (description) ngắn gọn trong 1 câu duy nhất bằng tiếng Việt tóm tắt nội dung chính của tài liệu này để giúp học sinh/sinh viên dễ dàng nắm bắt tài liệu nói về cái gì. Đảm bảo mô tả khách quan, chuyên nghiệp, không tự thêm thắt hay suy diễn thông tin ngoài tài liệu. Chỉ trả về kết quả mô tả, không thêm lời chào, ký hiệu đặc biệt, hay bất kỳ giải thích nào khác.`;

    return this.generateText(prompt);
  }

  /**
   * Generates a structured summary in Vietnamese based on the document text.
   */
  async generateSummary(documentText: string): Promise<string> {
    const sampleText = documentText.slice(0, 16000);
    const prompt = `Bạn là một trợ lý học tập thông minh chuyên nghiệp. Dưới đây là nội dung của một tài liệu học tập:
     
-----
Nội dung:
${sampleText}
-----

Nhiệm vụ: Hãy viết một bản tóm tắt (summary) chi tiết, rõ ràng và có cấu trúc bằng tiếng Việt cho tài liệu này. Bản tóm tắt nên bao gồm:
1. Một đoạn giới thiệu ngắn (2-3 câu) về chủ đề chính của tài liệu.
2. Các điểm chính hoặc nội dung quan trọng nhất dưới dạng danh sách gạch đầu dòng (bullet points).
3. Một câu kết luận tóm gọn giá trị học tập của tài liệu.

Yêu cầu:
- Trình bày mạch lạc, khách quan, chuyên nghiệp, sử dụng ngôn ngữ dễ hiểu.
- Không tự suy diễn hay thêm thông tin ngoài tài liệu.
- Phản hồi bằng định dạng Markdown sạch (sử dụng gạch đầu dòng, in đậm cho các từ khóa quan trọng).
- Chỉ trả về bản tóm tắt, không thêm lời chào, giải thích hay ký hiệu khác.`;

    return this.generateText(prompt);
  }

  /**
   * Performs an AI moderator analysis on the document text.
   * Returns a JSON object with summary, content risk flags, moderation suggestion, and reasoning.
   */
  async analyzeDocumentForModerator(documentText: string): Promise<{
    summary: string;
    flags: WarningFlag[];
    moderationSuggestion: 'APPROVE' | 'REJECT';
    reason: string;
  }> {
    const sampleText = documentText.slice(0, 16000);
    const prompt = `Bạn là một chuyên gia kiểm duyệt nội dung học tập thông minh sử dụng tiếng Việt. Hãy phân tích tài liệu học tập sau đây:
     
-----
Nội dung tài liệu:
${sampleText}
-----

Nhiệm vụ:
Hãy phân tích tài liệu để tìm các vấn đề sau:
1. Bản tóm tắt nội dung tài liệu ngắn gọn.
2. Các cảnh báo (flags) về độ an toàn và chất lượng nội dung. Bạn CHỈ được chọn các nhãn cảnh báo trong danh sách sau:
   - "SPAM": quảng cáo, tiếp thị, link rác, thông tin không liên quan học tập.
   - "TOXIC": nội dung bạo lực, thô tục, chính trị nhạy cảm, quấy rối hoặc không phù hợp môi trường học đường.
   - "ACADEMIC_INTEGRITY_RISK": Có dấu hiệu vi phạm liêm chính học thuật, bao gồm tài liệu mật/nội bộ, đề thi hoặc đáp án bị rò rỉ, hoặc nội dung hướng dẫn gian lận học tập. 
   Nếu tài liệu hoàn toàn tốt và không có vấn đề gì, hãy trả về mảng rỗng [] cho "flags".
3. Đề xuất hành động kiểm duyệt: "APPROVE" nếu tài liệu hữu ích cho học tập và an toàn, hoặc "REJECT" nếu vi phạm chính sách hoặc không có giá trị học tập.
4. Lý do chi tiết cho đề xuất đó (bằng tiếng Việt).

Yêu cầu định dạng kết quả:
Trả về duy nhất một chuỗi JSON hợp lệ với cấu trúc sau, không thêm bất kỳ văn bản, lời mở đầu, ký hiệu markdown \`\`\` hay giải thích nào khác ngoài JSON:
{
  "summary": "Tóm tắt ngắn gọn tài liệu (2-3 câu).",
  "flags": ["SPAM", "TOXIC", "ACADEMIC_INTEGRITY_RISK"],
  "moderationSuggestion": "APPROVE",
  "reason": "Lý do chi tiết đề xuất kiểm duyệt."
}

Hãy đảm bảo đầu ra là JSON sạch để có thể parse bằng JSON.parse().`;

    const responseText = await this.generateText(prompt);
    try {
      // Clean up response if it contains markdown code blocks
      const cleanJson = responseText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      const parsed = JSON.parse(cleanJson);

      // Sanitize flags to only match WarningFlag enum values
      const validFlags = (parsed.flags || [])
        .map((f: string) => {
          const upper = f.toUpperCase().trim();
          if (upper === 'SPAM') return WarningFlag.SPAM;
          if (upper === 'TOXIC') return WarningFlag.TOXIC;
          if (upper === 'ACADEMIC_INTEGRITY_RISK')
            return WarningFlag.ACADEMIC_INTEGRITY_RISK;
          return null;
        })
        .filter((f: WarningFlag | null): f is WarningFlag => f !== null);

      const uniqueFlags = Array.from(new Set(validFlags)) as WarningFlag[];

      return {
        summary: parsed.summary || '',
        flags: uniqueFlags,
        moderationSuggestion:
          parsed.moderationSuggestion === 'REJECT' ? 'REJECT' : 'APPROVE',
        reason: parsed.reason || '',
      };
    } catch (error) {
      this.logger.error(
        `Failed to parse AI moderator response`,
        (error as Error).stack,
      );
      // Fallback response if parsing fails
      return {
        summary: 'Không thể tạo tóm tắt do lỗi phân tích.',
        flags: [],
        moderationSuggestion: 'APPROVE',
        reason: 'Phản hồi từ AI không đúng định dạng JSON.',
      };
    }
  }
}
