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
  Req,
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
import { AuditLogService } from '../audit-logs';
import { AuditAction, AuditTargetType } from '@prisma/client';
import { VerifiedAccountGuard } from '../../common/guards/verified-account.guard';
import { TokenPayload } from '../../common/interfaces/auth.interface';
import { Roles, User } from '../../common/decorators';
import { UserRole } from '@prisma/client';

@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly auditLogService: AuditLogService,
  ) {}

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
  @Post(':id/approve')
  async approve(
    @Param('id', new ParseMongoIdPipe()) id: string,
    @User() user: TokenPayload,
    @Req() request: any,
  ) {
    const result = await this.documentsService.approve(id, user.sub);
    try {
      const ipAddress = request
        ? request.ip ||
          request.headers?.['x-forwarded-for'] ||
          request.socket?.remoteAddress
        : undefined;

      await this.auditLogService.log({
        actorId: user.sub,
        actorRole: user.role as any,
        action: AuditAction.APPROVE_DOCUMENT,
        targetType: AuditTargetType.DOCUMENT,
        targetId: id,
        metadata: {
          previousStatus: 'PENDING_REVIEW',
          newStatus: 'APPROVED',
        },
        ipAddress: ipAddress ? String(ipAddress) : undefined,
      });
    } catch (err) {
      console.error('Failed to log APPROVE_DOCUMENT:', err);
    }
    return result;
  }

  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR', 'ADMIN')
  @Post(':id/reject')
  async reject(
    @Param('id', new ParseMongoIdPipe()) id: string,
    @Body() rejectDocumentDto: RejectDocumentDto,
    @User() user: TokenPayload,
    @Req() request: any,
  ) {
    const result = await this.documentsService.reject(
      id,
      rejectDocumentDto,
      user.sub,
    );
    try {
      const ipAddress = request
        ? request.ip ||
          request.headers?.['x-forwarded-for'] ||
          request.socket?.remoteAddress
        : undefined;

      await this.auditLogService.log({
        actorId: user.sub,
        actorRole: user.role as any,
        action: AuditAction.REJECT_DOCUMENT,
        targetType: AuditTargetType.DOCUMENT,
        targetId: id,
        metadata: {
          reason: rejectDocumentDto.rejectionReason,
          previousStatus: 'PENDING_REVIEW',
          newStatus: 'REJECTED',
        },
        ipAddress: ipAddress ? String(ipAddress) : undefined,
      });
    } catch (err) {
      console.error('Failed to log REJECT_DOCUMENT:', err);
    }
    return result;
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
  async update(
    @Param('id', new ParseMongoIdPipe()) id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @User() user: TokenPayload,
    @Req() request: any,
  ) {
    let existingDoc: any = null;
    try {
      existingDoc = await this.documentsService.findOne(id, user);
    } catch (e) {
      // Ignore if document not found / forbidden to check
    }

    const result = await this.documentsService.update(
      id,
      updateDocumentDto,
      user.sub,
    );
    try {
      if (
        updateDocumentDto.isPublic !== undefined &&
        existingDoc &&
        updateDocumentDto.isPublic !== existingDoc.isPublic
      ) {
        const ipAddress = request
          ? request.ip ||
            request.headers?.['x-forwarded-for'] ||
            request.socket?.remoteAddress
          : undefined;

        await this.auditLogService.log({
          actorId: user.sub,
          actorRole: user.role as any,
          action: AuditAction.UPDATE_DOCUMENT_VISIBILITY,
          targetType: AuditTargetType.DOCUMENT,
          targetId: id,
          metadata: {
            previousVisibility: existingDoc.isPublic,
            newVisibility: updateDocumentDto.isPublic,
          },
          ipAddress: ipAddress ? String(ipAddress) : undefined,
        });
      }
    } catch (err) {
      console.error('Failed to log UPDATE_DOCUMENT_VISIBILITY:', err);
    }
    return result;
  }

  @Version('1')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id', new ParseMongoIdPipe()) id: string,
    @User() user: TokenPayload,
    @Req() request: any,
  ) {
    const result = await this.documentsService.delete(id, user.sub);
    try {
      const ipAddress = request
        ? request.ip ||
          request.headers?.['x-forwarded-for'] ||
          request.socket?.remoteAddress
        : undefined;

      await this.auditLogService.log({
        actorId: user.sub,
        actorRole: user.role as any,
        action: AuditAction.DELETE_DOCUMENT,
        targetType: AuditTargetType.DOCUMENT,
        targetId: id,
        metadata: {
          message: 'Document deleted by owner',
        },
        ipAddress: ipAddress ? String(ipAddress) : undefined,
      });
    } catch (err) {
      console.error('Failed to log DELETE_DOCUMENT:', err);
    }
    return result;
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
