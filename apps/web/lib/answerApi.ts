import api from "./api";

export interface Answer {
  _id: string;
  attemptId: string;
  questionId: string;
  selectedAnswers: number[];
  pointsEarned: number;
  isCorrect: boolean;
}

export interface CreateAnswerDto {
  attemptId: string;
  questionId: string;
  selectedAnswers: number[];
}

export interface SubmitQuizDto {
  attemptId: string;
  answers: CreateAnswerDto[];
}

export const answerApi = {
  createAnswer: async (data: CreateAnswerDto): Promise<Answer> => {
    const response = await api.post("/answers", data);
    return response.data;
  },

  getAnswersByAttempt: async (attemptId: string): Promise<Answer[]> => {
    const response = await api.get(`/answers/attempt/${attemptId}`);
    return response.data;
  },

  submitQuiz: async (data: SubmitQuizDto): Promise<any> => {
    const response = await api.post("/answers/submit-quiz", data);
    return response.data;
  },
};
