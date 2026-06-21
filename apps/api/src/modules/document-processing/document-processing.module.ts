import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QueueModule } from '../../common/queue/queue.module';
import { RedisModule } from '../../common/redis/redis.module';
import { DocumentProcessingService } from './document-processing.service';
import { DocumentProcessingProcessor } from './document-processing.processor';
import { DocumentExtractorService } from './document-extractor.service';

@Module({
  imports: [ConfigModule, QueueModule, RedisModule],
  providers: [
    DocumentProcessingService,
    DocumentProcessingProcessor,
    DocumentExtractorService,
  ],
  exports: [DocumentProcessingService, DocumentExtractorService],
})
export class DocumentProcessingModule {}
