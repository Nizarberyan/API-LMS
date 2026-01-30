import api from "./api";

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
  points: number;
  correctAnswers: number[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionData {
  quizId: string;
  questionText: string;
  type: QuestionType;
  options: string[];
  points: number;
  correctAnswers: number[];
}

export type UpdateQuestionData = Partial<CreateQuestionData>;

export const questionApi = {
  // Get questions by quiz
  getByQuiz: async (quizId: string): Promise<Question[]> => {
    const response = await api.get(`/questions/quiz/${quizId}`);
    return response.data;
  },

  // Create question
  create: async (data: CreateQuestionData): Promise<Question> => {
    const response = await api.post("/questions", data);
    return response.data;
  },

  // Update question
  update: async (id: string, data: UpdateQuestionData): Promise<Question> => {
    const response = await api.patch(`/questions/${id}`, data);
    return response.data;
  },

  // Delete question
  delete: async (id: string): Promise<void> => {
    await api.delete(`/questions/${id}`);
  },
};
