import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Enrollment } from '@src/enrollments/entities/enrollment.entity';
import { Course } from '@src/courses/entities/course.entity';
import { QuizAttempt } from '@src/quizAttempt/schema/quizAttempt.schema';
import { ModuleProgress } from '@src/module-progress/entities/module-progress.entity';
import { Module as ModuleEntity } from '@src/modules/entities/module.entity';
import { EnrolledLearnerDto } from './dto/enrolled-learner.dto';
import {
  StudentProgressReportDto,
  ModuleProgressDto,
  QuizResultDto,
} from './dto/student-progress-report.dto';

@Injectable()
export class FormateurService {
  constructor(
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<Enrollment>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(QuizAttempt.name)
    private readonly quizAttemptModel: Model<QuizAttempt>,
    @InjectModel(ModuleProgress.name)
    private readonly moduleProgressModel: Model<ModuleProgress>,
    @InjectModel(ModuleEntity.name)
    private readonly moduleModel: Model<ModuleEntity>,
  ) {}

  // ==========================================
  //            MÉTHODES PUBLIQUES
  // ==========================================

  /**
   * Récupère les cours créés par le formateur
   */
  async getMyCourses(teacherId: string): Promise<Course[]> {
    const courses = await this.courseModel
      .find({ teacher: teacherId })
      .select('_id title description createdAt')
      .lean();

    if (!courses.length)
      throw new NotFoundException('Aucun cours trouvé pour ce formateur');
    return courses;
  }

  /**
   * Récupère tous les apprenants inscrits aux cours de ce formateur
   */
  async getEnrolledLearners(trainerId: string): Promise<EnrolledLearnerDto[]> {
    const courses = await this.courseModel
      .find({ teacher: trainerId })
      .select('_id')
      .lean();
    if (!courses.length) throw new NotFoundException('Aucun cours trouvé');

    const courseIds = courses.map((c) => c._id);
    const enrollments = await this.enrollmentModel
      .find({ course: { $in: courseIds } })
      .populate('student', 'email firstName lastName')
      .populate('course', 'title')
      .lean();

    return this.groupEnrollmentsByLearner(enrollments);
  }

  /**
   * Récupère la liste des étudiants pour UN cours spécifique
   */
  async getStudentsByCourse(courseId: string, teacherId: string) {
    await this.validateCourseOwnership(courseId, teacherId);

    return this.enrollmentModel
      .find({ course: courseId })
      .populate('student', 'email firstName lastName')
      .select('student enrolledAt')
      .lean();
  }

  /**
   * Génère un rapport de progression détaillé pour un étudiant spécifique
   */
  async getStudentProgressReport(
    courseId: string,
    studentId: string,
    teacherId: string,
  ): Promise<StudentProgressReportDto> {
    await this.validateCourseOwnership(courseId, teacherId);

    const enrollment = await this.enrollmentModel
      .findOne({ course: courseId, student: studentId })
      .populate('student', 'email firstName lastName')
      .populate('course', 'title')
      .lean();

    if (!enrollment)
      throw new NotFoundException('Étudiant non inscrit à ce cours');

    // Récupérer d'abord les modules du cours
    const courseModules = await this.moduleModel
      .find({ course: courseId })
      .select('_id title') // Select title too for later use if needed
      .lean();

    const moduleIds = courseModules.map((m) => m._id);

    // Récupération de données en parallèle (Performance)
    const [moduleProgressData, quizAttempts] = await Promise.all([
      this.moduleProgressModel
        .find({
          apprenantId: studentId,
          moduleId: { $in: moduleIds },
        })
        .populate('moduleId', 'title')
        .lean(),
      this.fetchQuizAttemptsForCourse(studentId, courseId),
    ]);

    const moduleProgress = this.mapModuleProgress(
      moduleProgressData,
      courseModules,
    );
    const quizResults = this.mapQuizResults(quizAttempts);

    const student = enrollment.student as any;

    return {
      studentId: student._id.toString(),
      studentEmail: student.email,
      studentName: `${student.firstName} ${student.lastName}`,
      courseId: courseId,
      courseTitle: (enrollment.course as any).title,
      overallProgress: this.calculateOverallProgress(moduleProgress),
      moduleProgress,
      quizResults,
      ...this.calculateQuizStats(quizResults),
      enrolledAt: (enrollment as any).createdAt as Date,
      lastActivityAt: this.findLastActivity(moduleProgressData, quizAttempts),
    };
  }

  /**
   * Génère les rapports de progression pour TOUS les étudiants d'un cours
   */
  async getCourseProgressReports(
    courseId: string,
    teacherId: string,
  ): Promise<StudentProgressReportDto[]> {
    await this.validateCourseOwnership(courseId, teacherId);
    const enrollments = await this.enrollmentModel
      .find({ course: courseId })
      .select('student')
      .lean();

    return Promise.all(
      enrollments.map((e) =>
        this.getStudentProgressReport(
          courseId,
          e.student.toString(),
          teacherId,
        ),
      ),
    );
  }

  // ==========================================
  //      MÉTHODES PRIVÉES (LOGIQUE PARTAGÉE)
  // ==========================================

  private async validateCourseOwnership(
    courseId: string,
    teacherId: string,
  ): Promise<void> {
    const course = await this.courseModel
      .findById(courseId)
      .select('teacher')
      .lean();
    if (!course) throw new NotFoundException('Cours introuvable');
    if (course.teacher.toString() !== teacherId) {
      throw new ForbiddenException(
        "Accès refusé : vous n'êtes pas le propriétaire de ce cours",
      );
    }
  }

  private async fetchQuizAttemptsForCourse(
    studentId: string,
    courseId: string,
  ) {
    const attempts = await this.quizAttemptModel
      .find({ apprenantId: studentId })
      .populate({
        path: 'quizId',
        populate: { path: 'moduleId', select: 'title courseId' },
      })
      .sort({ startedAt: -1 })
      .lean();

    return attempts.filter(
      (a: any) => a.quizId?.moduleId?.courseId?.toString() === courseId,
    );
  }

  private mapModuleProgress(
    data: any[],
    allModules: any[],
  ): ModuleProgressDto[] {
    // Map existing progress
    const progressMap = new Map();
    data.forEach((mp) => {
      if (mp.moduleId) {
        progressMap.set(
          mp.moduleId._id ? mp.moduleId._id.toString() : mp.moduleId.toString(),
          mp,
        );
      }
    });

    return allModules.map((module) => {
      const mp = progressMap.get(module._id.toString());

      return {
        moduleId: module._id.toString(),
        moduleTitle: module.title,
        completionPercentage: mp ? mp.progressPercentage || 0 : 0,
        completedLessons: 0,
        totalLessons: 0,
        lastAccessedAt: mp ? mp.updatedAt : undefined,
      };
    });
  }

  private mapQuizResults(attempts: any[]): QuizResultDto[] {
    return attempts.map((a) => ({
      quizId: a.quizId._id.toString(),
      quizTitle: a.quizId.title,
      moduleTitle: a.quizId.moduleId?.title || 'N/A',
      score: a.score,
      passingScore: a.quizId.passingScore,
      percentage: Math.round((a.score / a.quizId.passingScore) * 100),
      attemptNumber: a.attemptNumber,
      attemptedAt: a.startedAt,
      completedAt: a.completedAt,
      passed: a.passed,
    }));
  }

  private calculateOverallProgress(modules: ModuleProgressDto[]): number {
    if (!modules.length) return 0;
    const sum = modules.reduce(
      (acc, curr) => acc + curr.completionPercentage,
      0,
    );
    return Math.round(sum / modules.length);
  }

  private calculateQuizStats(results: QuizResultDto[]) {
    const total = results.length;
    return {
      totalQuizzesTaken: total,
      totalQuizzesPassed: results.filter((r) => r.passed).length,
      averageQuizScore:
        total > 0
          ? Math.round(results.reduce((s, r) => s + r.score, 0) / total)
          : 0,
    };
  }

  private findLastActivity(modules: any[], quizzes: any[]): Date | undefined {
    const dates = [
      ...modules.map((m) => m.updatedAt),
      ...quizzes.map((q) => q.completedAt || q.startedAt),
    ].filter(Boolean);

    return dates.length
      ? new Date(Math.max(...dates.map((d) => new Date(d).getTime())))
      : undefined;
  }

  private groupEnrollmentsByLearner(enrollments: any[]): EnrolledLearnerDto[] {
    const learnerMap = new Map<string, EnrolledLearnerDto>();

    for (const enrollment of enrollments) {
      const student = enrollment.student;
      const sid = student._id.toString();

      if (!learnerMap.has(sid)) {
        learnerMap.set(sid, {
          learnerId: sid,
          email: student.email,
          firstName: student.firstName,
          lastName: student.lastName,
          enrolledCourses: [],
        });
      }
      learnerMap.get(sid)!.enrolledCourses.push({
        courseId: enrollment.course._id.toString(),
        courseTitle: enrollment.course.title,
      });
    }
    return Array.from(learnerMap.values());
  }
}
