import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { CreateQuestionDto } from '../question/dto/create-question.dto';
import { Roles, JwtAuthGuard, RolesGuard } from '@src/auth';
import { Role } from '@src/common/enums/role.enum';
import { type ObjectId } from '@common/types/objectid.type';
import { ParseObjectIdPipe } from '@common/pipes';
// import { RolesGuard } from './roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  //   @UseGuards(RolesGuard)
  @Post()
  @Roles(Role.TEACHER)
  async createQuiz(@Body() createQuizDto: CreateQuizDto) {
    return this.quizService.createQuiz(createQuizDto);
  }

  //   @UseGuards(RolesGuard)
  @Post(':quizId/questions')
  async addQuestion(
    @Param('quizId') quizId: string,
    @Body() createQuestionDto: CreateQuestionDto,
  ) {
    return this.quizService.addQuestion({ ...createQuestionDto, quizId });
  }

  @Get()
  @Roles(Role.TEACHER, Role.ADMIN)
  findAll() {
    return this.quizService.findAll();
  }

  @Get(':moduleId/quizzes') // ← EN PREMIER
  async getQuizzesByModule(@Param('moduleId') moduleId: string) {
    return this.quizService.getQuizzesByModule(moduleId);
  }

  @Get(':quizId/questions') // ← EN DEUXIÈME
  async getQuestionsByQuiz(@Param('quizId') quizId: string) {
    return this.quizService.getQuestionsByQuiz(quizId);
  }

  @Get(':id') // ← EN DERNIER
  async getQuizById(@Param('id') id: string) {
    return this.quizService.getQuizById(id);
  }

  @Patch(':id')
  async updateQuiz(
    @Param('id', ParseObjectIdPipe) id: ObjectId,
    @Body() updateQuizDto: Partial<CreateQuizDto>,
  ) {
    return this.quizService.updateQuiz(id, updateQuizDto);
  }

  @Delete(':id')
  async deleteQuiz(@Param('id', ParseObjectIdPipe) id: ObjectId) {
    return this.quizService.deleteQuiz(id);
  }
}
