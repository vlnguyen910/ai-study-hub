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
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import {
  CreateDocumentDto,
  UpdateDocumentDto,
  ListDocumentsQueryDto,
} from './dto';
import { User } from '../../common/decorators/user.decorator';
import type { RequestUser } from '../../common/decorators/user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OptionalJwtGuard } from '../../common/guards/optional-jwt.guard';
import { ParseMongoIdPipe } from '../../common/pipes/parse-mongoid.pipe';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Version('1')
  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createDocumentDto: CreateDocumentDto,
    @User() user: RequestUser,
  ) {
    return this.documentsService.create(createDocumentDto, user.sub);
  }

  @Version('1')
  @Public()
  @Get()
  @UseGuards(OptionalJwtGuard)
  findAll(@Query() query: ListDocumentsQueryDto, @User() user?: RequestUser) {
    return this.documentsService.findAll(query, user);
  }

  @Version('1')
  @UseGuards(AuthGuard)
  @Get('me')
  findMine(@Query() query: ListDocumentsQueryDto, @User() user: RequestUser) {
    return this.documentsService.findMine(query, user.sub);
  }

  @Version('1')
  @Public()
  @UseGuards(OptionalJwtGuard)
  @Get(':id')
  findOne(
    @Param('id', new ParseMongoIdPipe()) id: string,
    @User() user?: RequestUser,
  ) {
    return this.documentsService.findOne(id, user);
  }

  @Version('1')
  @Patch(':id')
  update(
    @Param('id', new ParseMongoIdPipe()) id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @User() user: RequestUser,
  ) {
    return this.documentsService.update(id, updateDocumentDto, user.sub);
  }

  @Version('1')
  @Delete(':id')
  remove(
    @Param('id', new ParseMongoIdPipe()) id: string,
    @User() user: RequestUser,
  ) {
    return this.documentsService.delete(id, user.sub);
  }
}
