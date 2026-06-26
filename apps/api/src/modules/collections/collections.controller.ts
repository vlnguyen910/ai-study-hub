import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  Version,
} from '@nestjs/common';
import { User } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { VerifiedAccountGuard } from '../../common/guards/verified-account.guard';
import { TokenPayload } from '../../common/interfaces/auth.interface';
import { ParseMongoIdPipe } from '../../common/pipes/parse-mongoid.pipe';
import { CollectionsService } from './collections.service';
import {
  AddDocumentToCollectionDto,
  CreateCollectionDto,
  ListCollectionsQueryDto,
  UpdateCollectionDto,
} from './dto';

@Controller('collections')
@UseGuards(JwtAuthGuard)
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Version('1')
  @UseGuards(VerifiedAccountGuard)
  @Post()
  create(
    @Body() createCollectionDto: CreateCollectionDto,
    @User() user: TokenPayload,
  ) {
    return this.collectionsService.create(createCollectionDto, user.sub);
  }

  @Version('1')
  @Get()
  findAll(@Query() query: ListCollectionsQueryDto, @User() user: TokenPayload) {
    return this.collectionsService.findAll(query, user.sub);
  }

  @Version('1')
  @Get('documents/:documentId/status')
  getDocumentSaveStatus(
    @Param('documentId', new ParseMongoIdPipe()) documentId: string,
    @User() user: TokenPayload,
  ) {
    return this.collectionsService.getDocumentSaveStatus(documentId, user.sub);
  }

  @Version('1')
  @Get(':id')
  findOne(
    @Param('id', new ParseMongoIdPipe()) id: string,
    @User() user: TokenPayload,
  ) {
    return this.collectionsService.findOne(id, user.sub);
  }

  @Version('1')
  @UseGuards(VerifiedAccountGuard)
  @Put(':id')
  update(
    @Param('id', new ParseMongoIdPipe()) id: string,
    @Body() updateCollectionDto: UpdateCollectionDto,
    @User() user: TokenPayload,
  ) {
    return this.collectionsService.update(id, updateCollectionDto, user.sub);
  }

  @Version('1')
  @UseGuards(VerifiedAccountGuard)
  @Delete(':id')
  remove(
    @Param('id', new ParseMongoIdPipe()) id: string,
    @User() user: TokenPayload,
  ) {
    return this.collectionsService.delete(id, user.sub);
  }

  @Version('1')
  @UseGuards(VerifiedAccountGuard)
  @Post(':id/documents')
  addDocument(
    @Param('id', new ParseMongoIdPipe()) id: string,
    @Body() addDocumentDto: AddDocumentToCollectionDto,
    @User() user: TokenPayload,
  ) {
    return this.collectionsService.addDocument(id, addDocumentDto, user.sub);
  }

  @Version('1')
  @UseGuards(VerifiedAccountGuard)
  @Delete(':id/documents/:docId')
  removeDocument(
    @Param('id', new ParseMongoIdPipe()) id: string,
    @Param('docId', new ParseMongoIdPipe()) docId: string,
    @User() user: TokenPayload,
  ) {
    return this.collectionsService.removeDocument(id, docId, user.sub);
  }
}
