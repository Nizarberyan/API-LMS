import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UploadsController } from './common/controllers/uploads.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QuizModule } from './quiz/quiz.module';
import { QuestionModule } from './question/question.module';
import { QuizAttemptModule } from './quizAttempt/quizAttempt.module';
import { AnswerModule } from './answer/answer.module';
import { FormateurModule } from './formateur/formateur.module';
import { CoursesModule } from './courses/courses.module';
import { ModulesModule } from './modules/modules.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { ModuleProgressModule } from './module-progress/module-progress.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    QuizModule,
    QuestionModule,
    QuizAttemptModule,
    AnswerModule,
    FormateurModule,
    CoursesModule,
    ModulesModule,
    EnrollmentsModule,
    ModuleProgressModule,
  ],
  controllers: [AppController, UploadsController],
  providers: [AppService],
})
export class AppModule { }
