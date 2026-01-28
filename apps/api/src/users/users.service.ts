import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { CreateUserDto } from '@users/dto/create-user.dto';
import { UpdateUserDto } from '@users/dto/update-user.dto';
import { User } from '@users/entities/user.entity';
import { Role } from '@common/enums/role.enum';
import { EmailService } from '@email/email.service';
import { type ObjectId } from '@common/types/objectid.type';
import {
  PASSWORD_LENGTH,
  BCRYPT_ROUNDS,
  PASSWORD_CHARS,
} from '@common/constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly emailService: EmailService,
  ) {}
  private generateRandomPassword(length = PASSWORD_LENGTH): string {
    let password = '';
    for (let i = 0; i < length; i++) {
      password += PASSWORD_CHARS.charAt(
        Math.floor(Math.random() * PASSWORD_CHARS.length),
      );
    }
    return password;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const generatedPassword = this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(generatedPassword, BCRYPT_ROUNDS);

    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      role: createUserDto.role || Role.STUDENT,
    });

    // Send password to user's email
    await this.emailService.sendUserPassword(user.email, generatedPassword);

    return user.save();
  }

  async findAll(): Promise<User[]> {
    const users: User[] = await this.userModel
      .find({ $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] })
      .exec();
    return users;
  }

  async findOne(id: ObjectId): Promise<User | null> {
    // Exclude soft-deleted users
    return this.userModel
      .findOne({ _id: id, deletedAt: { $exists: false } })
      .exec();
  }

  async update(
    id: ObjectId,
    updateUserDto: UpdateUserDto,
    currentUser: User,
  ): Promise<User> {
    const isOwner = currentUser._id.equals(id);
    const isAdmin = currentUser.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You cannot update this user');
    }

    // Prevent regular users from changing their role
    if (!isAdmin && 'role' in updateUserDto) {
      throw new ForbiddenException('You cannot change your role');
    }

    if (isAdmin && !isOwner) {
      if (
        updateUserDto.password !== undefined ||
        updateUserDto.email !== undefined ||
        updateUserDto.firstName !== undefined ||
        updateUserDto.lastName !== undefined
      ) {
        throw new ForbiddenException(
          'Admins cannot update personal user fields (password, email, firstName, lastName)',
        );
      }
    }
    if (updateUserDto.email) {
      const existingUser = await this.userModel.findOne({
        email: updateUserDto.email,
      });

      // If a user was found AND it's not the user we are currently updating
      if (existingUser && !existingUser._id.equals(id)) {
        throw new ConflictException('Email already in use');
      }
    }

    // Hash password if updated
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        BCRYPT_ROUNDS,
      );
    }
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { $set: updateUserDto }, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID #${id} not found`);
    }

    return updatedUser;
  }

  async remove(id: ObjectId, currentUser: User): Promise<User> {
    const isOwner = currentUser._id.equals(id);
    const isAdmin = currentUser.role === Role.ADMIN;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You cannot delete this user');
    }
    return this.update(
      id,
      { deletedAt: new Date() } as UpdateUserDto,
      currentUser,
    );
  }
}
