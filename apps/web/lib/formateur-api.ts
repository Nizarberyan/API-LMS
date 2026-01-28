// lib/services/formateur-api.service.ts
import api from "./api";

// ==================== TYPES ====================

export interface Course {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface EnrolledStudent {
  student: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  enrolledAt: string;
}

export interface ModuleProgressDto {
  moduleId: string;
  moduleTitle: string;
  completionPercentage: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessedAt: string;
}

export interface QuizResultDto {
  quizId: string;
  quizTitle: string;
  moduleTitle: string;
  score: number;
  passingScore: number;
  percentage: number;
  attemptNumber: number;
  attemptedAt: string;
  completedAt: string;
  passed: boolean;
}

export interface StudentProgressReport {
  studentId: string;
  studentEmail: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  overallProgress: number;
  moduleProgress: ModuleProgressDto[];
  quizResults: QuizResultDto[];
  totalQuizzesTaken: number;
  totalQuizzesPassed: number;
  averageQuizScore: number;
  enrolledAt: string;
  lastActivityAt?: string;
}

// ==================== SERVICE ====================

export class FormateurApiService {
  // Plus besoin de token en paramètre, l'interceptor s'en charge !

  async getMyCourses(): Promise<Course[]> {
    const response = await api.get("/formateur/my-courses");
    console.log("response de for", response.data.data);
    return response.data.data;
  }

  async getStudentsByCourse(courseId: string): Promise<EnrolledStudent[]> {
    const response = await api.get(`/formateur/courses/${courseId}/students`);
    return response.data.data;
  }

  async getStudentProgress(
    courseId: string,
    studentId: string,
  ): Promise<StudentProgressReport> {
    console.log("hello meriem el mecaniqui");
    console.log("courseId", courseId);
    console.log("studentId", studentId);
    const response = await api.get(
      `/formateur/courses/${courseId}/students/${studentId}/progress`,
    );
    return response.data.data;
  }

  async getCourseProgress(courseId: string): Promise<StudentProgressReport[]> {
    console.log("hello meriem ");
    console.log("courseId", courseId);
    const response = await api.get(`/formateur/courses/${courseId}/progress`);
    console.log("response", response.data.data);
    return response.data.data;
  }
}

export const formateurApi = new FormateurApiService();
