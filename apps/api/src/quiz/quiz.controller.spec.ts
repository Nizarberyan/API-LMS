import { Test, TestingModule } from '@nestjs/testing';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';

describe('QuizController', () => {
  let controller: QuizController;
  let service: QuizService;

  const mockQuiz = {
    _id: '65a1b2c3d4e5f6g7h8i9j0k1',
    title: 'Quiz Test',
    description: 'Test quiz',
    moduleId: '65a1b2c3d4e5f6g7h8i9j0k2',
    passingScore: 60,
    duration: 30,
    isRequired: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockQuestion = {
    _id: '65a1b2c3d4e5f6g7h8i9j0k3',
    quizId: '65a1b2c3d4e5f6g7h8i9j0k1',
    text: 'Test question?',
    type: 'multiple_choice',
    options: [
      { id: 0, text: 'Option 1' },
      { id: 1, text: 'Option 2' },
    ],
    points: 10,
    correctAnswers: [0],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizController],
      providers: [
        {
          provide: QuizService,
          useValue: {
            createQuiz: jest.fn().mockResolvedValue(mockQuiz),
            findAll: jest.fn().mockResolvedValue([mockQuiz]),
            getQuizById: jest.fn().mockResolvedValue(mockQuiz),
            getQuestionsByQuiz: jest.fn().mockResolvedValue([mockQuestion]),
            getQuizzesByModule: jest.fn().mockResolvedValue([mockQuiz]),
            updateQuiz: jest.fn().mockResolvedValue(mockQuiz),
            deleteQuiz: jest.fn().mockResolvedValue({ success: true }),
            addQuestion: jest.fn().mockResolvedValue(mockQuestion),
          },
        },
      ],
    }).compile();

    controller = module.get<QuizController>(QuizController);
    service = module.get<QuizService>(QuizService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createQuiz', () => {
    it('devrait créer un quiz', async () => {
      const dto = {
        title: 'Quiz Test',
        description: 'Test',
        moduleId: '65a1b2c3d4e5f6g7h8i9j0k2',
        passingScore: 60,
        duration: 30,
        isRequired: true,
      };

      const result = await controller.createQuiz(dto);
      expect(result).toEqual(mockQuiz);
      expect(service.createQuiz).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('devrait retourner tous les quiz', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockQuiz]);
    });
  });

  describe('getQuestionsByQuiz', () => {
    it('devrait retourner les questions', async () => {
      const result = await controller.getQuestionsByQuiz(
        '65a1b2c3d4e5f6g7h8i9j0k1',
      );
      expect(result).toEqual([mockQuestion]);
    });
  });
});
