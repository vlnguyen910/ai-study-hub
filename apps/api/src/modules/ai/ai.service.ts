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
   * Defaults to 'gemini-1.5-flash' for cost efficiency.
   */
  async generateText(
    prompt: string,
    modelName = 'gemini-1.5-flash',
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
   * Defaults to 'text-embedding-004' (768 dimensions).
   */
  async getEmbedding(
    text: string,
    modelName = 'text-embedding-004',
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
}
