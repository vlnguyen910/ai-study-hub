import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QueueModule } from '../../common/queue/queue.module';
import { RedisModule } from '../../common/redis/redis.module';
import { DocumentProcessingService } from './document-processing.service';
import { DocumentProcessingProcessor } from './document-processing.processor';

@Module({
  imports: [ConfigModule, QueueModule, RedisModule],
  providers: [DocumentProcessingService, DocumentProcessingProcessor],
  exports: [DocumentProcessingService],
})
export class DocumentProcessingModule {}
