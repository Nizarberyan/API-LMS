import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './entities/course.entity';
import type { ObjectId } from '@common/types/objectid.type';
import { User } from '@users/entities/user.entity';
import { Role } from '@src/common/enums/role.enum';
import { Module } from '@src/modules/entities/module.entity';
import { ModuleProgress } from '@src/module-progress/entities/module-progress.entity';
import { Enrollment } from '@src/enrollments/entities/enrollment.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<Course>,

    @InjectModel(Module.name)
    private readonly moduleModel: Model<Module>,

    @InjectModel(ModuleProgress.name)
    private readonly moduleProgressModel: Model<ModuleProgress>,

    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<Enrollment>,
  ) { }

  async create(createCourseDto: CreateCourseDto, user: User): Promise<Course> {
    const course = new this.courseModel({
      title: createCourseDto.title,
      description: createCourseDto.description,
      teacher: user._id,
      isPublished: createCourseDto.isPublished ?? false,
    });
    return course.save();
  }

  async findAll(): Promise<Course[]> {
    // Exclude soft-deleted courses
    return this.courseModel
      .find({ deletedAt: { $exists: false } })
      .populate('teacher', 'firstName lastName email role')
      .exec();
  }

  async findOne(id: ObjectId): Promise<Course | null> {
    // Exclude soft-deleted courses
    return this.courseModel
      .findOne({ _id: id, $or:[{deletedAt: { $exists: false } }, { deletedAt: null }] })
      .populate('teacher', 'firstName lastName email role')
      .exec();
  }

  async update(
    id: ObjectId,
    updateCourseDto: UpdateCourseDto,
    user: User,
  ): Promise<Course> {
    const course = await this.courseModel.findById(id);
    if (!course) {
      throw new Error('Course not found');
    }
    // Allow teacher or admin to update
    const isTeacher = course.teacher.toString() === user._id.toString();
    const isAdmin = user.role === Role.ADMIN;
    if (!isTeacher && !isAdmin) {
      throw new ForbiddenException(
        'You are not authorized to update this course',
      );
    }

    if (isAdmin && !isTeacher) {
      if (
        updateCourseDto.title !== undefined ||
        updateCourseDto.description !== undefined
      ) {
        throw new ForbiddenException(
          'Admins cannot update personal course fields (title, description)',
        );
      }
    }
    Object.assign(course, updateCourseDto);
    return course.save();
  }

  async findPublished(): Promise<Course[]> {
    return this.courseModel
      .find({ isPublished: true, $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] })
      .populate('teacher', 'firstName lastName email role')
      .exec();
  }

  async remove(
    id: ObjectId,
    user: User,
  ): Promise<{ deleted: boolean; course: Course | null }> {
    const course = await this.courseModel.findById(id);
    if (!course) {
      throw new Error('Course not found');
    }
    // Allow teacher or admin to remove
    const isTeacher = course.teacher.toString() === user._id.toString();
    const isAdmin = user.role === Role.ADMIN;
    if (!isTeacher && !isAdmin) {
      throw new ForbiddenException(
        'You are not authorized to delete this course',
      );
    }
    // Soft delete: set deletedAt
    await this.courseModel.updateOne({ _id: id }, { deletedAt: new Date() });
    const deletedCourse = await this.courseModel.findById(id);
    return { deleted: true, course: deletedCourse };
  }

  // async getCourseProgress(courseId: Types.ObjectId, apprenantId: Types.ObjectId): Promise<number> {

  //   const modules = await this.moduleModel.find({ course: courseId, deletedAt: { $exists: false } }).exec();
  //   if (!modules.length) return 0;

  //   const moduleIds = modules.map(m => m._id);
  //   const progresses = await this.moduleProgressModel.find({
  //     moduleId: { $in: moduleIds },
  //     apprenantId,
  //   }).exec();

  //   let total = 0;
  //   for (const module of modules) {
  //     const progress = progresses.find(p => p.moduleId.equals(module._id));
  //     total += progress ? (progress.progressPercentage || 0) : 0;
  //   }
  //   return Math.round(total / modules.length);
  // }

  // async getAllLearnersProgress(courseId: Types.ObjectId) {
  //   const enrollments = await this.enrollmentModel.find({ course: courseId }).exec();
  //   return Promise.all(enrollments.map(async (enr) => ({
  //     apprenantId: enr.student,
  //     progress: await this.getCourseProgress(courseId, enr.student),
  //   })));
  // }

  async getResumeModule(courseId: Types.ObjectId, apprenantId: Types.ObjectId) {
    const modules = await this.moduleModel
      .find({
        course: courseId,
        isPublished: true,
        deletedAt: null,
      })
      .sort({ order: 1 })
      .exec();

    if (!modules.length) {
      throw new NotFoundException('Aucun module trouvé pour ce cours');
    }

    const progresses = await this.moduleProgressModel
      .find({
        apprenantId,
        moduleId: { $in: modules.map((m) => m._id) },
      })
      .exec();
    for (const module of modules) {
      const progress = progresses.find((p) => p.moduleId.equals(module._id));

      if (!progress) {
        return module;
      }

      const isCompleted =
        progress.status === 'completed' || progress.progressPercentage === 100;

      if (isCompleted) {
        continue;
      }
      return module;
    }
    return modules[modules.length - 1];
  }

  async calculateCourseProgress(
    courseId: Types.ObjectId,
    apprenantId: Types.ObjectId,
  ): Promise<number> {
    const totalModules = await this.moduleModel.countDocuments({
      course: courseId,
      isPublished: true,
      deletedAt: null,
    });

    if (totalModules === 0) return 0;

    const userProgress = await this.moduleProgressModel
      .find({
        apprenantId,
      })
      .exec();

    const courseModules = await this.moduleModel
      .find({ course: courseId })
      .select('_id');
    const courseModuleIds = courseModules.map((m) => m._id.toString());

    const relevantProgress = userProgress.filter((p) =>
      courseModuleIds.includes(p.moduleId.toString()),
    );

    const totalProgress = relevantProgress.reduce(
      (acc, curr) => acc + curr.progressPercentage,
      0,
    );

    const overallProgress = Math.round(totalProgress / totalModules);

    return overallProgress;
  }
  async getModulesByCourse(courseId: Types.ObjectId): Promise<Module[]> {
    return this.moduleModel
      .find({ course: courseId, $or:[{deletedAt: { $exists: false }},{deletedAt: null } ] })
      .sort({ order: 1 })
      .exec();
  }
}
