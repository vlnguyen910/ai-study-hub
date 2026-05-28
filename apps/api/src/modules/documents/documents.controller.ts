import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Version,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import {
  CreateDocumentDto,
  UpdateDocumentDto,
  ListDocumentsQueryDto,
} from './dto';
import { User } from '../../common/decorators/user.decorator';
import type { RequestUser } from '../../common/decorators/user.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@UseGuards(AuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Version('1')
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
  findAll(@Query() query: ListDocumentsQueryDto) {
    return this.documentsService.findAll(query);
  }

  @Version('1')
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Version('1')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @User() user: RequestUser,
  ) {
    return this.documentsService.update(id, updateDocumentDto, user.sub);
  }

  @Version('1')
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: RequestUser) {
    return this.documentsService.delete(id, user.sub);
  }
}
