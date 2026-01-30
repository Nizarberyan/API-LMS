import api from "./api";

export interface Module {
  _id: string;
  course: string;
  title: string;
  description: string;
  order: number;
  moduleType: string;
  isPublished: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  _id: string;
  moduleId: Module;
  title: string;
  passingScore: number;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuizData {
  moduleId: string;
  title: string;
  passingScore: number;
  isRequired: boolean;
}

export type UpdateQuizData = Partial<CreateQuizData>;

export const quizApi = {
  // Get all quizzes
  getAll: async (): Promise<Quiz[]> => {
    const response = await api.get("/quizzes");
    return response.data;
  },

  // Get quiz by ID
  getById: async (id: string): Promise<Quiz> => {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
  },

  // Get quizzes by module
  getByModule: async (moduleId: string): Promise<Quiz[]> => {
    const response = await api.get(`/quizzes/module/${moduleId}`);
    return response.data;
  },

  // Create quiz
  create: async (data: CreateQuizData): Promise<Quiz> => {
    const response = await api.post("/quizzes", data);
    return response.data;
  },

  // Update quiz
  update: async (id: string, data: UpdateQuizData): Promise<Quiz> => {
    const response = await api.patch(`/quizzes/${id}`, data);
    return response.data;
  },

  // Delete quiz
  delete: async (id: string): Promise<void> => {
    await api.delete(`/quizzes/${id}`);
  },
};
