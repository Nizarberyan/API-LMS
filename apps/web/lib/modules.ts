import api from "./api";

export interface Module {
  _id: string;
  course: string;
  title: string;
  description: string;
  order: number;
  moduleType: string;
  content: string;
  isPublished: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const modulesApi = {
  // Get all modules
  getAll: async (): Promise<Module[]> => {
    const response = await api.get("/modules");
    return response.data;
  },

  // Get modules by teacher
  getByTeacher: async (): Promise<Module[]> => {
    const response = await api.get("/modules/teacher");
    return response.data;
  },

  // Get a single module by ID
  getOne: async (id: string): Promise<Module> => {
    const response = await api.get(`/modules/${id}`);
    return response.data;
  },
};
