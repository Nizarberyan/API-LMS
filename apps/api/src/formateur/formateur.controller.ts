// filepath: src/formateur/formateur.controller.ts
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
import { FormateurService } from './formateur.service';
import { CreateFormateurDto } from './dto/create-formateur.dto';
import { UpdateFormateurDto } from './dto/update-formateur.dto';
import { JwtAuthGuard, Roles, RolesGuard, CurrentUser } from '@src/auth';
import { Role } from '@src/common/enums/role.enum';
import { User } from '@users/entities/user.entity';
import { EnrolledLearnerDto } from './dto/enrolled-learner.dto';
import { StudentProgressReportDto } from './dto/student-progress-report.dto';

@Controller('formateur')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TEACHER)
export class FormateurController {
  constructor(private readonly formateurService: FormateurService) {}
  @Get('my-courses')
  async getMyCourses(@CurrentUser() user: User) {
    const courses = await this.formateurService.getMyCourses(
      user._id.toString(),
    );

    return {
      message: 'Courses retrieved successfully',
      data: courses,
    };
  }
  @Get('enrolled-learners')
  async getEnrolledLearners(
    @CurrentUser() user: User,
  ): Promise<{ message: string; data: EnrolledLearnerDto[] }> {
    const learners = await this.formateurService.getEnrolledLearners(
      user._id.toString(),
    );
    return { message: 'Enrolled learners retrieved', data: learners };
  }
  @Get('courses/:courseId/students')
  async getStudentsByCourse(
    @Param('courseId') courseId: string,
    @CurrentUser() user: User,
  ) {
    const students = await this.formateurService.getStudentsByCourse(
      courseId,
      user._id.toString(),
    );

    return {
      message: 'Students retrieved successfully',
      data: students,
    };
  }
  /**
   *  Get detailed progress for ONE student in a course
   * GET /formateur/courses/:courseId/students/:studentId/progress
   */
  @Get('courses/:courseId/students/:studentId/progress')
  async getStudentProgress(
    @Param('courseId') courseId: string,
    @Param('studentId') studentId: string,
    @CurrentUser() user: User,
  ): Promise<{
    message: string;
    data: StudentProgressReportDto;
  }> {
    const report = await this.formateurService.getStudentProgressReport(
      courseId,
      studentId,
      user._id.toString(),
    );

    return {
      message: 'Student progress report retrieved successfully',
      data: report,
    };
  }

  /**
   *  Get progress reports for ALL students in a course
   * GET /formateur/courses/:courseId/progress
   */
  @Get('courses/:courseId/progress')
  async getCourseProgress(
    @Param('courseId') courseId: string,
    @CurrentUser() user: User,
  ): Promise<{
    message: string;
    data: StudentProgressReportDto[];
  }> {
    const reports = await this.formateurService.getCourseProgressReports(
      courseId,
      user._id.toString(),
    );

    return {
      message: 'Course progress reports retrieved successfully',
      data: reports,
    };
  }
}
