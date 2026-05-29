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
import { SubjectsService } from './subjects.service';
import {
  CreateSubjectDto,
  UpdateSubjectDto,
  ListSubjectsQueryDto,
} from './dto';
import { Public, Roles } from '../../common/decorators';
import { AuthGuard } from '../../common/guards/auth.guard';
import { UserRole } from '@prisma/client';

@UseGuards(AuthGuard)
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Version('1')
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.create(createSubjectDto);
  }

  @Version('1')
  @Public()
  @Get()
  findAll(@Query() query: ListSubjectsQueryDto) {
    return this.subjectsService.findAll(query);
  }

  @Version('1')
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subjectsService.findOne(id);
  }

  @Version('1')
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubjectDto: UpdateSubjectDto) {
    return this.subjectsService.update(id, updateSubjectDto);
  }

  @Version('1')
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subjectsService.delete(id);
  }
}
