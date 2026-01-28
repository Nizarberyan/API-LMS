import api from "./api";

// ========== TYPES ==========
export interface Quiz {
  _id: string;
  moduleId:
    | string
    | {
        _id: string;
        title: string;
      };
  title: string;
  passingScore: number;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export enum QuestionType {
  MULTIPLE_CHOICE = "multiple_choice",
  SINGLE_CHOICE = "single_choice",
  TRUE_FALSE = "true_false",
}

export interface Question {
  _id: string;
  quizId: string;
  questionText: string;
  type: QuestionType;
  options: string[];
  correctAnswers: number[]; // Backend uses array for multiple answers
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttempt {
  _id: string;
  startedAt: string;
  completedAt: string | null;
  score: number;
  passed: boolean;
  attemptNumber: number;
  apprenantId: string;
  quizId: string;
}

export interface Answer {
  _id: string;
  selectedAnswers: number[];
  isCorrect: boolean;
  pointsEarned: number;
  attemptId: string;
  questionId: string;
}

export interface CreateQuizAttemptDto {
  quizId: string;
  apprenantId: string;
}

export interface CreateAnswerDto {
  attemptId: string;
  questionId: string;
  selectedAnswers: number[];
}

export interface SubmitQuizDto {
  attemptId: string;
  answers: {
    questionId: string;
    selectedAnswers: number[];
  }[];
}

export interface QuizSubmissionResult {
  success: boolean;
  message: string;
  results: {
    questionId: string;
    status: string;
    error?: string;
  }[];
}

// ========== API METHODS ==========
export const quizApi = {
  // Quiz endpoints
  getQuizzesByModule: async (moduleId: string): Promise<Quiz[]> => {
    const response = await api.get(`/quizzes/${moduleId}/quizzes`);
    return response.data;
  },

  getQuizById: async (quizId: string): Promise<Quiz> => {
    const response = await api.get(`/quizzes/${quizId}`);
    return response.data;
  },

  // Question endpoints
  getQuestionsByQuiz: async (quizId: string): Promise<Question[]> => {
    const response = await api.get(`/quizzes/${quizId}/questions`);
    return response.data;
  },

  // QuizAttempt endpoints
  createQuizAttempt: async (
    data: CreateQuizAttemptDto,
  ): Promise<QuizAttempt> => {
    const response = await api.post("/quiz-attempts", data);
    return response.data;
  },

  getAttemptsByQuiz: async (quizId: string): Promise<QuizAttempt[]> => {
    const response = await api.get(`/quiz-attempts/quiz/${quizId}/attempts`);
    return response.data;
  },

  getAttemptById: async (attemptId: string): Promise<QuizAttempt> => {
    const response = await api.get(`/quiz-attempts/attempt/${attemptId}`);
    return response.data;
  },

  finalizeAttempt: async (attemptId: string): Promise<QuizAttempt> => {
    const response = await api.post(
      `/quiz-attempts/attempt/${attemptId}/finalize`,
    );
    return response.data;
  },

  // Answer endpoints
  createAnswer: async (data: CreateAnswerDto): Promise<Answer> => {
    const response = await api.post("/answers", data);
    return response.data;
  },

  getAnswersByAttempt: async (attemptId: string): Promise<Answer[]> => {
    const response = await api.get(`/answers/attempt/${attemptId}`);
    return response.data;
  },

  submitQuiz: async (data: SubmitQuizDto): Promise<QuizSubmissionResult> => {
    const response = await api.post("/answers/submit-quiz", data);
    return response.data;
  },
};
