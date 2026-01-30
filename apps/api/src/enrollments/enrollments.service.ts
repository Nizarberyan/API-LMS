import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Enrollment } from './entities/enrollment.entity';
import { Model, Types } from 'mongoose';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<Enrollment>,
    @InjectModel('User') private readonly userModel: Model<any>,
    @InjectModel('Course') private readonly courseModel: Model<any>,
    @InjectModel('Module') private readonly moduleModel: Model<any>,
  ) { }

  async create(createEnrollmentDto: CreateEnrollmentDto) {
    const { student, course } = createEnrollmentDto;

    const foundStudent = await this.userModel.exists({ _id: student });
    if (!foundStudent) {
      throw new BadRequestException('Student ID does not exist');
    }

    const foundCourse = await this.courseModel.exists({ _id: course });
    if (!foundCourse) {
      throw new BadRequestException('Course ID does not exist');
    }

    // Check for existing enrollment
    const existingEnrollment = await this.enrollmentModel.findOne({
      student,
      course,
    });

    if (existingEnrollment) {
      return existingEnrollment;
    }

    const createdEnrollment = new this.enrollmentModel(createEnrollmentDto);
    return createdEnrollment.save();
  }

  findAll() {
    return `This action returns all enrollments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} enrollment`;
  }

  update(id: number, updateEnrollmentDto: UpdateEnrollmentDto) {
    return `This action updates a #${id} enrollment`;
  }

  remove(id: number) {
    return `This action removes a #${id} enrollment`;
  }

  async getModulesByCourseIdAndStudentId(courseId: string, studentId: string) {
    const enrollment = await this.enrollmentModel.findOne({
      course: new Types.ObjectId(courseId),
      student: new Types.ObjectId(studentId),
    });

    if (!enrollment) {
      throw new BadRequestException('Enrollment not found');
    }

    const modules = await this.moduleModel
      .find({
        course: new Types.ObjectId(courseId),
        deletedAt: null,
        isPublished: true,
      })
      .select('title description order isPublished moduleType')
      .sort({ order: 1 })
      .lean();

    return modules;
  }

  async checkEnrollment(courseId: string, studentId: string): Promise<boolean> {
    const enrollment = await this.enrollmentModel.exists({
      course: new Types.ObjectId(courseId),
      student: new Types.ObjectId(studentId),
    });
    return !!enrollment;
  }

  async findStudentEnrollments(studentId: string) {
    const enrollments = await this.enrollmentModel
      .find({ student: new Types.ObjectId(studentId) })
      .populate('course')
      .exec();

    // Filter out enrollments where course might be null (e.g. deleted courses)
    // and return just the course objects if that's what the frontend expects,
    // or return the enrollment objects with populated courses.
    // Returning enrollments is safer as it contains enrollment date etc.
    return enrollments.filter(e => e.course);
  }
}
