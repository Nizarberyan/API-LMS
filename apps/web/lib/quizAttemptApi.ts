import api from "./api";

export interface QuizAttempt {
  _id: string;
  quizId: string;
  apprenantId: string;
  startedAt: string;
  completedAt?: string;
  score: number;
  passed: boolean;
  attemptNumber: number;
}

export interface CreateQuizAttemptDto {
  quizId: string;
  apprenantId: string;
}

export const quizAttemptApi = {
  createAttempt: async (data: CreateQuizAttemptDto): Promise<QuizAttempt> => {
    const response = await api.post("/quiz-attempts", data);
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

  getAttemptsByQuiz: async (quizId: string): Promise<QuizAttempt[]> => {
    const response = await api.get(`/quiz-attempts/quiz/${quizId}/attempts`);
    return response.data;
  },
};
