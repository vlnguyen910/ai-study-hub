import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as pdf from 'pdf-parse';
import mammoth from 'mammoth';

@Injectable()
export class DocumentExtractorService {
  private readonly logger = new Logger(DocumentExtractorService.name);

  async extractText(fileUrl: string, format: string): Promise<string> {
    try {
      this.logger.log(`Fetching document content from: ${fileUrl}`);
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch file from Cloudinary (HTTP ${response.status}: ${response.statusText})`,
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const normalizedFormat = format.toLowerCase();
      if (normalizedFormat === 'pdf') {
        this.logger.log('Extracting text from PDF...');
        const parsed = await (pdf as any)(buffer);
        return parsed.text || '';
      } else if (normalizedFormat === 'docx' || normalizedFormat === 'doc') {
        this.logger.log('Extracting text from Word document...');
        const parsed = await mammoth.extractRawText({ buffer });
        return parsed.value || '';
      } else if (normalizedFormat === 'txt') {
        this.logger.log('Extracting text from Plain Text file...');
        return buffer.toString('utf8');
      } else {
        throw new BadRequestException(
          `Format "${format}" is not supported for AI text extraction.`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Document text extraction failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
