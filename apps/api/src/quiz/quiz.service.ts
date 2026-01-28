import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz } from './schemas/quiz.schema';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { Question } from '../question/schema/question.schema';
import { CreateQuestionDto } from '../question/dto/create-question.dto';
import { type ObjectId } from '@common/types/objectid.type';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz.name)
    private readonly quizModel: Model<Quiz>,
    @InjectModel(Question.name)
    private readonly questionModel: Model<Question>,
  ) {}

  async createQuiz(createQuizDto: CreateQuizDto): Promise<Quiz> {
    const quiz = new this.quizModel(createQuizDto);
    return quiz.save();
  }

  async addQuestion(createQuestionDto: CreateQuestionDto): Promise<Question> {
    const question = new this.questionModel(createQuestionDto);
    return question.save();
  }
  // Récupérer un quiz par son ID
  async getQuizById(id: string): Promise<Quiz> {
    const quiz = await this.quizModel.findById(id);

    if (!quiz) {
      throw new NotFoundException(`Quiz avec l'ID ${id} introuvable`);
    }

    return quiz;
  }

  async findAll(): Promise<Quiz[]> {
    // Exclude soft-deleted courses
    return this.quizModel
      .find({ $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] })
      .populate('moduleId')
      .exec();
  }
  async getQuestionsByQuiz(quizId: string): Promise<Question[]> {
    return this.questionModel.find({ quizId }).exec();
  }

  async getQuizzesByModule(moduleId: string): Promise<Quiz[]> {
    return this.quizModel.find({ moduleId }).exec();
  }

  async updateQuiz(
    id: ObjectId,
    updateQuizDto: Partial<CreateQuizDto>,
  ): Promise<Quiz> {
    const updatedQuiz = await this.quizModel
      .findByIdAndUpdate(id, updateQuizDto, { new: true })
      .populate('moduleId')
      .exec();
    if (!updatedQuiz) {
      throw new NotFoundException('Quiz not found');
    }
    return updatedQuiz;
  }

  async deleteQuiz(id: ObjectId): Promise<Quiz> {
    const deletedQuiz = await this.quizModel
      .findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true })
      .exec();
    if (!deletedQuiz) {
      throw new NotFoundException('Quiz not found');
    }
    return deletedQuiz;
  }
}
