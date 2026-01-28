import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormateurService } from './formateur.service';
import { FormateurController } from './formateur.controller';
import { UsersModule } from '@src/users/users.module';
import { CoursesModule } from 'src/courses/courses.module';
import { EnrollmentsModule } from 'src/enrollments/enrollments.module';
import { QuizModule } from 'src/quiz/quiz.module';
import {
  Enrollment,
  EnrollmentSchema,
} from 'src/enrollments/entities/enrollment.entity';
import { Course, CourseSchema } from 'src/courses/entities/course.entity';
import {
  QuizAttempt,
  QuizAttemptSchema,
} from 'src/quizAttempt/schema/quizAttempt.schema';
import {
  ModuleProgress,
  ModuleProgressSchema,
} from 'src/module-progress/entities/module-progress.entity';
import {
  Module as ModuleEntity,
  ModuleSchema,
} from 'src/modules/entities/module.entity';

@Module({
  imports: [
    UsersModule,
    CoursesModule,
    EnrollmentsModule,
    QuizModule,
    MongooseModule.forFeature([
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Course.name, schema: CourseSchema },
      { name: QuizAttempt.name, schema: QuizAttemptSchema },
      { name: ModuleProgress.name, schema: ModuleProgressSchema },
      { name: ModuleEntity.name, schema: ModuleSchema },
    ]),
  ],
  controllers: [FormateurController],
  providers: [FormateurService],
})
export class FormateurModule {}
