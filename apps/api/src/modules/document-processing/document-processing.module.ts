import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QueueModule } from '../../common/queue/queue.module';
import { RedisModule } from '../../common/redis/redis.module';
import { DocumentProcessingService } from './document-processing.service';
import { DocumentProcessingProcessor } from './document-processing.processor';
import { DocumentExtractorService } from './document-extractor.service';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [ConfigModule, QueueModule, RedisModule, AIModule],
  providers: [
    DocumentProcessingService,
    DocumentProcessingProcessor,
    DocumentExtractorService,
  ],
  exports: [DocumentProcessingService, DocumentExtractorService],
})
export class DocumentProcessingModule {}
