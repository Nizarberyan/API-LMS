import api from "./api";

export interface Course {
  _id: string;
  title: string;
  description: string;
  teacher: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseData {
  title: string;
  description?: string;
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  isPublished?: boolean;
}

export async function getCourses(): Promise<Course[]> {
  const response = await api.get<Course[]>("/courses");
  return response.data;
}

export async function getPublishedCourses(): Promise<Course[]> {
  const response = await api.get<Course[]>("/courses/published");
  return response.data;
}

export async function getCourse(id: string): Promise<Course> {
  // console.log("id", id);
  const response = await api.get<Course>(`/courses/${id}`);
  console.log("response", response);
  return response.data;
}

export async function createCourse(data: CreateCourseData): Promise<Course> {
  const response = await api.post<Course>("/courses", data);
  return response.data;
}

export async function updateCourse(
  id: string,
  data: UpdateCourseData,
): Promise<Course> {
  const response = await api.patch<Course>(`/courses/${id}`, data);
  return response.data;
}

export async function deleteCourse(id: string): Promise<void> {
  await api.delete(`/courses/${id}`);
}
