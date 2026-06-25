import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Version,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import {
  CreateDocumentDto,
  UpdateDocumentDto,
  ListDocumentsQueryDto,
  RejectDocumentDto,
  GenerateDescriptionDto,
} from './dto';
import { Public } from '../../common/decorators/public.decorator';
import { OptionalJwtGuard } from '../../common/guards/optional-jwt.guard';
import { ParseMongoIdPipe } from '../../common/pipes/parse-mongoid.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuditLogInterceptor, AuditLogAction } from '../audit-logs';
import { AuditAction } from '@prisma/client';
import { VerifiedAccountGuard } from '../../common/guards/verified-account.guard';
import { TokenPayload } from '../../common/interfaces/auth.interface';
import { Roles, User } from '../../common/decorators';
import { UserRole } from '@prisma/client';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Version('1')
  @UseGuards(JwtAuthGuard, VerifiedAccountGuard)
  @Post()
  create(
    @Body() createDocumentDto: CreateDocumentDto,
    @User() user: TokenPayload,
  ) {
    return this.documentsService.create(createDocumentDto, user.sub);
  }

  @Version('1')
  @UseGuards(JwtAuthGuard, VerifiedAccountGuard)
  @Post('generate-description-from-url')
  generateDescriptionFromUrl(
    @Body() generateDescriptionDto: GenerateDescriptionDto,
  ) {
    return this.documentsService.generateDescriptionFromUrl(
      generateDescriptionDto.fileUrl,
      generateDescriptionDto.format,
    );
  }

  @Version('1')
  @Public()
  @Get()
  @UseGuards(OptionalJwtGuard)
  findAll(@Query() query: ListDocumentsQueryDto, @User() user?: TokenPayload) {
    return this.documentsService.findAll(query, user);
  }

  @Version('1')
  @UseGuards(JwtAuthGuard)
  @Get('me')
  findMine(@Query() query: ListDocumentsQueryDto, @User() user: TokenPayload) {
    return this.documentsService.findMine(query, user.sub);
  }

  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR', 'ADMIN')
  @UseInterceptors(AuditLogInterceptor)
  @AuditLogAction(AuditAction.APPROVE_DOCUMENT)
  @Post(':id/approve')
  approve(
    @Param('id', new ParseMongoIdPipe()) id: string,
    @User() user: TokenPayload,
  ) {
    return this.documentsService.approve(id, user.sub);
  }

  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR', 'ADMIN')
  @UseInterceptors(AuditLogInterceptor)
  @AuditLogAction(AuditAction.REJECT_DOCUMENT)
  @Post(':id/reject')
  reject(
    @Param('id', new ParseMongoIdPipe()) id: string,
    @Body() rejectDocumentDto: RejectDocumentDto,
    @User() user: TokenPayload,
  ) {
    return this.documentsService.reject(id, rejectDocumentDto, user.sub);
  }

  @Version('1')
  @Public()
  @UseGuards(OptionalJwtGuard)
  @Get(':id')
  findOne(
    @Param('id', new ParseMongoIdPipe()) id: string,
    @User() user?: TokenPayload,
  ) {
    return this.documentsService.findOne(id, user);
  }

  @Version('1')
  @UseGuards(JwtAuthGuard, VerifiedAccountGuard)
  @Patch(':id')
  update(
    @Param('id', new ParseMongoIdPipe()) id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @User() user: TokenPayload,
  ) {
    return this.documentsService.update(id, updateDocumentDto, user.sub);
  }

  @Version('1')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLogAction(AuditAction.DELETE_DOCUMENT)
  @Delete(':id')
  remove(
    @Param('id', new ParseMongoIdPipe()) id: string,
    @User() user: TokenPayload,
  ) {
    return this.documentsService.delete(id, user.sub);
  }

  @Version('1')
  @UseGuards(JwtAuthGuard, VerifiedAccountGuard)
  @Post(':id/generate-description')
  generateDescription(
    @Param('id', new ParseMongoIdPipe()) id: string,
    @User() user: TokenPayload,
  ) {
    return this.documentsService.generateDescription(id, user.sub);
  }

  @Version('1')
  @UseGuards(JwtAuthGuard, VerifiedAccountGuard)
  @Post(':id/generate-summary')
  generateSummary(@Param('id', new ParseMongoIdPipe()) id: string) {
    return this.documentsService.generateSummary(id);
  }

  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR)
  @Post(':id/moderator-analysis')
  runModeratorAnalysis(@Param('id', new ParseMongoIdPipe()) id: string) {
    return this.documentsService.runModeratorAnalysis(id);
  }
}
