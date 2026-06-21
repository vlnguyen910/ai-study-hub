import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
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
    try {
      this.logger.log(
        `Calling Gemini API (model: ${modelName}) to generate content...`,
      );
      const model = this.genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      this.logger.error(
        `Error generating text from Gemini API: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
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
}
