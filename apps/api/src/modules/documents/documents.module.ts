import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { AuthModule } from '../auth/auth.module';
import { SubjectsModule } from '../subjects';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OptionalJwtGuard } from '../../common/guards/optional-jwt.guard';
import { VerifiedAccountGuard } from '../../common/guards/verified-account.guard';
import { SettingsModule } from '../settings';
import { DocumentProcessingModule } from '../document-processing/document-processing.module';
import { AIModule } from '../ai/ai.module';
import { DocumentGateway } from './document.gateway';
import { JwtModule } from '@nestjs/jwt';
import { AuditLogModule } from '../audit-logs';

@Module({
  imports: [
    AuthModule,
    SubjectsModule,
    DocumentProcessingModule,
    AIModule,
    SettingsModule,
    JwtModule,
    AuditLogModule,
  ],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    DocumentGateway,
    AuthGuard,
    OptionalJwtGuard,
    VerifiedAccountGuard,
  ],
  exports: [DocumentGateway],
})
export class DocumentsModule {}
