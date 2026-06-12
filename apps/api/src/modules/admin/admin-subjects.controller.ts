import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
  Version,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateSubjectDto, UpdateSubjectDto } from '../subjects/dto';
import { SubjectsService } from '../subjects/subjects.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subjects')
export class AdminSubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Version('1')
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.create(createSubjectDto);
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
