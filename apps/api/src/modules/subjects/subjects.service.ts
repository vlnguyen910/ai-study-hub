import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateSubjectDto,
  UpdateSubjectDto,
  ListSubjectsQueryDto,
} from './dto';

@Injectable()
export class SubjectsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createSubjectDto: CreateSubjectDto) {
    const existingSubject = await this.prismaService.subjects.findUnique({
      where: { code: createSubjectDto.code },
    });

    if (existingSubject) {
      throw new ConflictException(
        `Subject with code ${createSubjectDto.code} already exists`,
      );
    }

    const subject = await this.prismaService.subjects.create({
      data: createSubjectDto,
    });

    return {
      message: 'Subject created successfully',
      data: subject,
    };
  }

  async findAll(query: ListSubjectsQueryDto) {
    const { page = 1, limit = 10, schoolId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (schoolId) {
      where.schoolId = schoolId;
    }

    const [subjects, total] = await Promise.all([
      this.prismaService.subjects.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.subjects.count({ where }),
    ]);

    return {
      message: 'Subjects fetched successfully',
      data: {
        subjects,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findOne(id: string) {
    const subject = await this.prismaService.subjects.findUnique({
      where: { id },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    return {
      message: 'Subject fetched successfully',
      data: subject,
    };
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto) {
    const existingSubject = await this.prismaService.subjects.findUnique({
      where: { id },
    });

    if (!existingSubject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    if (
      updateSubjectDto.code &&
      updateSubjectDto.code !== existingSubject.code
    ) {
      const duplicateCode = await this.prismaService.subjects.findUnique({
        where: { code: updateSubjectDto.code },
      });

      if (duplicateCode) {
        throw new ConflictException(
          `Subject with code ${updateSubjectDto.code} already exists`,
        );
      }
    }

    const subject = await this.prismaService.subjects.update({
      where: { id },
      data: updateSubjectDto,
    });

    return {
      message: 'Subject updated successfully',
      data: subject,
    };
  }

  async delete(id: string) {
    const existingSubject = await this.prismaService.subjects.findUnique({
      where: { id },
    });

    if (!existingSubject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    await this.prismaService.subjects.delete({
      where: { id },
    });

    return {
      message: 'Subject deleted successfully',
    };
  }
}
