import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { SubjectsModule } from '../subjects';
import { OptionalJwtGuard } from '../../common/guards/optional-jwt.guard';

@Module({
  imports: [AuthModule, SubjectsModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, PrismaService, OptionalJwtGuard],
})
export class DocumentsModule {}
