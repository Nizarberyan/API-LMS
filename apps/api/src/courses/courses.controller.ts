import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { RolesGuard } from '@auth/guards/roles.guard';
import { Roles } from '@auth/decorators/roles.decorator';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { User } from '@users/entities/user.entity';
import { Types } from 'mongoose';
import { Role } from '@common/enums/role.enum';
import { ParseObjectIdPipe } from '@src/common/pipes';
import { type ObjectId } from '@src/common/types/objectid.type';

@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(Role.TEACHER)
  create(@Body() createCourseDto: CreateCourseDto, @CurrentUser() user: User) {
    return this.coursesService.create(createCourseDto, user);
  }

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get('published')
  @Roles(Role.STUDENT, Role.TEACHER, Role.ADMIN)
  findPublished() {
    return this.coursesService.findPublished();
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: ObjectId) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.TEACHER, Role.ADMIN)
  update(
    @Param('id', ParseObjectIdPipe) id: ObjectId,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser() user: User,
  ) {
    return this.coursesService.update(id, updateCourseDto, user);
  }

  @Delete(':id')
  @Roles(Role.TEACHER, Role.ADMIN)
  remove(
    @Param('id', ParseObjectIdPipe) id: ObjectId,
    @CurrentUser() user: User,
  ) {
    return this.coursesService.remove(id, user);
  }

  // @Get(':id/progress/:apprenantId')
  // async getCourseProgress(
  //   @Param('id', ParseObjectIdPipe) courseId: ObjectId,
  //   @Param('apprenantId', ParseObjectIdPipe) apprenantId: ObjectId,
  // ) {
  //   return this.coursesService.getCourseProgress(courseId, apprenantId);
  // }

  @Get(':courseId/resume')
  @Roles(Role.STUDENT)
  async resumeCourse(
    @Param('courseId', ParseObjectIdPipe) courseId: string,
    @CurrentUser() user: User,
  ) {
    return this.coursesService.getResumeModule(
      new Types.ObjectId(courseId),
      user._id,
    );
  }

  @Get(':id/calculate-progress/:apprenantId')
  @Roles(Role.STUDENT)
  async calculateCourseProgress(
    @Param('id', ParseObjectIdPipe) courseId: ObjectId,
    @Param('apprenantId', ParseObjectIdPipe) apprenantId: ObjectId,
  ) {
    const progress = await this.coursesService.calculateCourseProgress(
      courseId,
      apprenantId,
    );
    return {
      courseId,
      apprenantId,
      progressPercentage: progress,
    };
  }

  @Get(':courseId/modules')
  @Roles(Role.TEACHER, Role.STUDENT)
  async getModulesByCourse(
    @Param('courseId', ParseObjectIdPipe) courseId: string,
  ) {
    return this.coursesService.getModulesByCourse(new Types.ObjectId(courseId));
  }
}
